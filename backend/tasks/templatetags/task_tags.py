from datetime import date, timedelta
from django.utils import timezone
from django import template

register = template.Library()

@register.simple_tag
def due_date_display(due_date, status):
    if not due_date:
        return ""

    due_date_day = due_date.date()
    today = timezone.now().date()
    tomorrow = today + timedelta(days=1)

    if due_date_day == today:
        return f'<span class="font-medium text-blue-600">Today</span>'
    elif due_date_day == tomorrow:
        return f'<span class="font-medium text-purple-600">Tomorrow</span>'
    else:
        if status == False and due_date_day < today:
            return f'<span class="font-medium text-red-600">Overdue {due_date.strftime("%b %d, %Y")}</span>'
        
        return f'{due_date.strftime("%b %d, %Y")}'
