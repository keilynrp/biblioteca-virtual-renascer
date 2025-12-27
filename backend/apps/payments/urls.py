
from django.urls import path
from .views import CheckoutView, ConfirmPaymentView, StripeConfigView, StripeWebhookView

urlpatterns = [
    path('config/', StripeConfigView.as_view(), name='stripe_config'),
    path('checkout/', CheckoutView.as_view(), name='checkout'),
    path('confirm/', ConfirmPaymentView.as_view(), name='confirm_payment'),
    path('webhook/', StripeWebhookView.as_view(), name='stripe_webhook'),
]
