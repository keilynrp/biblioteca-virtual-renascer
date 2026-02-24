
from django.urls import path
from .views import CheckoutView, ConfirmPaymentView, StripeConfigView, StripeWebhookView, BankDetailsView

urlpatterns = [
    path('config/', StripeConfigView.as_view(), name='stripe_config'),
    path('bank-details/', BankDetailsView.as_view(), name='bank_details'),
    path('checkout/', CheckoutView.as_view(), name='checkout'),
    path('confirm/', ConfirmPaymentView.as_view(), name='confirm_payment'),
    path('webhook/', StripeWebhookView.as_view(), name='stripe_webhook'),
]
