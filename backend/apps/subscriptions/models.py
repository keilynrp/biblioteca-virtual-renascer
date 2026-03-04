
from django.db import models
from django.conf import settings
from django.utils import timezone
from django.utils.text import slugify


# =============================================================================
# Tier / Choice Enumerations
# =============================================================================

class PlanTier(models.TextChoices):
    FREE = 'free', 'Gratuito'
    BASIC = 'basic', 'Básico'
    STANDARD = 'standard', 'Estándar'
    PREMIUM = 'premium', 'Premium'
    ENTERPRISE = 'enterprise', 'Enterprise'


class CollectionTier(models.TextChoices):
    BASIC = 'basic', 'Básica'
    STANDARD = 'standard', 'Estándar'
    PREMIUM = 'premium', 'Premium'
    SPECIALIZED = 'specialized', 'Especializada'


class BillingCycle(models.TextChoices):
    MONTHLY = 'monthly', 'Mensual'
    ANNUAL = 'annual', 'Anual'
    ONE_TIME = 'one_time', 'Pago único'


# =============================================================================
# Collection — agrupación temática de libros
# =============================================================================

class Collection(models.Model):
    """
    Agrupación temática de libros (ej: "Ciencias Exactas 2026").
    Las colecciones se asignan a Planes y pueden venderse à la carte
    a instituciones o usuarios individuales.
    """
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=280, unique=True, blank=True)
    description = models.TextField(blank=True)
    tier = models.CharField(
        max_length=20,
        choices=CollectionTier.choices,
        default=CollectionTier.BASIC,
        help_text="Nivel mínimo de plan requerido para acceso vía suscripción."
    )
    cover_image = models.ImageField(upload_to='collections/', null=True, blank=True)
    books = models.ManyToManyField(
        'content.Book',
        related_name='collections',
        blank=True,
        through='CollectionBook',
    )
    # Precios à la carte
    institutional_price = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True,
        help_text="Precio à la carte para instituciones."
    )
    retail_price = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True,
        help_text="Precio à la carte para usuarios individuales."
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['tier', 'name']
        indexes = [
            models.Index(fields=['tier', 'is_active'], name='coll_tier_active_idx'),
            models.Index(fields=['slug'], name='coll_slug_idx'),
        ]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.get_tier_display()})"


class CollectionBook(models.Model):
    """Tabla intermedia explícita Book ↔ Collection con metadatos."""
    collection = models.ForeignKey(Collection, on_delete=models.CASCADE)
    book = models.ForeignKey('content.Book', on_delete=models.CASCADE)
    added_at = models.DateTimeField(auto_now_add=True)
    order = models.IntegerField(default=0)

    class Meta:
        unique_together = ('collection', 'book')
        ordering = ['order']

    def __str__(self):
        return f"{self.collection.name} — {self.book.title}"


# =============================================================================
# Plan — ofertas de suscripción
# =============================================================================

class Plan(models.Model):
    PLAN_TYPES = (
        ('INDIVIDUAL', 'Individual'),
        ('INSTITUTIONAL', 'Institutional'),
    )

    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, help_text="Precio mensual o precio base.")
    annual_price = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True,
        help_text="Precio anual (si aplica)."
    )
    duration_days = models.IntegerField(help_text="Duration of the plan in days")
    features = models.JSONField(default=list, help_text="List of features included in the plan")
    plan_type = models.CharField(max_length=20, choices=PLAN_TYPES, default='INDIVIDUAL')
    tier = models.CharField(
        max_length=20,
        choices=PlanTier.choices,
        default=PlanTier.BASIC,
        help_text="Nivel de acceso que otorga este plan."
    )
    billing_cycle = models.CharField(
        max_length=10,
        choices=BillingCycle.choices,
        default=BillingCycle.MONTHLY,
    )
    max_users = models.IntegerField(
        default=1,
        help_text="Máximo de usuarios (para planes institucionales). 0 = ilimitado."
    )
    collections = models.ManyToManyField(
        Collection,
        through='PlanCollection',
        blank=True,
        related_name='plans',
        help_text="Colecciones explícitas de este plan. Vacío = acceso por tier."
    )
    free_trial_days = models.IntegerField(default=0, help_text="Días de prueba gratuitos al activar.")
    grace_period_days = models.IntegerField(default=3, help_text="Días de gracia post-vencimiento.")
    max_concurrent_sessions = models.IntegerField(
        default=3,
        help_text="Sesiones de lectura simultáneas permitidas."
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.get_plan_type_display()}) - ${self.price}"

    def get_accessible_tiers(self):
        """Retorna los tiers de colección accesibles según el tier del plan."""
        tier_mapping = {
            'free': [],
            'basic': ['basic'],
            'standard': ['basic', 'standard'],
            'premium': ['basic', 'standard', 'premium'],
            'enterprise': ['basic', 'standard', 'premium', 'specialized'],
        }
        return tier_mapping.get(self.tier, [])


class PlanCollection(models.Model):
    """Qué colecciones incluye cada plan de forma explícita."""
    plan = models.ForeignKey(Plan, on_delete=models.CASCADE)
    collection = models.ForeignKey(Collection, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('plan', 'collection')

    def __str__(self):
        return f"{self.plan.name} → {self.collection.name}"


# =============================================================================
# UserSubscription — suscripciones individuales (B2C)
# =============================================================================

class UserSubscription(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='subscriptions')
    plan = models.ForeignKey(Plan, on_delete=models.PROTECT)
    start_date = models.DateTimeField(default=timezone.now)
    end_date = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    auto_renew = models.BooleanField(default=False)
    grace_period_end = models.DateTimeField(
        null=True, blank=True,
        help_text="Fin del período de gracia post-vencimiento."
    )
    stripe_subscription_id = models.CharField(
        max_length=255, blank=True, null=True,
        help_text="Stripe Subscription ID para renovaciones automáticas."
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.end_date and self.plan:
            self.end_date = self.start_date + timezone.timedelta(days=self.plan.duration_days)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.username} - {self.plan.name}"

    @property
    def is_in_grace_period(self):
        now = timezone.now()
        return (
            self.end_date < now
            and self.grace_period_end is not None
            and self.grace_period_end >= now
        )


# =============================================================================
# InstitutionSubscription — suscripciones institucionales (B2B)
# =============================================================================

class InstitutionSubscription(models.Model):
    institution = models.ForeignKey(
        'institutions.Institution', on_delete=models.CASCADE, related_name='subscriptions'
    )
    plan = models.ForeignKey(Plan, on_delete=models.PROTECT)
    start_date = models.DateTimeField(default=timezone.now)
    end_date = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    auto_renew = models.BooleanField(default=False)
    max_users = models.IntegerField(default=100, help_text="Maximum number of users allowed under this subscription")
    grace_period_end = models.DateTimeField(
        null=True, blank=True,
        help_text="Fin del período de gracia post-vencimiento."
    )
    seats_used = models.IntegerField(default=0, help_text="Asientos actualmente ocupados (actualizado por signal).")
    is_trial = models.BooleanField(default=False, help_text="Suscripción de prueba institucional.")
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.end_date and self.plan:
            self.end_date = self.start_date + timezone.timedelta(days=self.plan.duration_days)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.institution.name} - {self.plan.name}"

    @property
    def seats_available(self):
        if self.max_users == 0:
            return float('inf')
        return max(0, self.max_users - self.seats_used)

    @property
    def is_at_limit(self):
        if self.max_users == 0:
            return False
        return self.seats_used >= self.max_users

    def get_accessible_collections(self):
        """Retorna colecciones accesibles: del plan + à la carte."""
        plan_collections = self.plan.collections.filter(is_active=True)
        alacarte_collections = Collection.objects.filter(
            institution_access__institution=self.institution,
            institution_access__is_active=True,
        ).filter(
            models.Q(institution_access__expires_at__isnull=True)
            | models.Q(institution_access__expires_at__gte=timezone.now())
        )
        return (plan_collections | alacarte_collections).distinct()


