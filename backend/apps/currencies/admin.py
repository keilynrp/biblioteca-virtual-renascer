from django.contrib import admin
from .models import Currency, ExchangeRate

@admin.register(Currency)
class CurrencyAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'symbol', 'is_active', 'is_base')
    list_filter = ('is_active', 'is_base')
    search_fields = ('code', 'name')

@admin.register(ExchangeRate)
class ExchangeRateAdmin(admin.ModelAdmin):
    list_display = ('from_currency', 'to_currency', 'rate', 'is_manual', 'last_updated')
    list_filter = ('is_manual', 'from_currency', 'to_currency')
