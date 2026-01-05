# =============================================================================
# Core Views - BVS Backend
# =============================================================================
import logging
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from rest_framework import status

logger = logging.getLogger(__name__)


# =============================================================================
# RATE LIMITING VIEWS
# =============================================================================

@require_http_methods(["GET", "POST", "PUT", "PATCH", "DELETE"])
def rate_limit_exceeded(request, exception=None):
    """
    Custom view for rate limit exceeded (HTTP 429).

    This view is called when a user exceeds the rate limit for an endpoint.
    It returns a JSON response with details about the rate limit and when
    the user can retry.

    Args:
        request: Django request object
        exception: Optional exception object from django-ratelimit

    Returns:
        JsonResponse with HTTP 429 status
    """
    # Log the rate limit violation
    logger.warning(
        f"Rate limit exceeded for IP {request.META.get('REMOTE_ADDR')} "
        f"on {request.method} {request.path}"
    )

    # Get rate limit details from exception if available
    retry_after = getattr(exception, 'retry_after', 60)  # Default 60 seconds

    response_data = {
        'error': 'rate_limit_exceeded',
        'message': 'Too many requests. Please try again later.',
        'detail': (
            'You have exceeded the rate limit for this endpoint. '
            'Please wait before making additional requests.'
        ),
        'retry_after': retry_after,  # Seconds until can retry
        'status_code': status.HTTP_429_TOO_MANY_REQUESTS,
    }

    # Create response with Retry-After header
    response = JsonResponse(
        response_data,
        status=status.HTTP_429_TOO_MANY_REQUESTS
    )
    response['Retry-After'] = str(retry_after)

    return response


# =============================================================================
# HEALTH CHECK VIEWS
# =============================================================================

@require_http_methods(["GET"])
def health_check(request):
    """
    Basic health check endpoint for monitoring and load balancers.
    Quick check that returns 200 OK if service is running.

    Returns:
        JsonResponse with health status
    """
    return JsonResponse({
        'status': 'healthy',
        'service': 'bvs-backend',
        'version': '1.0.0',
    })


@require_http_methods(["GET"])
def health_check_detailed(request):
    """
    Detailed health check that verifies database and cache connectivity.

    This endpoint checks:
    - Database connection (PostgreSQL)
    - Cache connection (Redis)
    - Overall service health

    Returns:
        JsonResponse with detailed health status and component checks
    """
    from django.core.cache import cache
    from django.db import connection
    import time

    health_status = {
        'status': 'healthy',
        'service': 'bvs-backend',
        'version': '1.0.0',
        'timestamp': time.time(),
        'checks': {}
    }

    # Check database connection
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()
        health_status['checks']['database'] = {
            'status': 'healthy',
            'type': 'postgresql'
        }
    except Exception as e:
        health_status['checks']['database'] = {
            'status': 'unhealthy',
            'error': str(e)
        }
        health_status['status'] = 'unhealthy'
        logger.error(f"Database health check failed: {e}")

    # Check Redis cache connection
    try:
        cache_key = 'health_check'
        cache.set(cache_key, 'ok', 10)
        cache_value = cache.get(cache_key)
        if cache_value == 'ok':
            health_status['checks']['cache'] = {
                'status': 'healthy',
                'type': 'redis'
            }
        else:
            raise Exception("Cache value mismatch")
    except Exception as e:
        health_status['checks']['cache'] = {
            'status': 'unhealthy',
            'error': str(e)
        }
        health_status['status'] = 'degraded'  # Cache failure is not critical
        logger.warning(f"Cache health check failed: {e}")

    # Return appropriate status code
    if health_status['status'] == 'healthy':
        return JsonResponse(health_status, status=200)
    elif health_status['status'] == 'degraded':
        return JsonResponse(health_status, status=200)  # Still return 200 for degraded
    else:
        return JsonResponse(health_status, status=503)