# =============================================================================
# InstitutionCollectionAccess — colecciones à la carte para instituciones
# =============================================================================

class InstitutionCollectionAccess(models.Model):
    """Colecciones adquiridas à la carte por una institución (fuera del plan)."""
    institution = models.ForeignKey(
        'institutions.Institution', on_delete=models.CASCADE, related_name='collection_access'
    )
    collection = models.ForeignKey(Collection, on_delete=models.CASCADE, related_name='institution_access')
    subscription = models.ForeignKey(
        InstitutionSubscription, on_delete=models.SET_NULL,
        null=True, blank=True,
        help_text="Suscripción que otorgó este acceso. Null = compra à la carte."
    )
    granted_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ('institution', 'collection')

    def __str__(self):
        return f"{self.institution.name} → {self.collection.name}"


# =============================================================================
# Coupon — descuentos y promociones
# =============================================================================

class Coupon(models.Model):
    DISCOUNT_TYPE_CHOICES = (
        ('percentage', 'Porcentaje'),
        ('fixed', 'Monto fijo'),
    )
    code = models.CharField(max_length=50, unique=True)
    discount_type = models.CharField(max_length=10, choices=DISCOUNT_TYPE_CHOICES)
    discount_value = models.DecimalField(max_digits=10, decimal_places=2)
    applicable_plans = models.ManyToManyField(Plan, blank=True, help_text="Planes aplicables. Vacío = todos.")
    max_uses = models.IntegerField(null=True, blank=True, help_text="Máximo de usos. Null = ilimitado.")
    uses_count = models.IntegerField(default=0)
    valid_from = models.DateTimeField()
    valid_until = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.code} ({self.discount_type}: {self.discount_value})"

    @property
    def is_valid(self):
        now = timezone.now()
        if not self.is_active:
            return False
        if now < self.valid_from:
            return False
        if self.valid_until and now > self.valid_until:
            return False
        if self.max_uses is not None and self.uses_count >= self.max_uses:
            return False
        return True

    def calculate_discount(self, original_price):
        if self.discount_type == 'percentage':
            return round(original_price * self.discount_value / 100, 2)
        return min(self.discount_value, original_price)


class CouponUse(models.Model):
    coupon = models.ForeignKey(Coupon, on_delete=models.CASCADE, related_name='uses')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    transaction = models.ForeignKey(
        'payments.Transaction', on_delete=models.CASCADE, null=True, blank=True
    )
    discount_applied = models.DecimalField(max_digits=10, decimal_places=2)
    used_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} used {self.coupon.code}"


# =============================================================================
# BookPurchase — compra individual de un libro (micro-transacción B2C)
# =============================================================================

class BookPurchase(models.Model):
    """
    Compra unitaria de un libro premium sin necesidad de suscripción.
    Permite acceso permanente o por un período de alquiler.
    """
    PURCHASE_TYPE_CHOICES = (
        ('permanent', 'Permanente'),
        ('rental', 'Alquiler'),
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='book_purchases',
    )
    book = models.ForeignKey(
        'content.Book',
        on_delete=models.CASCADE,
        related_name='purchases',
    )
    purchase_type = models.CharField(
        max_length=10,
        choices=PURCHASE_TYPE_CHOICES,
        default='permanent',
    )
    price_paid = models.DecimalField(max_digits=10, decimal_places=2)
    transaction = models.ForeignKey(
        'payments.Transaction',
        on_delete=models.SET_NULL,
        null=True, blank=True,
    )
    valid_until = models.DateTimeField(
        null=True, blank=True,
        help_text="Null = acceso permanente. Con fecha = alquiler temporal.",
    )
    purchased_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'book')
        indexes = [
            models.Index(fields=['user', 'valid_until'], name='bkpurchase_user_valid_idx'),
        ]

    def __str__(self):
        return f"{self.user.username} → {self.book.title} ({self.get_purchase_type_display()})"

    @property
    def is_valid(self):
        if self.valid_until is None:
            return True  # permanent
        return self.valid_until >= timezone.now()

