"""
Email utilities for sending notifications.
"""
from django.core.mail import send_mail
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


def send_notification_email(notification):
    """
    Send notification email to user.

    Uses the SMTP config from the database (apps.mailer) if active,
    otherwise falls back to the environment-configured mail backend.

    Args:
        notification: Notification instance

    Returns:
        bool: True if email was sent successfully
    """
    if notification.is_emailed:
        logger.info(f"Notification {notification.id} already emailed, skipping")
        return False

    subject = f"[BVS] {notification.title}"
    body_text = f"""
{notification.title}

{notification.message}

{f'Ver más: {notification.link}' if notification.link else ''}

---
Biblioteca Virtual Renascer
    """.strip()

    # Try to use the DB SMTP config if active
    try:
        from apps.mailer.models import SMTPConfig
        from apps.mailer import services as mailer_services

        cfg = SMTPConfig.get_config()
        if cfg.is_active:
            success = mailer_services.send_email(
                to=notification.user.email,
                subject=subject,
                body_text=body_text,
                template_key='notification',
            )
            if success:
                notification.is_emailed = True
                notification.save(update_fields=['is_emailed'])
                logger.info(f"Email sent (mailer service) for notification {notification.id}")
            return success
    except Exception as e:
        logger.warning(f"Mailer service unavailable, falling back to env config: {e}")

    # Fallback: use environment-configured backend
    try:
        from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@bvs.com')
        send_mail(
            subject=subject,
            message=body_text,
            from_email=from_email,
            recipient_list=[notification.user.email],
            fail_silently=False,
        )
        notification.is_emailed = True
        notification.save(update_fields=['is_emailed'])
        logger.info(f"Email sent (env backend) for notification {notification.id}")
        return True
    except Exception as e:
        logger.error(f"Error sending email for notification {notification.id}: {str(e)}")
        return False
