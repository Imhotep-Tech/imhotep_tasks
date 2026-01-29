from django.shortcuts import redirect
from ..models import User, PendingOTP
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from tasks.utils.otp_utils import generate_otp, is_otp_valid, OTP_VALIDITY_MINUTES

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_profile(request):
    """Get current user profile information"""
    user = request.user
    return Response({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'email_verify': user.email_verify,
        'date_joined': user.date_joined,
    })

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    """Update user profile information"""
    try:
        user = request.user
        first_name = request.data.get('first_name', '').strip()
        last_name = request.data.get('last_name', '').strip()
        username = request.data.get('username', '').strip()
        email = request.data.get('email', '').strip()

        messages = []
        errors = []

        # Update first name and last name directly
        if first_name != user.first_name:
            user.first_name = first_name
            messages.append("First name updated")
        
        if last_name != user.last_name:
            user.last_name = last_name
            messages.append("Last name updated")

        # Validate and update username
        if username and username != user.username:
            # Check if username contains '@'
            if '@' in username:
                errors.append("Username cannot contain @")
            else:
                # Check if username already exists
                if User.objects.filter(username=username).exclude(id=user.id).exists():
                    errors.append('Username already taken, please choose another one!')
                else:
                    user.username = username
                    messages.append("Username updated")

        # Validate and handle email update
        if email and email != user.email:
            # Check if email contains '@'
            if '@' not in email:
                errors.append("Email must contain @")
            else:
                # Check if email already exists
                if User.objects.filter(email=email).exclude(id=user.id).exists():
                    errors.append('Email already taken, please choose another one!')
                else:
                    # Invalidate any existing unused email change OTPs for this user
                    PendingOTP.objects.filter(
                        user=user,
                        otp_type='email_change',
                        is_used=False
                    ).update(is_used=True)
                    
                    # Generate new OTP
                    otp_code = generate_otp()
                    
                    # Save OTP to database with new email
                    PendingOTP.objects.create(
                        user=user,
                        otp_code=otp_code,
                        otp_type='email_change',
                        new_email=email,
                        is_used=False
                    )
                    
                    # Send verification email with OTP
                    try:
                        mail_subject = 'Verify your new email address'
                        
                        context = {
                            'user': user,
                            'new_email': email,
                            'otp_code': otp_code,
                            'validity_minutes': OTP_VALIDITY_MINUTES,
                        }
                        
                        message = render_to_string('activate_mail_change_send.html', context)
                        
                        send_mail(
                            mail_subject, 
                            '', 
                            'imhoteptech1@gmail.com', 
                            [email], 
                            html_message=message
                        )
                        
                        messages.append("Email verification sent! Please check your new email for the verification code.")
                        email_verification_required = True
                        pending_new_email = email
                        
                    except Exception as email_error:
                        print(f"Failed to send email verification: {str(email_error)}")
                        errors.append("Failed to send verification email. Please try again later.")
                        email_verification_required = False
                        pending_new_email = None
        else:
            email_verification_required = False
            pending_new_email = None

        # Save user if there are no errors
        if not errors:
            user.save()
            if not messages:
                messages.append("Profile updated successfully!")

        if errors:
            return Response(
                {'error': errors[0] if len(errors) == 1 else errors},
                status=status.HTTP_400_BAD_REQUEST
            )

        response_data = {
            'message': messages[0] if len(messages) == 1 else messages,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'email_verify': user.email_verify,
            }
        }
        
        if email_verification_required:
            response_data['email_verification_required'] = True
            response_data['pending_new_email'] = pending_new_email
        
        return Response(response_data)

    except Exception as e:
        return Response(
            {'error': f'An error occurred during profile update'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    """Change user password"""
    try:
        user = request.user
        current_password = request.data.get('current_password')
        new_password = request.data.get('new_password')
        confirm_password = request.data.get('confirm_password')

        if not all([current_password, new_password, confirm_password]):
            return Response(
                {'error': 'All password fields are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check current password
        if not user.check_password(current_password):
            return Response(
                {'error': 'Current password is incorrect'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if new passwords match
        if new_password != confirm_password:
            return Response(
                {'error': 'New passwords do not match'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate new password
        try:
            validate_password(new_password, user)
        except ValidationError as e:
            return Response(
                {'error': e.messages}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Set new password
        user.set_password(new_password)
        user.save()

        return Response(
            {'message': 'Password changed successfully'}, 
            status=status.HTTP_200_OK
        )

    except Exception as e:
        return Response(
            {'error': f'An error occurred during password change'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_email_change(request):
    """Verify email change using OTP"""
    try:
        otp_code = request.data.get('otp')
        
        if not otp_code:
            return Response(
                {'error': 'OTP code is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user = request.user
        
        # Find the OTP record for email change
        try:
            pending_otp = PendingOTP.objects.filter(
                user=user,
                otp_code=otp_code,
                otp_type='email_change',
                is_used=False
            ).latest('created_at')
        except PendingOTP.DoesNotExist:
            return Response(
                {'error': 'Invalid or expired OTP'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if the OTP is still valid (within 10 minutes)
        if not is_otp_valid(pending_otp):
            return Response(
                {'error': 'OTP has expired. Please request a new email change.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        new_email = pending_otp.new_email
        
        # Check if the new email is already taken by another user
        if User.objects.filter(email=new_email).exclude(id=user.id).exists():
            return Response(
                {'error': 'This email address is already in use by another account'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Mark OTP as used
        pending_otp.is_used = True
        pending_otp.save()
        
        # Update the user's email
        user.email = new_email
        user.email_verify = True
        user.save()
        
        return Response(
            {'message': 'Email updated successfully'}, 
            status=status.HTTP_200_OK
        )
            
    except Exception as e:
        return Response(
            {'error': 'An error occurred during email verification'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )