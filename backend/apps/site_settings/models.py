import io
import logging

from django.core.files.base import ContentFile
from django.db import models
from PIL import Image

logger = logging.getLogger(__name__)

FAVICON_VARIANTS = {
    'favicon_16': (16, 16),
    'favicon_32': (32, 32),
    'apple_touch_icon': (180, 180),
    'android_chrome_192': (192, 192),
    'android_chrome_512': (512, 512),
}


class SiteSettings(models.Model):
    site_name = models.CharField(max_length=100, default='BVS')
    tagline = models.CharField(max_length=200, blank=True)
    logo = models.ImageField(upload_to='site_settings/', null=True, blank=True)
    logo_small = models.ImageField(upload_to='site_settings/', null=True, blank=True,
                                   verbose_name='Logo reducido (para scroll/móvil)')
    favicon = models.ImageField(upload_to='site_settings/', null=True, blank=True)

    # Favicon variants (auto-generated from source favicon)
    favicon_16 = models.ImageField(upload_to='site_settings/favicons/', null=True, blank=True)
    favicon_32 = models.ImageField(upload_to='site_settings/favicons/', null=True, blank=True)
    apple_touch_icon = models.ImageField(upload_to='site_settings/favicons/', null=True, blank=True)
    android_chrome_192 = models.ImageField(upload_to='site_settings/favicons/', null=True, blank=True)
    android_chrome_512 = models.ImageField(upload_to='site_settings/favicons/', null=True, blank=True)
    safari_pinned_tab_color = models.CharField(max_length=7, default='#3b82f6', blank=True)
    ms_tile_color = models.CharField(max_length=7, default='#3b82f6', blank=True)
    theme_color = models.CharField(max_length=7, default='#3b82f6', blank=True)

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

    def save(self, *args, **kwargs):
        generate_variants = False

        if self.pk:
            try:
                old = SiteSettings.objects.get(pk=self.pk)
                if self.favicon and self.favicon != old.favicon:
                    generate_variants = True
            except SiteSettings.DoesNotExist:
                if self.favicon:
                    generate_variants = True
        elif self.favicon:
            generate_variants = True

        super().save(*args, **kwargs)

        if generate_variants:
            self._generate_favicon_variants()
            super().save(update_fields=list(FAVICON_VARIANTS.keys()))

    def _generate_favicon_variants(self):
        try:
            self.favicon.seek(0)
            source = Image.open(self.favicon)
            source = source.convert('RGBA')
        except Exception as e:
            logger.error('Failed to open favicon source for variant generation: %s', e)
            return

        for field_name, size in FAVICON_VARIANTS.items():
            try:
                img = source.copy()
                img.thumbnail(size, Image.LANCZOS)
                # Create canvas of exact target size and paste centered
                canvas = Image.new('RGBA', size, (0, 0, 0, 0))
                offset = ((size[0] - img.width) // 2, (size[1] - img.height) // 2)
                canvas.paste(img, offset)

                buf = io.BytesIO()
                canvas.save(buf, format='PNG')
                buf.seek(0)

                filename = f'favicon-{size[0]}x{size[1]}.png'
                getattr(self, field_name).save(filename, ContentFile(buf.read()), save=False)
            except Exception as e:
                logger.error('Failed to generate favicon variant %s: %s', field_name, e)
