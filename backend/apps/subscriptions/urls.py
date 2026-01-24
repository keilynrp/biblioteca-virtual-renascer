
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PlanListView, SubscriptionView, CancelSubscriptionView, InstitutionSubscriptionViewSet

router = DefaultRouter()
router.register(r'institutions', InstitutionSubscriptionViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('plans/', PlanListView.as_view(), name='plan_list'),
    path('my-subscription/', SubscriptionView.as_view(), name='my_subscription'),
    path('cancel/', CancelSubscriptionView.as_view(), name='cancel_subscription'),
]
