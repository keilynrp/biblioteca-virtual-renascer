import uuid
from django.db import models
from django.conf import settings
from django.utils.text import slugify


class Form(models.Model):
    """A form definition created by an admin."""

    class Status(models.TextChoices):
        DRAFT = 'draft', 'Borrador'
        PUBLISHED = 'published', 'Publicado'
        ARCHIVED = 'archived', 'Archivado'

    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    description = models.TextField(blank=True, default='')
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.DRAFT,
    )

    # Spam protection
    honeypot_field_name = models.CharField(
        max_length=100, default='website_url',
        help_text='Name of the hidden honeypot field',
    )

    class CaptchaProvider(models.TextChoices):
        NONE = 'none', 'Ninguno (solo honeypot)'
        TURNSTILE = 'turnstile', 'Cloudflare Turnstile'
        RECAPTCHA_V3 = 'recaptcha_v3', 'Google reCAPTCHA v3'
        NUMERIC = 'numeric', 'CAPTCHA numérico'
        TIME_BASED = 'time_based', 'Validación por tiempo'

    captcha_provider = models.CharField(
        max_length=20, choices=CaptchaProvider.choices, default=CaptchaProvider.NONE,
    )
    captcha_site_key = models.CharField(
        max_length=255, blank=True, default='',
        help_text='Site key for Turnstile or reCAPTCHA',
    )
    captcha_secret_key = models.CharField(
        max_length=255, blank=True, default='',
        help_text='Secret key for Turnstile or reCAPTCHA (server-side only)',
    )
    captcha_min_seconds = models.PositiveIntegerField(
        default=3,
        help_text='Minimum seconds before submission is accepted (time_based)',
    )
    captcha_score_threshold = models.FloatField(
        default=0.5,
        help_text='Minimum score for reCAPTCHA v3 (0.0–1.0)',
    )

    # Success behavior
    success_message = models.TextField(
        default='Formulario enviado exitosamente.',
        help_text='Message shown after successful submission',
    )
    redirect_url = models.URLField(
        blank=True, default='',
        help_text='Optional URL to redirect after submission',
    )

    # Versioning
    version = models.PositiveIntegerField(default=1)
    field_snapshots = models.JSONField(default=dict, blank=True)

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='created_forms',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']
        verbose_name = 'Formulario'
        verbose_name_plural = 'Formularios'

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(self.title)
            slug = base
            n = 1
            while Form.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f'{base}-{n}'
                n += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def snapshot_fields(self):
        """Capture current field config for the current version."""
        fields_data = list(
            self.fields.order_by('order').values(
                'label', 'field_type', 'placeholder', 'help_text',
                'is_required', 'validation_rules', 'options', 'order',
            )
        )
        self.field_snapshots[str(self.version)] = fields_data
        self.save(update_fields=['field_snapshots'])

    def __str__(self):
        return self.title


class FormField(models.Model):
    """A single field in a form."""

    class FieldType(models.TextChoices):
        TEXT = 'text', 'Texto'
        EMAIL = 'email', 'Email'
        TEXTAREA = 'textarea', 'Texto largo'
        SELECT = 'select', 'Selección'
        CHECKBOX = 'checkbox', 'Casilla'
        RADIO = 'radio', 'Opción múltiple'
        NUMBER = 'number', 'Número'
        DATE = 'date', 'Fecha'
        FILE = 'file', 'Archivo'
        HIDDEN = 'hidden', 'Oculto'

    form = models.ForeignKey(Form, on_delete=models.CASCADE, related_name='fields')
    label = models.CharField(max_length=255)
    field_type = models.CharField(max_length=20, choices=FieldType.choices)
    placeholder = models.CharField(max_length=255, blank=True, default='')
    help_text = models.CharField(max_length=500, blank=True, default='')
    is_required = models.BooleanField(default=False)
    validation_rules = models.JSONField(default=dict, blank=True)
    options = models.JSONField(default=list, blank=True)
    default_value = models.CharField(max_length=500, blank=True, default='')
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']
        verbose_name = 'Campo'
        verbose_name_plural = 'Campos'

    def __str__(self):
        return f'{self.label} ({self.get_field_type_display()})'


class FormSubmission(models.Model):
    """A single submission of a form."""

    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    form = models.ForeignKey(Form, on_delete=models.CASCADE, related_name='submissions')
    form_version = models.PositiveIntegerField(
        help_text='Version of the form schema when submitted',
    )
    data = models.JSONField(default=dict)
    file_uploads = models.JSONField(default=dict, blank=True)

    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True, default='')
    submitted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='form_submissions',
    )
    is_spam = models.BooleanField(default=False)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Envío'
        verbose_name_plural = 'Envíos'

    def __str__(self):
        return f'Submission {self.uuid} — {self.form.title}'


class FormNotificationRecipient(models.Model):
    """Who receives email notifications for a form's submissions."""

    form = models.ForeignKey(
        Form, on_delete=models.CASCADE, related_name='notification_recipients',
    )
    email = models.EmailField()
    name = models.CharField(max_length=200, blank=True, default='')
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = [['form', 'email']]
        verbose_name = 'Destinatario'
        verbose_name_plural = 'Destinatarios'

    def __str__(self):
        return f'{self.email} — {self.form.title}'
