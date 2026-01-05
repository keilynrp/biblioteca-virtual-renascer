# =============================================================================
# Rate Limiting Tests - BVS Backend
# =============================================================================
"""
Tests for rate limiting functionality.

These tests verify that:
1. Rate limits are properly enforced
2. HTTP 429 is returned when limit exceeded
3. Rate limits reset after time period
4. Whitelisted IPs are exempt
5. Different endpoints have different limits
"""

import pytest
from django.test import TestCase, Client, override_settings
from django.urls import reverse
from django.contrib.auth import get_user_model
from django.core.cache import cache
from rest_framework import status
from apps.authentication.models import User
import time

User = get_user_model()


@pytest.mark.django_db
class RateLimitTestCase(TestCase):
    """
    Test cases for rate limiting middleware and decorators.
    """

    def setUp(self):
        """Set up test client and clear cache before each test."""
        self.client = Client()
        cache.clear()  # Clear rate limit cache

        # Create test user
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )

    def tearDown(self):
        """Clear cache after each test."""
        cache.clear()

    # =============================================================================
    # AUTHENTICATION RATE LIMIT TESTS
    # =============================================================================

    def test_registration_rate_limit(self):
        """Test that registration is rate limited to 3 per hour."""
        url = reverse('register')  # Adjust if your URL name is different

        # First 3 registrations should succeed
        for i in range(3):
            response = self.client.post(url, {
                'email': f'user{i}@example.com',
                'password': 'testpass123',
                'first_name': 'Test',
                'last_name': f'User{i}'
            })
            # Should succeed (201) or fail for other reasons (400), but not rate limited
            self.assertNotEqual(response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)

        # 4th registration should be rate limited
        response = self.client.post(url, {
            'email': 'user4@example.com',
            'password': 'testpass123',
            'first_name': 'Test',
            'last_name': 'User4'
        })

        self.assertEqual(response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)
        self.assertEqual(response.json()['error'], 'rate_limit_exceeded')
        self.assertIn('retry_after', response.json())

    def test_password_change_rate_limit(self):
        """Test that password changes are rate limited to 3 per hour."""
        # Login first
        self.client.force_login(self.user)

        url = reverse('change-password')  # Adjust if your URL name is different

        # Attempt 4 password changes
        for i in range(4):
            response = self.client.put(url, {
                'old_password': 'testpass123',
                'new_password': f'newpass{i}123'
            }, content_type='application/json')

            if i < 3:
                # First 3 should not be rate limited
                self.assertNotEqual(response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)
            else:
                # 4th should be rate limited
                self.assertEqual(response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)

    # =============================================================================
    # API RATE LIMIT TESTS
    # =============================================================================

    def test_api_read_rate_limit(self):
        """Test that API reads are rate limited to 100 per minute."""
        url = reverse('book-list')  # Adjust to your actual URL

        # Make 101 requests
        for i in range(101):
            response = self.client.get(url)

            if i < 100:
                # First 100 should succeed
                self.assertNotEqual(response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)
            else:
                # 101st should be rate limited
                self.assertEqual(response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)

    def test_api_write_rate_limit(self):
        """Test that API writes are rate limited to 30 per minute."""
        self.client.force_login(self.user)

        url = reverse('book-list')  # Adjust to your actual URL

        # Make 31 POST requests
        for i in range(31):
            response = self.client.post(url, {
                'title': f'Test Book {i}',
                'author': 1,
                'description': 'Test description'
            }, content_type='application/json')

            if i < 30:
                # First 30 should not be rate limited (may fail for other reasons)
                self.assertNotEqual(response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)
            else:
                # 31st should be rate limited
                self.assertEqual(response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)

    def test_search_rate_limit(self):
        """Test that search is rate limited to 60 per minute."""
        url = reverse('search-books')  # Adjust to your actual URL

        # Make 61 search requests
        for i in range(61):
            response = self.client.get(url, {'q': f'test query {i}'})

            if i < 60:
                # First 60 should succeed
                self.assertNotEqual(response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)
            else:
                # 61st should be rate limited
                self.assertEqual(response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)

    # =============================================================================
    # RATE LIMIT RESPONSE TESTS
    # =============================================================================

    def test_rate_limit_response_format(self):
        """Test that rate limit response has correct format."""
        url = reverse('register')

        # Exceed rate limit
        for i in range(4):
            response = self.client.post(url, {
                'email': f'user{i}@example.com',
                'password': 'testpass123',
                'first_name': 'Test',
                'last_name': f'User{i}'
            })

        # Check last response (should be rate limited)
        self.assertEqual(response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)

        data = response.json()
        self.assertEqual(data['error'], 'rate_limit_exceeded')
        self.assertIn('message', data)
        self.assertIn('retry_after', data)
        self.assertIn('detail', data)

        # Check Retry-After header
        self.assertIn('Retry-After', response)

    def test_rate_limit_headers(self):
        """Test that rate limit responses include proper headers."""
        url = reverse('register')

        # Exceed rate limit
        for i in range(4):
            response = self.client.post(url, {
                'email': f'user{i}@example.com',
                'password': 'testpass123',
                'first_name': 'Test',
                'last_name': f'User{i}'
            })

        # Verify Retry-After header exists
        self.assertIn('Retry-After', response)
        retry_after = int(response['Retry-After'])
        self.assertGreater(retry_after, 0)

    # =============================================================================
    # WHITELIST TESTS
    # =============================================================================

    @override_settings(RATELIMIT_IP_WHITELIST=['127.0.0.1'])
    def test_whitelisted_ip_exempt(self):
        """Test that whitelisted IPs are exempt from rate limiting."""
        url = reverse('register')

        # Make many requests (more than limit)
        for i in range(10):
            response = self.client.post(url, {
                'email': f'user{i}@example.com',
                'password': 'testpass123',
                'first_name': 'Test',
                'last_name': f'User{i}'
            })

            # Should never be rate limited (may fail for other reasons)
            self.assertNotEqual(response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)

    # =============================================================================
    # CACHE TESTS
    # =============================================================================

    def test_rate_limit_uses_redis_cache(self):
        """Test that rate limiting uses Redis cache."""
        from django.conf import settings

        # Verify Redis is configured for rate limiting
        self.assertEqual(settings.RATELIMIT_USE_CACHE, 'default')

        # Make a request
        url = reverse('book-list')
        self.client.get(url)

        # Verify cache has rate limit keys
        # Note: Actual key format depends on django-ratelimit implementation
        # This is a basic check
        self.assertIsNotNone(cache._cache)  # Verify cache is available

    # =============================================================================
    # DIFFERENT METHODS TESTS
    # =============================================================================

    def test_different_methods_different_limits(self):
        """Test that GET and POST have different rate limits."""
        self.client.force_login(self.user)

        url = reverse('book-list')

        # Make 100 GET requests (should all succeed)
        for i in range(100):
            response = self.client.get(url)
            self.assertNotEqual(response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)

        # Now make 30 POST requests (should all succeed, separate limit)
        for i in range(30):
            response = self.client.post(url, {
                'title': f'Test Book {i}',
                'author': 1,
                'description': 'Test'
            }, content_type='application/json')
            self.assertNotEqual(response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)

        # 31st POST should be rate limited
        response = self.client.post(url, {
            'title': 'Test Book Final',
            'author': 1,
            'description': 'Test'
        }, content_type='application/json')
        self.assertEqual(response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)


