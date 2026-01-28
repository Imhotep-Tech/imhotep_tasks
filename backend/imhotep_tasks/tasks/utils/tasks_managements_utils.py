from datetime import date, timedelta, datetime as _datetime
from django.utils.dateparse import parse_datetime
from ..models import Tasks
from django.db.models import Q
from django.utils import timezone

# Helper serializer for Tasks
def serialize_task(task):
    return {
        "id": task.id,
        "task_title": task.task_title,
        "task_details": getattr(task, "task_details", None),
        "due_date": task.due_date.isoformat() if getattr(task, "due_date", None) else None,
        "status": bool(task.status),
        "done_date": task.done_date.isoformat() if getattr(task, "done_date", None) else None,
        "created_by": getattr(task.created_by, "id", None),
        # Optional finance-related fields
        "price": getattr(task, "price", None),
        "transaction_id": getattr(task, "transaction_id", None),
        "transaction_status": getattr(task, "transaction_status", None),
        "transaction_currency": getattr(task, "transaction_currency", None),
        "transaction_category": getattr(task, "transaction_category", None),
    }

# Helper: parse date-like input to date
def _parse_date_input(value):
    if not value:
        return None
    # Accept date strings like "2025-08-17" or datetimes
    try:
        # If it's already a date/datetime
        if hasattr(value, 'date'):
            return value.date()
        # Try ISO date
        return date.fromisoformat(value)
    except Exception:
        try:
            dt = parse_datetime(value)
            if dt:
                return dt.date()
        except Exception:
            pass
    return None

# updated counts based on the url it called from
def tasks_count(url_call="all", request=None):
    today = timezone.now().date()

    #if the url call is for today tasks
    if url_call == "today-tasks":
        user_tasks_qs = Tasks.objects.filter(
            created_by=request.user
        ).filter(
            Q(due_date__date=today) |
            Q(due_date__date__lt=today, status=False)
        ).order_by('status', 'due_date').all()

        completed = user_tasks_qs.filter(status=True).count()
        total = user_tasks_qs.count()
        pending = total - completed

    #for the next week
    elif url_call == "next-week": 
        week_later = today + timedelta(days=7)
        user_tasks_qs = Tasks.objects.filter(
            created_by=request.user,
            due_date__date__gte=today,
            due_date__date__lte=week_later
        ).order_by('status', 'due_date').all()

        completed = user_tasks_qs.filter(status=True).count()
        total = user_tasks_qs.count()
        pending = total - completed

    # for all of the tasks (show all) or if it's not passed
    elif url_call == "all":
        user_tasks_qs = Tasks.objects.filter(created_by=request.user)

        completed = user_tasks_qs.filter(status=True).count()
        total = user_tasks_qs.count()
        pending = total - completed

    return total, completed, pending