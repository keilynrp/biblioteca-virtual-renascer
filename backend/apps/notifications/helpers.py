"""
Additional signals for subscription expiring notifications.
This can be triggered by a Celery periodic task.
"""
from django.utils import timezone
from datetime import timedelta
from apps.subscriptions.models import Subscription
from apps.notifications.models import Notification
import logging

logger = logging.getLogger(__name__)


def check_expiring_subscriptions():
    """
    Check for subscriptions expiring in the next 3 days and create notifications.
    This function should be called by a Celery periodic task.
    """
    three_days_from_now = timezone.now() + timedelta(days=3)
    
    # Find subscriptions expiring in 3 days that haven't been notified
    expiring_subscriptions = Subscription.objects.filter(
        status='active',
        end_date__lte=three_days_from_now,
        end_date__gte=timezone.now()
    ).select_related('user', 'plan')
    
    notifications_created = 0
    
    for subscription in expiring_subscriptions:
        # Check if notification already exists
        existing_notification = Notification.objects.filter(
            user=subscription.user,
            type=Notification.NotificationType.SUBSCRIPTION_EXPIRING,
            metadata__subscription_id=subscription.id,
            created_at__gte=timezone.now() - timedelta(days=1)  # Don't spam daily
        ).exists()
        
        if not existing_notification:
            Notification.objects.create(
                user=subscription.user,
                type=Notification.NotificationType.SUBSCRIPTION_EXPIRING,
                title=f'Tu suscripción {subscription.plan.name} está por vencer',
                message=f'Tu suscripción vence el {subscription.end_date.strftime("%d/%m/%Y")}. Renueva ahora para no perder acceso a contenido premium.',
                link='/plans',
                metadata={
                    'subscription_id': subscription.id,
                    'plan_name': subscription.plan.name,
                    'end_date': subscription.end_date.isoformat()
                }
            )
            notifications_created += 1
    
    if notifications_created > 0:
        logger.info(f"Created {notifications_created} subscription expiring notifications")
    
    return notifications_created


def send_welcome_notification(user):
    """
    Send welcome notification to new user.
    Can be called from the registration view or signal.
    """
    Notification.objects.create(
        user=user,
        type=Notification.NotificationType.WELCOME,
        title='¡Bienvenido a Biblioteca Virtual Renascer!',
        message=f'Hola {user.username}, estamos emocionados de tenerte en nuestra comunidad. Explora nuestra extensa colección de libros y comienza tu viaje de aprendizaje hoy.',
        link='/library'
    )
    logger.info(f"Welcome notification sent to {user.username}")
