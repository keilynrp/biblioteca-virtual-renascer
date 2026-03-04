from django.contrib import admin
from .models import (
    Collection, CollectionBook, Plan, PlanCollection,
    UserSubscription, InstitutionSubscription,
    InstitutionCollectionAccess, Coupon, CouponUse,
)


# ─── Collection ──────────────────────────────────────────────────────

class CollectionBookInline(admin.TabularInline):
    model = CollectionBook
    extra = 1
    autocomplete_fields = ['book']


@admin.register(Collection)
class CollectionAdmin(admin.ModelAdmin):
    list_display = ('name', 'tier', 'is_active', 'book_count', 'created_at')
    list_filter = ('tier', 'is_active')
    search_fields = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}
    inlines = [CollectionBookInline]

    def book_count(self, obj):
        return obj.books.count()
    book_count.short_description = 'Libros'


# ─── Plan ────────────────────────────────────────────────────────────

class PlanCollectionInline(admin.TabularInline):
    model = PlanCollection
    extra = 1


@admin.register(Plan)
class PlanAdmin(admin.ModelAdmin):
    list_display = ('name', 'plan_type', 'tier', 'billing_cycle', 'price', 'annual_price', 'is_active')
    list_filter = ('plan_type', 'tier', 'billing_cycle', 'is_active')
    search_fields = ('name',)
    inlines = [PlanCollectionInline]


# ─── UserSubscription ────────────────────────────────────────────────

@admin.register(UserSubscription)
class UserSubscriptionAdmin(admin.ModelAdmin):
    list_display = ('user', 'plan', 'start_date', 'end_date', 'is_active', 'auto_renew')
    list_filter = ('is_active', 'auto_renew', 'plan__tier')
    search_fields = ('user__username', 'user__email', 'plan__name')
    raw_id_fields = ('user',)


# ─── InstitutionSubscription ─────────────────────────────────────────

@admin.register(InstitutionSubscription)
class InstitutionSubscriptionAdmin(admin.ModelAdmin):
    list_display = ('institution', 'plan', 'start_date', 'end_date', 'max_users', 'seats_used', 'is_active')
    list_filter = ('is_active', 'auto_renew', 'is_trial', 'plan__tier')
    search_fields = ('institution__name', 'plan__name')


# ─── InstitutionCollectionAccess ──────────────────────────────────────

@admin.register(InstitutionCollectionAccess)
class InstitutionCollectionAccessAdmin(admin.ModelAdmin):
    list_display = ('institution', 'collection', 'is_active', 'granted_at', 'expires_at')
    list_filter = ('is_active',)
    search_fields = ('institution__name', 'collection__name')


# ─── Coupon ───────────────────────────────────────────────────────────

@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = ('code', 'discount_type', 'discount_value', 'uses_count', 'max_uses', 'is_active')
    list_filter = ('discount_type', 'is_active')
    search_fields = ('code',)
    filter_horizontal = ('applicable_plans',)


@admin.register(CouponUse)
class CouponUseAdmin(admin.ModelAdmin):
    list_display = ('coupon', 'user', 'discount_applied', 'used_at')
    search_fields = ('coupon__code', 'user__username')
    raw_id_fields = ('user', 'transaction')


# ─── BookPurchase ─────────────────────────────────────────────────────

from .models import BookPurchase

@admin.register(BookPurchase)
class BookPurchaseAdmin(admin.ModelAdmin):
    list_display = ('user', 'book', 'purchase_type', 'price_paid', 'valid_until', 'purchased_at')
    list_filter = ('purchase_type',)
    search_fields = ('user__username', 'user__email', 'book__title')
    raw_id_fields = ('user', 'book', 'transaction')

