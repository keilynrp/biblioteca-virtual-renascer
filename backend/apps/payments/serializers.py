
from rest_framework import serializers
from .models import Transaction

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ('id', 'amount', 'currency', 'status', 'payment_method', 'created_at')
        read_only_fields = ('id', 'amount', 'currency', 'status', 'created_at')

class CheckoutSerializer(serializers.Serializer):
    plan_id = serializers.IntegerField(required=True)
    payment_method = serializers.ChoiceField(choices=Transaction.PAYMENT_METHOD_CHOICES, default='CREDIT_CARD')
