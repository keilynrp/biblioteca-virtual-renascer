"""
Configuración base de Django compartida entre todos los entornos
"""

import os
from pathlib import Path
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

# Build paths
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-default-key')

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Third party
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'django_filters',
    # Local
    'apps.authentication',
    'apps.institutions',
    'apps.subscriptions',
    'apps.payments',
    'apps.content',
    'apps.notifications',
    'apps.loans',
    'apps.core',
    'apps.communities', # Sprint 7
    'apps.analytics',
    'apps.currencies',
    'apps.mailer',
    'apps.site_settings',
    'apps.pages',
    'apps.navigation',
    'apps.billing',
    'apps.blog',
]

AUTH_USER_MODEL = 'authentication.User'

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 1000,  # Retorna todos los libros (hay 49 actualmente)
    'DEFAULT_FILTER_BACKENDS': (
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ),
    'EXCEPTION_HANDLER': 'apps.core.exceptions.custom_exception_handler',
    'NON_FIELD_ERRORS_KEY': 'non_field_errors',
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': False,
    'BLACKLIST_AFTER_ROTATION': False,
    'UPDATE_LAST_LOGIN': False,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'VERIFYING_KEY': None,
    'AUDIENCE': None,
    'ISSUER': None,
    'JWK_URL': None,
    'LEEWAY': 0,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_HEADER_NAME': 'HTTP_AUTHORIZATION',
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
    'USER_AUTHENTICATION_RULE': 'rest_framework_simplejwt.authentication.default_user_authentication_rule',
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'TOKEN_TYPE_CLAIM': 'token_type',
    'TOKEN_USER_CLASS': 'rest_framework_simplejwt.models.TokenUser',
    'JTI_CLAIM': 'jti',
}

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {
            'min_length': 8,
        }
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
LANGUAGE_CODE = 'es-es'
TIME_ZONE = 'Africa/Luanda'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# ─── Storage: MinIO / S3 ──────────────────────────────────────────────────────
USE_MINIO = os.getenv('USE_MINIO', 'False') == 'True'

if USE_MINIO:
    INSTALLED_APPS += ['storages']

    DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'

    AWS_ACCESS_KEY_ID       = os.getenv('MINIO_ACCESS_KEY', 'minioadmin')
    AWS_SECRET_ACCESS_KEY   = os.getenv('MINIO_SECRET_KEY', 'minioadmin123')
    AWS_STORAGE_BUCKET_NAME = os.getenv('MINIO_BUCKET_NAME', 'biblioteca')
    AWS_S3_ENDPOINT_URL     = os.getenv('MINIO_ENDPOINT_URL', 'http://minio:9000')
    AWS_S3_REGION_NAME      = 'us-east-1'
    AWS_DEFAULT_ACL         = 'private'       # todos los archivos privados
    AWS_S3_FILE_OVERWRITE   = False           # nunca sobreescribir archivos
    AWS_QUERYSTRING_AUTH    = False           # Django proxy maneja la auth
    AWS_S3_SIGNATURE_VERSION = 's3v4'
    AWS_S3_ADDRESSING_STYLE  = 'path'        # obligatorio para MinIO

    MEDIA_URL  = f"{os.getenv('MINIO_ENDPOINT_URL', 'http://localhost:9000')}/{os.getenv('MINIO_BUCKET_NAME', 'biblioteca')}/"
    MEDIA_ROOT = BASE_DIR / 'media'          # fallback local (no se usa con MinIO)
else:
    # Media files — almacenamiento local (desarrollo sin MinIO)
    MEDIA_URL  = 'media/'
    MEDIA_ROOT = BASE_DIR / 'media'
# ─────────────────────────────────────────────────────────────────────────────

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Stripe Configuration
STRIPE_SECRET_KEY = os.getenv('STRIPE_SECRET_KEY', '')
STRIPE_PUBLISHABLE_KEY = os.getenv('STRIPE_PUBLISHABLE_KEY', '')
STRIPE_WEBHOOK_SECRET = os.getenv('STRIPE_WEBHOOK_SECRET', '')

# Email Configuration
EMAIL_BACKEND = os.getenv('EMAIL_BACKEND', 'django.core.mail.backends.console.EmailBackend')
EMAIL_HOST = os.getenv('EMAIL_HOST', 'smtp.gmail.com')
EMAIL_PORT = int(os.getenv('EMAIL_PORT', '587'))
EMAIL_USE_TLS = os.getenv('EMAIL_USE_TLS', 'True') == 'True'
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER', '')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD', '')
DEFAULT_FROM_EMAIL = os.getenv('DEFAULT_FROM_EMAIL', 'noreply@biblioteca.ao')

# Mailer encryption key (Fernet) — generate with:
# python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
MAILER_ENCRYPTION_KEY = os.getenv('MAILER_ENCRYPTION_KEY', '')

# Celery Configuration
CELERY_BROKER_URL = os.getenv('CELERY_BROKER_URL', 'redis://localhost:6379/0')
CELERY_RESULT_BACKEND = os.getenv('CELERY_RESULT_BACKEND', 'redis://localhost:6379/0')
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = TIME_ZONE
CELERY_TASK_TRACK_STARTED = True
CELERY_TASK_TIME_LIMIT = 30 * 60  # 30 minutes

# Cache TTL (Time To Live) settings for different data types
CACHE_TTL = {
    'categories': 60 * 60,           # 1 hour (rarely changes)
    'authors': 60 * 60,              # 1 hour (rarely changes)
    'books_list': 60 * 15,           # 15 minutes (moderate changes)
    'book_detail': 60 * 30,          # 30 minutes (moderate changes)
    'search_results': 60 * 5,        # 5 minutes (frequent searches)
    'dashboard_stats': 60 * 15,      # 15 minutes (aggregated data)
    'user_favorites': 60 * 5,        # 5 minutes (user-specific)
    'user_reading_history': 60 * 5,  # 5 minutes (user-specific)
    'reviews': 60 * 30,              # 30 minutes (moderate changes)
}

# Meilisearch Configuration
MEILISEARCH_HOST = os.getenv('MEILI_URL', 'http://localhost:7700')
MEILISEARCH_MASTER_KEY = os.getenv('MEILI_MASTER_KEY', 'your-master-key-change-this')
