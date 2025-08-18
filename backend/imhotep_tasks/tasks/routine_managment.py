from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from .models import Tasks, Routines
from django.contrib import messages
from django.db import IntegrityError
from datetime import date, timedelta
from django.utils import timezone
from django.utils.dateparse import parse_datetime
from django.utils.dateparse import parse_datetime
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.db.models import Q
from .utils.apply_routines import apply_routines

#the user today_tasks function
@login_required
def show_routines(request):
    #get user tasks for today
    today = date.today()

    user_routines_all = Routines.objects.filter(created_by=request.user)
    
    # Set up pagination - 20 tasks per page
    paginator = Paginator(user_routines_all, 20)
    page = request.GET.get('page', 1)

    try:
        user_routines = paginator.page(page)
    except PageNotAnInteger:
        # If page is not an integer, deliver first page
        user_routines = paginator.page(1)
    except EmptyPage:
        # If page is out of range, deliver last page of results
        user_routines = paginator.page(paginator.num_pages)

    #create the context data that will be sent
    context = {
        "username": request.user.username,
        "user_routines": user_routines,
    }
    return render(request, "show_routines.html", context)

@login_required
def add_routine(request):
    if request.method == 'POST':

        routines_title = request.POST.get("routines_title")
        routines_dates = request.POST.get("routines_dates")

        routine = Routines.objects.create(
            routines_title=routines_title,
            routines_dates=routines_dates,
            created_by=request.user
        )
        
        messages.success(request, "Routine added successfully!")
        return redirect('show_routines')

    context = {
        "username": request.user.username,
    }
    return render(request, 'add_routines.html', context=context)

@login_required
def update_routine(request, routine_id):

    routine = get_object_or_404(Routines, id=routine_id, created_by= request.user)

    #checks if the request is post
    if request.method=="POST":

        routines_title = request.POST.get("routines_title")
        routines_dates = request.POST.get("routines_dates")

        routine.routines_title = routines_title
        routine.routines_dates = routines_dates

        routine.save()

        # Redirect to the today tasks with a success message
        messages.success(request, "Routine updated successfully!")

        return redirect("show_routines")

    # If the request wasn't POST, then redirect to the update poll page with the poll data
    context = {
        "username": request.user.username,
        "routine": routine,
    }
    return render(request, "update_routine.html", context)

@login_required
def delete_routine(request, routine_id):
    routine = get_object_or_404(Routines, id=routine_id, created_by= request.user)

    if request.method == 'POST':

        routine.delete()
        messages.success(request, "Routine Delete successfully!")

        return redirect('show_routines')
        
    else:
        messages.error(request, "Method not allowed!")
        return redirect("today_tasks")

@login_required
def update_routine_status(request, routine_id):
    routine = get_object_or_404(Routines, id=routine_id, created_by= request.user)

    if request.method == 'POST':

        if routine.status:
            routine.status = False
        else:
            routine.status = True

        routine.save()

        return redirect('show_routines')
        
    else:
        messages.error(request, "Method not allowed!")
        return redirect("today_tasks")

@login_required
def apply_routines_view(request):
    """Manual routine application view"""
    if request.method == 'POST':
        today = date.today()
        apply_routines(request, today, True)
        messages.success(request, "Routines applied successfully!")
        return redirect('today_tasks')
    
    return redirect('show_routines')
