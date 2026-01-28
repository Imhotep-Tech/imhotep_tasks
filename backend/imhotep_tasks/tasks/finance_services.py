from datetime import timedelta
from typing import Any, Dict, Optional, Tuple

from django.utils import timezone
from django.db import transaction
from django.core.exceptions import ObjectDoesNotExist

from .models import ImhotepFinanceConnection, Tasks, User
from .utils import finance_client


def _get_or_create_connection(user: User) -> ImhotepFinanceConnection:
    """
    Helper to get or create the user's Imhotep Finance connection row.
    """
    connection, _ = ImhotepFinanceConnection.objects.get_or_create(user=user)
    return connection


def _is_token_expired(connection: ImhotepFinanceConnection) -> bool:
    if not connection.expires_at:
        return False
    return timezone.now() >= connection.expires_at


def get_authorization_url(
    user: User,
    state: Optional[str] = None,
    code_challenge: Optional[str] = None,
    code_challenge_method: Optional[str] = None,
) -> str:
    """
    Return the OAuth2 authorization URL for the given user.
    """
    # Currently we do not use user-specific state, but the hook is here.
    return finance_client.get_authorize_url(
        state=state,
        code_challenge=code_challenge,
        code_challenge_method=code_challenge_method,
    )


def connect_imhotep_finance(user: User, code: str, code_verifier: Optional[str] = None) -> Dict[str, Any]:
    """
    Exchange an authorization code for tokens and persist them for the user.
    """
    token_payload = finance_client.exchange_code_for_tokens(code, code_verifier=code_verifier)

    access_token = token_payload.get("access_token")
    refresh_token = token_payload.get("refresh_token")
    scope = token_payload.get("scope", "")
    expires_in = token_payload.get("expires_in", 3600)

    if not access_token:
        return {
            "success": False,
            "message": "Imhotep Finance did not return an access token.",
        }

    expires_at = timezone.now() + timedelta(seconds=int(expires_in))

    with transaction.atomic():
        connection = _get_or_create_connection(user)
        connection.access_token = access_token
        connection.refresh_token = refresh_token or connection.refresh_token
        connection.expires_at = expires_at
        connection.scopes = scope
        connection.save()

    return {
        "success": True,
        "message": "Connected to Imhotep Finance successfully.",
        "scopes": scope,
        "expires_at": expires_at.isoformat() if expires_at else None,
    }


def get_connection_status(user: User) -> Dict[str, Any]:
    """
    Return a simple status payload describing the user's finance connection.
    """
    try:
        connection = ImhotepFinanceConnection.objects.get(user=user)
    except ObjectDoesNotExist:
        return {
            "connected": False,
            "scopes": "",
            "expires_at": None,
            "token_valid": False,
        }

    expired = _is_token_expired(connection)
    return {
        "connected": bool(connection.access_token),
        "scopes": connection.scopes or "",
        "expires_at": connection.expires_at.isoformat() if connection.expires_at else None,
        "token_valid": bool(connection.access_token) and not expired,
    }


def _get_active_access_token(user: User) -> Optional[str]:
    try:
        connection = ImhotepFinanceConnection.objects.get(user=user)
    except ObjectDoesNotExist:
        return None

    if not connection.access_token or _is_token_expired(connection):
        return None

    return connection.access_token


def create_task_transaction(task: Tasks) -> Tuple[bool, Dict[str, Any]]:
    """
    If the user has an active finance connection and the task has a price,
    create a corresponding transaction in Imhotep Finance and persist the
    returned identifiers on the task.

    Returns (success, payload).
    """
    # Only create transactions for tasks that have a price
    if task.price is None:
        return False, {"message": "Task has no price, skipping finance transaction."}

    access_token = _get_active_access_token(task.created_by)
    if not access_token:
        return False, {"message": "User is not connected to Imhotep Finance or token is invalid."}

    # Basic mapping from task to transaction fields
    amount = str(task.price)
    currency = task.transaction_currency or "USD"
    trans_status = task.transaction_status or "Deposit"
    category = task.transaction_category or "Tasks"
    trans_details = task.task_details or f"Task: {task.task_title}"
    date_value = (task.due_date or timezone.now()).date()
    date_str = date_value.isoformat()

    data = finance_client.create_transaction(
        access_token=access_token,
        amount=amount,
        currency=currency,
        trans_status=trans_status,
        category=category,
        trans_details=trans_details,
        date=date_str,
    )

    transaction_id = data.get("transaction_id")
    if transaction_id is not None:
        task.transaction_id = str(transaction_id)
        task.transaction_status = data.get("trans_status", trans_status)
        task.transaction_currency = data.get("currency", currency)
        task.transaction_category = category
        task.save(update_fields=[
            "transaction_id",
            "transaction_status",
            "transaction_currency",
            "transaction_category",
        ])

    return True, data


def delete_task_transaction(task: Tasks) -> Tuple[bool, Dict[str, Any]]:
    """
    If the task has a linked Imhotep Finance transaction and the user is
    connected, attempt to delete the remote transaction. On success, clear
    the local transaction fields on the task.

    Returns (success, payload).
    """
    if not task.transaction_id:
        return False, {"message": "Task has no linked Imhotep Finance transaction."}

    access_token = _get_active_access_token(task.created_by)
    if not access_token:
        return False, {"message": "User is not connected to Imhotep Finance or token is invalid."}

    try:
        success, payload = finance_client.delete_transaction(
            access_token=access_token,
            transaction_id=int(task.transaction_id),
        )
    except Exception as exc:  # noqa: BLE001
        # Do not block task deletion on remote errors
        return False, {"message": str(exc)}

    if success:
        task.transaction_id = None
        task.transaction_status = None
        task.transaction_currency = None
        task.transaction_category = None
        task.save(update_fields=[
            "transaction_id",
            "transaction_status",
            "transaction_currency",
            "transaction_category",
        ])

    return success, payload

