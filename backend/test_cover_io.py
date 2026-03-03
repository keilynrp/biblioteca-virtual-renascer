import os
import django
from django.core.files.base import ContentFile
import requests

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from django.conf import settings
if 'testserver' not in settings.ALLOWED_HOSTS:
    settings.ALLOWED_HOSTS.append('testserver')

from apps.content.models import Book, Author, Category
from apps.content.utils.import_export import BookImportExport
from django.test import RequestFactory

# 1. Test Export
# Create a dummy book with a cover image if it doesn't exist
author, _ = Author.objects.get_or_create(name="Test Author")
category, _ = Category.objects.get_or_create(name="Test Category")
book, created = Book.objects.get_or_create(
    title="Test Book for Export",
    defaults={
        'author': author,
        'category': category,
        'description': 'Test description',
        'slug': 'test-book-export'
    }
)

if not book.cover_image:
    book.cover_image.save("test_cover.jpg", ContentFile(b"fake image data"), save=True)

print(f"Book created/found: {book.title}, cover: {book.cover_image.url}")

factory = RequestFactory()
request = factory.get('/')

# Test CSV Export
csv_data = BookImportExport.export_books(Book.objects.filter(id=book.id), format_type='csv', request=request)
decoded_csv = csv_data.decode('utf-8-sig')
print("CSV Export Data (sample 300 chars):")
print(decoded_csv[:300])

# Verify Portada URL is present and absolute
expected_url = f"http://testserver{book.cover_image.url}"
if expected_url in decoded_csv:
    print(f"SUCCESS: CSV export contains absolute URL: {expected_url}")
else:
    print(f"FAILURE: CSV export does not contain correct absolute URL. Expected: {expected_url}")

# 2. Test Import
import_data = [
    {
        'title': 'Imported Book with URL',
        'author': 'Test Author',
        'category': 'Test Category',
        'description': 'Imported description',
        'cover_image': 'https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png', # A public image
        'slug': 'imported-book-url'
    }
]

# Clear existing if any
Book.objects.filter(slug='imported-book-url').delete()

print("Starting import...")
result = BookImportExport._process_import(import_data)
print("Import result:", result)

imported_book = Book.objects.filter(slug='imported-book-url').first()
if imported_book and imported_book.cover_image:
    print(f"SUCCESS: Imported book has cover image: {imported_book.cover_image.name}")
    print(f"Image size: {imported_book.cover_image.size} bytes")
else:
    print("FAILURE: Imported book missing cover image.")
