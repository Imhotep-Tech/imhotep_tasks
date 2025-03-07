from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from .models import Tasks
from django.contrib import messages
from django.db import IntegrityError
from datetime import date

#the user today_tasks function
@login_required
def today_tasks(request):
    #get user tasks for today
    today = date.today()

    # If you need to handle DateTimeField comparison to date:
    user_tasks_today = Tasks.objects.filter(
        created_by=request.user,
        due_date__date=today
    ).order_by('id')
    
    completed_tasks_count = user_tasks_today.filter(status=True).count()

    total_number_tasks = user_tasks_today.count()

    #create the context data that will be sent
    context = {
        "username": request.user.username,
        "user_tasks_today": user_tasks_today,
        "total_number_tasks":total_number_tasks,
        "completed_tasks_count" :completed_tasks_count,
        "pending_tasks":total_number_tasks-completed_tasks_count,
        "tasks_title":"Today's Tasks"
    }
    return render(request, "show_tasks.html", context)

#the user today_tasks function
@login_required
def all_tasks(request):

    # If you need to handle DateTimeField comparison to date:
    user_tasks_today = Tasks.objects.filter(
        created_by=request.user,
    ).order_by('id')
    
    completed_tasks_count = user_tasks_today.filter(status=True).count()

    total_number_tasks = user_tasks_today.count()

    #create the context data that will be sent
    context = {
        "username": request.user.username,
        "user_tasks_today": user_tasks_today,
        "total_number_tasks":total_number_tasks,
        "completed_tasks_count" :completed_tasks_count,
        "pending_tasks":total_number_tasks-completed_tasks_count,
        "tasks_title":"All Tasks"
    }
    return render(request, "show_tasks.html", context)
