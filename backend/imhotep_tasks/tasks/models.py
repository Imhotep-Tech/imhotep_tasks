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

    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, default=None)

    transaction_id = models.CharField(max_length=200, null=True, blank=True, default=None)

    transaction_status = models.CharField(max_length=200, null=True, blank=True, default=None)

    transaction_currency = models.CharField(max_length=200, null=True, blank=True, default=None)

    transaction_category = models.CharField(max_length=200, null=True, blank=True, default=None)

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

    # Finance fields for Imhotep Finance integration
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, default=None)
    transaction_currency = models.CharField(max_length=200, null=True, blank=True, default=None)
    transaction_status = models.CharField(max_length=200, null=True, blank=True, default=None)
    transaction_category = models.CharField(max_length=200, null=True, blank=True, default=None)

    def __str__(self):
        return self.routines_title


class ImhotepFinanceConnection(models.Model):
    """
    Store OAuth2 tokens and scopes for Imhotep Finance per user.
    """

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='imhotep_finance_connection',
    )

    access_token = models.CharField(max_length=512)
    refresh_token = models.CharField(max_length=512, null=True, blank=True, default=None)
    expires_at = models.DateTimeField(null=True, blank=True, default=None)
    scopes = models.CharField(max_length=512, null=True, blank=True, default='')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Imhotep Finance connection for {self.user}"