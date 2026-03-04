"""
Subscription utility functions for access control.

Provides tier-based access checking that replaces the original boolean
`user_has_active_reading_access`.  The public API consists of:

    get_user_access_level(user) -> str
    can_user_access_book(user, book) -> tuple[bool, str]
    user_has_active_reading_access(user) -> bool   # backward-compat wrapper
"""

from django.utils import timezone
from .models import (
    UserSubscription,
    InstitutionSubscription,
    Collection,
    PlanTier,
    CollectionTier,
)

# Ordered list of access tiers (lowest → highest)
ACCESS_TIERS = ['none', 'free', 'basic', 'standard', 'premium', 'enterprise']

# Mapping: plan/collection tier → numerical weight for comparison
_TIER_WEIGHT = {tier: idx for idx, tier in enumerate(ACCESS_TIERS)}


def _tier_gte(tier_a: str, tier_b: str) -> bool:
    """Return True if tier_a is greater than or equal to tier_b."""
    return _TIER_WEIGHT.get(tier_a, 0) >= _TIER_WEIGHT.get(tier_b, 0)


# ─────────────────────────────────────────────────────────────────────
# 1. get_user_access_level
# ─────────────────────────────────────────────────────────────────────

def get_user_access_level(user) -> str:
    """
    Return the highest tier the user currently holds.

    Checks (in order): staff, trial, personal subscription, institutional
    membership/subscription.  Returns the single best tier among them.
    """
    if user.is_staff or user.is_superuser:
        return 'enterprise'

    now = timezone.now()
    levels = ['none']

    # Trial → equivalent to premium
    trial_end = getattr(user, 'trial_end_date', None)
    if trial_end and trial_end >= now:
        levels.append('premium')

    # Personal subscription
    user_sub = (
        UserSubscription.objects
        .filter(user=user, is_active=True, end_date__gte=now)
        .select_related('plan')
        .first()
    )
    if user_sub:
        levels.append(user_sub.plan.tier)

    # Institutional subscription via InstitutionMembership
    try:
        from apps.institutions.models import InstitutionMembership
        membership = (
            InstitutionMembership.objects
            .filter(user=user, status='active')
            .select_related('institution')
            .first()
        )
        if membership:
            inst_sub = (
                InstitutionSubscription.objects
                .filter(
                    institution=membership.institution,
                    is_active=True,
                    end_date__gte=now,
                )
                .select_related('plan')
                .first()
            )
            if inst_sub:
                levels.append(inst_sub.plan.tier)
    except Exception:
        # Fallback to legacy User.institution FK
        institution = getattr(user, 'institution', None)
        if institution:
            inst_sub = (
                InstitutionSubscription.objects
                .filter(institution=institution, is_active=True, end_date__gte=now)
                .select_related('plan')
                .first()
            )
            if inst_sub:
                levels.append(inst_sub.plan.tier)

    return max(levels, key=lambda t: _TIER_WEIGHT.get(t, 0))


# ─────────────────────────────────────────────────────────────────────
# 2. can_user_access_book
# ─────────────────────────────────────────────────────────────────────

def can_user_access_book(user, book) -> tuple:
    """
    Determine whether *user* may read *book*.

    Returns (can_access: bool, reason: str).
    """
    # 1. Open-access / non-premium → always visible
    if book.is_open_access or not book.is_premium:
        return True, 'open_access'

    # 2. Embargo check
    available_from = getattr(book, 'available_from', None)
    if available_from and available_from > timezone.now():
        return False, 'embargoed'

    # 3. Staff override
    if user.is_staff or user.is_superuser:
        return True, 'staff'

    # 4. Direct book purchase (micro-transaction)
    from .models import BookPurchase
    from django.db.models import Q
    has_purchase = BookPurchase.objects.filter(
        user=user, book=book,
    ).filter(
        Q(valid_until__isnull=True) | Q(valid_until__gte=timezone.now())
    ).exists()
    if has_purchase:
        return True, 'direct_book_purchase'

    # 5. User-level tier check
    user_tier = get_user_access_level(user)

    if user_tier != 'none':
        book_collections = book.collections.all()
        if not book_collections.exists():
            # Premium book without explicit collection → accessible with any paid tier
            return True, f'subscription_{user_tier}'

        for coll in book_collections:
            if _tier_gte(user_tier, coll.tier):
                return True, f'collection_{coll.slug}'

    # 6. Institutional à-la-carte collections
    now = timezone.now()
    try:
        from apps.institutions.models import InstitutionMembership
        membership = (
            InstitutionMembership.objects
            .filter(user=user, status='active')
            .select_related('institution')
            .first()
        )
        institution = membership.institution if membership else getattr(user, 'institution', None)
    except Exception:
        institution = getattr(user, 'institution', None)

    if institution:
        from .models import InstitutionCollectionAccess
        from django.db.models import Q

        book_collection_ids = list(book.collections.values_list('id', flat=True))
        if book_collection_ids:
            has_alacarte = InstitutionCollectionAccess.objects.filter(
                institution=institution,
                collection_id__in=book_collection_ids,
                is_active=True,
            ).filter(
                Q(expires_at__isnull=True) | Q(expires_at__gte=now)
            ).exists()
            if has_alacarte:
                return True, 'institutional_alacarte'

    # 7. Grace-period (read-only) — enforced in views (StartReadingView, ServePDFView)
    user_sub = (
        UserSubscription.objects
        .filter(user=user, is_active=True, end_date__lt=timezone.now())
        .first()
    )
    if user_sub and user_sub.is_in_grace_period:
        return True, 'grace_period_read_only'

    return False, 'no_access'


# ─────────────────────────────────────────────────────────────────────
# 3. Backward-compatible boolean wrapper
# ─────────────────────────────────────────────────────────────────────

def user_has_active_reading_access(user) -> bool:
    """
    Legacy boolean check — kept for backward compatibility.

    Returns True when the user has *any* active tier above 'none'.
    """
    return get_user_access_level(user) != 'none'