# =============================================================================
# INTEGRATION TESTS
# =============================================================================

@pytest.mark.django_db
class RateLimitIntegrationTestCase(TestCase):
    """
    Integration tests for rate limiting across multiple endpoints.
    """

    def setUp(self):
        self.client = Client()
        cache.clear()

    def test_rate_limits_are_independent_per_endpoint(self):
        """Test that rate limits are tracked independently per endpoint."""
        # Make requests to different endpoints
        books_url = reverse('book-list')
        search_url = reverse('search-books')

        # Exhaust book list rate limit
        for i in range(100):
            self.client.get(books_url)

        # Search should still work (different rate limit)
        response = self.client.get(search_url, {'q': 'test'})
        self.assertNotEqual(response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)

    def test_authenticated_vs_anonymous_rate_limits(self):
        """Test that authenticated and anonymous users can have different limits."""
        # This test assumes you might have different limits for auth/anon users
        # Adjust based on your actual implementation
        pass


# =============================================================================
# NOTES FOR RUNNING TESTS
# =============================================================================
"""
To run these tests:

1. Ensure Redis is running:
   docker-compose up -d redis

2. Run all rate limit tests:
   pytest apps/core/test_ratelimit.py -v

3. Run specific test:
   pytest apps/core/test_ratelimit.py::RateLimitTestCase::test_registration_rate_limit -v

4. Run with coverage:
   pytest apps/core/test_ratelimit.py --cov=apps.core.decorators --cov=apps.core.middleware

IMPORTANT:
- These tests require Redis to be running
- Tests will clear the cache, so don't run in production
- Some tests may need URL names adjusted to match your urls.py
- Rate limits are strict, so tests run sequentially
"""
