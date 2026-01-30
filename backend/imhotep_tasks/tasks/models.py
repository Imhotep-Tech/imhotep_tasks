from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings
from django.utils import timezone

#a class to define a table to save the poll questions in them
class Tasks(models.Model):

    # the title it self with max 200 char
    task_title = models.CharField(max_length=200)

    # the user that created this task
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    # the task details with max 2000 char (optional)
    task_details = models.CharField(max_length=2000, null=True, blank=True, default=None)

    # the date where this poll was created
    creation_date = models.DateTimeField(auto_now_add=True)

    # the date where this tasks is due by (optional)
    due_date = models.DateTimeField(default=timezone.now)

    #to set the current status of the poll if active or not
    status = models.BooleanField(default=False)

    done_date = models.DateTimeField(null=True, blank=True, default=None)

    def __str__(self):
        return self.task_title

#inherate from the User class and add the email verify
class User(AbstractUser):

    email_verify = models.BooleanField(default=False)

    def __str__(self):
        return self.username


class Routines(models.Model):
    # the title it self with max 200 char
    routines_title = models.CharField(max_length=200)

    # the user that created this task
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    # the dates the type to this routine
    routine_type = models.CharField(max_length=200,default='weekly')

    # the dates that this routine will be added
    routines_dates = models.JSONField(default=list)

    #to set the current status of the routine if active or not
    status = models.BooleanField(default=True)

    last_applied = models.DateTimeField(null=True, blank=True, default=None)

    def __str__(self):
        return self.routines_title

class PendingOTP(models.Model):
    OTP_TYPE_CHOICES = [
        ('registration', 'Registration'),
        ('password_reset', 'Password Reset'),
        ('email_change', 'Email Change'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    otp_code = models.CharField(max_length=6)
    otp_type = models.CharField(max_length=20, choices=OTP_TYPE_CHOICES, default='registration')
    new_email = models.EmailField(null=True, blank=True)  # Used for email change OTPs
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)

    def __str__(self):
        return f"OTP for {self.user.username} ({self.otp_type}) - Used: {self.is_used}"