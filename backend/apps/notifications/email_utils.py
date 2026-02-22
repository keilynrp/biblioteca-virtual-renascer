"""
Email utilities for sending notifications.
"""
import os
from django.core.mail import send_mail
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


def _build_notification_html(notification, logo_url=None):
    """Build an HTML email body for a notification."""
    logo_html = ''
    if logo_url:
        logo_html = f'<img src="{logo_url}" alt="Logo" style="max-height:62px;object-fit:contain;margin-bottom:16px;" />'

    link_html = ''
    if notification.link:
        link_html = f'<p style="margin-top:16px;"><a href="{notification.link}" style="color:#00576F;font-weight:600;">Ver más &rarr;</a></p>'

    return f"""
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8" /></head>
<body style="font-family:sans-serif;background:#f4f4f4;margin:0;padding:0;">
  <div style="max-width:600px;margin:32px auto;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
    <div style="background:#00576F;padding:24px 32px;text-align:center;">
      {logo_html}
    </div>
    <div style="padding:32px;">
      <h2 style="color:#1a1a1a;margin-top:0;">{notification.title}</h2>
      <p style="color:#444444;line-height:1.6;">{notification.message}</p>
      {link_html}
    </div>
    <div style="background:#f9f9f9;padding:16px 32px;text-align:center;border-top:1px solid #eeeeee;">
      <p style="color:#888888;font-size:12px;margin:0;">Biblioteca Virtual Renascer</p>
    </div>
  </div>
</body>
</html>
""".strip()


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

    # Build logo URL from SiteSettings
    logo_url = None
    try:
        from apps.site_settings.models import SiteSettings
        site = SiteSettings.get_settings()
        if site.logo:
            site_url = os.getenv('SITE_URL', 'http://localhost:8000')
            logo_url = f"{site_url}{site.logo.url}"
    except Exception:
        pass

    body_html = _build_notification_html(notification, logo_url)

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
                body_html=body_html,
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
            html_message=body_html,
        )
        notification.is_emailed = True
        notification.save(update_fields=['is_emailed'])
        logger.info(f"Email sent (env backend) for notification {notification.id}")
        return True
    except Exception as e:
        logger.error(f"Error sending email for notification {notification.id}: {str(e)}")
        return False
