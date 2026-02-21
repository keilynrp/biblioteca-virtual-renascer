from cryptography.fernet import Fernet
from django.conf import settings
from django.core.mail import get_connection, EmailMultiAlternatives
from .models import SMTPConfig, EmailLog
import logging

logger = logging.getLogger(__name__)


def _fernet():
    key = settings.MAILER_ENCRYPTION_KEY
    if not key:
        raise ValueError("MAILER_ENCRYPTION_KEY is not configured")
    return Fernet(key if isinstance(key, bytes) else key.encode())


def encrypt_password(raw: str) -> str:
    return _fernet().encrypt(raw.encode()).decode()


def decrypt_password(token: str) -> str:
    return _fernet().decrypt(token.encode()).decode()


def get_smtp_connection():
    cfg = SMTPConfig.get_config()
    if not cfg.is_active:
        return None
    password = ''
    if cfg.password_encrypted:
        try:
            password = decrypt_password(cfg.password_encrypted)
        except Exception as e:
            logger.error(f"Error decrypting SMTP password: {e}")
    return get_connection(
        backend='django.core.mail.backends.smtp.EmailBackend',
        host=cfg.host,
        port=cfg.port,
        username=cfg.username,
        password=password,
        use_tls=cfg.use_tls,
        use_ssl=cfg.use_ssl,
    )


def send_email(to, subject, body_text, body_html='', template_key='') -> bool:
    cfg = SMTPConfig.get_config()
    connection = get_smtp_connection()
    from_email = f"{cfg.from_name} <{cfg.from_email}>" if cfg.from_name else cfg.from_email
    try:
        msg = EmailMultiAlternatives(
            subject, body_text, from_email, [to], connection=connection
        )
        if body_html:
            msg.attach_alternative(body_html, 'text/html')
        msg.send()
        EmailLog.objects.create(
            recipient=to,
            subject=subject,
            template_key=template_key,
            status=EmailLog.STATUS_SENT,
        )
        return True
    except Exception as e:
        EmailLog.objects.create(
            recipient=to,
            subject=subject,
            template_key=template_key,
            status=EmailLog.STATUS_FAILED,
            error_message=str(e),
        )
        logger.error(f"Error sending email to {to}: {e}")
        return False
