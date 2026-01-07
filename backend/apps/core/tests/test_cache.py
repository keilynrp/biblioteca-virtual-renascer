"""
Cache Tests - BVS Backend
=============================================================================
Test cache functionality and invalidation.
"""

import pytest
from django.core.cache import cache
from django.conf import settings
from apps.core.cache_utils import (
    make_cache_key,
    make_hash_key,
    get_or_set_cache,
    invalidate_cache,
)


@pytest.mark.django_db
class TestCacheUtils:
    """Test cache utility functions"""

    def setup_method(self):
        """Clear cache before each test"""
        cache.clear()

    def teardown_method(self):
        """Clear cache after each test"""
        cache.clear()

    def test_make_cache_key(self):
        """Test cache key generation"""
        key = make_cache_key('books', 'list', page=1, category='fiction')
        assert key == 'books:list:category=fiction:page=1'

    def test_make_cache_key_no_kwargs(self):
        """Test cache key without kwargs"""
        key = make_cache_key('categories', 'list')
        assert key == 'categories:list'

    def test_make_hash_key(self):
        """Test hash-based cache key generation"""
        data = {'query': 'python', 'filters': {'category': 'programming'}}
        key = make_hash_key('search', data)

        assert key.startswith('search:')
        assert len(key.split(':')[1]) == 32  # MD5 hash length

    def test_get_or_set_cache_miss(self):
        """Test cache miss - callback should be called"""
        call_count = []

        def expensive_operation():
            call_count.append(1)
            return "computed_value"

        result = get_or_set_cache('test_key', expensive_operation, timeout=60)

        assert result == "computed_value"
        assert len(call_count) == 1  # Callback was called

    def test_get_or_set_cache_hit(self):
        """Test cache hit - callback should not be called"""
        # Pre-populate cache
        cache.set('test_key', 'cached_value', timeout=60)

        call_count = []

        def expensive_operation():
            call_count.append(1)
            return "computed_value"

        result = get_or_set_cache('test_key', expensive_operation, timeout=60)

        assert result == 'cached_value'
        assert len(call_count) == 0  # Callback was NOT called

    def test_cache_set_and_get(self):
        """Test basic cache set and get"""
        cache.set('test_key', 'test_value', timeout=60)
        value = cache.get('test_key')

        assert value == 'test_value'

    def test_cache_delete(self):
        """Test cache deletion"""
        cache.set('test_key', 'test_value', timeout=60)
        cache.delete('test_key')
        value = cache.get('test_key')

        assert value is None

    def test_cache_timeout(self):
        """Test that cache respects timeout"""
        import time

        cache.set('test_key', 'test_value', timeout=1)
        value1 = cache.get('test_key')
        assert value1 == 'test_value'

        # Wait for cache to expire
        time.sleep(2)
        value2 = cache.get('test_key')
        assert value2 is None


@pytest.mark.django_db
class TestCacheInvalidation:
    """Test cache invalidation"""

    def setup_method(self):
        """Clear cache before each test"""
        cache.clear()

    def teardown_method(self):
        """Clear cache after each test"""
        cache.clear()

    def test_invalidate_cache_pattern(self):
        """Test pattern-based cache invalidation"""
        # Set multiple cache keys
        cache.set('books:list:page=1', 'data1')
        cache.set('books:list:page=2', 'data2')
        cache.set('books:detail:123', 'data3')
        cache.set('categories:list', 'data4')

        # Invalidate books:list:* pattern
        deleted_count = invalidate_cache('books:list:*')

        # Check that books:list:* keys were deleted
        assert cache.get('books:list:page=1') is None
        assert cache.get('books:list:page=2') is None

        # Check that other keys are still there
        assert cache.get('books:detail:123') == 'data3'
        assert cache.get('categories:list') == 'data4'

        # Should have deleted 2 keys
        assert deleted_count >= 2


@pytest.mark.django_db
class TestCacheConfiguration:
    """Test cache configuration"""

    def test_cache_backend_is_redis(self):
        """Test that Redis is configured as cache backend"""
        backend = settings.CACHES['default']['BACKEND']
        assert 'redis' in backend.lower()

    def test_cache_ttl_settings_exist(self):
        """Test that CACHE_TTL settings are defined"""
        assert hasattr(settings, 'CACHE_TTL')
        assert 'categories' in settings.CACHE_TTL
        assert 'authors' in settings.CACHE_TTL
        assert 'dashboard_stats' in settings.CACHE_TTL

    def test_cache_ttl_values(self):
        """Test that CACHE_TTL values are reasonable"""
        # Categories should be cached for 1 hour (3600 seconds)
        assert settings.CACHE_TTL['categories'] == 60 * 60

        # Dashboard stats should be cached for 15 minutes (900 seconds)
        assert settings.CACHE_TTL['dashboard_stats'] == 60 * 15


@pytest.mark.django_db
class TestModelCaching:
    """Test caching in model views"""

    def setup_method(self):
        """Clear cache before each test"""
        cache.clear()

    def teardown_method(self):
        """Clear cache after each test"""
        cache.clear()

    def test_categories_list_caching(self):
        """Test that categories list is cached"""
        from apps.content.models import Category
        from apps.content.serializers import CategorySerializer
        from apps.core.cache_utils import make_cache_key

        # Create test category
        category = Category.objects.create(
            name="Test Category",
            description="Test Description"
        )

        cache_key = make_cache_key('categories', 'list')

        # First call - cache miss
        assert cache.get(cache_key) is None

        # Simulate caching
        categories = Category.objects.all()
        serializer = CategorySerializer(categories, many=True)
        cache.set(cache_key, serializer.data, timeout=settings.CACHE_TTL['categories'])

        # Second call - cache hit
        cached_data = cache.get(cache_key)
        assert cached_data is not None
        assert len(cached_data) == 1
        assert cached_data[0]['name'] == "Test Category"

    def test_dashboard_stats_caching(self):
        """Test that dashboard stats are cached"""
        cache_key = make_cache_key('dashboard', 'stats')

        # Simulate dashboard stats
        stats = {
            'total_books': 100,
            'total_users': 50,
            'average_rating': 4.5,
        }

        cache.set(cache_key, stats, timeout=settings.CACHE_TTL['dashboard_stats'])

        # Retrieve from cache
        cached_stats = cache.get(cache_key)
        assert cached_stats is not None
        assert cached_stats['total_books'] == 100
        assert cached_stats['total_users'] == 50


@pytest.mark.django_db
class TestCacheInvalidationSignals:
    """Test that signals properly invalidate cache"""

    def setup_method(self):
        """Clear cache before each test"""
        cache.clear()

    def teardown_method(self):
        """Clear cache after each test"""
        cache.clear()

    def test_category_save_invalidates_cache(self):
        """Test that saving a category invalidates cache"""
        from apps.content.models import Category

        # Pre-populate cache
        cache_key = make_cache_key('categories', 'list')
        cache.set(cache_key, ['cached_data'], timeout=300)

        # Create a category (should trigger signal)
        Category.objects.create(name="New Category", description="Test")

        # Cache should be invalidated
        cached_data = cache.get(cache_key)
        assert cached_data is None

    def test_category_delete_invalidates_cache(self):
        """Test that deleting a category invalidates cache"""
        from apps.content.models import Category

        # Create and then pre-populate cache
        category = Category.objects.create(name="Test Category", description="Test")
        cache_key = make_cache_key('categories', 'list')
        cache.set(cache_key, ['cached_data'], timeout=300)

        # Delete the category (should trigger signal)
        category.delete()

        # Cache should be invalidated
        cached_data = cache.get(cache_key)
        assert cached_data is None
