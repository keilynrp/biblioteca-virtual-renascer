from django.db import models
import uuid

class Currency(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    code = models.CharField(max_length=3, unique=True, help_text="ISO 4217 code (e.g. USD)")
    name = models.CharField(max_length=50)
    symbol = models.CharField(max_length=10, blank=True)
    is_active = models.BooleanField(default=True)
    is_base = models.BooleanField(default=False, help_text="Defines if this is the base currency for exchange rates")

    class Meta:
        verbose_name_plural = "Currencies"
        app_label = 'currencies'

    def __str__(self):
        return f"{self.code} - {self.name}"

    def save(self, *args, **kwargs):
        if self.is_base:
            # Ensure only one base currency exists
            Currency.objects.filter(is_base=True).exclude(id=self.id).update(is_base=False)
        super().save(*args, **kwargs)

class ExchangeRate(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    from_currency = models.ForeignKey(Currency, on_delete=models.CASCADE, related_name='rates_from')
    to_currency = models.ForeignKey(Currency, on_delete=models.CASCADE, related_name='rates_to')
    rate = models.DecimalField(max_digits=18, decimal_places=6)
    is_manual = models.BooleanField(default=False, help_text="If true, API sync won't overwrite this rate")
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('from_currency', 'to_currency')
        app_label = 'currencies'

    def __str__(self):
        return f"{self.from_currency.code} -> {self.to_currency.code}: {self.rate}"
