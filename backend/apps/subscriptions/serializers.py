
from rest_framework import serializers
from .models import (
    Plan, UserSubscription, InstitutionSubscription,
    Collection, CollectionBook, PlanCollection,
    InstitutionCollectionAccess, Coupon, CouponUse,
)


class CollectionSerializer(serializers.ModelSerializer):
    book_count = serializers.SerializerMethodField()

    class Meta:
        model = Collection
        fields = (
            'id', 'name', 'slug', 'description', 'tier',
            'cover_image', 'institutional_price', 'retail_price',
            'is_active', 'book_count', 'created_at',
        )
        read_only_fields = ('slug',)

    def get_book_count(self, obj):
        return obj.books.count()


class CollectionBookSerializer(serializers.ModelSerializer):
    class Meta:
        model = CollectionBook
        fields = ('id', 'collection', 'book', 'order', 'added_at')
        read_only_fields = ('added_at',)


class PlanSerializer(serializers.ModelSerializer):
    collections_detail = CollectionSerializer(source='collections', many=True, read_only=True)

    class Meta:
        model = Plan
        fields = (
            'id', 'name', 'description', 'price', 'annual_price',
            'duration_days', 'features', 'plan_type', 'tier',
            'billing_cycle', 'max_users', 'free_trial_days',
            'grace_period_days', 'max_concurrent_sessions',
            'is_active', 'collections_detail',
        )


class UserSubscriptionSerializer(serializers.ModelSerializer):
    plan_detail = PlanSerializer(source='plan', read_only=True)
    is_in_grace_period = serializers.BooleanField(read_only=True)

    class Meta:
        model = UserSubscription
        fields = (
            'id', 'plan', 'plan_detail', 'start_date', 'end_date',
            'is_active', 'auto_renew', 'grace_period_end',
            'stripe_subscription_id', 'is_in_grace_period',
        )
        read_only_fields = ('is_active', 'is_in_grace_period')


class InstitutionSubscriptionSerializer(serializers.ModelSerializer):
    plan_detail = PlanSerializer(source='plan', read_only=True)
    seats_available = serializers.IntegerField(read_only=True)
    is_at_limit = serializers.BooleanField(read_only=True)

    class Meta:
        model = InstitutionSubscription
        fields = (
            'id', 'institution', 'plan', 'plan_detail', 'start_date',
            'end_date', 'max_users', 'is_active', 'auto_renew',
            'grace_period_end', 'seats_used', 'seats_available',
            'is_at_limit', 'is_trial',
        )
        read_only_fields = ('is_active', 'seats_used', 'seats_available', 'is_at_limit')


class InstitutionCollectionAccessSerializer(serializers.ModelSerializer):
    collection_detail = CollectionSerializer(source='collection', read_only=True)

    class Meta:
        model = InstitutionCollectionAccess
        fields = (
            'id', 'institution', 'collection', 'collection_detail',
            'subscription', 'granted_at', 'expires_at', 'is_active',
        )
        read_only_fields = ('granted_at',)


class CouponValidateSerializer(serializers.Serializer):
    code = serializers.CharField(max_length=50)
    plan_id = serializers.IntegerField(required=False)


class CouponSerializer(serializers.ModelSerializer):
    is_valid = serializers.BooleanField(read_only=True)

    class Meta:
        model = Coupon
        fields = (
            'id', 'code', 'discount_type', 'discount_value',
            'max_uses', 'uses_count', 'valid_from', 'valid_until',
            'is_active', 'is_valid',
        )


# ── BookPurchase ──────────────────────────────────────────────────────

from .models import BookPurchase


class BookPurchaseSerializer(serializers.ModelSerializer):
    is_valid = serializers.BooleanField(read_only=True)
    book_title = serializers.CharField(source='book.title', read_only=True)

    class Meta:
        model = BookPurchase
        fields = (
            'id', 'user', 'book', 'book_title', 'purchase_type',
            'price_paid', 'transaction', 'valid_until', 'purchased_at', 'is_valid',
        )
        read_only_fields = ('purchased_at', 'is_valid')


class BookPurchaseCreateSerializer(serializers.Serializer):
    book_id = serializers.IntegerField()
    purchase_type = serializers.ChoiceField(
        choices=['permanent', 'rental'],
        default='permanent',
    )
    payment_method = serializers.ChoiceField(
        choices=['CREDIT_CARD', 'PAYPAL', 'MANUAL_TRANSFER'],
        default='CREDIT_CARD',
    )

