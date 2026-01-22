from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _


class Notification(models.Model):
    """
    Modelo para gestionar notificaciones de usuarios.
    Almacena notificaciones para eventos relevantes en la plataforma.
    """
    
    class NotificationType(models.TextChoices):
        BOOK_AVAILABLE = 'book_available', _('Libro Disponible')
        LOAN_EXPIRING = 'loan_expiring', _('Préstamo por Vencer')
        NEW_REVIEW = 'new_review', _('Nueva Reseña')
        SUBSCRIPTION_EXPIRING = 'subscription_expiring', _('Suscripción por Vencer')
        ADMIN_ANNOUNCEMENT = 'admin_announcement', _('Anuncio Administrativo')
        WELCOME = 'welcome', _('Bienvenida')
        BOOK_RECOMMENDATION = 'book_recommendation', _('Recomendación de Libro')
        COMMUNITY_ACTIVITY = 'community_activity', _('Actividad en Club')
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications',
        verbose_name=_('Usuario')
    )
    
    type = models.CharField(
        max_length=30,
        choices=NotificationType.choices,
        verbose_name=_('Tipo')
    )
    
    title = models.CharField(
        max_length=200,
        verbose_name=_('Título')
    )
    
    message = models.TextField(
        verbose_name=_('Mensaje')
    )
    
    link = models.URLField(
        blank=True,
        null=True,
        verbose_name=_('Enlace'),
        help_text=_('URL opcional para redirigir al usuario')
    )
    
    is_read = models.BooleanField(
        default=False,
        verbose_name=_('Leída')
    )
    
    is_emailed = models.BooleanField(
        default=False,
        verbose_name=_('Enviada por Email'),
        help_text=_('Indica si se envió notificación por correo')
    )
    
    metadata = models.JSONField(
        default=dict,
        blank=True,
        verbose_name=_('Metadata'),
        help_text=_('Datos adicionales relacionados con la notificación')
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_('Fecha de Creación')
    )
    
    read_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_('Fecha de Lectura')
    )
    
    class Meta:
        db_table = 'notifications'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'is_read']),
            models.Index(fields=['user', 'created_at']),
            models.Index(fields=['type']),
        ]
        verbose_name = _('Notificación')
        verbose_name_plural = _('Notificaciones')
    
    def __str__(self):
        return f"{self.get_type_display()} - {self.user.username} - {self.created_at.strftime('%Y-%m-%d %H:%M')}"
    
    def mark_as_read(self):
        """Marca la notificación como leída y registra la fecha."""
        if not self.is_read:
            from django.utils import timezone
            self.is_read = True
            self.read_at = timezone.now()
            self.save(update_fields=['is_read', 'read_at'])
