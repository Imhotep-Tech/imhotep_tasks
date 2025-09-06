from django.db.models import Q
from django.utils import timezone
from datetime import datetime, timedelta
from ..models import Tasks, Routines

def apply_routines(request, target_date, manually=False):
    """
    Apply routines for the given target date.
    Supports weekly, monthly, and yearly routine types.
    """
    # Get current date information
    current_weekday = target_date.weekday()
    day_names = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    current_day_name = day_names[current_weekday]
    current_day_of_month = target_date.day
    current_date_str = target_date.strftime('%m-%d')  # MM-DD format for yearly routines
    
    #get all active routines for the user
    active_routines = Routines.objects.filter(
        created_by=request.user,
        status=True
    )
    
    #check each routine to see if it should create a task today
    for routine in active_routines:
        should_create_task = False
        
        # Handle routines_dates as a list (JSONField)
        routine_dates = routine.routines_dates
        if not isinstance(routine_dates, list):
            # Fallback for old data that might be stored as string
            routine_dates = str(routine_dates).lower().split() if routine_dates else []
        
        # Check if routine applies to current day based on routine type
        last_applied_date = routine.last_applied.date() if routine.last_applied else None
        target_date_only = target_date.date() if hasattr(target_date, 'date') else target_date
        
        # Check if a task already exists for this routine on this date
        existing_task = Tasks.objects.filter(
            created_by=request.user,
            task_title=routine.routines_title,
            due_date__date=target_date_only,
            task_details__startswith=f"Created from {routine.routine_type} routine:"
        ).exists()
        
        # Skip if already applied today or task already exists (unless manually triggered)
        if (last_applied_date == target_date_only or existing_task) and not manually:
            continue
            
        if routine.routine_type == 'weekly':
            # Weekly routines: check if current day name is in routine_dates
            if current_day_name in routine_dates:
                should_create_task = True
                
        elif routine.routine_type == 'monthly':
            # Monthly routines: check if current day of month is in routine_dates
            if str(current_day_of_month) in routine_dates:
                should_create_task = True
                
        elif routine.routine_type == 'yearly':
            # Yearly routines: check if current MM-DD is in routine_dates
            if current_date_str in routine_dates:
                should_create_task = True
        
        if should_create_task:
            # create task from routine using date only
            Tasks.objects.create(
                task_title=routine.routines_title,
                task_details=f"Created from {routine.routine_type} routine: {routine.routines_title}",
                due_date=target_date,
                created_by=request.user,
                status=False
            )
            routine.last_applied = target_date_only
            routine.save()
