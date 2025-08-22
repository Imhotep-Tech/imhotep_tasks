from django.shortcuts import get_object_or_404
from ..models import Routines
from datetime import date
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from ..utils.apply_routines import apply_routines
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def show_routines(request):
    today = date.today()
    user_routines_all = Routines.objects.filter(created_by=request.user)
    paginator = Paginator(user_routines_all, 20)
    page = request.GET.get('page', 1)
    try:
        user_routines = paginator.page(page)
    except PageNotAnInteger:
        user_routines = paginator.page(1)
    except EmptyPage:
        user_routines = paginator.page(paginator.num_pages)

    routines_list = [
        {
            "id": r.id,
            "routines_title": r.routines_title,
            "routines_dates": r.routines_dates,
            "status": r.status,
            "created_by": r.created_by.id,
        }
        for r in user_routines.object_list
    ]
    return Response({
        "success": True,
        "username": request.user.username,
        "user_routines": routines_list,
        "pagination": {
            "page": user_routines.number,
            "num_pages": paginator.num_pages,
            "per_page": paginator.per_page,
            "total": paginator.count,
        }
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_routine(request):
    routines_title = request.data.get("routines_title")
    routines_dates = request.data.get("routines_dates")
    routine = Routines.objects.create(
        routines_title=routines_title,
        routines_dates=routines_dates,
        created_by=request.user
    )
    return Response({
        "success": True,
        "routine": {
            "id": routine.id,
            "routines_title": routine.routines_title,
            "routines_dates": routine.routines_dates,
            "status": routine.status,
            "created_by": routine.created_by.id,
        }
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_routine(request, routine_id):
    routine = get_object_or_404(Routines, id=routine_id, created_by=request.user)
    routines_title = request.data.get("routines_title")
    routines_dates = request.data.get("routines_dates")
    routine.routines_title = routines_title
    routine.routines_dates = routines_dates
    routine.save()
    return Response({
        "success": True,
        "routine": {
            "id": routine.id,
            "routines_title": routine.routines_title,
            "routines_dates": routine.routines_dates,
            "status": routine.status,
            "created_by": routine.created_by.id,
        }
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def delete_routine(request, routine_id):
    routine = get_object_or_404(Routines, id=routine_id, created_by=request.user)
    routine.delete()
    return Response({"success": True, "message": "Routine deleted"})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_routine_status(request, routine_id):
    routine = get_object_or_404(Routines, id=routine_id, created_by=request.user)
    routine.status = not routine.status
    routine.save()
    return Response({
        "success": True,
        "routine": {
            "id": routine.id,
            "routines_title": routine.routines_title,
            "routines_dates": routine.routines_dates,
            "status": routine.status,
            "created_by": routine.created_by.id,
        }
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def apply_routines_view(request):
    today = date.today()
    apply_routines(request, today, True)
    return Response({"success": True, "message": "Routines applied successfully!"})
