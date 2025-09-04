from django.shortcuts import get_object_or_404
from datetime import date, timedelta, datetime as _datetime
from django.utils import timezone
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.db.models import Q
from tasks.utils.apply_routines import apply_routines
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from ..models import User, Tasks
from ..utils import tasks_managements_utils

#the user today_tasks function
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def today_tasks(request):
    today = date.today()
    apply_routines(request, today)

    user_tasks_qs = Tasks.objects.filter(
        created_by=request.user
    ).filter(
        Q(due_date__date=today) |
        Q(due_date__date__lt=today, status=False)
    ).order_by('status', 'due_date').all()

    paginator = Paginator(user_tasks_qs, 20)
    page_num = request.GET.get('page', 1)
    try:
        page_obj = paginator.page(page_num)
    except (PageNotAnInteger, EmptyPage):
        page_obj = paginator.page(1)

    tasks_list = [tasks_managements_utils.serialize_task(t) for t in page_obj.object_list]
    completed_tasks_count = user_tasks_qs.filter(status=True).count()
    total_number_tasks = user_tasks_qs.count()

    response_data = {
        'success': True,
        "username": request.user.username,
        "user_tasks": tasks_list,
        "pagination": {
            "page": page_obj.number,
            "num_pages": paginator.num_pages,
            "per_page": paginator.per_page,
            "total": paginator.count,
        },
        "total_number_tasks": total_number_tasks,
        "completed_tasks_count": completed_tasks_count,
        "pending_tasks": total_number_tasks - completed_tasks_count,
    }
    return Response(response_data, status=status.HTTP_200_OK)

#the user all_tasks function
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def all_tasks(request):
    user_tasks_qs = Tasks.objects.filter(created_by=request.user).order_by('status', 'due_date').all()

    paginator = Paginator(user_tasks_qs, 20)
    page_num = request.GET.get('page', 1)
    try:
        page_obj = paginator.page(page_num)
    except (PageNotAnInteger, EmptyPage):
        page_obj = paginator.page(1)

    tasks_list = [tasks_managements_utils.serialize_task(t) for t in page_obj.object_list]
    completed_tasks_count = user_tasks_qs.filter(status=True).count()
    total_number_tasks = user_tasks_qs.count()

    response_data = {
        "username": request.user.username,
        "user_tasks": tasks_list,
        "pagination": {
            "page": page_obj.number,
            "num_pages": paginator.num_pages,
            "per_page": paginator.per_page,
            "total": paginator.count,
        },
        "total_number_tasks": total_number_tasks,
        "completed_tasks_count": completed_tasks_count,
        "pending_tasks": total_number_tasks - completed_tasks_count,
    }
    return Response(response_data, status=status.HTTP_200_OK)

#the next_week_tasks function
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def next_week_tasks(request):
    today = date.today()
    apply_routines(request, today)
    week_later = today + timedelta(days=7)

    user_tasks_qs = Tasks.objects.filter(
        created_by=request.user,
        due_date__date__gte=today,
        due_date__date__lte=week_later
    ).order_by('status', 'due_date').all()

    paginator = Paginator(user_tasks_qs, 20)
    page_num = request.GET.get('page', 1)
    try:
        page_obj = paginator.page(page_num)
    except (PageNotAnInteger, EmptyPage):
        page_obj = paginator.page(1)

    tasks_list = [tasks_managements_utils.serialize_task(t) for t in page_obj.object_list]
    completed_tasks_count = user_tasks_qs.filter(status=True).count()
    total_number_tasks = user_tasks_qs.count()

    response_data = {
        "username": request.user.username,
        "user_tasks": tasks_list,
        "pagination": {
            "page": page_obj.number,
            "num_pages": paginator.num_pages,
            "per_page": paginator.per_page,
            "total": paginator.count,
        },
        "total_number_tasks": total_number_tasks,
        "completed_tasks_count": completed_tasks_count,
        "pending_tasks": total_number_tasks - completed_tasks_count,
    }
    return Response(response_data, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_task(request):
    try:
        today = timezone.now().date()

        url_call = request.data.get("url_call", "all")
        task_title = request.data.get("task_title")
        task_details = request.data.get("task_details")
        due_date_raw = request.data.get("due_date")
        due_date = tasks_managements_utils._parse_date_input(due_date_raw) or today

        task = Tasks.objects.create(
            task_title=task_title,
            task_details=task_details,
            due_date=due_date,
            created_by=request.user
        )

        task_data = tasks_managements_utils.serialize_task(task)

        total, completed, pending = tasks_managements_utils.tasks_count(url_call, request)

        return Response({
            "success": True,
            "task": task_data,
            "total_number_tasks": total,
            "completed_tasks_count": completed,
            "pending_tasks": pending
        }, status=status.HTTP_201_CREATED)
    
    except Exception:
        return Response(
            {
                'error': 'An error occurred',
                'success': False
            }, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_task(request, task_id):
    try:
        url_call = request.data.get("url_call", "all")
        task = get_object_or_404(Tasks, id=task_id, created_by=request.user)

        task_title = request.data.get("task_title", task.task_title)
        task_details = request.data.get("task_details", task.task_details)
        due_date_raw = request.data.get("due_date", None)
    
        task.task_title = task_title
        task.task_details = task_details
        if due_date_raw is not None:
            parsed = tasks_managements_utils._parse_date_input(due_date_raw)
            task.due_date = parsed
        task.save()

        task_data = tasks_managements_utils.serialize_task(task)

        total, completed, pending = tasks_managements_utils.tasks_count(url_call, request)

        return Response({
            "success": True,
            "task": task_data,
            "total_number_tasks": total,
            "completed_tasks_count": completed,
            "pending_tasks": pending
        }, status=status.HTTP_200_OK)
    
    except Exception:
        return Response(
            {
                'error': 'An error occurred',
                'success': False
            }, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_task(request, task_id):
    try:
        task = get_object_or_404(Tasks, id=task_id, created_by=request.user)
        url_call = request.data.get("url_call", "all")

        due_date = getattr(task.due_date, "date", task.due_date)
        if hasattr(due_date, "date"):
            due_date = due_date.date()
        task.delete()

        total, completed, pending = tasks_managements_utils.tasks_count(url_call, request)

        return Response({
            "success": True,
            "message": "Task deleted",
            "total_number_tasks": total,
            "completed_tasks_count": completed,
            "pending_tasks": pending
        }, status=status.HTTP_200_OK)

    except Exception:
            return Response(
                {
                    'error': 'An error occurred',
                    'success': False
                }, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def task_complete(request, task_id):
    try:
        url_call = request.data.get("url_call", "all")
        task = get_object_or_404(Tasks, id=task_id, created_by=request.user)

        if task.status:
            task.status = False
            task.done_date = None
        else:
            task.status = True
            task.done_date = timezone.now().date()

        task.save()
        task_data = tasks_managements_utils.serialize_task(task)

        total, completed, pending = tasks_managements_utils.tasks_count(url_call, request)

        return Response({
            "success": True,
            "task": task_data,
            "total_number_tasks": total,
            "completed_tasks_count": completed,
            "pending_tasks": pending
        }, status=status.HTTP_200_OK)

    except Exception:
        return Response(
            {
                'error': 'An error occurred',
                'success': False
            }, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
