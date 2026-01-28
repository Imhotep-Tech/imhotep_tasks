from typing import Any, Dict, Optional, Tuple

import requests
from django.conf import settings


class ImhotepFinanceError(Exception):
    """
    Base exception for Imhotep Finance client errors.
    """

    def __init__(self, message: str, status_code: Optional[int] = None, data: Optional[Dict[str, Any]] = None):
        super().__init__(message)
        self.status_code = status_code
        self.data = data or {}


def _build_base_url() -> str:
    base_url = getattr(settings, "IMHOTEP_FINANCE_BASE_URL", "").rstrip("/")
    if not base_url:
        raise ImhotepFinanceError("IMHOTEP_FINANCE_BASE_URL is not configured")
    return base_url


def get_authorize_url(
    state: Optional[str] = None,
    scope: str = "transactions:read transactions:write",
    code_challenge: Optional[str] = None,
    code_challenge_method: Optional[str] = None,
) -> str:
    """
    Build the authorization URL for the OAuth2 authorization-code flow.
    """
    base_url = _build_base_url()
    client_id = getattr(settings, "IMHOTEP_FINANCE_CLIENT_ID", "")
    redirect_uri = getattr(settings, "IMHOTEP_FINANCE_REDIRECT_URI", "")

    if not client_id or not redirect_uri:
        raise ImhotepFinanceError("Imhotep Finance client credentials or redirect URI are not configured")

    params = {
        "response_type": "code",
        "client_id": client_id,
        "redirect_uri": redirect_uri,
        "scope": scope,
    }
    if state:
        params["state"] = state
    if code_challenge:
        params["code_challenge"] = code_challenge
    if code_challenge_method:
        params["code_challenge_method"] = code_challenge_method

    # Manually build query to avoid extra dependencies
    query = "&".join(f"{key}={requests.utils.quote(str(value), safe='')}" for key, value in params.items())
    return f"{base_url}/o/authorize/?{query}"


def exchange_code_for_tokens(code: str, code_verifier: Optional[str] = None) -> Dict[str, Any]:
    """
    Exchange an authorization code for access and refresh tokens.
    """
    base_url = _build_base_url()
    client_id = getattr(settings, "IMHOTEP_FINANCE_CLIENT_ID", "")
    client_secret = getattr(settings, "IMHOTEP_FINANCE_CLIENT_SECRET", "")
    redirect_uri = getattr(settings, "IMHOTEP_FINANCE_REDIRECT_URI", "")

    if not client_id or not client_secret or not redirect_uri:
        raise ImhotepFinanceError("Imhotep Finance client credentials or redirect URI are not configured")

    data = {
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": redirect_uri,
        "client_id": client_id,
        "client_secret": client_secret,
    }
    if code_verifier:
        data["code_verifier"] = code_verifier

    try:
        # Send credentials in the form body (required by Imhotep Finance)
        response = requests.post(
            f"{base_url}/o/token/",
            data=data,
            timeout=10,
        )
    except requests.RequestException as exc:
        raise ImhotepFinanceError("Failed to contact Imhotep Finance token endpoint") from exc

    try:
        payload = response.json()
    except ValueError:
        payload = {}

    if response.status_code != 200:
        raise ImhotepFinanceError(
            "Failed to exchange authorization code for tokens",
            status_code=response.status_code,
            data=payload,
        )

    return payload


def _auth_headers(access_token: str) -> Dict[str, str]:
    return {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
    }


def create_transaction(
    access_token: str,
    *,
    amount: str,
    currency: str,
    trans_status: str,
    category: Optional[str] = None,
    trans_details: Optional[str] = None,
    date: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Call the public API to create a transaction.
    """
    base_url = _build_base_url()
    url = f"{base_url}/api/v1/external/transaction/add/"

    payload: Dict[str, Any] = {
        "amount": amount,
        "currency": currency,
        "trans_status": trans_status,
    }
    if category is not None:
        payload["category"] = category
    if trans_details is not None:
        payload["trans_details"] = trans_details
    if date is not None:
        payload["date"] = date

    try:
        response = requests.post(url, json=payload, headers=_auth_headers(access_token), timeout=10)
    except requests.RequestException as exc:
        raise ImhotepFinanceError("Failed to contact Imhotep Finance create transaction endpoint") from exc

    try:
        data = response.json()
    except ValueError:
        data = {}

    if response.status_code not in (200, 201) or not data.get("success"):
        raise ImhotepFinanceError(
            data.get("message") or "Failed to create transaction",
            status_code=response.status_code,
            data=data,
        )

    return data


def delete_transaction(access_token: str, transaction_id: int) -> Tuple[bool, Dict[str, Any]]:
    """
    Call the public API to delete a transaction. Returns (success, payload).
    """
    base_url = _build_base_url()
    url = f"{base_url}/api/v1/external/transaction/delete/{transaction_id}/"

    try:
        response = requests.delete(url, headers=_auth_headers(access_token), timeout=10)
    except requests.RequestException as exc:
        raise ImhotepFinanceError("Failed to contact Imhotep Finance delete transaction endpoint") from exc

    try:
        data = response.json()
    except ValueError:
        data = {}

    if response.status_code == 200 and data.get("success"):
        return True, data

    # Surface failure but let callers decide whether to treat it as fatal
    return False, data


def get_currencies() -> Dict[str, Any]:
    """
    Fetch available currencies from Imhotep Finance.
    No authentication required - this is public reference data.
    """
    base_url = _build_base_url()
    url = f"{base_url}/api/v1/external/currencies/"

    try:
        response = requests.get(url, timeout=10)
    except requests.RequestException as exc:
        raise ImhotepFinanceError("Failed to contact Imhotep Finance currencies endpoint") from exc

    try:
        data = response.json()
    except ValueError:
        data = {}

    if response.status_code != 200:
        raise ImhotepFinanceError(
            "Failed to fetch currencies",
            status_code=response.status_code,
            data=data,
        )

    return data

