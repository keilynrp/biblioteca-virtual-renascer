
from rest_framework import serializers
from .models import Plan, UserSubscription, InstitutionSubscription

class PlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plan
        fields = ('id', 'name', 'description', 'price', 'duration_days', 'features', 'plan_type', 'is_active')

class UserSubscriptionSerializer(serializers.ModelSerializer):
    plan_detail = PlanSerializer(source='plan', read_only=True)

    class Meta:
        model = UserSubscription
        fields = ('id', 'plan', 'plan_detail', 'start_date', 'end_date', 'is_active', 'auto_renew')
        read_only_fields = ('is_active',)

class InstitutionSubscriptionSerializer(serializers.ModelSerializer):
    plan_detail = PlanSerializer(source='plan', read_only=True)

    class Meta:
        model = InstitutionSubscription
        fields = ('id', 'institution', 'plan', 'plan_detail', 'start_date', 'end_date', 'max_users', 'is_active', 'auto_renew')
        read_only_fields = ('is_active',)
