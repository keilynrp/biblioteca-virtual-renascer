from django.contrib import admin
from .models import Category, Author, Book


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

    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'slug', 'author', 'category', 'description')
        }),
        ('Publication Details', {
            'fields': ('publication_date', 'isbn')
        }),
        ('Media', {
            'fields': ('cover_image', 'file')
        }),
        ('Access Control', {
            'fields': ('is_premium',)
        }),
    )
