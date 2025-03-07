from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings

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
    due_date = models.DateTimeField(null=True, blank=True, default=None)

    #to set the current status of the poll if active or not
    status = models.BooleanField(default=False)

    def __str__(self):
        return self.question

#inherate from the User class and add the email verify
class User(AbstractUser):

    email_verify = models.BooleanField(default=False)

    def __str__(self):
        return self.username
    