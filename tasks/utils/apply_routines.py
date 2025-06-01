from django.db.models import Q
from django.utils import timezone
from datetime import datetime, timedelta
from ..models import Tasks, Routines

def apply_routines(request, target_date, manually = False):
    #get current day of week (Monday=0, Sunday=6)
    current_weekday = target_date.weekday()
    day_names = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    current_day_name = day_names[current_weekday]
    
    #get all active routines for the user
    active_routines = Routines.objects.filter(
        created_by=request.user,
        status=True
    )
    
    #check each routine to see if it should create a task today
    for routine in active_routines:
        should_create_task = False
        routine_days = routine.routines_dates.lower().split()

        #check if routine applies to current day (using date only)
        last_applied_date = routine.last_applied.date() if routine.last_applied else None
        target_date_only = target_date.date() if hasattr(target_date, 'date') else target_date
        
        if current_day_name in routine_days and (last_applied_date != target_date_only or manually):
            should_create_task = True
        
        if should_create_task:
            # create task from routine using date only
            Tasks.objects.create(
                task_title=routine.routines_title,
                task_details=f"Created from routine: {routine.routines_title}",
                due_date=target_date,
                created_by=request.user,
                status=False
            )
            routine.last_applied = target_date_only
            routine.save()
