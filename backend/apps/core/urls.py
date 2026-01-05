# =============================================================================
# Core URLs - BVS Backend
# =============================================================================
from django.urls import path
from . import views

app_name = 'core'

urlpatterns = [
    # Health checks
    path('health/', views.health_check, name='health_check'),
    path('health/detailed/', views.health_check_detailed, name='health_check_detailed'),
]
