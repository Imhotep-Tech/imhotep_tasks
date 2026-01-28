from django.shortcuts import get_object_or_404
from datetime import date, timedelta
from django.utils import timezone
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.db.models import Q
from tasks.utils.apply_routines import apply_routines
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from ..models import Tasks
from ..utils import tasks_managements_utils
from .. import finance_services

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
        "success": True,
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
        "success": True,
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

        # Finance-related fields (optional)
        price = request.data.get("price")
        transaction_currency = request.data.get("transaction_currency")
        transaction_status = request.data.get("transaction_status")
        transaction_category = request.data.get("transaction_category")

        task = Tasks.objects.create(
            task_title=task_title,
            task_details=task_details,
            due_date=due_date,
            created_by=request.user,
            price=price if price else None,
            transaction_currency=transaction_currency if transaction_currency else None,
            transaction_status=transaction_status if transaction_status else None,
            transaction_category=transaction_category if transaction_category else None,
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

        # Finance-related fields (optional, only update if provided)
        if "price" in request.data:
            price = request.data.get("price")
            task.price = price if price else None
        if "transaction_currency" in request.data:
            task.transaction_currency = request.data.get("transaction_currency") or None
        if "transaction_status" in request.data:
            task.transaction_status = request.data.get("transaction_status") or None
        if "transaction_category" in request.data:
            task.transaction_category = request.data.get("transaction_category") or None

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

@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def multiple_update_task_dates(request):
    try:
        url_call = request.data.get("url_call", "all")
        task_ids = request.data.get("task_ids", [])

        if not isinstance(task_ids, list):
            return Response({"error": "task_ids should be a list of IDs", "success": False},
                            status=status.HTTP_400_BAD_REQUEST)
        if not task_ids:
            return Response({"error": "task_ids list is empty", "success": False},
                            status=status.HTTP_400_BAD_REQUEST)

        tasks_qs = Tasks.objects.filter(id__in=task_ids, created_by=request.user)
        if not tasks_qs.exists():
            return Response({"error": "No tasks found", "success": False},
                            status=status.HTTP_404_NOT_FOUND)

        due_date_raw = request.data.get("due_date", None)
        if due_date_raw is not None:
            parsed = tasks_managements_utils._parse_date_input(due_date_raw)
            for t in tasks_qs:
                t.due_date = parsed
            Tasks.objects.bulk_update(tasks_qs, ['due_date'])

        tasks_data = [tasks_managements_utils.serialize_task(t) for t in tasks_qs]
        total, completed, pending = tasks_managements_utils.tasks_count(url_call, request)

        return Response({
            "success": True,
            "tasks": tasks_data,
            "total_number_tasks": total,
            "completed_tasks_count": completed,
            "pending_tasks": pending
        }, status=status.HTTP_200_OK)
    except Exception:
        return Response({"error": "An error occurred", "success": False},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_task(request, task_id):
    try:
        task = get_object_or_404(Tasks, id=task_id, created_by=request.user)
        url_call = request.data.get("url_call", "all")

        finance_errors = []
        # Attempt to delete linked Imhotep Finance transaction, but do not block task deletion
        success, payload = finance_services.delete_task_transaction(task)
        if not success and payload.get("message"):
            finance_errors.append(payload["message"])

        task.delete()
        total, completed, pending = tasks_managements_utils.tasks_count(url_call, request)
        return Response({
            "success": True,
            "message": "Task deleted",
            "total_number_tasks": total,
            "completed_tasks_count": completed,
            "pending_tasks": pending,
            "finance_errors": finance_errors,
        }, status=status.HTTP_200_OK)
    except Exception:
        return Response({"error": "An error occurred", "success": False},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def multiple_delete_task(request):
    try:
        task_ids = request.data.get("task_ids", [])
        url_call = request.data.get("url_call", "all")
        if not isinstance(task_ids, list):
            return Response({"error": "task_ids should be a list of IDs", "success": False},
                            status=status.HTTP_400_BAD_REQUEST)
        if not task_ids:
            return Response({"error": "task_ids list is empty", "success": False},
                            status=status.HTTP_400_BAD_REQUEST)
        tasks_qs = Tasks.objects.filter(id__in=task_ids, created_by=request.user)

        finance_errors = []
        for t in tasks_qs:
            success, payload = finance_services.delete_task_transaction(t)
            if not success and payload.get("message"):
                finance_errors.append(payload["message"])

        tasks_qs.delete()
        total, completed, pending = tasks_managements_utils.tasks_count(url_call, request)
        return Response({
            "success": True,
            "message": "Tasks deleted",
            "total_number_tasks": total,
            "completed_tasks_count": completed,
            "pending_tasks": pending,
            "finance_errors": finance_errors,
        }, status=status.HTTP_200_OK)
    except Exception:
        return Response({"error": "An error occurred", "success": False},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def task_complete(request, task_id):
    try:
        url_call = request.data.get("url_call", "all")
        task = get_object_or_404(Tasks, id=task_id, created_by=request.user)
        task.status = not task.status  # simplified toggle
        task.done_date = timezone.now().date() if task.status else None
        task.save()

        finance_error = None
        if task.status:
            # Task is now complete - create a finance transaction if it has a price
            success, payload = finance_services.create_task_transaction(task)
            if not success and payload.get("message"):
                finance_error = payload["message"]
        else:
            # Task is now incomplete - delete the linked finance transaction if exists
            success, payload = finance_services.delete_task_transaction(task)
            if not success and payload.get("message") and task.transaction_id:
                # Only show error if there was actually a transaction to delete
                finance_error = payload["message"]

        task_data = tasks_managements_utils.serialize_task(task)
        total, completed, pending = tasks_managements_utils.tasks_count(url_call, request)
        return Response({
            "success": True,
            "task": task_data,
            "total_number_tasks": total,
            "completed_tasks_count": completed,
            "pending_tasks": pending,
            "finance_error": finance_error,
        }, status=status.HTTP_200_OK)
    except Exception:
        return Response({"error": "An error occurred", "success": False},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def multiple_task_complete(request):
    try:
        url_call = request.data.get("url_call", "all")
        task_ids = request.data.get("task_ids", [])
        if not isinstance(task_ids, list):
            return Response({"error": "task_ids should be a list of IDs", "success": False},
                            status=status.HTTP_400_BAD_REQUEST)
        tasks_qs = Tasks.objects.filter(id__in=task_ids, created_by=request.user)
        
        finance_errors = []
        for t in tasks_qs:
            t.status = not t.status
            t.done_date = timezone.now().date() if t.status else None
            
            if t.status:
                # Task is now complete - create a finance transaction if it has a price
                success, payload = finance_services.create_task_transaction(t)
                if not success and payload.get("message"):
                    finance_errors.append(payload["message"])
            else:
                # Task is now incomplete - delete the linked finance transaction if exists
                if t.transaction_id:
                    success, payload = finance_services.delete_task_transaction(t)
                    if not success and payload.get("message"):
                        finance_errors.append(payload["message"])
        
        Tasks.objects.bulk_update(tasks_qs, ['status', 'done_date'])
        tasks_data = [tasks_managements_utils.serialize_task(t) for t in tasks_qs]
        total, completed, pending = tasks_managements_utils.tasks_count(url_call, request)
        return Response({
            "success": True,
            "tasks": tasks_data,
            "total_number_tasks": total,
            "completed_tasks_count": completed,
            "pending_tasks": pending,
            "finance_errors": finance_errors,
        }, status=status.HTTP_200_OK)
    except Exception:
        return Response({"error": "An error occurred", "success": False},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR)
