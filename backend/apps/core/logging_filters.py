# =============================================================================
# Logging Filters - BVS Backend
# =============================================================================
"""
Custom logging filters for enhanced log tracking.

Filters:
- CorrelationIdFilter: Adds correlation ID to all log records
"""

import logging
import uuid
from threading import local

# Thread-local storage for correlation ID
_thread_locals = local()


def get_correlation_id():
    """
    Get the current correlation ID from thread-local storage.

    Returns:
        str: Correlation ID or 'no-correlation-id' if not set
    """
    return getattr(_thread_locals, 'correlation_id', 'no-correlation-id')


def set_correlation_id(correlation_id=None):
    """
    Set the correlation ID in thread-local storage.

    Args:
        correlation_id: Optional correlation ID. If None, generates a new one.

    Returns:
        str: The correlation ID that was set
    """
    if correlation_id is None:
        correlation_id = str(uuid.uuid4())

    _thread_locals.correlation_id = correlation_id
    return correlation_id


def clear_correlation_id():
    """Clear the correlation ID from thread-local storage."""
    if hasattr(_thread_locals, 'correlation_id'):
        delattr(_thread_locals, 'correlation_id')


class CorrelationIdFilter(logging.Filter):
    """
    Logging filter that adds correlation ID to all log records.

    The correlation ID allows tracking a single request across multiple
    log entries, making it easier to debug issues and trace request flow.

    Usage in settings.py:
        LOGGING = {
            'filters': {
                'correlation_id': {
                    '()': 'apps.core.logging_filters.CorrelationIdFilter',
                }
            }
        }

    Usage in JSON logs:
        {"correlation_id": "abc-123", "message": "User logged in", ...}
    """

    def filter(self, record):
        """
        Add correlation ID to log record.

        Args:
            record: LogRecord instance

        Returns:
            bool: Always True (don't filter out any records)
        """
        record.correlation_id = get_correlation_id()
        return True


class UserInfoFilter(logging.Filter):
    """
    Logging filter that adds user information to log records.

    Adds user ID and email to log records when available from request.

    Usage:
        LOGGING = {
            'filters': {
                'user_info': {
                    '()': 'apps.core.logging_filters.UserInfoFilter',
                }
            }
        }
    """

    def filter(self, record):
        """
        Add user information to log record.

        Args:
            record: LogRecord instance

        Returns:
            bool: Always True
        """
        # Try to get user from thread locals (set by middleware)
        user = getattr(_thread_locals, 'user', None)

        if user and hasattr(user, 'id') and user.is_authenticated:
            record.user_id = user.id
            record.user_email = getattr(user, 'email', 'unknown')
        else:
            record.user_id = None
            record.user_email = 'anonymous'

        return True


class RequestInfoFilter(logging.Filter):
    """
    Logging filter that adds request information to log records.

    Adds request path, method, and IP address to log records.

    Usage:
        LOGGING = {
            'filters': {
                'request_info': {
                    '()': 'apps.core.logging_filters.RequestInfoFilter',
                }
            }
        }
    """

    def filter(self, record):
        """
        Add request information to log record.

        Args:
            record: LogRecord instance

        Returns:
            bool: Always True
        """
        # Try to get request from thread locals
        request = getattr(_thread_locals, 'request', None)

        if request:
            record.request_path = getattr(request, 'path', 'unknown')
            record.request_method = getattr(request, 'method', 'unknown')

            # Get IP address (handle proxy)
            x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
            if x_forwarded_for:
                record.request_ip = x_forwarded_for.split(',')[0].strip()
            else:
                record.request_ip = request.META.get('REMOTE_ADDR', 'unknown')
        else:
            record.request_path = 'no-request'
            record.request_method = 'no-request'
            record.request_ip = 'no-request'

        return True


# =============================================================================
# HELPER FUNCTIONS FOR STORING REQUEST/USER IN THREAD LOCALS
# =============================================================================

def set_request(request):
    """Store request in thread-local storage."""
    _thread_locals.request = request


def get_request():
    """Get request from thread-local storage."""
    return getattr(_thread_locals, 'request', None)


def clear_request():
    """Clear request from thread-local storage."""
    if hasattr(_thread_locals, 'request'):
        delattr(_thread_locals, 'request')


def set_user(user):
    """Store user in thread-local storage."""
    _thread_locals.user = user


def get_user():
    """Get user from thread-local storage."""
    return getattr(_thread_locals, 'user', None)


def clear_user():
    """Clear user from thread-local storage."""
    if hasattr(_thread_locals, 'user'):
        delattr(_thread_locals, 'user')
