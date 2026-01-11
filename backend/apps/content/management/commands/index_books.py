"""
Management command para indexar libros en Elasticsearch.
DISABLED: Migrating to Meilisearch
"""
from django.core.management.base import BaseCommand
from django.db import transaction
from apps.content.models import Book
# Elasticsearch disabled - using Meilisearch instead
# from apps.content.documents import BookDocument


class Command(BaseCommand):
    help = 'DISABLED: Elasticsearch indexing disabled - migrating to Meilisearch'

    def add_arguments(self, parser):
        parser.add_argument(
            '--rebuild',
            action='store_true',
            help='Elimina el índice existente y lo recrea desde cero',
        )

    def handle(self, *args, **options):
        self.stdout.write(
            self.style.WARNING('This command is disabled - migrating from Elasticsearch to Meilisearch')
        )
        self.stdout.write('Please use Meilisearch for search indexing instead.')
        return

        # rebuild = options['rebuild']
        #
        # try:
        #     if rebuild:
        #         self.stdout.write('Eliminando índice existente...')
        #         BookDocument._index.delete(ignore=404)
        #         self.stdout.write(self.style.SUCCESS('✓ Índice eliminado'))
        #
        #     # Inicializar índice
        #     self.stdout.write('Inicializando índice...')
        #     BookDocument.init()
        #     self.stdout.write(self.style.SUCCESS('✓ Índice inicializado'))
        #
        #     # Obtener todos los libros
        #     books = Book.objects.select_related('author', 'category').all()
        #     total = books.count()
        #
        #     if total == 0:
        #         self.stdout.write(self.style.WARNING('No hay libros para indexar'))
        #         return
        #
        #     self.stdout.write(f'Indexando {total} libros...')
        #
        #     # Indexar libros
        #     indexed = 0
        #     errors = 0
        #
        #     for book in books:
        #         try:
        #             doc = BookDocument.from_django_model(book)
        #             doc.save()
        #             indexed += 1
        #
        #             # Mostrar progreso cada 10 libros
        #             if indexed % 10 == 0:
        #                 self.stdout.write(f'  Indexados: {indexed}/{total}')
        #
        #         except Exception as e:
        #             errors += 1
        #             self.stdout.write(
        #                 self.style.ERROR(f'✗ Error indexando libro {book.id} "{book.title}": {str(e)}')
        #             )
        #
        #     # Resumen
        #     self.stdout.write('')
        #     self.stdout.write(self.style.SUCCESS(f'✓ Indexación completada'))
        #     self.stdout.write(f'  Total de libros: {total}')
        #     self.stdout.write(self.style.SUCCESS(f'  Indexados exitosamente: {indexed}'))
        #     if errors > 0:
        #         self.stdout.write(self.style.ERROR(f'  Errores: {errors}'))
        #
        # except Exception as e:
        #     self.stdout.write(
        #         self.style.ERROR(f'Error fatal durante la indexación: {str(e)}')
        #     )
        #     raise
