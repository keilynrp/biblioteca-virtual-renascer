
from django.urls import path
from .views import PlanListView, SubscriptionView

urlpatterns = [
    path('plans/', PlanListView.as_view(), name='plan_list'),
    path('my-subscription/', SubscriptionView.as_view(), name='my_subscription'),
]
