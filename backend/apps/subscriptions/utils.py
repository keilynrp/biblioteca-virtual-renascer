"""
Subscription utility functions for access control.
"""

from django.utils import timezone
from .models import UserSubscription, InstitutionSubscription


def user_has_active_reading_access(user):
    """
    Check if a user has active access to premium content.

    Access is granted if ANY of the following are true:
    1. User is staff/admin.
    2. User has an active UserSubscription (not expired).
    3. User is within their trial period.
    4. User belongs to an institution with an active InstitutionSubscription.
    """
    if user.is_staff or user.is_superuser:
        return True

    now = timezone.now()

    # 1. Check direct user subscription
    if UserSubscription.objects.filter(
        user=user,
        is_active=True,
        end_date__gte=now
    ).exists():
        return True

    # 2. Check trial period
    trial_end = getattr(user, 'trial_end_date', None)
    if trial_end and trial_end >= now:
        return True

    # 3. Check institutional subscription
    institution = getattr(user, 'institution', None)
    if institution:
        if InstitutionSubscription.objects.filter(
            institution=institution,
            is_active=True,
            end_date__gte=now
        ).exists():
            return True

    return False
