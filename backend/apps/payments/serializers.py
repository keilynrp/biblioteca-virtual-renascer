
from rest_framework import serializers
from .models import Transaction

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ('id', 'amount', 'currency', 'status', 'payment_method', 'paypal_order_id', 'payment_reference', 'created_at')
        read_only_fields = ('id', 'amount', 'currency', 'status', 'paypal_order_id', 'payment_reference', 'created_at')

class CheckoutSerializer(serializers.Serializer):
    plan_id = serializers.IntegerField(required=True)
    payment_method = serializers.ChoiceField(choices=Transaction.PAYMENT_METHOD_CHOICES, default='CREDIT_CARD')
    order_reference = serializers.CharField(required=False, allow_blank=True, max_length=100)
