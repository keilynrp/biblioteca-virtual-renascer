from django.contrib import admin, messages
from django.shortcuts import render, redirect
from django.urls import path
from django import forms
from .models import Category, Author, Book, Bookmark, Highlight, Annotation, Review
from .utils.import_books import import_books_from_csv


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    search_fields = ('name', 'description')
    prepopulated_fields = {'slug': ('name',)}
    ordering = ('name',)


@admin.register(Author)
class AuthorAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name', 'bio')
    ordering = ('name',)


@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'category', 'is_premium', 'publication_date', 'created_at')
    search_fields = ('title', 'description', 'isbn')
    list_filter = ('category', 'author', 'is_premium', 'created_at')
    prepopulated_fields = {'slug': ('title',)}
    ordering = ('-created_at',)
    date_hierarchy = 'created_at'

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('import-csv/', self.admin_site.admin_view(self.import_csv), name='import-csv'),
        ]
        return custom_urls + urls

    def import_csv(self, request):
        if request.method == "POST":
            csv_file = request.FILES.get("csv_file")
            if not csv_file or not csv_file.name.endswith('.csv'):
                self.message_user(request, "Error: Debe subir un archivo CSV válido.", level=messages.ERROR)
                return redirect("..")
            
            count, errors = import_books_from_csv(csv_file)
            if errors:
                for error in errors:
                    self.message_user(request, error, level=messages.WARNING)
            
            self.message_user(request, f"Éxito: Se han importado {count} libros correctamente.", level=messages.SUCCESS)
            return redirect("..")
        
        form = CsvImportForm()
        payload = {"form": form}
        return render(request, "admin/csv_form.html", payload)

    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'slug', 'author', 'category', 'description')
        }),
        ('Publication Details', {
            'fields': ('publication_date', 'isbn'),
            'description': 'La fecha de publicación es opcional. Déjala vacía si no está disponible.'
        }),
        ('Media', {
            'fields': ('cover_image', 'file')
        }),
        ('Access Control', {
            'fields': ('is_premium',)
        }),
    )


# =============================================================================
# Annotation Admin - Sprint 10
# =============================================================================

@admin.register(Bookmark)
class BookmarkAdmin(admin.ModelAdmin):
    list_display = ('user', 'book', 'page_number', 'title', 'created_at')
    search_fields = ('user__username', 'book__title', 'title', 'notes')
    list_filter = ('created_at', 'book')
    ordering = ('-created_at',)
    date_hierarchy = 'created_at'

    fieldsets = (
        ('Bookmark Information', {
            'fields': ('user', 'book', 'page_number')
        }),
        ('Details', {
            'fields': ('title', 'notes')
        }),
    )

    readonly_fields = ('created_at', 'updated_at')


@admin.register(Highlight)
class HighlightAdmin(admin.ModelAdmin):
    list_display = ('user', 'book', 'page_number', 'color', 'text_preview', 'created_at')
    search_fields = ('user__username', 'book__title', 'selected_text')
    list_filter = ('color', 'created_at', 'book')
    ordering = ('-created_at',)
    date_hierarchy = 'created_at'

    fieldsets = (
        ('Highlight Information', {
            'fields': ('user', 'book', 'page_number', 'color')
        }),
        ('Content', {
            'fields': ('selected_text', 'position_data')
        }),
    )

    readonly_fields = ('created_at', 'updated_at')

    def text_preview(self, obj):
        """Show preview of selected text"""
        if len(obj.selected_text) > 50:
            return obj.selected_text[:50] + '...'
        return obj.selected_text
    text_preview.short_description = 'Text Preview'


@admin.register(Annotation)
class AnnotationAdmin(admin.ModelAdmin):
    list_display = ('user', 'book', 'page_number', 'content_preview', 'is_private', 'created_at')
    search_fields = ('user__username', 'book__title', 'content', 'selected_text')
    list_filter = ('is_private', 'created_at', 'book')
    ordering = ('-created_at',)
    date_hierarchy = 'created_at'

    fieldsets = (
        ('Annotation Information', {
            'fields': ('user', 'book', 'page_number', 'highlight')
        }),
        ('Content', {
            'fields': ('content', 'selected_text', 'position_data')
        }),
        ('Privacy', {
            'fields': ('is_private',)
        }),
    )

    readonly_fields = ('created_at', 'updated_at')

    def content_preview(self, obj):
        """Show preview of annotation content"""
        if len(obj.content) > 50:
            return obj.content[:50] + '...'
        return obj.content
    content_preview.short_description = 'Content Preview'


class CsvImportForm(forms.Form):
    csv_file = forms.FileField()


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('book', 'user', 'rating', 'is_verified_reader', 'created_at')
    list_filter = ('rating', 'is_verified_reader', 'created_at')
    search_fields = ('book__title', 'user__username', 'comment')
    actions = ['approve_reviews', 'disapprove_reviews']

    def approve_reviews(self, request, queryset):
        queryset.update(is_verified_reader=True)
        self.message_user(request, "Reseñas marcadas como verificadas.")
    approve_reviews.short_description = "Marcar como verificado"

    def disapprove_reviews(self, request, queryset):
        queryset.update(is_verified_reader=False)
        self.message_user(request, "Reseñas marcadas como no verificadas.")
    disapprove_reviews.short_description = "Quitar verificación"
