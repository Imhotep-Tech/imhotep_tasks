from ..models import User, PendingOTP
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.contrib.auth.password_validation import validate_password
from tasks.utils.otp_utils import generate_otp, is_otp_valid, OTP_VALIDITY_MINUTES

#the register route
@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    try:
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        password2 = request.data.get('password2')
        first_name = request.data.get('first_name', '')
        last_name = request.data.get('last_name', '')

        # Check if all required fields are provided
        if not all([username, email, password, password2]):
            return Response(
                {'error': 'All fields are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if username contains '@'
        if '@' in username:
            return Response(
                {'error': 'Username cannot contain @ in it'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if email contains '@'
        if '@' not in email:
            return Response(
                {'error': 'Email must contain @ in it'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if passwords match
        if password != password2:
            return Response(
                {'error': 'Passwords do not match'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if username already exists
        try:
            if User.objects.filter(username=username).exists():
                return Response(
                    {'error': 'Username already exists'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        except Exception as db_error:
            return Response(
                {'error': 'Database connection error. Please ensure migrations are run and database is accessible.'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        # Check if email already exists
        try:
            if User.objects.filter(email=email).exists():
                return Response(
                    {'error': 'Email already exists'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        except Exception as db_error:
            return Response(
                {'error': 'Database connection error. Please ensure migrations are run and database is accessible.'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        # Create a new user
        try:
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                email_verify=False,
                first_name=first_name,
                last_name=last_name
            )
            user.save()
        except Exception:
            return Response(
                {'error': f'Failed to create user'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # Invalidate any existing unused OTPs for this user (registration type)
        PendingOTP.objects.filter(
            user=user,
            otp_type='registration',
            is_used=False
        ).update(is_used=True)
        
        # Generate new OTP
        otp_code = generate_otp()
        
        # Save OTP to database
        PendingOTP.objects.create(
            user=user,
            otp_code=otp_code,
            otp_type='registration',
            is_used=False
        )

        # Send verification email
        try:
            mail_subject = 'Activate your Imhotep Tasks account'
            message = render_to_string('activate_mail_send.html', {
                'user': user,
                'otp_code': otp_code,
                'validity_minutes': OTP_VALIDITY_MINUTES,
            })
            send_mail(mail_subject, message, 'imhoteptech1@gmail.com', [email], html_message=message)
        except Exception as email_error:
            # If email fails, still create the user but log the error
            print(f"Failed to send verification email: {str(email_error)}")

        return Response(
            {'message': 'User created successfully. Please check your email to verify your account.'}, 
            status=status.HTTP_201_CREATED
        )
            
    except Exception as e:
        return Response(
            {'error': f'An error occurred during registration'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

#the verify email API route
@api_view(['POST'])
@permission_classes([AllowAny])
def verify_email(request):
    try:
        otp_code = request.data.get('otp')
        email = request.data.get('email')

        if not otp_code or not email:
            return Response(
                {'error': 'Missing verification parameters (email and otp required)'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Find the user by email
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )

        # Find the OTP record
        try:
            pending_otp = PendingOTP.objects.filter(
                user=user,
                otp_code=otp_code,
                otp_type='registration',
                is_used=False
            ).latest('created_at')
        except PendingOTP.DoesNotExist:
            return Response(
                {'valid': False, 'error': 'Invalid or expired OTP'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if the OTP is still valid (within 10 minutes)
        if is_otp_valid(pending_otp):
            # Mark OTP as used
            pending_otp.is_used = True
            pending_otp.save()
            
            # Verify the user's email
            user.email_verify = True
            user.save()
            
            return Response(
                {'valid': True, 'message': 'Email verified successfully!', 'email': user.email}, 
                status=status.HTTP_200_OK
            )
        else:
            return Response(
                {'valid': False, 'error': 'OTP has expired. Please request a new verification code.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    except Exception as e:
        return Response(
            {'error': f'An error occurred during verification'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )