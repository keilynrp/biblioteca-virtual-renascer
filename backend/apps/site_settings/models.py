from django.db import models


class SiteSettings(models.Model):
    site_name = models.CharField(max_length=100, default='BVS')
    tagline = models.CharField(max_length=200, blank=True)
    logo = models.ImageField(upload_to='site_settings/', null=True, blank=True)
    favicon = models.ImageField(upload_to='site_settings/', null=True, blank=True)
    
    # Google Services
    ga_id = models.CharField(max_length=50, blank=True, verbose_name='Google Analytics ID (G-XXXXX)')
    gtm_id = models.CharField(max_length=50, blank=True, verbose_name='Google Tag Manager ID (GTM-XXXXX)')
    gsc_id = models.CharField(max_length=200, blank=True, verbose_name='Google Search Console Verification')

    # Cookie & Privacy Settings
    cookie_consent_enabled = models.BooleanField(default=False, verbose_name='Habilitar banner de consentimiento')
    privacy_policy_url = models.URLField(blank=True, verbose_name='URL Política de Privacidad')
    terms_of_service_url = models.URLField(blank=True, verbose_name='URL Términos de Servicio')
    cookie_policy_url = models.URLField(blank=True, verbose_name='URL Política de Cookies')

    # Cookie Categories
    cookies_analytics_enabled = models.BooleanField(default=True, verbose_name='Cookies de Analítica')
    cookies_marketing_enabled = models.BooleanField(default=False, verbose_name='Cookies de Marketing')
    cookies_functional_enabled = models.BooleanField(default=True, verbose_name='Cookies Funcionales')

    # Compliance Frameworks
    compliance_gdpr = models.BooleanField(default=False, verbose_name='GDPR (Unión Europea)')
    compliance_lgpd = models.BooleanField(default=False, verbose_name='LGPD (Brasil)')
    compliance_hipaa = models.BooleanField(default=False, verbose_name='HIPAA (EE.UU. Salud)')
    compliance_ccpa = models.BooleanField(default=False, verbose_name='CCPA (California)')

    # Banner Customization
    cookie_banner_title = models.CharField(max_length=200, blank=True, default='Utilizamos cookies', verbose_name='Título del banner')
    cookie_banner_description = models.TextField(blank=True, default='Este sitio utiliza cookies para mejorar tu experiencia. Puedes personalizar tus preferencias o aceptar todas las cookies.', verbose_name='Descripción del banner')

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Configuración del Sitio'

    def __str__(self):
        return self.site_name

    @classmethod
    def get_settings(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj
