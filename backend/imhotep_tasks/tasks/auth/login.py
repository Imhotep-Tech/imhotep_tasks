from django.contrib.auth import authenticate
from ..models import User, PendingOTP
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.views.decorators.csrf import csrf_exempt
from tasks.utils.otp_utils import generate_otp, OTP_VALIDITY_MINUTES

#the login route
@api_view(['POST'])
@permission_classes([AllowAny])
@csrf_exempt
def login_view(request):
    try:
        user_username_mail = request.data.get('username')
        password = request.data.get('password')

        if not user_username_mail or not password:
            return Response(
                {'error': 'Username/email and password are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        user = None

        # Check if the input is a username or email
        if '@' not in user_username_mail:
            # Authenticate using username
            user = authenticate(username=user_username_mail, password=password)
        else:
            # Authenticate using email - first find user by email, then authenticate with username
            try:
                user_obj = User.objects.filter(email=user_username_mail).first()
                if user_obj:
                    user = authenticate(username=user_obj.username, password=password)
            except Exception as e:
                return Response(
                    {'error': 'Database error occurred'}, 
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

        if user:
            if user.email_verify == True:
                refresh = RefreshToken.for_user(user)
                return Response({
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                    'user': {
                        'id': user.id,
                        'username': user.username,
                        'email': user.email,
                        'first_name': user.first_name,
                        'last_name': user.last_name,
                    }
                })
            else:
                # Invalidate any existing unused registration OTPs for this user
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
                    send_mail(mail_subject, message, 'imhoteptech1@gmail.com', [user.email], html_message=message)
                except Exception as email_error:
                    # If email fails, still create the user but log the error
                    print(f"Failed to send verification email: {str(email_error)}")

                return Response(
                    {
                        'error': 'Email not verified',
                        'message': 'Please check your email to verify your account. A new verification email has been sent.'
                    },
                    status=status.HTTP_401_UNAUTHORIZED
                )
        else:
            return Response(
                {'error': 'Invalid credentials'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )

    except Exception as e:
        return Response(
            {'error': 'An error occurred during login. Please try again.'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )