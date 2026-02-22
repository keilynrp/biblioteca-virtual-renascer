from django.db import models


class SiteSettings(models.Model):
    site_name = models.CharField(max_length=100, default='BVS')
    tagline = models.CharField(max_length=200, blank=True)
    logo = models.ImageField(upload_to='site_settings/', null=True, blank=True)
    favicon = models.ImageField(upload_to='site_settings/', null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Configuración del Sitio'

    def __str__(self):
        return self.site_name

    @classmethod
    def get_settings(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj
