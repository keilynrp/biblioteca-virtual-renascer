from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal


class BookCopy(models.Model):
    """
    Representa un ejemplar físico de un libro.
    Un libro puede tener múltiples copias.
    """
    
    class Condition(models.TextChoices):
        NEW = 'new', _('Nuevo')
        GOOD = 'good', _('Bueno')
        FAIR = 'fair', _('Regular')
        POOR = 'poor', _('Malo')
    
    book = models.ForeignKey(
        'content.Book',
        on_delete=models.CASCADE,
        related_name='copies',
        verbose_name=_('Libro')
    )
    
    copy_number = models.PositiveIntegerField(
        verbose_name=_('Número de Copia'),
        help_text=_('Ejemplo: Copia 1 de 3')
    )
    
    is_available = models.BooleanField(
        default=True,
        verbose_name=_('Disponible')
    )
    
    condition = models.CharField(
        max_length=10,
        choices=Condition.choices,
        default=Condition.GOOD,
        verbose_name=_('Condición')
    )
    
    barcode = models.CharField(
        max_length=50,
        unique=True,
        null=True,
        blank=True,
        verbose_name=_('Código de Barras')
    )
    
    notes = models.TextField(
        blank=True,
        verbose_name=_('Notas'),
        help_text=_('Notas sobre el estado o ubicación del ejemplar')
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'book_copies'
        ordering = ['book', 'copy_number']
        unique_together = ['book', 'copy_number']
        verbose_name = _('Ejemplar de Libro')
        verbose_name_plural = _('Ejemplares de Libros')
        indexes = [
            models.Index(fields=['book', 'is_available']),
        ]
    
    def __str__(self):
        return f"{self.book.title} - Copia #{self.copy_number}"


class Loan(models.Model):
    """
    Representa un préstamo de libro a un usuario.
    """
    
    class LoanStatus(models.TextChoices):
        ACTIVE = 'active', _('Activo')
        RETURNED = 'returned', _('Devuelto')
        OVERDUE = 'overdue', _('Vencido')
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='loans',
        verbose_name=_('Usuario')
    )
    
    book = models.ForeignKey(
        'content.Book',
        on_delete=models.CASCADE,
        related_name='loans',
        verbose_name=_('Libro')
    )
    
    book_copy = models.ForeignKey(
        BookCopy,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='loans',
        verbose_name=_('Ejemplar')
    )
    
    status = models.CharField(
        max_length=10,
        choices=LoanStatus.choices,
        default=LoanStatus.ACTIVE,
        verbose_name=_('Estado')
    )
    
    borrowed_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_('Fecha de Préstamo')
    )
    
    due_date = models.DateField(
        verbose_name=_('Fecha de Vencimiento')
    )
    
    returned_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_('Fecha de Devolución')
    )
    
    # Renovaciones
    renewals_count = models.PositiveIntegerField(
        default=0,
        verbose_name=_('Cantidad de Renovaciones')
    )
    
    max_renewals = models.PositiveIntegerField(
        default=2,
        verbose_name=_('Renovaciones Máximas')
    )
    
    # Multas (opcional)
    fine_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        verbose_name=_('Monto de Multa')
    )
    
    notes = models.TextField(
        blank=True,
        verbose_name=_('Notas')
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'loans'
        ordering = ['-borrowed_at']
        verbose_name = _('Préstamo')
        verbose_name_plural = _('Préstamos')
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['book', 'status']),
            models.Index(fields=['status', 'due_date']),
        ]
    
    def __str__(self):
        return f"{self.user.username} - {self.book.title} ({self.get_status_display()})"
    
    @property
    def is_overdue(self):
        """Verifica si el préstamo está vencido."""
        if self.status == self.LoanStatus.ACTIVE:
            return timezone.now().date() > self.due_date
        return False
    
    @property
    def days_overdue(self):
        """Calcula días de retraso."""
        if self.is_overdue:
            return (timezone.now().date() - self.due_date).days
        return 0
    
    @property
    def can_renew(self):
        """Verifica si puede renovarse."""
        return (
            self.status == self.LoanStatus.ACTIVE and
            self.renewals_count < self.max_renewals and
            not self.is_overdue
        )
    
    def renew(self, days=14):
        """Renueva el préstamo extendiendo la fecha de vencimiento."""
        if not self.can_renew:
            raise ValueError("Este préstamo no puede ser renovado")
        
        self.due_date = self.due_date + timedelta(days=days)
        self.renewals_count += 1
        self.save(update_fields=['due_date', 'renewals_count', 'updated_at'])
    
    def return_book(self):
        """Marca el libro como devuelto."""
        if self.status != self.LoanStatus.ACTIVE:
            raise ValueError("Solo préstamos activos pueden ser devueltos")
        
        self.status = self.LoanStatus.RETURNED
        self.returned_at = timezone.now()
        
        # Liberar el ejemplar
        if self.book_copy:
            self.book_copy.is_available = True
            self.book_copy.save(update_fields=['is_available'])
        
        self.save(update_fields=['status', 'returned_at', 'updated_at'])


class LoanQueue(models.Model):
    """
    Cola de espera para libros que no están disponibles.
    """
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='loan_reservations',
        verbose_name=_('Usuario')
    )
    
    book = models.ForeignKey(
        'content.Book',
        on_delete=models.CASCADE,
        related_name='loan_queue',
        verbose_name=_('Libro')
    )
    
    position = models.PositiveIntegerField(
        verbose_name=_('Posición en Cola')
    )
    
    notified = models.BooleanField(
        default=False,
        verbose_name=_('Notificado'),
        help_text=_('Si el usuario fue notificado de disponibilidad')
    )
    
    notified_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_('Fecha de Notificación')
    )
    
    expires_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_('Expira en'),
        help_text=_('Fecha límite para tomar el préstamo después de notificación')
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'loan_queue'
        ordering = ['book', 'position']
        unique_together = ['user', 'book']
        verbose_name = _('Cola de Préstamo')
        verbose_name_plural = _('Colas de Préstamos')
        indexes = [
            models.Index(fields=['book', 'notified']),
            models.Index(fields=['user', 'created_at']),
        ]
    
    def __str__(self):
        return f"{self.user.username} - {self.book.title} (Posición {self.position})"
    
    def notify_availability(self):
        """Notifica al usuario que el libro está disponible."""
        self.notified = True
        self.notified_at = timezone.now()
        self.expires_at = timezone.now() + timedelta(days=3)  # 3 días para tomar el préstamo
        self.save(update_fields=['notified', 'notified_at', 'expires_at', 'updated_at'])
