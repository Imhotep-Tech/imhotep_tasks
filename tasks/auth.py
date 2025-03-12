#all of the auth related function
from django.shortcuts import render, redirect
from .models import User
from django.contrib import messages
from django.contrib.auth import authenticate, login, logout, get_backends
from django.contrib.auth.decorators import login_required
from django.contrib.auth.views import PasswordResetView, PasswordResetDoneView, PasswordResetConfirmView, PasswordResetCompleteView
from django.core.mail import send_mail
from django.urls import reverse
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.template.loader import render_to_string
from django.contrib.sites.shortcuts import get_current_site
from django.contrib.auth.tokens import default_token_generator
from django.http import HttpResponse
from django.contrib.auth.forms import PasswordResetForm, SetPasswordForm
import requests
from django.conf import settings
from django.contrib.auth.hashers import make_password
from imhotep_tasks.settings import SITE_DOMAIN

#the register route
def register(request):

    if request.user.is_authenticated:
        return redirect("today_tasks")

    if request.method == "POST":
        username = request.POST.get('username')
        email = request.POST.get('email')
        password = request.POST.get('password')

        # Check if username contains '@'
        if '@' in username:
            messages.error(request, "Username can't include @")

        # Check if email contains '@'
        if not '@' in email:
            messages.error(request, "Email must include @!")

        # Check if username already exists
        if User.objects.filter(username=username).exists():
            messages.error(request, 'Username already taken, please choose another one!')
            return render(request, "register.html")

        # Check if email already exists
        if User.objects.filter(email=email).exists():
            messages.error(request, 'Email already taken, please choose another one or login!')
            return render(request, "register.html")

        # Create a new user
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            email_verify=False
        )
        user.save()

        # Send verification email
        mail_subject = 'Activate your account.'
        current_site = SITE_DOMAIN.rstrip('/')  # Remove trailing slash if present
        message = render_to_string('activate_mail_send.html', {
            'user': user,
            'domain': current_site,
            'uid': urlsafe_base64_encode(force_bytes(user.pk)),
            'token': default_token_generator.make_token(user),
        })
        send_mail(mail_subject, message, 'imhoteptech1@gmail.com', [email], html_message=message)

        messages.success(request, "Account created successfully! Please check your email to verify your account.")
        return redirect("login")

    return render(request, "register.html")

#the activate route
def activate(request, uidb64, token):
    try:
        # Decode the user ID
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except(TypeError, ValueError, OverflowError, User.DoesNotExist):
        user = None

    # Check if the token is valid
    if user is not None and default_token_generator.check_token(user, token):
        user.is_active = True
        user.email_verify = True
        user.save()

        # Set the backend attribute on the user
        backend = get_backends()[0]
        user.backend = f'{backend.__module__}.{backend.__class__.__name__}'

        # Log the user in
        login(request, user)
        messages.success(request, "Thank you for your email confirmation. You can now log in to your account.")
        return redirect('login')
    else:
        messages.success(request, "Activation link is invalid!")
        return redirect('login')

#the login route
def user_login(request):

    if request.user.is_authenticated:
        return redirect("today_tasks")

    if request.method == "POST":
        user_username_mail = request.POST.get('user_username_mail')
        password = request.POST.get('password')

        # Check if the input is a username or email
        if '@' not in user_username_mail:
            # Authenticate using username
            user = authenticate(request, username=user_username_mail, password=password)
            if user is not None:
                if user.email_verify == True:
                    login(request, user)
                    messages.success(request, "Login successful!")
                    return redirect("today_tasks")
                else:
                    # Send verification email
                    mail_subject = 'Activate your account.'
                    current_site = SITE_DOMAIN.rstrip('/')  # Remove trailing slash if present
                    message = render_to_string('activate_mail_send.html', {
                        'user': user,
                        'domain': current_site,
                        'uid': urlsafe_base64_encode(force_bytes(user.pk)),
                        'token': default_token_generator.make_token(user),
                    })
                    send_mail(mail_subject, message, 'imhoteptech1@gmail.com', [user.email], html_message=message)

                    messages.error(request, "E-mail not verified!")
                    messages.info(request, "Please check your email to verify your account.")
                    return redirect("login")
            else:
                messages.error(request, "Invalid username or password!")
        else:
            # Authenticate using email
            user = User.objects.filter(email=user_username_mail).first()
            if user:
                username = user.username
                user = authenticate(request, username=username, password=password)
                if user is not None:
                    if user.email_verify == True:
                        login(request, user)
                        messages.success(request, "Login successful!")
                        return redirect("today_tasks")
                    else:
                        # Send verification email
                        mail_subject = 'Activate your account.'
                        current_site = SITE_DOMAIN.rstrip('/')  # Remove trailing slash if present
                        message = render_to_string('activate_mail_send.html', {
                            'user': user,
                            'domain': current_site,
                            'uid': urlsafe_base64_encode(force_bytes(user.pk)),
                            'token': default_token_generator.make_token(user),
                        })
                        send_mail(mail_subject, message, 'imhoteptech1@gmail.com', [user.email], html_message=message)

                        messages.error(request, "E-mail not verified!")
                        messages.info(request, "Please check your email to verify your account.")
                        return redirect("login")
                else:
                    messages.error(request, "Invalid E-mail or password!")
            else:
                messages.error(request, "Invalid E-mail or password!")

    return render(request, "login.html")

