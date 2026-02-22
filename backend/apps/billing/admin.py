from django.contrib import admin
from .models import BillingProfile, StoredPaymentMethod, Invoice


@admin.register(BillingProfile)
class BillingProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'full_name', 'email', 'country', 'stripe_customer_id', 'created_at']
    search_fields = ['user__username', 'user__email', 'full_name', 'stripe_customer_id']
    readonly_fields = ['stripe_customer_id', 'created_at', 'updated_at']


@admin.register(StoredPaymentMethod)
class StoredPaymentMethodAdmin(admin.ModelAdmin):
    list_display = ['user', 'brand', 'last4', 'exp_month', 'exp_year', 'is_default', 'created_at']
    search_fields = ['user__username', 'stripe_pm_id', 'last4']
    list_filter = ['brand', 'is_default']


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ['invoice_number', 'user', 'amount', 'currency', 'status', 'issued_at']
    search_fields = ['invoice_number', 'user__username', 'billing_name']
    list_filter = ['status', 'currency']
    readonly_fields = ['invoice_number', 'issued_at', 'refunded_at']
