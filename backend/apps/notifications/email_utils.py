"""
Email utilities for sending notifications.
"""
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


def send_notification_email(notification):
    """
    Send notification email to user.
    
    Args:
        notification: Notification instance
    
    Returns:
        bool: True if email was sent successfully
    """
    if notification.is_emailed:
        logger.info(f"Notification {notification.id} already emailed, skipping")
        return False
    
    try:
        subject = f"[BVS] {notification.title}"
        
        # Use plain text for console backend, will enhance later
        message = f"""
{notification.title}

{notification.message}

{f'Ver más: {notification.link}' if notification.link else ''}

---
Biblioteca Virtual Renascer
        """
        
        from_email = settings.DEFAULT_FROM_EMAIL if hasattr(settings, 'DEFAULT_FROM_EMAIL') else 'noreply@bvs.com'
        
        send_mail(
            subject=subject,
            message=message.strip(),
            from_email=from_email,
            recipient_list=[notification.user.email],
            fail_silently=False,
        )
        
        # Mark as emailed
        notification.is_emailed = True
        notification.save(update_fields=['is_emailed'])
        
        logger.info(f"Email sent successfully for notification {notification.id}")
        return True
        
    except Exception as e:
        logger.error(f"Error sending email for notification {notification.id}: {str(e)}")
        return False