#the logout route
@login_required
def user_logout(request):
    logout(request)
    messages.success(request, "You have been logged out.")
    return redirect("login")

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
    
    # Override this method to use SITE_DOMAIN instead of the Sites framework
    def get_extra_email_context(self):
        context = super().get_extra_email_context() or {}
        context['domain'] = SITE_DOMAIN.replace('http://', '').replace('https://', '')
        context['site_name'] = 'Imhotep Tasks'
        context['protocol'] = 'https' if 'https://' in SITE_DOMAIN else 'http'
        return context
    
    def send_mail(self, subject_template_name, email_template_name,
                context, from_email, to_email, html_email_template_name=None):
        """
        Override to use a custom subject
        """
        subject = "Reset your Imhotep Tasks password"
        
        # # Ensure the domain is set correctly before sending the email
        # if 'domain' not in context:
        #     context['domain'] = SITE_DOMAIN.replace('http://', '').replace('https://', '')
        #     context['site_name'] = 'Imhotep Tasks'
        #     context['protocol'] = 'https' if 'https://' in SITE_DOMAIN else 'http'
            
        return super().send_mail(
            subject_template_name, email_template_name, context, from_email,
            to_email, html_email_template_name
        )

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


GOOGLE_CLIENT_ID = settings.SOCIALACCOUNT_PROVIDERS['google']['APP']['client_id']
GOOGLE_CLIENT_SECRET = settings.SOCIALACCOUNT_PROVIDERS['google']['APP']['secret']
GOOGLE_REDIRECT_URI = settings.SOCIALACCOUNT_PROVIDERS['google']['REDIRECT_URI']

def google_login(request):
    """Initiates the Google OAuth2 login flow"""
    oauth2_url = (
        'https://accounts.google.com/o/oauth2/v2/auth?'
        f'client_id={GOOGLE_CLIENT_ID}&'
        f'redirect_uri={SITE_DOMAIN}/google/callback/&'
        'response_type=code&'
        'scope=openid email profile'
    )
    return redirect(oauth2_url)

def google_callback(request):
    """Handles the callback from Google OAuth2"""
    code = request.GET.get('code')
    
    if not code:
        messages.error(request, "Google login was canceled. Please try again.")
        return redirect('login')

    # Exchange code for access token
    token_url = 'https://oauth2.googleapis.com/token'
    token_payload = {
        'client_id': GOOGLE_CLIENT_ID,
        'client_secret': GOOGLE_CLIENT_SECRET,
        'code': code,
        'redirect_uri': GOOGLE_REDIRECT_URI,
        'grant_type': 'authorization_code'
    }

    try:
        token_response = requests.post(token_url, data=token_payload)
        token_data = token_response.json()

        # Get user info using access token
        userinfo_url = 'https://www.googleapis.com/oauth2/v3/userinfo'
        headers = {'Authorization': f'Bearer {token_data["access_token"]}'}
        userinfo_response = requests.get(userinfo_url, headers=headers)
        user_info = userinfo_response.json()

        email = user_info['email']
        username = email.split('@')[0]
        
        # Check if user exists
        user = User.objects.filter(email=email).first()
        
        if user:
            # Set the backend attribute on the user
            backend = get_backends()[0]
            user.backend = f'{backend.__module__}.{backend.__class__.__name__}'
            # User exists, log them in
            login(request, user)
            messages.success(request, "Login successful!")
            return redirect('today_tasks')
        
        # Check if username exists
        if User.objects.filter(username=username).exists():
            # Store info in session and ask for new username
            request.session['google_user_info'] = {
                'email': email,
                'need_username': True
            }
            return render(request, 'add_username_google.html')

        # Create new user
        user = User.objects.create_user(
            username=username,
            email=email,
            password=make_password(None),  # Random password since using OAuth
            email_verify=True  # Google accounts are pre-verified
        )

        backend = get_backends()[0]
        user.backend = f'{backend.__module__}.{backend.__class__.__name__}'

        # Log user in
        login(request, user)
        messages.success(request, "Account created successfully!")
        return redirect('today_tasks')

    except Exception as e:
        messages.error(request, f"An error occurred during Google login. Please try again. {e}")
        return redirect('login')

def add_username_google_login(request):
    
    if request.method != "POST":
        return redirect('login')

    user_info = request.session.get('google_user_info', {})
    if not user_info:
        messages.error(request, "Session expired. Please try again.")
        return redirect('login')

    new_username = request.POST.get('username')

    # Validate username
    if User.objects.filter(username=new_username).exists():
        messages.error(request, "Username already taken. Please choose another one.")
        return render(request, 'add_username_google.html')

    # Create user with new username
    user = User.objects.create_user(
        username=new_username,
        email=user_info['email'],
        password=make_password(None),
        email_verify=True
    )

    # Set the backend attribute on the user
    backend = get_backends()[0]
    user.backend = f'{backend.__module__}.{backend.__class__.__name__}'

    # Clean up session
    del request.session['google_user_info']

    # Log user in
    login(request, user)
    messages.success(request, "Account created successfully!")
    return redirect('today_tasks')