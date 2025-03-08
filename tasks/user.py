from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from .models import Tasks
from django.contrib import messages
from django.db import IntegrityError
from datetime import date, timedelta
from django.utils import timezone
from django.utils.dateparse import parse_datetime

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

        today = timezone.now().date()

        task_title = request.POST.get("task_title")
        task_details = request.POST.get("task_details")
        due_date = request.POST.get("due_date")

        if due_date:
            due_date = parse_datetime(due_date).date()
            task = Tasks.objects.create(
                task_title=task_title,
                task_details=task_details,
                due_date=due_date,
                created_by=request.user
            )
            # Determine which page to redirect to
            if due_date == today:
                return redirect('today_tasks')
            elif today < due_date <= today + timedelta(days=7):
                return redirect('next_week_tasks')
            else:
                return redirect('all_tasks')
        
        else:
            task = Tasks.objects.create(
                task_title=task_title,
                task_details=task_details,
                created_by=request.user
            )

        messages.success(request, "Task added successfully!")
        return redirect('today_tasks')  # Redirect to today's tasks if using today's date

    context = {
        "username": request.user.username,
    }
    return render(request, 'add_task.html', context=context)

@login_required
def update_task(request, task_id):

    task = get_object_or_404(Tasks, id=task_id, created_by= request.user)

    #checks if the request is post
    if request.method=="POST":

        today = timezone.now().date()

        task_title = request.POST.get("task_title")
        task_details = request.POST.get("task_details")
        due_date = request.POST.get("due_date")

        task.task_title = task_title
        task.task_details = task_details
        if due_date:

            due_date = parse_datetime(due_date).date()

            task.due_date = due_date

            task.save()

            # Redirect to the today tasks with a success message
            messages.success(request, "Task updated successfully!")

            # Determine which page to redirect to
            if due_date == today:
                return redirect('today_tasks')
            elif today < due_date <= today + timedelta(days=7):
                return redirect('next_week_tasks')
            else:
                return redirect('all_tasks')

        # Redirect to the today tasks with a success message
        messages.success(request, "Task updated successfully!")
        return redirect("today_tasks")

    # If the request wasn't POST, then redirect to the update poll page with the poll data
    context = {
        "username": request.user.username,
        "task": task,
    }
    return render(request, "update_task.html", context)

@login_required
def delete_task(request, task_id):
    task = get_object_or_404(Tasks, id=task_id, created_by= request.user)

    if request.method == 'POST':
        
        today = timezone.now().date()

        due_date = task.due_date.date()

        task.delete()
        messages.success(request, "Task Delete successfully!")

        # Determine which page to redirect to
        if due_date == today:
            return redirect('today_tasks')
        elif today < due_date <= today + timedelta(days=7):
            return redirect('next_week_tasks')
        else:
            return redirect('all_tasks')
        
    else:
        messages.error(request, "Method not allowed!")
        return redirect("today_tasks")

@login_required
def task_complete(request, task_id):
    task = get_object_or_404(Tasks, id=task_id, created_by= request.user)

    if request.method == 'POST':
        
        today = timezone.now().date()

        due_date = task.due_date.date()

        if task.status:
            task.status = False
            task.done_date = None
        else:
            task.status = True
            task.done_date = today

        task.save()

        # Determine which page to redirect to
        if due_date == today:
            return redirect('today_tasks')
        elif today < due_date <= today + timedelta(days=7):
            return redirect('next_week_tasks')
        else:
            return redirect('all_tasks')
        
    else:
        messages.error(request, "Method not allowed!")
        return redirect("today_tasks")
