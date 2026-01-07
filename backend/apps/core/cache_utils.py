"""
Cache Utilities - BVS Backend
=============================================================================
Helper functions and decorators for caching with Redis.

This module provides:
- Cache key builders
- Cache decorators for views and functions
- Cache invalidation helpers
- Cache statistics and monitoring
"""

import hashlib
import json
from functools import wraps
from typing import Any, Callable, Optional, Union
from django.core.cache import cache
from django.conf import settings
from django.http import JsonResponse
from rest_framework.response import Response
import logging

logger = logging.getLogger(__name__)


# =============================================================================
# CACHE KEY BUILDERS
# =============================================================================

def make_cache_key(prefix: str, *args, **kwargs) -> str:
    """
    Build a consistent cache key from prefix, args, and kwargs.

    Args:
        prefix: Cache key prefix (e.g., 'books', 'categories')
        *args: Additional positional arguments for the key
        **kwargs: Keyword arguments for the key

    Returns:
        str: Formatted cache key

    Examples:
        >>> make_cache_key('books', 'list', page=1)
        'books:list:page=1'

        >>> make_cache_key('book', 'detail', slug='python-guide')
        'book:detail:slug=python-guide'
    """
    parts = [prefix] + list(args)
    if kwargs:
        # Sort kwargs for consistent keys regardless of order
        parts.extend([f'{k}={v}' for k, v in sorted(kwargs.items())])
    return ':'.join(str(p) for p in parts)


def make_hash_key(prefix: str, data: Union[dict, list, str]) -> str:
    """
    Create a cache key using hash of data for complex/long keys.

    Useful when cache keys would be too long or contain special characters.

    Args:
        prefix: Cache key prefix
        data: Data to hash (dict, list, or string)

    Returns:
        str: Cache key with hash

    Example:
        >>> make_hash_key('search', {'query': 'python', 'filters': {...}})
        'search:a3f4b2c1d5e6...'
    """
    if isinstance(data, (dict, list)):
        data_str = json.dumps(data, sort_keys=True)
    else:
        data_str = str(data)

    data_hash = hashlib.md5(data_str.encode()).hexdigest()
    return f'{prefix}:{data_hash}'


def get_user_cache_key(user_id: int, prefix: str, *args, **kwargs) -> str:
    """
    Build a user-specific cache key.

    Args:
        user_id: User ID
        prefix: Cache key prefix
        *args: Additional positional arguments
        **kwargs: Keyword arguments

    Returns:
        str: User-specific cache key

    Example:
        >>> get_user_cache_key(123, 'favorites')
        'user:123:favorites'
    """
    return make_cache_key(f'user:{user_id}', prefix, *args, **kwargs)


# =============================================================================
# CACHE DECORATORS
# =============================================================================

def cache_function(timeout: Optional[int] = None, key_prefix: str = 'func'):
    """
    Decorator to cache function results.

    Args:
        timeout: Cache timeout in seconds (None = use default)
        key_prefix: Prefix for cache keys

    Example:
        @cache_function(timeout=3600, key_prefix='categories')
        def get_all_categories():
            return Category.objects.all()
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Build cache key from function name and arguments
            cache_key = make_hash_key(
                f'{key_prefix}:{func.__name__}',
                {'args': args, 'kwargs': kwargs}
            )

            # Try to get from cache
            result = cache.get(cache_key)
            if result is not None:
                logger.debug(f'Cache HIT: {cache_key}')
                return result

            # Cache miss - execute function
            logger.debug(f'Cache MISS: {cache_key}')
            result = func(*args, **kwargs)

            # Store in cache
            cache_timeout = timeout or settings.CACHES['default']['TIMEOUT']
            cache.set(cache_key, result, cache_timeout)

            return result

        return wrapper
    return decorator


def cache_view(timeout: Optional[int] = None, key_builder: Optional[Callable] = None):
    """
    Decorator to cache DRF view responses.

    Args:
        timeout: Cache timeout in seconds
        key_builder: Custom function to build cache key from request

    Example:
        @cache_view(timeout=300)
        def list(self, request):
            ...
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(self, request, *args, **kwargs):
            # Build cache key
            if key_builder:
                cache_key = key_builder(request, *args, **kwargs)
            else:
                # Default: use view name, method, and query params
                view_name = self.__class__.__name__
                query_params = dict(request.query_params)
                cache_key = make_hash_key(
                    f'view:{view_name}:{request.method}',
                    query_params
                )

            # Only cache GET requests
            if request.method != 'GET':
                return func(self, request, *args, **kwargs)

            # Try to get from cache
            cached_data = cache.get(cache_key)
            if cached_data is not None:
                logger.debug(f'Cache HIT: {cache_key}')
                return Response(cached_data)

            # Cache miss - execute view
            logger.debug(f'Cache MISS: {cache_key}')
            response = func(self, request, *args, **kwargs)

            # Only cache successful responses
            if response.status_code == 200:
                cache_timeout = timeout or settings.CACHES['default']['TIMEOUT']
                cache.set(cache_key, response.data, cache_timeout)

            return response

        return wrapper
    return decorator


# =============================================================================
# CACHE OPERATIONS
# =============================================================================

