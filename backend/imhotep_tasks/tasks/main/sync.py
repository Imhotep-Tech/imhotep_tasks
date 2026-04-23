from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from ..models import Tasks
from ..utils import tasks_managements_utils


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def sync_mutations(request):
    """
    Process a batch of offline mutations from the mobile app.
    
    Handles conflict resolution with last-write-wins strategy:
    - Groups mutations by task_id
    - For each task_id, keeps only the mutation with the latest client_timestamp
    - Processes mutations in order: creates first, then updates, then deletes
    
    Request body:
    {
        "mutations": [
            {
                "action": "add_task" | "update_task" | "delete_task" | "toggle_complete" | 
                          "bulk_delete" | "bulk_complete" | "bulk_update_date" | "bulk_update_category",
                "endpoint": "api/tasks/add_task/",
                "method": "POST" | "PATCH" | "DELETE",
                "payload": {...},
                "task_id": 42,            // optional, for updates/deletes
                "client_timestamp": "..."  // ISO 8601 timestamp
            }
        ]
    }
    """
    mutations = request.data.get('mutations', [])
    
    #check if it's not a list
    if not isinstance(mutations, list):
        return Response(
            {'error': 'mutations must be a list', 'success': False},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if not mutations:
        return Response({'success': True, 'processed': 0, 'results': []})
    
    #remove duplicates  
    deduplicated = _deduplicate_mutations(mutations)
    
    #sort by processing order
    action_order = {
        'add_task': 0,
        'update_task': 1,
        'toggle_complete': 2,
        'bulk_complete': 3,
        'bulk_update_date': 4,
        'bulk_update_category': 5,
        'delete_task': 6,
        'bulk_delete': 7,
    }
    deduplicated.sort(key=lambda m: action_order.get(m.get('action', ''), 99))
    
    #Process each mutation
    results = []
    temp_id_map = {}  # Maps client temp_ids to server IDs (for creates)
    
    for mutation in deduplicated:
        action = mutation.get('action', '')
        payload = mutation.get('payload', {})
        task_id = mutation.get('task_id')
        
        try:
            result = _process_mutation(request, action, payload, task_id, temp_id_map)
            results.append({
                'action': action,
                'task_id': task_id,
                'success': True,
                **result,
            })
        except Exception as e:
            results.append({
                'action': action,
                'task_id': task_id,
                'success': False,
                'error': str(e),
            })
    
    return Response({
        'success': True,
        'processed': len(results),
        'results': results,
        'temp_id_map': temp_id_map,
    }, status=status.HTTP_200_OK)


def _deduplicate_mutations(mutations):
    """
    For each task_id, keep only the mutation with the latest client_timestamp.
    Mutations without a task_id (e.g., creates) are always kept.
    """
    without_task_id = []
    by_task_id = {}
    
    for mutation in mutations:
        task_id = mutation.get('task_id')
        
        if not task_id:
            without_task_id.append(mutation)
        else:
            existing = by_task_id.get(task_id)
            if not existing:
                by_task_id[task_id] = mutation
            else:
                # Compare timestamps — keep the latest
                existing_ts = existing.get('client_timestamp', '')
                current_ts = mutation.get('client_timestamp', '')
                if current_ts > existing_ts:
                    by_task_id[task_id] = mutation
    
    return without_task_id + list(by_task_id.values())


def _process_mutation(request, action, payload, task_id, temp_id_map):
    """Process a single mutation and return the result."""
    
    url_call = payload.get('url_call', 'all')
    
    if action == 'add_task':
        return _handle_add_task(request, payload, url_call)
    
    elif action == 'update_task':
        return _handle_update_task(request, payload, task_id, url_call)
    
    elif action == 'delete_task':
        return _handle_delete_task(request, task_id, url_call)
    
    elif action == 'toggle_complete':
        return _handle_toggle_complete(request, task_id, url_call)
    
    elif action == 'bulk_delete':
        return _handle_bulk_delete(request, payload, url_call)
    
    elif action == 'bulk_complete':
        return _handle_bulk_complete(request, payload, url_call)
    
    elif action == 'bulk_update_date':
        return _handle_bulk_update_date(request, payload, url_call)
    
    elif action == 'bulk_update_category':
        return _handle_bulk_update_category(request, payload, url_call)
    
    else:
        raise ValueError(f'Unknown action: {action}')


def _handle_add_task(request, payload, url_call):
    today = timezone.now().date()
    due_date = tasks_managements_utils._parse_date_input(payload.get('due_date')) or today
    
    task = Tasks.objects.create(
        task_title=payload.get('task_title', ''),
        task_details=payload.get('task_details'),
        due_date=due_date,
        created_by=request.user,
        task_category=payload.get('task_category', 'general'),
    )
    
    return {'task': tasks_managements_utils.serialize_task(task), 'server_id': task.id}


def _handle_update_task(request, payload, task_id, url_call):
    try:
        task = Tasks.objects.get(id=task_id, created_by=request.user)
    except Tasks.DoesNotExist:
        raise ValueError(f'Task {task_id} not found')
    
    if 'task_title' in payload:
        task.task_title = payload['task_title']
    if 'task_details' in payload:
        task.task_details = payload['task_details']
    if 'task_category' in payload:
        task.task_category = payload['task_category']
    if 'due_date' in payload and payload['due_date'] is not None:
        parsed = tasks_managements_utils._parse_date_input(payload['due_date'])
        if parsed:
            task.due_date = parsed
    
    task.save()
    return {'task': tasks_managements_utils.serialize_task(task)}


def _handle_delete_task(request, task_id, url_call):
    try:
        task = Tasks.objects.get(id=task_id, created_by=request.user)
        task.delete()
        return {'message': 'Task deleted'}
    except Tasks.DoesNotExist:
        # Already deleted — that's fine
        return {'message': 'Task already deleted'}


def _handle_toggle_complete(request, task_id, url_call):
    try:
        task = Tasks.objects.get(id=task_id, created_by=request.user)
    except Tasks.DoesNotExist:
        raise ValueError(f'Task {task_id} not found')
    
    task.status = not task.status
    task.done_date = timezone.now().date() if task.status else None
    task.save()
    
    return {'task': tasks_managements_utils.serialize_task(task)}


def _handle_bulk_delete(request, payload, url_call):
    task_ids = payload.get('task_ids', [])
    deleted_count = Tasks.objects.filter(id__in=task_ids, created_by=request.user).delete()[0]
    return {'deleted_count': deleted_count}


def _handle_bulk_complete(request, payload, url_call):
    task_ids = payload.get('task_ids', [])
    tasks_qs = Tasks.objects.filter(id__in=task_ids, created_by=request.user)
    
    for t in tasks_qs:
        t.status = not t.status
        t.done_date = timezone.now().date() if t.status else None
    
    Tasks.objects.bulk_update(tasks_qs, ['status', 'done_date'])
    return {'updated_count': len(task_ids)}


def _handle_bulk_update_date(request, payload, url_call):
    task_ids = payload.get('task_ids', [])
    due_date_raw = payload.get('due_date')
    
    if not due_date_raw:
        raise ValueError('due_date is required')
    
    parsed = tasks_managements_utils._parse_date_input(due_date_raw)
    tasks_qs = Tasks.objects.filter(id__in=task_ids, created_by=request.user)
    
    for t in tasks_qs:
        t.due_date = parsed
    
    Tasks.objects.bulk_update(tasks_qs, ['due_date'])
    return {'updated_count': len(task_ids)}


def _handle_bulk_update_category(request, payload, url_call):
    task_ids = payload.get('task_ids', [])
    category = (payload.get('task_category', '') or '').strip().lower()
    
    if not category:
        raise ValueError('task_category is required')
    
    tasks_qs = Tasks.objects.filter(id__in=task_ids, created_by=request.user)
    
    for t in tasks_qs:
        t.task_category = category
    
    Tasks.objects.bulk_update(tasks_qs, ['task_category'])
    return {'updated_count': len(task_ids)}
