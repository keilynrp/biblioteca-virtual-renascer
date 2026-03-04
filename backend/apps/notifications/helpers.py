"""
Helpers for subscription- and trial-related notifications.
Can be called directly or from Celery periodic tasks.
"""
from django.utils import timezone
from datetime import timedelta
from apps.subscriptions.models import UserSubscription
from apps.notifications.models import Notification
import logging

logger = logging.getLogger(__name__)


def check_expiring_subscriptions():
    """
    Check for subscriptions expiring in the next 3 days and create notifications.
    This function should be called by a Celery periodic task.
    """
    now = timezone.now()
    three_days_from_now = now + timedelta(days=3)

    expiring_subscriptions = UserSubscription.objects.filter(
        is_active=True,
        end_date__lte=three_days_from_now,
        end_date__gte=now,
    ).select_related('user', 'plan')

    notifications_created = 0

    for subscription in expiring_subscriptions:
        existing_notification = Notification.objects.filter(
            user=subscription.user,
            type=Notification.NotificationType.SUBSCRIPTION_EXPIRING,
            metadata__subscription_id=subscription.id,
            created_at__gte=now - timedelta(days=1),
        ).exists()

        if not existing_notification:
            days_left = (subscription.end_date - now).days
            Notification.objects.create(
                user=subscription.user,
                type=Notification.NotificationType.SUBSCRIPTION_EXPIRING,
                title=f'Tu suscripción {subscription.plan.name} está por vencer',
                message=(
                    f'Tu suscripción vence el {subscription.end_date.strftime("%d/%m/%Y")} '
                    f'(en {days_left} día(s)). Renueva ahora para no perder acceso.'
                ),
                link='/plans',
                metadata={
                    'subscription_id': subscription.id,
                    'plan_name': subscription.plan.name,
                    'end_date': subscription.end_date.isoformat(),
                    'days_remaining': days_left,
                },
            )
            notifications_created += 1

    if notifications_created > 0:
        logger.info(f"Created {notifications_created} subscription expiring notifications")

    return notifications_created


def check_expiring_trials():
    """
    Check for trials expiring in the next 2 days and create notifications.
    """
    from django.contrib.auth import get_user_model
    User = get_user_model()

    now = timezone.now()
    two_days = now + timedelta(days=2)

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
            created_at__gte=now - timedelta(days=1),
        ).exists()

        if not already:
            days_left = (user.trial_end_date - now).days
            Notification.objects.create(
                user=user,
                type=Notification.NotificationType.TRIAL_EXPIRING,
                title='Tu período de prueba está por terminar',
                message=(
                    f'Tu prueba gratuita termina en {days_left} día(s). '
                    f'Suscríbete a un plan para seguir disfrutando.'
                ),
                link='/plans',
                metadata={
                    'trial_end_date': user.trial_end_date.isoformat(),
                    'days_remaining': days_left,
                },
            )
            created += 1

    if created > 0:
        logger.info(f"Created {created} trial expiring notifications")
    return created


def send_welcome_notification(user):
    """
    Send welcome notification to new user.
    Can be called from the registration view or signal.
    """
    Notification.objects.create(
        user=user,
        type=Notification.NotificationType.WELCOME,
        title='¡Bienvenido a Biblioteca Virtual Renascer!',
        message=(
            f'Hola {user.username}, estamos emocionados de tenerte. '
            f'Explora nuestra colección y comienza tu viaje de aprendizaje hoy.'
        ),
        link='/library',
    )
    logger.info(f"Welcome notification sent to {user.username}")


def send_subscription_activated_notification(user, plan_name):
    """
    Send notification when a subscription is activated.
    """
    Notification.objects.create(
        user=user,
        type=Notification.NotificationType.SUBSCRIPTION_EXPIRING,  # re-use type
        title=f'¡Tu plan {plan_name} está activo!',
        message=f'Tu suscripción al plan "{plan_name}" se ha activado correctamente. ¡Disfruta del contenido premium!',
        link='/library',
        metadata={'plan_name': plan_name, 'event': 'activated'},
    )
    logger.info(f"Subscription activated notification sent to {user.username}")
