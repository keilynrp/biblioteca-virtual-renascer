import csv
import io
import logging
from django.utils.text import slugify
from apps.content.models import Book, Author, Category

logger = logging.getLogger(__name__)

def import_books_from_csv(csv_file):
    """
    Imports books from a CSV file.
    Expected columns: title, author, category, description, isbn, is_premium
    """
    decoded_file = csv_file.read().decode('utf-8')
    io_string = io.StringIO(decoded_file)
    reader = csv.DictReader(io_string)
    
    imported_count = 0
    errors = []

    for row in reader:
        try:
            title = row.get('title')
            author_name = row.get('author')
            category_name = row.get('category')
            description = row.get('description', '')
            isbn = row.get('isbn', '')
            is_premium = row.get('is_premium', 'false').lower() == 'true'

            if not title or not author_name:
                errors.append(f"Missing required fields for row: {row}")
                continue

            # Get or create author
            author, _ = Author.objects.get_or_create(name=author_name)

            # Get or create category
            category = None
            if category_name:
                category, _ = Category.objects.get_or_create(
                    name=category_name,
                    defaults={'slug': slugify(category_name)}
                )

            # Create book
            book, created = Book.objects.get_or_create(
                title=title,
                author=author,
                defaults={
                    'category': category,
                    'description': description,
                    'isbn': isbn,
                    'is_premium': is_premium,
                    'slug': slugify(title)
                }
            )

            if created:
                imported_count += 1
            else:
                logger.info(f"Book already exists: {title}")

        except Exception as e:
            logger.error(f"Error importing row {row}: {str(e)}")
            errors.append(f"Error in row {row.get('title', 'Unknown')}: {str(e)}")

    return imported_count, errors
