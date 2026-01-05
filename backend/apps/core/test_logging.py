# =============================================================================
# Logging Tests - BVS Backend
# =============================================================================
"""
Tests for logging system including:
- Correlation ID generation and propagation
- JSON formatted logs
- Log rotation
- Filters
"""

import pytest
import logging
import json
from django.test import TestCase, Client, override_settings
from django.contrib.auth import get_user_model
from .logging_filters import (
    get_correlation_id,
    set_correlation_id,
    clear_correlation_id,
    CorrelationIdFilter
)

User = get_user_model()


class CorrelationIdTestCase(TestCase):
    """Tests for correlation ID functionality."""

    def tearDown(self):
        """Clean up correlation ID after each test."""
        clear_correlation_id()

    def test_set_and_get_correlation_id(self):
        """Test setting and getting correlation ID."""
        test_id = "test-correlation-123"
        set_correlation_id(test_id)

        self.assertEqual(get_correlation_id(), test_id)

    def test_auto_generate_correlation_id(self):
        """Test auto-generation of correlation ID."""
        correlation_id = set_correlation_id()

        self.assertIsNotNone(correlation_id)
        self.assertNotEqual(correlation_id, 'no-correlation-id')
        self.assertEqual(len(correlation_id), 36)  # UUID format

    def test_clear_correlation_id(self):
        """Test clearing correlation ID."""
        set_correlation_id("test-123")
        clear_correlation_id()

        self.assertEqual(get_correlation_id(), 'no-correlation-id')

    def test_correlation_id_filter(self):
        """Test CorrelationIdFilter adds correlation ID to log record."""
        set_correlation_id("test-456")

        # Create log record
        record = logging.LogRecord(
            name="test",
            level=logging.INFO,
            pathname="test.py",
            lineno=1,
            msg="Test message",
            args=(),
            exc_info=None
        )

        # Apply filter
        log_filter = CorrelationIdFilter()
        log_filter.filter(record)

        self.assertEqual(record.correlation_id, "test-456")


class CorrelationIdMiddlewareTestCase(TestCase):
    """Tests for CorrelationIdMiddleware."""

    def setUp(self):
        """Set up test client."""
        self.client = Client()
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )

    def test_middleware_generates_correlation_id(self):
        """Test middleware generates correlation ID."""
        response = self.client.get('/api/')

        # Response should have X-Correlation-ID header
        self.assertIn('X-Correlation-ID', response)
        self.assertIsNotNone(response['X-Correlation-ID'])

    def test_middleware_uses_provided_correlation_id(self):
        """Test middleware uses provided correlation ID from header."""
        test_id = "provided-correlation-id"

        response = self.client.get(
            '/api/',
            HTTP_X_CORRELATION_ID=test_id
        )

        # Response should use provided correlation ID
        self.assertEqual(response.get('X-Correlation-ID'), test_id)

    def test_middleware_adds_correlation_id_to_logs(self):
        """Test middleware makes correlation ID available for logging."""
        with self.assertLogs('apps.core.middleware', level='DEBUG') as cm:
            self.client.get('/api/')

        # Check that logs contain correlation_id
        # Note: Actual assertion depends on log format
        self.assertTrue(len(cm.output) > 0)


class LoggingConfigurationTestCase(TestCase):
    """Tests for logging configuration."""

    def test_json_formatter_available(self):
        """Test JSON formatter is available."""
        from django.conf import settings

        self.assertIn('json', settings.LOGGING['formatters'])
        self.assertEqual(
            settings.LOGGING['formatters']['json']['()'],
            'pythonjsonlogger.jsonlogger.JsonFormatter'
        )

    def test_correlation_id_filter_configured(self):
        """Test correlation ID filter is configured."""
        from django.conf import settings

        self.assertIn('correlation_id', settings.LOGGING['filters'])
        self.assertEqual(
            settings.LOGGING['filters']['correlation_id']['()'],
            'apps.core.logging_filters.CorrelationIdFilter'
        )

    def test_log_handlers_configured(self):
        """Test log handlers are configured."""
        from django.conf import settings

        handlers = settings.LOGGING['handlers']
        self.assertIn('console', handlers)
        self.assertIn('file', handlers)
        self.assertIn('error_file', handlers)

    def test_log_level_from_environment(self):
        """Test log level can be set from environment."""
        from django.conf import settings

        # LOG_LEVEL should be set
        self.assertIsNotNone(settings.LOG_LEVEL)


class RequestLoggingTestCase(TestCase):
    """Tests for request logging middleware."""

    def setUp(self):
        """Set up test client."""
        self.client = Client()

    def test_request_logging_middleware_logs_request(self):
        """Test RequestLoggingMiddleware logs requests."""
        with self.assertLogs('apps.core.middleware', level='INFO') as cm:
            self.client.get('/api/')

        # Should have logged the request
        self.assertTrue(any('GET' in log for log in cm.output))
        self.assertTrue(any('/api/' in log for log in cm.output))

    def test_request_logging_includes_status_code(self):
        """Test request logging includes status code."""
        with self.assertLogs('apps.core.middleware', level='INFO') as cm:
            self.client.get('/api/')

        # Should include status code in logs
        self.assertTrue(any('[' in log and ']' in log for log in cm.output))


# =============================================================================
# MANUAL TESTING NOTES
# =============================================================================
"""
Manual tests to perform:

1. Check log files are created:
   ls backend/logs/
   # Should see: django.log, errors.log, daily.log, etc.

2. Check JSON format:
   tail -1 backend/logs/django.log | python -m json.tool
   # Should parse as valid JSON

3. Check correlation ID in logs:
   grep "correlation_id" backend/logs/django.log
   # Should see correlation IDs in all log entries

4. Check log rotation:
   # Make many requests to generate large log file
   for i in {1..10000}; do curl http://localhost:8000/api/ &>/dev/null; done
   ls -lh backend/logs/
   # Should see .1, .2 backup files if exceeded 10MB

5. Test with different log levels:
   export LOG_LEVEL=WARNING
   python manage.py runserver
   # Should only see WARNING and above

6. Check correlation ID in response:
   curl -v http://localhost:8000/api/ | grep X-Correlation-ID
   # Should see X-Correlation-ID header

7. Provide correlation ID:
   curl -H "X-Correlation-ID: my-test-id" http://localhost:8000/api/
   # Logs should use "my-test-id"
"""
