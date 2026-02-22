from django.db import models


class Page(models.Model):
    class PageType(models.TextChoices):
        MARKETING = 'marketing', 'Marketing'
        DASHBOARD = 'dashboard', 'Dashboard'
        CUSTOM    = 'custom',    'Custom Landing Page'

    slug         = models.SlugField(max_length=100, unique=True)
    title        = models.CharField(max_length=200)
    page_type    = models.CharField(
        max_length=20,
        choices=PageType.choices,
        default=PageType.MARKETING,
    )
    is_published = models.BooleanField(default=False)
    # Stores the full Puck Data object: { content: [...], root: { props: {} } }
    content      = models.JSONField(default=dict, blank=True)
    created_at   = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Página'
        verbose_name_plural = 'Páginas'
        ordering = ['slug']

    def __str__(self):
        return f'{self.title} ({self.slug})'
