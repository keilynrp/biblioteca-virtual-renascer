from django.urls import path
from .views import SiteSettingsView, WebManifestView

urlpatterns = [
    path('', SiteSettingsView.as_view(), name='site-settings'),
    path('manifest.webmanifest', WebManifestView.as_view(), name='web-manifest'),
]
