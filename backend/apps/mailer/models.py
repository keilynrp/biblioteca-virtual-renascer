import uuid
from django.db import models


class SMTPConfig(models.Model):
    """Singleton — siempre pk=1."""
    host = models.CharField(max_length=255, default='smtp.gmail.com')
    port = models.IntegerField(default=587)
    use_tls = models.BooleanField(default=True)
    use_ssl = models.BooleanField(default=False)
    username = models.CharField(max_length=255, blank=True)
    password_encrypted = models.TextField(blank=True)  # Fernet token
    from_email = models.EmailField(default='noreply@bvs.com')
    from_name = models.CharField(max_length=100, blank=True, default='BVS')
    is_active = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Configuración SMTP"

    @classmethod
    def get_config(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj

    def __str__(self):
        return f"SMTP: {self.username} ({self.host}:{self.port})"


class EmailLog(models.Model):
    STATUS_SENT = 'sent'
    STATUS_FAILED = 'failed'
    STATUS_CHOICES = [(STATUS_SENT, 'Enviado'), (STATUS_FAILED, 'Fallido')]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    recipient = models.EmailField()
    subject = models.CharField(max_length=500)
    template_key = models.CharField(max_length=50, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    error_message = models.TextField(blank=True)
    sent_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-sent_at']
        verbose_name = "Log de correo"


class EmailTemplate(models.Model):
    KEYS = [
        ('welcome', 'Bienvenida'),
        ('password_reset', 'Recuperación de contraseña'),
        ('notification', 'Notificación'),
        ('subscription', 'Suscripción'),
        ('form_submission', 'Envío de formulario'),
    ]
    key = models.CharField(max_length=50, unique=True, choices=KEYS)
    subject = models.CharField(max_length=500)
    body_html = models.TextField()
    body_text = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Plantilla de correo"

    def __str__(self):
        return self.get_key_display()
