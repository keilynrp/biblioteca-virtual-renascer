# =============================================================================
# Middleware - BVS Backend
# =============================================================================
"""
Custom middleware for request processing.

Middleware order matters! This middleware should be placed after:
- SecurityMiddleware
- SessionMiddleware
- AuthenticationMiddleware

And before:
- View execution
"""

import logging
import time
from django.http import JsonResponse
from django.urls import resolve
from django_ratelimit.exceptions import Ratelimited
from rest_framework import status
from .logging_filters import (
    set_correlation_id,
    clear_correlation_id,
    set_request,
    clear_request,
    set_user,
    clear_user
)

logger = logging.getLogger(__name__)


# =============================================================================
# CORRELATION ID MIDDLEWARE
# =============================================================================

class CorrelationIdMiddleware:
    """
    Middleware to add correlation ID to every request.

    The correlation ID allows tracking a single request across multiple
    log entries, services, and components. It's essential for distributed
    tracing and debugging.

    Features:
    - Generates or uses existing X-Correlation-ID header
    - Stores correlation ID in thread-local storage
    - Adds correlation ID to response headers
    - Integrates with logging filters
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Get correlation ID from header or generate new one
        correlation_id = request.META.get('HTTP_X_CORRELATION_ID')
        correlation_id = set_correlation_id(correlation_id)

        # Store request and user in thread locals for logging
        set_request(request)
        if hasattr(request, 'user'):
            set_user(request.user)

        # Log request started
        logger.debug(
            f"Request started: {request.method} {request.path}",
            extra={
                'correlation_id': correlation_id,
                'request_method': request.method,
                'request_path': request.path
            }
        )

        try:
            # Process request
            response = self.get_response(request)

            # Add correlation ID to response headers
            response['X-Correlation-ID'] = correlation_id

            return response

        finally:
            # Clean up thread locals
            clear_correlation_id()
            clear_request()
            clear_user()


# =============================================================================
# RATE LIMITING MIDDLEWARE
# =============================================================================

class RateLimitMiddleware:
    """
    Middleware to handle rate limit exceptions globally.

    This middleware catches Ratelimited exceptions from django-ratelimit
    and returns a proper JSON response with HTTP 429 status.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        return response

    def process_exception(self, request, exception):
        """
        Handle Ratelimited exceptions.

        Args:
            request: Django request object
            exception: Exception raised during request processing

        Returns:
            JsonResponse with HTTP 429 if Ratelimited, None otherwise
        """
        if isinstance(exception, Ratelimited):
            # Log the rate limit violation
            logger.warning(
                f"Rate limit exceeded: "
                f"IP={request.META.get('REMOTE_ADDR')}, "
                f"Method={request.method}, "
                f"Path={request.path}, "
                f"User={getattr(request.user, 'email', 'Anonymous')}"
            )

            # Construct response
            response_data = {
                'error': 'rate_limit_exceeded',
                'message': 'Too many requests. Please try again later.',
                'detail': (
                    'You have exceeded the rate limit for this endpoint. '
                    'Please wait before making additional requests.'
                ),
                'retry_after': 60,  # Default to 60 seconds
                'status_code': status.HTTP_429_TOO_MANY_REQUESTS,
            }

            # Create JSON response
            response = JsonResponse(
                response_data,
                status=status.HTTP_429_TOO_MANY_REQUESTS
            )

            # Add Retry-After header
            response['Retry-After'] = '60'

            return response

        # Let other exceptions pass through
        return None


# =============================================================================
# REQUEST LOGGING MIDDLEWARE
# =============================================================================

class RequestLoggingMiddleware:
    """
    Middleware to log all incoming requests for debugging and monitoring.

    Logs:
    - Request method, path, IP
    - Response status code
    - Request duration
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        import time

        # Record start time
        start_time = time.time()

        # Get client IP
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR')

        # Process request
        response = self.get_response(request)

        # Calculate duration
        duration = time.time() - start_time

        # Log request details
        logger.info(
            f"{request.method} {request.path} "
            f"[{response.status_code}] "
            f"IP={ip} "
            f"Duration={duration:.2f}s "
            f"User={getattr(request.user, 'email', 'Anonymous')}"
        )

        return response


# =============================================================================
# CORS HEADERS MIDDLEWARE (if needed beyond django-cors-headers)
# =============================================================================

class CustomCORSMiddleware:
    """
    Custom CORS middleware for additional control.

    Note: This is only needed if django-cors-headers doesn't cover your use case.
    In most cases, use django-cors-headers instead.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        # Add custom CORS headers if needed
        # response['Access-Control-Allow-Origin'] = '*'
        # response['Access-Control-Allow-Methods'] = 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
        # response['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'

        return response
