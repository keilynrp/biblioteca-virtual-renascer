
from django.db import models
from django.conf import settings


class Institution(models.Model):
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50, unique=True)
    logo = models.ImageField(upload_to='institutions/', null=True, blank=True)
    website = models.URLField(blank=True)
    address = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'institutions'
        ordering = ['name']


# =============================================================================
# InstitutionMembership — relación explícita User ↔ Institution
# =============================================================================

class InstitutionRole(models.TextChoices):
    ADMIN = 'admin', 'Administrador'
    LIBRARIAN = 'librarian', 'Bibliotecario'
    MEMBER = 'member', 'Miembro'


class MembershipStatus(models.TextChoices):
    ACTIVE = 'active', 'Activo'
    SUSPENDED = 'suspended', 'Suspendido'
    PENDING = 'pending', 'Pendiente'


class InstitutionMembership(models.Model):
    """
    Membresía explícita de un usuario en una institución.
    Reemplaza la dependencia simple de User.institution FK,
    agregando rol, estado e historial de invitación.
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='institution_memberships',
    )
    institution = models.ForeignKey(
        Institution,
        on_delete=models.CASCADE,
        related_name='memberships',
    )
    role = models.CharField(
        max_length=20,
        choices=InstitutionRole.choices,
        default=InstitutionRole.MEMBER,
    )
    status = models.CharField(
        max_length=20,
        choices=MembershipStatus.choices,
        default=MembershipStatus.ACTIVE,
    )
    invited_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='sent_institution_invitations',
    )
    joined_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(
        null=True, blank=True,
        help_text="Para membresías temporales."
    )

    class Meta:
        unique_together = ('user', 'institution')
        indexes = [
            models.Index(fields=['institution', 'status'], name='membership_inst_status_idx'),
        ]

    def __str__(self):
        return f"{self.user.username} @ {self.institution.name} ({self.get_role_display()})"

