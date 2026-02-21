
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PlanListView, PlanDetailView, SubscriptionView, CancelSubscriptionView, InstitutionSubscriptionViewSet, TrialStatusView

router = DefaultRouter()
router.register(r'institutions', InstitutionSubscriptionViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('plans/', PlanListView.as_view(), name='plan_list'),
    path('plans/<int:pk>/', PlanDetailView.as_view(), name='plan_detail'),
    path('my-subscription/', SubscriptionView.as_view(), name='my_subscription'),
    path('cancel/', CancelSubscriptionView.as_view(), name='cancel_subscription'),
    path('trial-status/', TrialStatusView.as_view(), name='trial_status'),
]
