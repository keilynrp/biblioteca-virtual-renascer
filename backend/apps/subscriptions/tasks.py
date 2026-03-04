"""
Celery tasks for subscription lifecycle management.

Schedule is defined in config/celery.py (beat_schedule).
"""
import logging
from celery import shared_task
from datetime import timedelta
from django.utils import timezone

logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────────────────
# 1. Subscription Expiration + Grace Period
# ─────────────────────────────────────────────────────────────────────

@shared_task(name='apps.subscriptions.tasks.process_subscription_expirations')
def process_subscription_expirations():
    """
    Daily task:
      - Subscriptions past end_date → set grace_period_end (if not already set).
      - Subscriptions past grace_period_end → deactivate (is_active=False).
    """
    from apps.subscriptions.models import UserSubscription, InstitutionSubscription

    now = timezone.now()
    user_set_grace = 0
    user_deactivated = 0
    inst_set_grace = 0
    inst_deactivated = 0

    # ── User Subscriptions ────────────────────────────────────────
    # Step A: Mark grace period for freshly-expired subs
    expired_no_grace = UserSubscription.objects.filter(
        is_active=True,
        end_date__lt=now,
        grace_period_end__isnull=True,
    ).select_related('plan')

    for sub in expired_no_grace:
        if sub.plan.grace_period_days > 0:
            sub.grace_period_end = sub.end_date + timedelta(days=sub.plan.grace_period_days)
            sub.save(update_fields=['grace_period_end'])
            user_set_grace += 1
            logger.info(f"Grace period set for user {sub.user_id}: until {sub.grace_period_end}")
        else:
            sub.is_active = False
            sub.save(update_fields=['is_active'])
            user_deactivated += 1

    # Step B: Deactivate subs whose grace period has expired
    past_grace = UserSubscription.objects.filter(
        is_active=True,
        grace_period_end__isnull=False,
        grace_period_end__lt=now,
    )
    user_deactivated = past_grace.update(is_active=False)

    # ── Institution Subscriptions ─────────────────────────────────
    inst_expired_no_grace = InstitutionSubscription.objects.filter(
        is_active=True,
        end_date__lt=now,
        grace_period_end__isnull=True,
    ).select_related('plan')

    for sub in inst_expired_no_grace:
        if sub.plan.grace_period_days > 0:
            sub.grace_period_end = sub.end_date + timedelta(days=sub.plan.grace_period_days)
            sub.save(update_fields=['grace_period_end'])
            inst_set_grace += 1
        else:
            sub.is_active = False
            sub.save(update_fields=['is_active'])
            inst_deactivated += 1

    inst_past_grace = InstitutionSubscription.objects.filter(
        is_active=True,
        grace_period_end__isnull=False,
        grace_period_end__lt=now,
    )
    inst_deactivated = inst_past_grace.update(is_active=False)

    summary = (
        f"Expirations processed — "
        f"Users: {user_set_grace} graced, {user_deactivated} deactivated | "
        f"Institutions: {inst_set_grace} graced, {inst_deactivated} deactivated"
    )
    logger.info(summary)
    return summary


# ─────────────────────────────────────────────────────────────────────
# 2. Notify Expiring Subscriptions (3 days before end_date)
# ─────────────────────────────────────────────────────────────────────

@shared_task(name='apps.subscriptions.tasks.notify_expiring_subscriptions')
def notify_expiring_subscriptions():
    """
    Notify users whose subscription expires within 3 days.
    De-duplicates by checking if a notification was already sent today.
    """
    from apps.subscriptions.models import UserSubscription
    from apps.notifications.models import Notification

    now = timezone.now()
    three_days = now + timedelta(days=3)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

    expiring = UserSubscription.objects.filter(
        is_active=True,
        end_date__gte=now,
        end_date__lte=three_days,
    ).select_related('user', 'plan')

    created = 0
    for sub in expiring:
        already_notified = Notification.objects.filter(
            user=sub.user,
            type=Notification.NotificationType.SUBSCRIPTION_EXPIRING,
            created_at__gte=today_start,
        ).exists()

        if not already_notified:
            days_left = (sub.end_date - now).days
            Notification.objects.create(
                user=sub.user,
                type=Notification.NotificationType.SUBSCRIPTION_EXPIRING,
                title=f'Tu suscripción {sub.plan.name} vence pronto',
                message=(
                    f'Tu plan "{sub.plan.name}" vence en {days_left} día(s) '
                    f'({sub.end_date.strftime("%d/%m/%Y")}). '
                    f'Renueva ahora para no perder acceso.'
                ),
                link='/plans',
                metadata={
                    'subscription_id': sub.id,
                    'plan_name': sub.plan.name,
                    'end_date': sub.end_date.isoformat(),
                    'days_remaining': days_left,
                },
            )
            created += 1

    logger.info(f"Subscription expiry notifications: {created} sent")
    return created


# ─────────────────────────────────────────────────────────────────────
# 3. Notify Expiring Trials (2 days before trial_end_date)
# ─────────────────────────────────────────────────────────────────────

@shared_task(name='apps.subscriptions.tasks.notify_expiring_trials')
def notify_expiring_trials():
    """
    Notify users whose free trial expires within 2 days.
    """
    from django.contrib.auth import get_user_model
    from apps.notifications.models import Notification

    User = get_user_model()
    now = timezone.now()
    two_days = now + timedelta(days=2)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

    trial_users = User.objects.filter(
        trial_end_date__gte=now,
        trial_end_date__lte=two_days,
        is_staff=False,
    )

    created = 0
    for user in trial_users:
        already = Notification.objects.filter(
            user=user,
            type=Notification.NotificationType.TRIAL_EXPIRING,
            created_at__gte=today_start,
        ).exists()

        if not already:
            days_left = (user.trial_end_date - now).days
            Notification.objects.create(
                user=user,
                type=Notification.NotificationType.TRIAL_EXPIRING,
                title='Tu período de prueba está por terminar',
                message=(
                    f'Tu prueba gratuita termina en {days_left} día(s). '
                    f'Suscríbete a un plan para seguir disfrutando de contenido premium.'
                ),
                link='/plans',
                metadata={
                    'trial_end_date': user.trial_end_date.isoformat(),
                    'days_remaining': days_left,
                },
            )
            created += 1

    logger.info(f"Trial expiry notifications: {created} sent")
    return created


# ─────────────────────────────────────────────────────────────────────
# 4. Sync Institution Seat Counts
# ─────────────────────────────────────────────────────────────────────

@shared_task(name='apps.subscriptions.tasks.sync_institution_seats')
def sync_institution_seats():
    """
    Recalculate seats_used on every active InstitutionSubscription
    based on actual InstitutionMembership counts.
    """
    from apps.subscriptions.models import InstitutionSubscription
    from apps.institutions.models import InstitutionMembership

    now = timezone.now()
    active_subs = InstitutionSubscription.objects.filter(
        is_active=True,
        end_date__gte=now,
    )

    updated = 0
    for sub in active_subs:
        actual_seats = InstitutionMembership.objects.filter(
            institution=sub.institution,
            status='active',
        ).count()

        if sub.seats_used != actual_seats:
            sub.seats_used = actual_seats
            sub.save(update_fields=['seats_used'])
            updated += 1

    logger.info(f"Seat sync: {updated} subscriptions updated")
    return updated
