from .settings import *

# Use LocMemCache instead of DummyCache for cache-dependent tests
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'unique-snowflake',
    }
}

# Rate limiting cache backend
RATELIMIT_USE_CACHE = 'default'

# Disable rate limiting in tests so sequential requests don't get blocked
RATELIMIT_ENABLE = False

# Celery using memory for tests
CELERY_BROKER_URL = 'memory://'
CELERY_RESULT_BACKEND = 'cache+memory://'
CELERY_TASK_ALWAYS_EAGER = True
CELERY_TASK_EAGER_PROPAGATES = True
