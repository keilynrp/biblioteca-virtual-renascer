from django.contrib import admin
from .models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'type', 'title', 'is_read', 'is_emailed', 'created_at')
    list_filter = ('type', 'is_read', 'is_emailed', 'created_at')
    search_fields = ('user__username', 'user__email', 'title', 'message')
    readonly_fields = ('created_at', 'read_at')
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Usuario', {
            'fields': ('user',)
        }),
        ('Contenido', {
            'fields': ('type', 'title', 'message', 'link')
        }),
        ('Estado', {
            'fields': ('is_read', 'is_emailed', 'metadata')
        }),
        ('Fechas', {
            'fields': ('created_at', 'read_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['mark_as_read', 'mark_as_unread']
    
    def mark_as_read(self, request, queryset):
        """Acción para marcar notificaciones como leídas"""
        from django.utils import timezone
        count = queryset.filter(is_read=False).update(
            is_read=True,
            read_at=timezone.now()
        )
        self.message_user(request, f'{count} notificacion(es) marcada(s) como leída(s).')
    mark_as_read.short_description = 'Marcar como leída'
    
    def mark_as_unread(self, request, queryset):
        """Acción para marcar notificaciones como no leídas"""
        count = queryset.update(is_read=False, read_at=None)
        self.message_user(request, f'{count} notificacion(es) marcada(s) como no leída(s).')
    mark_as_unread.short_description = 'Marcar como no leída'
