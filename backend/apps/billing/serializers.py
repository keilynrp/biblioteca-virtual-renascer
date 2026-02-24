from rest_framework import serializers
from .models import BillingProfile, StoredPaymentMethod, Invoice


class BillingProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = BillingProfile
        fields = [
            'id', 'stripe_customer_id', 'full_name', 'email',
            'address_line1', 'address_line2', 'city', 'state',
            'postal_code', 'country', 'vat_number',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'stripe_customer_id', 'created_at', 'updated_at']


class StoredPaymentMethodSerializer(serializers.ModelSerializer):
    class Meta:
        model = StoredPaymentMethod
        fields = [
            'id', 'stripe_pm_id', 'brand', 'last4',
            'exp_month', 'exp_year', 'is_default', 'created_at',
        ]
        read_only_fields = fields


class InvoiceSerializer(serializers.ModelSerializer):
    plan_name = serializers.SerializerMethodField()

    class Meta:
        model = Invoice
        fields = [
            'id', 'invoice_number', 'status', 'amount', 'currency',
            'description', 'billing_name', 'billing_address',
            'stripe_refund_id', 'issued_at', 'refunded_at', 'plan_name',
        ]
        read_only_fields = fields

    def get_plan_name(self, obj) -> str | None:
        try:
            return obj.transaction.subscription.plan.name
        except AttributeError:
            return None
