from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.utils import timezone


class User(AbstractUser):
    class UserType(models.TextChoices):
        STUDENT = 'student', _('Estudiante')
        EMPLOYEE = 'employee', _('Funcionário')
        TEACHER = 'teacher', _('Professor')
        LIBRARIAN = 'librarian', _('Bibliotecário')
        MODERATOR = 'moderator', _('Moderador')
        CONTENT_MANAGER = 'content_manager', _('Gestor de Conteúdo')
        ADMIN = 'admin', _('Administrador')
        OTHER = 'other', _('Outro')

    user_type = models.CharField(
        max_length=20, 
        choices=UserType.choices,
        default=UserType.STUDENT
    )
    institution = models.ForeignKey('institutions.Institution', on_delete=models.SET_NULL, null=True, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    bio = models.TextField(blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    preferences = models.JSONField(default=dict)
    is_verified = models.BooleanField(default=False)
    two_factor_enabled = models.BooleanField(default=False)
    trial_end_date = models.DateTimeField(null=True, blank=True, verbose_name=_('Fin del período de prueba'))
    
    onboarding_completed = models.BooleanField(default=False)
    age_range = models.CharField(max_length=20, blank=True, help_text="e.g. 18-24, 25-34")

    # Password expiration fields
    password_changed_at = models.DateTimeField(null=True, blank=True)
    force_password_change = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'users'
        ordering = ['-date_joined']

    def __str__(self):
        return self.username
    
    def is_password_expired(self, policy=None):
        """Check if user's password has expired based on policy"""
        # Admins are exempt from password expiration
        if self.is_superuser or self.is_staff:
            return False
        
        if self.force_password_change:
            return True
            
        if not policy or not policy.is_enabled:
            return False
            
        if not self.password_changed_at:
            # If never changed, consider it expired if policy is enabled
            return True
            
        expiration_date = self.password_changed_at + timezone.timedelta(days=policy.expiration_days)
        return timezone.now() > expiration_date
    
    def update_password_changed_at(self):
        """Update password_changed_at timestamp and clear force flag"""
        self.password_changed_at = timezone.now()
        self.force_password_change = False
        self.save(update_fields=['password_changed_at', 'force_password_change'])


class PasswordPolicy(models.Model):
    """System-wide password policy configuration (singleton)"""
    
    expiration_days = models.IntegerField(
        default=90,
        verbose_name=_('Días de expiración'),
        help_text=_('Número de días antes de que la contraseña expire')
    )
    is_enabled = models.BooleanField(
        default=False,
        verbose_name=_('Política habilitada'),
        help_text=_('Habilitar o deshabilitar la política de expiración')
    )
    min_length = models.IntegerField(
        default=8,
        verbose_name=_('Longitud mínima')
    )
    require_uppercase = models.BooleanField(
        default=True,
        verbose_name=_('Requiere mayúsculas')
    )
    require_lowercase = models.BooleanField(
        default=True,
        verbose_name=_('Requiere minúsculas')
    )
    require_numbers = models.BooleanField(
        default=True,
        verbose_name=_('Requiere números')
    )
    require_special = models.BooleanField(
        default=False,
        verbose_name=_('Requiere caracteres especiales')
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='password_policy_updates'
    )

    class Meta:
        db_table = 'password_policy'
        verbose_name = _('Política de Contraseñas')
        verbose_name_plural = _('Políticas de Contraseñas')

    def __str__(self):
        return f"Password Policy (Expiration: {self.expiration_days} days, Enabled: {self.is_enabled})"
    
    def save(self, *args, **kwargs):
        # Ensure only one instance exists (singleton pattern)
        self.pk = 1
        super().save(*args, **kwargs)
    
    @classmethod
    def get_policy(cls):
        """Get or create the singleton policy instance"""
        policy, _ = cls.objects.get_or_create(pk=1)
        return policy

