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
        ('Cookies y Privacidad', {
            'fields': (
                'cookie_consent_enabled',
                'privacy_policy_url', 'terms_of_service_url', 'cookie_policy_url',
                'cookies_analytics_enabled', 'cookies_marketing_enabled', 'cookies_functional_enabled',
                'cookie_banner_title', 'cookie_banner_description',
            ),
            'description': 'Configuración del banner de consentimiento de cookies y enlaces de políticas.'
        }),
        ('Compliance', {
            'fields': ('compliance_gdpr', 'compliance_lgpd', 'compliance_hipaa', 'compliance_ccpa'),
            'description': 'Marcos regulatorios de privacidad aplicables.'
        }),
        ('Metadatos', {
            'fields': ('updated_at',),
            'classes': ('collapse',)
        }),
    )
