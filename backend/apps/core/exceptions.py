"""
Custom exception handlers and error responses
"""

from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from django.core.exceptions import ValidationError as DjangoValidationError
from django.http import Http404


def custom_exception_handler(exc, context):
    """
    Custom exception handler que retorna respuestas estandarizadas

    Formato de respuesta de error:
    {
        "error": {
            "code": "error_code",
            "message": "Human readable message",
            "details": {...}  // Opcional
        }
    }
    """
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)

    # Si DRF ya manejó la excepción, personalizar el formato
    if response is not None:
        error_data = {
            'error': {
                'code': get_error_code(exc),
                'message': get_error_message(response.data),
                'status_code': response.status_code
            }
        }

        # Agregar detalles si existen
        if isinstance(response.data, dict):
            # Eliminar el mensaje principal de los detalles si ya está incluido
            details = {k: v for k, v in response.data.items() if k not in ['detail', 'non_field_errors']}
            if details:
                error_data['error']['details'] = details

        response.data = error_data
        return response

    # Manejar excepciones de Django no manejadas por DRF
    if isinstance(exc, DjangoValidationError):
        error_data = {
            'error': {
                'code': 'validation_error',
                'message': 'Validation error',
                'status_code': status.HTTP_400_BAD_REQUEST,
                'details': exc.message_dict if hasattr(exc, 'message_dict') else {'detail': exc.messages}
            }
        }
        return Response(error_data, status=status.HTTP_400_BAD_REQUEST)

    if isinstance(exc, Http404):
        error_data = {
            'error': {
                'code': 'not_found',
                'message': 'Resource not found',
                'status_code': status.HTTP_404_NOT_FOUND
            }
        }
        return Response(error_data, status=status.HTTP_404_NOT_FOUND)

    # Para cualquier otra excepción no manejada
    if not response:
        error_data = {
            'error': {
                'code': 'internal_server_error',
                'message': 'An unexpected error occurred',
                'status_code': status.HTTP_500_INTERNAL_SERVER_ERROR
            }
        }
        return Response(error_data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return response


def get_error_code(exc):
    """Determinar el código de error basado en la excepción"""
    error_codes = {
        'ValidationError': 'validation_error',
        'PermissionDenied': 'permission_denied',
        'NotAuthenticated': 'not_authenticated',
        'AuthenticationFailed': 'authentication_failed',
        'NotFound': 'not_found',
        'MethodNotAllowed': 'method_not_allowed',
        'ParseError': 'parse_error',
        'Throttled': 'throttled',
    }

    exc_class = exc.__class__.__name__
    return error_codes.get(exc_class, 'error')


def get_error_message(data):
    """Extraer mensaje de error legible"""
    if isinstance(data, dict):
        if 'detail' in data:
            return str(data['detail'])
        elif 'non_field_errors' in data:
            return str(data['non_field_errors'][0]) if isinstance(data['non_field_errors'], list) else str(data['non_field_errors'])
        else:
            # Tomar el primer error disponible
            for key, value in data.items():
                if isinstance(value, list) and len(value) > 0:
                    return f"{key}: {value[0]}"
                return f"{key}: {value}"
    elif isinstance(data, list) and len(data) > 0:
        return str(data[0])

    return str(data)


class APIException(Exception):
    """Base class for custom API exceptions"""
    status_code = status.HTTP_400_BAD_REQUEST
    default_code = 'error'
    default_message = 'An error occurred'

    def __init__(self, message=None, code=None, status_code=None):
        self.message = message or self.default_message
        self.code = code or self.default_code
        if status_code:
            self.status_code = status_code


class ResourceNotFoundError(APIException):
    """Exception raised when a resource is not found"""
    status_code = status.HTTP_404_NOT_FOUND
    default_code = 'resource_not_found'
    default_message = 'The requested resource was not found'


class InvalidPaymentError(APIException):
    """Exception raised for payment-related errors"""
    status_code = status.HTTP_400_BAD_REQUEST
    default_code = 'invalid_payment'
    default_message = 'Payment processing failed'


class SubscriptionError(APIException):
    """Exception raised for subscription-related errors"""
    status_code = status.HTTP_400_BAD_REQUEST
    default_code = 'subscription_error'
    default_message = 'Subscription operation failed'


class InsufficientPermissionsError(APIException):
    """Exception raised when user doesn't have required permissions"""
    status_code = status.HTTP_403_FORBIDDEN
    default_code = 'insufficient_permissions'
    default_message = 'You do not have permission to perform this action'
