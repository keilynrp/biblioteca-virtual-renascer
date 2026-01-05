# =============================================================================
# Management Command: Index Books to Meilisearch
# =============================================================================
"""
Django management command to index all books into Meilisearch.

Usage:
    python manage.py index_books_meilisearch
    python manage.py index_books_meilisearch --clear  # Clear index first
    python manage.py index_books_meilisearch --batch-size 100  # Custom batch size
"""
from django.core.management.base import BaseCommand
from django.db.models import Q
from apps.content.models import Book
from apps.content.search_meilisearch import (
    index_books_bulk,
    clear_index,
    get_index_stats,
    MeilisearchClient
)


class Command(BaseCommand):
    help = 'Index all books into Meilisearch'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear the index before indexing'
        )

        parser.add_argument(
            '--batch-size',
            type=int,
            default=100,
            help='Number of books to index per batch (default: 100)'
        )

    def handle(self, *args, **options):
        self.stdout.write(
            self.style.SUCCESS('=== Indexing Books to Meilisearch ===\n')
        )

        # Initialize Meilisearch client and index
        try:
            client = MeilisearchClient.get_client()
            index = MeilisearchClient.get_index()
            self.stdout.write(
                self.style.SUCCESS('✓ Connected to Meilisearch\n')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'✗ Failed to connect to Meilisearch: {e}\n')
            )
            return

        # Clear index if requested
        if options['clear']:
            self.stdout.write('Clearing existing index...')
            try:
                task = clear_index()
                client.wait_for_task(task.task_uid)
                self.stdout.write(
                    self.style.SUCCESS('✓ Index cleared\n')
                )
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'✗ Failed to clear index: {e}\n')
                )
                return

        # Get total number of books
        total_books = Book.objects.count()
        self.stdout.write(f'Total books to index: {total_books}\n')

        if total_books == 0:
            self.stdout.write(
                self.style.WARNING('No books found in database\n')
            )
            return

        # Index books in batches
        batch_size = options['batch_size']
        indexed_count = 0
        failed_count = 0

        for i in range(0, total_books, batch_size):
            batch = Book.objects.all()[i:i + batch_size]
            batch_number = (i // batch_size) + 1
            total_batches = (total_books + batch_size - 1) // batch_size

            self.stdout.write(
                f'Processing batch {batch_number}/{total_batches} '
                f'({len(batch)} books)...'
            )

            try:
                task = index_books_bulk(batch)

                if task:
                    # Wait for the task to complete
                    client.wait_for_task(task.task_uid)
                    indexed_count += len(batch)
                    self.stdout.write(
                        self.style.SUCCESS(
                            f'✓ Indexed batch {batch_number}/{total_batches}\n'
                        )
                    )
                else:
                    failed_count += len(batch)
                    self.stdout.write(
                        self.style.WARNING(
                            f'⚠ Batch {batch_number} was empty\n'
                        )
                    )

            except Exception as e:
                failed_count += len(batch)
                self.stdout.write(
                    self.style.ERROR(
                        f'✗ Failed to index batch {batch_number}: {e}\n'
                    )
                )

        # Show final stats
        self.stdout.write('\n=== Indexing Complete ===\n')
        self.stdout.write(f'Total books: {total_books}')
        self.stdout.write(
            self.style.SUCCESS(f'Successfully indexed: {indexed_count}')
        )

        if failed_count > 0:
            self.stdout.write(
                self.style.ERROR(f'Failed: {failed_count}')
            )

        # Show Meilisearch index stats
        try:
            stats = get_index_stats()
            self.stdout.write('\n=== Meilisearch Index Stats ===')
            self.stdout.write(f'Documents in index: {stats["number_of_documents"]}')
            self.stdout.write(f'Is indexing: {stats["is_indexing"]}')

            if stats.get('field_distribution'):
                self.stdout.write('\nField distribution:')
                for field, count in stats['field_distribution'].items():
                    self.stdout.write(f'  {field}: {count}')

        except Exception as e:
            self.stdout.write(
                self.style.WARNING(f'\nCould not fetch index stats: {e}')
            )

        self.stdout.write(
            self.style.SUCCESS('\n✓ Indexing process completed!\n')
        )
