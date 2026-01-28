from django.shortcuts import render
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response

from .models import User
from . import finance_services
from .utils.finance_client import ImhotepFinanceError
from .utils import finance_client

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_view(request):
    """
    Get current authenticated user details
    """
    user = request.user
    return Response({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'email_verify': getattr(user, 'email_verify', False),
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def imhotep_finance_authorize_url(request):
    """
    Return the OAuth2 authorize URL for Imhotep Finance so the frontend
    can redirect the user to connect their account.
    Supports PKCE via optional code_challenge parameters.
    """
    code_challenge = request.query_params.get('code_challenge')
    code_challenge_method = request.query_params.get('code_challenge_method')

    url = finance_services.get_authorization_url(
        request.user,
        code_challenge=code_challenge,
        code_challenge_method=code_challenge_method,
    )
    return Response({'authorize_url': url}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def imhotep_finance_callback(request):
    """
    Exchange an authorization code for tokens and store them for the user.
    """
    code = request.data.get('code')
    error = request.data.get('error')
    error_description = request.data.get('error_description')
    code_verifier = request.data.get('code_verifier')

    if error:
        # Surface OAuth error from provider
        return Response(
            {
                'success': False,
                'message': error_description or error,
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    if not code:
        return Response(
            {'success': False, 'message': 'Authorization code is required.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        result = finance_services.connect_imhotep_finance(request.user, code, code_verifier=code_verifier)
    except ImhotepFinanceError as exc:
        # Surface provider error details to the client for easier debugging
        provider_data = exc.data or {}
        message = provider_data.get("error_description") or provider_data.get("error") or str(exc)
        return Response(
            {
                'success': False,
                'message': message,
                'provider_response': provider_data,
            },
            status=status.HTTP_400_BAD_REQUEST,
        )
    except Exception:  # noqa: BLE001
        return Response(
            {'success': False, 'message': 'Failed to connect to Imhotep Finance.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    status_code = status.HTTP_200_OK if result.get('success') else status.HTTP_400_BAD_REQUEST
    return Response(result, status=status_code)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def imhotep_finance_status(request):
    """
    Return connection status for the current user.
    """
    status_payload = finance_services.get_connection_status(request.user)
    return Response(status_payload, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def imhotep_finance_currencies(request):
    """
    Fetch available currencies from Imhotep Finance.
    No authentication required - public reference data.
    """
    try:
        data = finance_client.get_currencies()
        return Response(data, status=status.HTTP_200_OK)
    except ImhotepFinanceError as exc:
        return Response(
            {'error': str(exc), 'currencies': []},
            status=status.HTTP_502_BAD_GATEWAY,
        )
