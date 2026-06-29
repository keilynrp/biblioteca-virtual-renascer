
from django.db import models
from django.conf import settings


class InstitutionType(models.TextChoices):
    UNIVERSITY = 'UNI', 'Universidad'
    HIGHER_ED  = 'IES', 'Institución de Educación Superior'
    RESEARCH   = 'INV', 'Centro de Investigación'
    SCHOOL     = 'ESC', 'Centro Escolar'
    OTHER      = 'OTR', 'Otro'


class Institution(models.Model):
    name = models.CharField(max_length=255)
    code = models.CharField(
        max_length=50,
        unique=True,
        help_text=(
            'Identificador único estructurado generado automáticamente '
            '(ej: AO-UNI-0001). No cambiar una vez asignado.'
        ),
    )
    abbreviation = models.CharField(
        max_length=20,
        blank=True,
        help_text='Sigla o abreviatura de la institución (ej: ULA). Solo para visualización.',
    )
    ror_id = models.CharField(
        max_length=50,
        blank=True,
        help_text=(
            'Identificador ROR (Research Organization Registry). '
            'Solo el hash corto, ej: 02mhbdp94. '
            'Consultar https://ror.org para verificar.'
        ),
    )
    country = models.CharField(
        max_length=2,
        blank=True,
        help_text='Código de país ISO 3166-1 alpha-2 (ej: AO, BR, PT, MZ).',
    )
    institution_type = models.CharField(
        max_length=3,
        choices=InstitutionType.choices,
        default=InstitutionType.UNIVERSITY,
    )
    logo    = models.ImageField(upload_to='institutions/', null=True, blank=True)
    website = models.URLField(blank=True)
    address = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)
        # Auto-generate structured code on first save when not provided
        if is_new and not self.code:
            country = (self.country.upper() if self.country else 'XX')
            itype   = self.institution_type or InstitutionType.OTHER
            self.code = f"{country}-{itype}-{self.pk:04d}"
            type(self).objects.filter(pk=self.pk).update(code=self.code)

    def __str__(self):
        if self.abbreviation:
            return f"{self.name} ({self.abbreviation})"
        return self.name

    class Meta:
        db_table = 'institutions'
        ordering = ['name']
        indexes = [
            models.Index(fields=['country', 'institution_type'], name='inst_country_type_idx'),
            models.Index(fields=['ror_id'], name='inst_ror_idx'),
        ]


# =============================================================================
# InstitutionMembership — relación explícita User ↔ Institution
# =============================================================================

class InstitutionRole(models.TextChoices):
    ADMIN     = 'admin',     'Administrador'
    LIBRARIAN = 'librarian', 'Bibliotecario'
    MEMBER    = 'member',    'Miembro'


class MembershipStatus(models.TextChoices):
    ACTIVE    = 'active',    'Activo'
    SUSPENDED = 'suspended', 'Suspendido'
    PENDING   = 'pending',   'Pendiente'


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
    joined_at  = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(
        null=True, blank=True,
        help_text="Para membresías temporales.",
    )

    class Meta:
        unique_together = ('user', 'institution')
        indexes = [
            models.Index(fields=['institution', 'status'], name='membership_inst_status_idx'),
        ]

    def __str__(self):
        return f"{self.user.username} @ {self.institution.name} ({self.get_role_display()})"
