from django.shortcuts import get_object_or_404
from ..models import Routines
from datetime import date
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from ..utils.apply_routines import apply_routines
from ..utils.validate_yearly_dates import validate_yearly_dates
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

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
            "routine_type": r.routine_type,
            "status": r.status,
            "created_by": r.created_by.id,
            "price": float(r.price) if r.price is not None else None,
            "transaction_currency": r.transaction_currency,
            "transaction_status": r.transaction_status,
            "transaction_category": r.transaction_category,
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
    routine_type = request.data.get("routine_type")

    # Finance fields (optional)
    price = request.data.get("price")
    transaction_currency = request.data.get("transaction_currency")
    transaction_status = request.data.get("transaction_status")
    transaction_category = request.data.get("transaction_category")

    # Validate required fields
    if not routines_title:
        return Response(
            {'error': 'routines_title is required and cannot be empty'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    if not (routine_type and routines_dates):
        return Response(
            {'error': 'The routine type and dates must be set'}, 
            status=status.HTTP_400_BAD_REQUEST
        )

    if not isinstance(routines_dates, list):
        return Response(
            {'error': 'routines_dates must be an array/list'}, 
            status=status.HTTP_400_BAD_REQUEST
        )

    # Validate yearly dates format
    if routine_type == "yearly":
        is_valid, error_msg = validate_yearly_dates(routines_dates)
        if not is_valid:
            return Response(
                {'error': f'Invalid yearly dates: {error_msg}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    if routine_type in ["yearly", "monthly", "weekly"]:
        routine = Routines.objects.create(
            routines_title=routines_title,
            routine_type=routine_type,
            routines_dates=routines_dates,
            created_by=request.user,
            price=price if price else None,
            transaction_currency=transaction_currency if transaction_currency else None,
            transaction_status=transaction_status if transaction_status else None,
            transaction_category=transaction_category if transaction_category else None,
        )
    else:
        return Response(
            {'error': 'routine type must be yearly, monthly, or weekly'}, 
            status=status.HTTP_400_BAD_REQUEST
        )

    return Response({
        "success": True,
        "routine": {
            "id": routine.id,
            "routines_title": routine.routines_title,
            "routines_dates": routine.routines_dates,
            "routine_type": routine.routine_type,
            "status": routine.status,
            "created_by": routine.created_by.id,
            "price": float(routine.price) if routine.price is not None else None,
            "transaction_currency": routine.transaction_currency,
            "transaction_status": routine.transaction_status,
            "transaction_category": routine.transaction_category,
        }
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_routine(request, routine_id):
    routine = get_object_or_404(Routines, id=routine_id, created_by=request.user)
    routines_title = request.data.get("routines_title")
    routines_dates = request.data.get("routines_dates")
    routine_type = request.data.get("routine_type")
    
    # Add validation for routines_dates as a list
    if routines_dates is not None and not isinstance(routines_dates, list):
        return Response(
            {'error': 'routines_dates must be an array/list'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Validate yearly dates format if updating to yearly or if already yearly
    if routines_dates is not None and (routine_type == "yearly" or routine.routine_type == "yearly"):
        is_valid, error_msg = validate_yearly_dates(routines_dates)
        if not is_valid:
            return Response(
                {'error': f'Invalid yearly dates: {error_msg}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    # Only update fields if provided (partial update)
    if routines_title is not None:
        routine.routines_title = routines_title
    if routines_dates is not None:
        routine.routines_dates = routines_dates
    if routine_type is not None:
        routine.routine_type = routine_type

    # Finance fields (optional, only update if provided)
    if "price" in request.data:
        price = request.data.get("price")
        routine.price = price if price else None
    if "transaction_currency" in request.data:
        routine.transaction_currency = request.data.get("transaction_currency") or None
    if "transaction_status" in request.data:
        routine.transaction_status = request.data.get("transaction_status") or None
    if "transaction_category" in request.data:
        routine.transaction_category = request.data.get("transaction_category") or None

    routine.save()
    return Response({
        "success": True,
        "routine": {
            "id": routine.id,
            "routines_title": routine.routines_title,
            "routines_dates": routine.routines_dates,
            "routine_type": routine.routine_type,
            "status": routine.status,
            "created_by": routine.created_by.id,
            "price": float(routine.price) if routine.price is not None else None,
            "transaction_currency": routine.transaction_currency,
            "transaction_status": routine.transaction_status,
            "transaction_category": routine.transaction_category,
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
