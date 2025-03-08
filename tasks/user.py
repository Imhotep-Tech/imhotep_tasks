from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from .models import Tasks
from django.contrib import messages
from django.db import IntegrityError
from datetime import date, timedelta

#the user today_tasks function
@login_required
def today_tasks(request):
    #get user tasks for today
    today = date.today()

    user_tasks = Tasks.objects.filter(
        created_by=request.user,
        due_date__date=today
    ).order_by('id')
    
    completed_tasks_count = user_tasks.filter(status=True).count()

    total_number_tasks = user_tasks.count()

    #create the context data that will be sent
    context = {
        "username": request.user.username,
        "user_tasks": user_tasks,
        "total_number_tasks":total_number_tasks,
        "completed_tasks_count" :completed_tasks_count,
        "pending_tasks":total_number_tasks-completed_tasks_count,
        "tasks_title":"Today's Tasks"
    }
    return render(request, "show_tasks.html", context)

#the user today_tasks function
@login_required
def all_tasks(request):

    user_tasks = Tasks.objects.filter(
        created_by=request.user,
    ).order_by('id')
    
    completed_tasks_count = user_tasks.filter(status=True).count()

    total_number_tasks = user_tasks.count()

    #create the context data that will be sent
    context = {
        "username": request.user.username,
        "user_tasks": user_tasks,
        "total_number_tasks":total_number_tasks,
        "completed_tasks_count" :completed_tasks_count,
        "pending_tasks":total_number_tasks-completed_tasks_count,
        "tasks_title":"All Tasks"
    }
    return render(request, "show_tasks.html", context)

#the user today_tasks function
@login_required
def next_week_tasks(request):

    # Get today's date
    today = date.today()
    
    # Calculate the date 7 days from now
    week_later = today + timedelta(days=7)
    
    # Filter tasks between today and next 7 days
    user_tasks = Tasks.objects.filter(
        created_by=request.user,
        due_date__date__gte=today,  # greater than or equal to today
        due_date__date__lte=week_later  # less than or equal to a week from today
    ).order_by('id')
    
    completed_tasks_count = user_tasks.filter(status=True).count()

    total_number_tasks = user_tasks.count()

    #create the context data that will be sent
    context = {
        "username": request.user.username,
        "user_tasks": user_tasks,
        "total_number_tasks":total_number_tasks,
        "completed_tasks_count" :completed_tasks_count,
        "pending_tasks":total_number_tasks-completed_tasks_count,
        "tasks_title":"Next 7 days Tasks"
    }
    return render(request, "show_tasks.html", context)

@login_required
def add_task(request):
    if request.method == 'POST':

        today = date.today()
        task_title = request.POST.get("task_title")
        task_details = request.POST.get("task_details")
        due_date = request.POST.get("due_date")

        if due_date:
            task = Tasks.objects.create(
                task_title=task_title,
                task_details=task_details,
                due_date=due_date,
                created_by=request.user
            )
        else:
            task = Tasks.objects.create(
                task_title=task_title,
                task_details=task_details,
                due_date=today,
                created_by=request.user
            )

        messages.success(request, "Task added successfully!")
        return redirect('today_tasks')
    context = {
        "username": request.user.username,
    }
    return render(request, 'add_task.html', context=context)
