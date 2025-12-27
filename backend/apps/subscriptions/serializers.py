
from rest_framework import serializers
from .models import Plan, UserSubscription

class PlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plan
        fields = ('id', 'name', 'description', 'price', 'duration_days', 'features', 'is_active')

class UserSubscriptionSerializer(serializers.ModelSerializer):
    plan_detail = PlanSerializer(source='plan', read_only=True)

    class Meta:
        model = UserSubscription
        fields = ('id', 'plan', 'plan_detail', 'start_date', 'end_date', 'is_active', 'auto_renew')
        read_only_fields = ('start_date', 'end_date', 'is_active')
