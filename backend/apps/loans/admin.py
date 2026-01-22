from django.contrib import admin
from django.db import models as django_models
from .models import Loan, BookCopy, LoanQueue


@admin.register(BookCopy)
class BookCopyAdmin(admin.ModelAdmin):
    list_display = ('id', 'book', 'copy_number', 'is_available', 'condition', 'barcode')
    list_filter = ('is_available', 'condition')
    search_fields = ('book__title', 'barcode')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Información del Ejemplar', {
            'fields': ('book', 'copy_number', 'barcode')
        }),
        ('Estado', {
            'fields': ('is_available', 'condition', 'notes')
        }),
        ('Fechas', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Loan)
class LoanAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'book', 'status', 'borrowed_at', 'due_date', 'is_overdue', 'renewals_count')
    list_filter = ('status', 'borrowed_at', 'due_date')
    search_fields = ('user__username', 'user__email', 'book__title')
    readonly_fields = ('borrowed_at', 'returned_at', 'is_overdue', 'days_overdue', 'can_renew', 'created_at', 'updated_at')
    date_hierarchy = 'borrowed_at'
    
    fieldsets = (
        ('Préstamo', {
            'fields': ('user', 'book', 'book_copy', 'status')
        }),
        ('Fechas', {
            'fields': ('borrowed_at', 'due_date', 'returned_at')
        }),
        ('Renovaciones', {
            'fields': ('renewals_count', 'max_renewals', 'can_renew')
        }),
        ('Estado', {
            'fields': ('is_overdue', 'days_overdue', 'fine_amount')
        }),
        ('Notas', {
            'fields': ('notes',),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['mark_as_returned', 'extend_due_date']
    
    def mark_as_returned(self, request, queryset):
        """Mark selected loans as returned."""
        count = 0
        for loan in queryset:
            if loan.status == Loan.LoanStatus.ACTIVE:
                try:
                    loan.return_book()
                    count += 1
                except ValueError:
                    pass
        
        self.message_user(request, f'{count} préstamo(s) marcado(s) como devuelto(s).')
    mark_as_returned.short_description = 'Marcar como devuelto'
    
    def extend_due_date(self, request, queryset):
        """Extend due date by 7 days."""
        from datetime import timedelta
        count = queryset.filter(status=Loan.LoanStatus.ACTIVE).update(
            due_date=django_models.F('due_date') + timedelta(days=7)
        )
        self.message_user(request, f'Extendida fecha de vencimiento de {count} préstamo(s).')
    extend_due_date.short_description = 'Extender vencimiento 7 días'


@admin.register(LoanQueue)
class LoanQueueAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'book', 'position', 'notified', 'notified_at', 'created_at')
    list_filter = ('notified', 'created_at')
    search_fields = ('user__username', 'book__title')
    readonly_fields = ('notified_at', 'created_at', 'updated_at')
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Reserva', {
            'fields': ('user', 'book', 'position')
        }),
        ('Notificación', {
            'fields': ('notified', 'notified_at', 'expires_at')
        }),
        ('Fechas', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['notify_users']
    
    def notify_users(self, request, queryset):
        """Notify selected users about book availability."""
        count = 0
        for queue_entry in queryset.filter(notified=False):
            queue_entry.notify_availability()
            count += 1
        
        self.message_user(request, f'{count} usuario(s) notificado(s).')
    notify_users.short_description = 'Notificar disponibilidad'
