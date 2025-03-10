from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from .models import User
from django.contrib import messages

from django.contrib.auth import authenticate, login, logout, get_backends
from django.contrib.auth.views import PasswordChangeView, PasswordChangeDoneView
from django.core.mail import send_mail
from django.contrib.auth.forms import PasswordChangeForm
from django.template.loader import render_to_string
from django.contrib.sites.shortcuts import get_current_site
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.contrib.auth.tokens import default_token_generator

# Password reset views
class CustomPasswordChangeView(PasswordChangeView):
    template_name = 'password_change.html'
    form_class = PasswordChangeForm

    def form_invalid(self, form):
        for field, errors in form.errors.items():
            for error in errors:
                messages.error(self.request, error)
        return super().form_invalid(form)

class CustomPasswordChangeDoneView(PasswordChangeDoneView):
    template_name = 'password_change_done.html'

@login_required
def update_profile(request, user_id):

    user = get_object_or_404(User, id=user_id)

    if request.method == 'POST':
        user_username = request.POST.get("username")
        user_email = request.POST.get("email")

        if user.email == user_email and user.username == user_username:
            messages.info(request, "Nothing has been updated!")
            return redirect("update_profile", user_id=user_id)
        
        # Check if username contains '@'
        if '@' in user_username:
            messages.error(request, "Username can't include @")
            return redirect("update_profile", user_id=user_id)
        
        # Check if email contains '@'
        if not '@' in user_email:
            messages.error(request, "Email must include @!")
            return redirect("update_profile", user_id=user_id)

        if user.email != user_email and user.username != user_username:

            # Check if username already exists
            if User.objects.filter(username=user_username).exists():
                messages.error(request, 'Username already taken, please choose another one!')
                return redirect("update_profile", user_id=user_id)
            
            # Check if email already exists
            if User.objects.filter(email=user_email).exists():
                messages.error(request, 'Email already taken, please choose another one!')
                return redirect("update_profile", user_id=user_id)

            # Send verification email
            current_site = get_current_site(request)
            mail_subject = 'Activate your account.'
            message = render_to_string('activate_mail_send.html', {
                'user': user,
                'domain': current_site.domain,
                'uid': urlsafe_base64_encode(force_bytes(user.pk)),
                'token': default_token_generator.make_token(user),
                'new_email': urlsafe_base64_encode(force_bytes(user_email)),
                'activate':'activate_profile_update'
            })
            send_mail(mail_subject, message, 'imhoteptech1@gmail.com', [user_email], html_message=message)

            messages.success(request, "Email submitted successfully! Please check your email to verify your Email.")

            user.username = user_username
            logout(user)
            return redirect("update_profile", user_id=user_id)

        elif user.username != user_username:

            # Check if username already exists
            if User.objects.filter(username=user_username).exists():
                messages.error(request, 'Username already taken, please choose another one!')
                return redirect("update_profile", user_id=user_id)
            
            user.username = user_username
            user.save()
            messages.success(request, "Username Updated successfully!")
            return redirect("update_profile", user_id=user_id)
        
        else:
            # Check if email already exists
            if User.objects.filter(email=user_email).exists():
                messages.error(request, 'Email already taken, please choose another one!')
                return redirect("update_profile", user_id=user_id)
            
            # Send verification email
            current_site = get_current_site(request)
            mail_subject = 'Activate your account.'
            message = render_to_string('activate_mail_change_send.html', {
                'user': user,
                'domain': current_site.domain,
                'uid': urlsafe_base64_encode(force_bytes(user.pk)),
                'token': default_token_generator.make_token(user),
                'new_email': urlsafe_base64_encode(force_bytes(user_email)),
                'activate':'activate_profile_update'
            })
            send_mail(mail_subject, message, 'imhoteptech1@gmail.com', [user_email], html_message=message)

            messages.success(request, "Email submitted successfully! Please check your email to verify your Email.")
            return redirect("update_profile", user_id=user_id)

    # If the request wasn't POST, then redirect to the update poll page with the poll data
    context = {
        "username": request.user.username,
        "user":user
    }
    return render(request, "update_profile.html", context)

#the activate route
def activate_profile_update(request, uidb64, token, new_email):
    try:
        # Decode the user ID and new email
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
        new_email = force_str(urlsafe_base64_decode(new_email))
    except(TypeError, ValueError, OverflowError, User.DoesNotExist):
        user = None

    # Check if the token is valid
    if user is not None and default_token_generator.check_token(user, token):
        user.email = new_email
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
       return redirect('register')
    