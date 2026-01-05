# =============================================================================
# Rate Limiting Decorators - BVS Backend
# =============================================================================
"""
Rate limiting decorators for protecting API endpoints.

Usage:
    from apps.core.decorators import rate_limit_auth, rate_limit_api_read

    @rate_limit_auth
    def login_view(request):
        ...

    @rate_limit_api_read
    def list_books(request):
        ...
"""

from functools import wraps
from django.conf import settings
from django_ratelimit.decorators import ratelimit


# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

def get_client_ip(request):
    """
    Get client IP address from request, handling proxies/load balancers.

    Args:
        request: Django request object

    Returns:
        str: Client IP address
    """
    # Check X-Forwarded-For header first (behind proxy)
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        # X-Forwarded-For can contain multiple IPs, get the first one
        ip = x_forwarded_for.split(',')[0].strip()
    else:
        # Direct connection
        ip = request.META.get('REMOTE_ADDR')

    return ip


def is_whitelisted(request):
    """
    Check if request IP is whitelisted (exempt from rate limiting).

    Args:
        request: Django request object

    Returns:
        bool: True if IP is whitelisted
    """
    ip = get_client_ip(request)
    whitelist = getattr(settings, 'RATELIMIT_IP_WHITELIST', [])

    # Filter out empty strings from whitelist
    whitelist = [w for w in whitelist if w]

    return ip in whitelist


# =============================================================================
# AUTHENTICATION RATE LIMITERS
# =============================================================================

def rate_limit_auth(method='POST', rate=None):
    """
    Rate limit decorator for authentication endpoints (login, register, etc.).

    Usage:
        @rate_limit_auth  # Uses default 5/m
        def login_view(request):
            ...

        @rate_limit_auth(rate='3/h')  # Custom rate
        def register_view(request):
            ...

    Args:
        method: HTTP method(s) to limit (default: POST)
        rate: Rate limit string (default: '5/m' from settings)

    Returns:
        Decorated function
    """
    if rate is None:
        rate = settings.RATELIMIT_RATE_GROUPS.get('auth_login', '5/m')

    def decorator(func):
        @wraps(func)
        @ratelimit(
            key='ip',
            rate=rate,
            method=method,
            block=True
        )
        def wrapper(request, *args, **kwargs):
            # Skip rate limiting for whitelisted IPs
            if is_whitelisted(request):
                return func(request, *args, **kwargs)

            # django-ratelimit sets request.limited = True if rate exceeded
            # The middleware will handle the 429 response
            return func(request, *args, **kwargs)

        return wrapper
    return decorator


def rate_limit_register(func):
    """Rate limit for user registration (3 per hour)."""
    # Use hard-coded rate to avoid settings import order issues
    @wraps(func)
    @ratelimit(key='ip', rate='3/h', method='POST', block=True)
    def wrapper(request, *args, **kwargs):
        if is_whitelisted(request):
            return func(request, *args, **kwargs)
        return func(request, *args, **kwargs)

    return wrapper


def rate_limit_password_reset(func):
    """Rate limit for password reset requests (3 per hour)."""
    # Use hard-coded rate to avoid settings import order issues
    @wraps(func)
    @ratelimit(key='ip', rate='3/h', method='POST', block=True)
    def wrapper(request, *args, **kwargs):
        if is_whitelisted(request):
            return func(request, *args, **kwargs)
        return func(request, *args, **kwargs)

    return wrapper


# =============================================================================
# API RATE LIMITERS
# =============================================================================

def rate_limit_api_read(func):
    """
    Rate limit for API read endpoints (GET) - 100 per minute.

    Usage:
        @rate_limit_api_read
        def list_books(request):
            ...
    """
    # Use hard-coded rate to avoid settings import order issues
    @wraps(func)
    @ratelimit(key='ip', rate='100/m', method='GET', block=True)
    def wrapper(request, *args, **kwargs):
        if is_whitelisted(request):
            return func(request, *args, **kwargs)
        return func(request, *args, **kwargs)

    return wrapper


