from django.db import models


class NavZone(models.Model):
    LOCATIONS = [
        ('header', 'Header'),
        ('footer', 'Footer'),
        ('sidebar_left', 'Sidebar Izq.'),
        ('sidebar_right', 'Sidebar Der.'),
    ]
    label    = models.CharField(max_length=100)
    location = models.CharField(max_length=30, choices=LOCATIONS)
    order    = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['location', 'order']
        verbose_name = 'Zona de Navegación'
        verbose_name_plural = 'Zonas de Navegación'

    def __str__(self):
        return f'{self.label} ({self.get_location_display()})'


class NavItem(models.Model):
    TYPES = [('link', 'Enlace'), ('widget', 'Widget')]

    zone            = models.ForeignKey(NavZone, on_delete=models.CASCADE, related_name='items')
    parent          = models.ForeignKey('self', null=True, blank=True,
                                        on_delete=models.CASCADE, related_name='children')
    label           = models.CharField(max_length=200)
    url             = models.CharField(max_length=500, blank=True)
    open_in_new_tab = models.BooleanField(default=False)
    item_type       = models.CharField(max_length=20, choices=TYPES, default='link')
    widget_type     = models.CharField(max_length=50, blank=True)
    widget_content  = models.JSONField(default=dict, blank=True)
    order           = models.PositiveIntegerField(default=0)
    is_visible      = models.BooleanField(default=True)

    class Meta:
        ordering = ['order']
        verbose_name = 'Ítem de Navegación'
        verbose_name_plural = 'Ítems de Navegación'

    def __str__(self):
        return f'{self.label} ({self.zone.label})'