def get_or_set_cache(
    key: str,
    callback: Callable,
    timeout: Optional[int] = None
) -> Any:
    """
    Get value from cache or set it using callback.

    Args:
        key: Cache key
        callback: Function to call if cache miss
        timeout: Cache timeout in seconds

    Returns:
        Cached or computed value

    Example:
        def expensive_query():
            return Book.objects.select_related('author').all()

        books = get_or_set_cache('books:all', expensive_query, timeout=3600)
    """
    value = cache.get(key)

    if value is not None:
        logger.debug(f'Cache HIT: {key}')
        return value

    logger.debug(f'Cache MISS: {key}')
    value = callback()

    cache_timeout = timeout or settings.CACHES['default']['TIMEOUT']
    cache.set(key, value, cache_timeout)

    return value


def invalidate_cache(pattern: str) -> int:
    """
    Invalidate cache keys matching a pattern.

    Note: This requires Redis SCAN command support.
    For production, consider using cache versioning instead.

    Args:
        pattern: Pattern to match (e.g., 'books:*', 'user:123:*')

    Returns:
        Number of keys deleted

    Example:
        # Invalidate all book caches
        invalidate_cache('books:*')

        # Invalidate user-specific caches
        invalidate_cache(f'user:{user_id}:*')
    """
    try:
        from django.core.cache.backends.redis import RedisCache

        if not isinstance(cache, RedisCache):
            logger.warning('Cache invalidation by pattern only works with Redis')
            return 0

        # Get Redis client
        redis_client = cache._cache.get_client()

        # Build full pattern with key prefix
        key_prefix = settings.CACHES['default'].get('KEY_PREFIX', '')
        full_pattern = f'{key_prefix}:{pattern}' if key_prefix else pattern

        # Scan for matching keys
        keys_to_delete = []
        cursor = 0

        while True:
            cursor, keys = redis_client.scan(cursor, match=full_pattern, count=100)
            keys_to_delete.extend(keys)

            if cursor == 0:
                break

        # Delete keys
        if keys_to_delete:
            redis_client.delete(*keys_to_delete)
            logger.info(f'Invalidated {len(keys_to_delete)} cache keys matching {pattern}')
            return len(keys_to_delete)

        return 0

    except Exception as e:
        logger.error(f'Error invalidating cache: {e}')
        return 0


def invalidate_model_cache(model_name: str, instance_id: Optional[int] = None):
    """
    Invalidate all caches related to a model.

    Args:
        model_name: Model name (e.g., 'book', 'category')
        instance_id: Optional instance ID for specific invalidation

    Example:
        # Invalidate all book caches
        invalidate_model_cache('book')

        # Invalidate specific book cache
        invalidate_model_cache('book', instance_id=123)
    """
    patterns = [
        f'{model_name}:*',
        f'{model_name}s:*',  # Plural
        f'view:*{model_name.title()}*',  # View caches
    ]

    if instance_id:
        patterns.append(f'{model_name}:{instance_id}:*')

    total_deleted = 0
    for pattern in patterns:
        total_deleted += invalidate_cache(pattern)

    logger.info(f'Invalidated {total_deleted} cache keys for {model_name}')


# =============================================================================
# CACHE MONITORING
# =============================================================================

def get_cache_stats() -> dict:
    """
    Get cache statistics (Redis-specific).

    Returns:
        dict: Cache statistics including hit rate, memory usage, etc.

    Example:
        stats = get_cache_stats()
        print(f"Hit rate: {stats['hit_rate']:.2%}")
    """
    try:
        from django.core.cache.backends.redis import RedisCache

        if not isinstance(cache, RedisCache):
            return {'error': 'Stats only available for Redis cache'}

        redis_client = cache._cache.get_client()
        info = redis_client.info('stats')

        total_requests = info.get('keyspace_hits', 0) + info.get('keyspace_misses', 0)
        hit_rate = info.get('keyspace_hits', 0) / total_requests if total_requests > 0 else 0

        return {
            'hit_rate': hit_rate,
            'hits': info.get('keyspace_hits', 0),
            'misses': info.get('keyspace_misses', 0),
            'total_requests': total_requests,
            'used_memory': info.get('used_memory_human', 'N/A'),
            'connected_clients': info.get('connected_clients', 0),
        }

    except Exception as e:
        logger.error(f'Error getting cache stats: {e}')
        return {'error': str(e)}


# =============================================================================
# CACHE WARMING
# =============================================================================

def warm_cache(data_loaders: dict):
    """
    Pre-populate cache with frequently accessed data.

    Args:
        data_loaders: Dict mapping cache keys to loader functions

    Example:
        warm_cache({
            'categories:all': lambda: Category.objects.all(),
            'authors:popular': lambda: Author.objects.filter(is_popular=True),
        })
    """
    logger.info('Starting cache warming...')

    for key, loader in data_loaders.items():
        try:
            data = loader()
            cache.set(key, data, timeout=settings.CACHE_TTL.get('categories', 3600))
            logger.info(f'Warmed cache: {key}')
        except Exception as e:
            logger.error(f'Error warming cache for {key}: {e}')

    logger.info('Cache warming completed')
