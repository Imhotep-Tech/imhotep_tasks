from django.contrib import messages
from django.contrib.auth.views import PasswordResetView, PasswordResetDoneView, PasswordResetConfirmView, PasswordResetCompleteView
from django.core.mail import send_mail
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes, force_str
from django.template.loader import render_to_string
from django.contrib.auth.forms import PasswordResetForm, SetPasswordForm
from django.utils import timezone
from imhotep_tasks.settings import SITE_DOMAIN, frontend_url
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from ..models import User, PendingOTP
from tasks.utils.otp_utils import generate_otp, is_otp_valid, OTP_VALIDITY_MINUTES

class CustomPasswordResetView(PasswordResetView):
    template_name = 'password_reset.html'
    form_class = PasswordResetForm
    email_template_name = 'password_reset_email.html'
    html_email_template_name = 'password_reset_email.html'
    
    def form_invalid(self, form):
        for field, errors in form.errors.items():
            for error in errors:
                messages.error(self.request, error)
        return super().form_invalid(form)

    def get_extra_email_context(self):
        context = {}
        context['domain'] = SITE_DOMAIN.replace('http://', '').replace('https://', '')
        context['site_name'] = 'Imhotep Tasks'
        context['protocol'] = 'https' if 'https://' in SITE_DOMAIN else 'http'
        return context

    def form_valid(self, form):
        """
        Override form_valid to handle email sending ourselves rather than 
        letting Django's built-in functionality handle it.
        """
        # Get user email
        email = form.cleaned_data["email"]
        # Get associated users
        active_users = form.get_users(email)
        
        for user in active_users:
            # Generate token and context
            context = {
                'email': email,
                'domain': SITE_DOMAIN.replace('http://', '').replace('https://', ''),
                'site_name': 'Imhotep Tasks',
                'protocol': 'https' if 'https://' in SITE_DOMAIN else 'http',
                'uid': urlsafe_base64_encode(force_bytes(user.pk)),
                'user': user,
                'token': self.token_generator.make_token(user),
            }
            
            # Render email
            subject = "Reset your Imhotep Tasks password"
            email_message = render_to_string(self.email_template_name, context)
            html_email = render_to_string(self.html_email_template_name, context)
            
            # Send email
            send_mail(
                subject,
                email_message,
                self.from_email or 'imhoteptech1@gmail.com',
                [user.email],
                html_message=html_email,
            )
            
        # Return success response
        return super().form_valid(form)
    
class CustomPasswordResetDoneView(PasswordResetDoneView):
    template_name = 'password_reset_done.html'

class CustomPasswordResetConfirmView(PasswordResetConfirmView):
    template_name = 'password_reset_confirm.html'
    form_class = SetPasswordForm

    def form_invalid(self, form):
        for field, errors in form.errors.items():
            for error in errors:
                messages.error(self.request, error)
        return super().form_invalid(form)

class CustomPasswordResetCompleteView(PasswordResetCompleteView):
    template_name = 'password_reset_complete.html'

@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_request(request):
    """
    API endpoint to request a password reset OTP email
    """
    try:
        email = request.data.get('email')
        
        if not email:
            return Response(
                {'error': 'Email is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if user exists with this email
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # Return success even if user doesn't exist for security
            return Response(
                {'message': 'If an account with this email exists, a password reset OTP has been sent.'}, 
                status=status.HTTP_200_OK
            )
        
        # Generate OTP and save to database
        try:
            # Invalidate any existing unused OTPs for this user (password reset type)
            PendingOTP.objects.filter(
                user=user,
                otp_type='password_reset',
                is_used=False
            ).update(is_used=True)
            
            # Generate new OTP
            otp_code = generate_otp()
            
            # Save OTP to database
            PendingOTP.objects.create(
                user=user,
                otp_code=otp_code,
                otp_type='password_reset',
                is_used=False
            )
            
            # Send password reset email with OTP
            mail_subject = 'Reset your Imhotep Tasks password'
            
            context = {
                'user': user,
                'otp_code': otp_code,
                'validity_minutes': OTP_VALIDITY_MINUTES,
            }
            
            message = render_to_string('password_reset_email.html', context)
            
            send_mail(
                mail_subject, 
                message, 
                'imhoteptech1@gmail.com', 
                [email], 
                html_message=message
            )
            
        except Exception as email_error:
            print(f"Failed to send password reset email: {str(email_error)}")
            return Response(
                {'error': 'Failed to send password reset email. Please try again later.'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        return Response(
            {'message': 'If an account with this email exists, a password reset OTP has been sent.'}, 
            status=status.HTTP_200_OK
        )
        
    except Exception:
        return Response(
            {'error': 'An error occurred during password reset request'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_confirm(request):
    """
    API endpoint to confirm password reset with OTP and new password
    """
    try:
        email = request.data.get('email')
        otp_code = request.data.get('otp')
        new_password = request.data.get('new_password')
        confirm_password = request.data.get('confirm_password')
        
        if not all([email, otp_code, new_password, confirm_password]):
            return Response(
                {'error': 'All fields are required (email, otp, new_password, confirm_password)'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if new_password != confirm_password:
            return Response(
                {'error': 'Passwords do not match'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate password strength
        try:
            validate_password(new_password)
        except ValidationError as e:
            return Response(
                {'error': e.messages}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get the user by email
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {'error': 'Invalid email or OTP'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Find the OTP record
        try:
            pending_otp = PendingOTP.objects.filter(
                user=user,
                otp_code=otp_code,
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
                {'error': 'OTP has expired. Please request a new password reset.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Mark OTP as used
        pending_otp.is_used = True
        pending_otp.save()
        
        # Set new password
        user.set_password(new_password)
        user.save()
        
        return Response(
            {'message': 'Password has been reset successfully. You can now login with your new password.'}, 
            status=status.HTTP_200_OK
        )
        
    except Exception:
        return Response(
            {'error': 'An error occurred during password reset'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_validate(request):
    """
    API endpoint to validate password reset OTP without changing password
    """
    try:
        email = request.data.get('email')
        otp_code = request.data.get('otp')
        
        if not email or not otp_code:
            return Response(
                {'error': 'Missing validation parameters (email, otp)'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get the user by email
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {'valid': False, 'error': 'Invalid email or OTP'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Find the OTP record
        try:
            pending_otp = PendingOTP.objects.filter(
                user=user,
                otp_code=otp_code,
                otp_type='password_reset',
                is_used=False
            ).latest('created_at')
        except PendingOTP.DoesNotExist:
            return Response(
                {'valid': False, 'error': 'Invalid or expired OTP'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if the OTP is still valid (within 10 minutes)
        if is_otp_valid(pending_otp):
            return Response(
                {'valid': True, 'email': user.email}, 
                status=status.HTTP_200_OK
            )
        else:
            return Response(
                {'valid': False, 'error': 'OTP has expired. Please request a new password reset.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
    except Exception:
        return Response(
            {'valid': False, 'error': 'An error occurred during validation'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

