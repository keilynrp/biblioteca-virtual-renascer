from django.contrib import admin
from .models import SiteSettings


@admin.register(SiteSettings)
class SiteSettingsAdmin(admin.ModelAdmin):
    list_display = ('site_name', 'updated_at')
    readonly_fields = ('updated_at',)
    fieldsets = (
        (None, {
            'fields': ('site_name', 'tagline', 'logo', 'favicon')
        }),
        ('Google Services', {
            'fields': ('ga_id', 'gtm_id', 'gsc_id'),
            'description': 'Configuración de herramientas de Google para análisis y SEO.'
        }),
        ('Metadatos', {
            'fields': ('updated_at',),
            'classes': ('collapse',)
        }),
    )