def rate_limit_api_write(func):
    """
    Rate limit for API write endpoints (POST, PUT, PATCH) - 30 per minute.

    Usage:
        @rate_limit_api_write
        def create_book(request):
            ...
    """
    # Use hard-coded rate to avoid settings import order issues
    @wraps(func)
    @ratelimit(
        key='ip',
        rate='30/m',
        method=['POST', 'PUT', 'PATCH'],
        block=True
    )
    def wrapper(request, *args, **kwargs):
        if is_whitelisted(request):
            return func(request, *args, **kwargs)
        return func(request, *args, **kwargs)

    return wrapper


def rate_limit_api_delete(func):
    """
    Rate limit for API delete endpoints - 10 per minute.

    Usage:
        @rate_limit_api_delete
        def delete_book(request):
            ...
    """
    # Use hard-coded rate to avoid settings import order issues
    @wraps(func)
    @ratelimit(key='ip', rate='10/m', method='DELETE', block=True)
    def wrapper(request, *args, **kwargs):
        if is_whitelisted(request):
            return func(request, *args, **kwargs)
        return func(request, *args, **kwargs)

    return wrapper


# =============================================================================
# SPECIALIZED RATE LIMITERS
# =============================================================================

def rate_limit_search(func):
    """
    Rate limit for search endpoints - 60 per minute.

    Usage:
        @rate_limit_search
        def search_books(request):
            ...
    """
    # Use hard-coded rate to avoid settings import order issues
    @wraps(func)
    @ratelimit(
        key='ip',
        rate='60/m',
        method=['GET', 'POST'],
        block=True
    )
    def wrapper(request, *args, **kwargs):
        if is_whitelisted(request):
            return func(request, *args, **kwargs)
        return func(request, *args, **kwargs)

    return wrapper


def rate_limit_upload(func):
    """
    Rate limit for file upload endpoints - 10 per hour.

    Usage:
        @rate_limit_upload
        def upload_pdf(request):
            ...
    """
    # Use hard-coded rate to avoid settings import order issues
    @wraps(func)
    @ratelimit(key='ip', rate='10/h', method='POST', block=True)
    def wrapper(request, *args, **kwargs):
        if is_whitelisted(request):
            return func(request, *args, **kwargs)
        return func(request, *args, **kwargs)

    return wrapper


def rate_limit_admin_critical(func):
    """
    Rate limit for critical admin actions - 20 per hour.

    Usage:
        @rate_limit_admin_critical
        def delete_all_users(request):
            ...
    """
    # Use hard-coded rate to avoid settings import order issues
    @wraps(func)
    @ratelimit(
        key='ip',
        rate='20/h',
        method=['POST', 'DELETE'],
        block=True
    )
    def wrapper(request, *args, **kwargs):
        if is_whitelisted(request):
            return func(request, *args, **kwargs)
        return func(request, *args, **kwargs)

    return wrapper


# =============================================================================
# CUSTOM RATE LIMITER
# =============================================================================

def custom_rate_limit(rate, methods=None, key_func='ip'):
    """
    Custom rate limit decorator with configurable parameters.

    Usage:
        @custom_rate_limit(rate='50/m', methods=['GET', 'POST'])
        def my_view(request):
            ...

    Args:
        rate: Rate limit string (e.g., '50/m', '100/h', '1000/d')
        methods: List of HTTP methods to limit (default: all)
        key_func: Key function ('ip', 'user', or custom)

    Returns:
        Decorator function
    """
    if methods is None:
        methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']

    def decorator(func):
        @wraps(func)
        @ratelimit(key=key_func, rate=rate, method=methods, block=True)
        def wrapper(request, *args, **kwargs):
            if is_whitelisted(request):
                return func(request, *args, **kwargs)
            return func(request, *args, **kwargs)

        return wrapper
    return decorator
