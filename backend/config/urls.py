"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('apps.core.urls')),  # Health checks and core endpoints
    path('api/auth/', include('apps.authentication.urls')),
    path('api/institutions/', include('apps.institutions.urls')),
    path('api/subscriptions/', include('apps.subscriptions.urls')),
    path('api/payments/', include('apps.payments.urls')),
    path('api/content/', include('apps.content.urls')),
    path('api/loans/', include('apps.loans.urls')),
    path('api/communities/', include('apps.communities.urls')),
    path('api/notifications/', include('apps.notifications.urls')),
    path('api/analytics/', include('apps.analytics.urls')),
    path('api/currencies/', include('apps.currencies.urls')),
    path('api/mailer/', include('apps.mailer.urls')),
    path('api/site-settings/', include('apps.site_settings.urls')),
    path('api/pages/', include('apps.pages.urls')),
    path('api/navigation/', include('apps.navigation.urls')),
    path('api/billing/', include('apps.billing.urls')),
    path('api/blog/', include('apps.blog.urls')),
]

# Media file serving
if settings.DEBUG:
    # Development: serve from local filesystem
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
elif getattr(settings, 'USE_MINIO', False):
    # Production with MinIO: proxy media files through Django
    from apps.core.views import serve_media_from_minio
    urlpatterns += [
        path('media/<path:file_path>', serve_media_from_minio, name='media-proxy'),
    ]

    # Django Debug Toolbar
    # Temporarily disabled due to Django 6.0 / Python 3.13 compatibility issues
    # if 'debug_toolbar' in settings.INSTALLED_APPS:
    #     try:
    #         import debug_toolbar
    #         urlpatterns = [
    #             path('__debug__/', include(debug_toolbar.urls)),
    #         ] + urlpatterns
    #     except ImportError:
    #         pass
