from django.urls import path
from . import views

urlpatterns = [
    path('profile/', views.BillingProfileView.as_view(), name='billing-profile'),
    path('setup-intent/', views.SetupIntentView.as_view(), name='billing-setup-intent'),
    path('payment-methods/', views.PaymentMethodListView.as_view(), name='billing-payment-methods'),
    path('payment-methods/<uuid:pk>/', views.PaymentMethodDetailView.as_view(), name='billing-payment-method-detail'),
    path('payment-methods/<uuid:pk>/set-default/', views.PaymentMethodSetDefaultView.as_view(), name='billing-payment-method-set-default'),
    path('invoices/', views.InvoiceListView.as_view(), name='billing-invoices'),
    path('invoices/summary/', views.InvoiceSummaryView.as_view(), name='billing-invoices-summary'),
    path('invoices/<uuid:pk>/download/', views.InvoiceDownloadView.as_view(), name='billing-invoice-download'),
    path('invoices/<uuid:pk>/refund/', views.RefundView.as_view(), name='billing-invoice-refund'),
]
