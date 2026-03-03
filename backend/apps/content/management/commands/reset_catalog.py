from django.core.management.base import BaseCommand
from django.db import transaction

from apps.content.models import Book, Author, Category
from apps.content.search_meilisearch import clear_index


class Command(BaseCommand):
    help = 'Elimina todos los libros, autores y categorías del catálogo y limpia el índice de búsqueda.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--confirm',
            action='store_true',
            help='Confirma que deseas borrar TODO el catálogo. Requerido para ejecutar.',
        )

    def handle(self, *args, **options):
        if not options['confirm']:
            self.stdout.write(self.style.WARNING(
                'Esta operación borrará TODOS los libros, autores y categorías.\n'
                'Para confirmar, ejecuta el comando con la bandera --confirm:\n\n'
                '  python manage.py reset_catalog --confirm\n'
            ))
            return

        self.stdout.write(self.style.WARNING('Iniciando reset del catálogo...'))

        with transaction.atomic():
            books_count = Book.objects.count()
            Book.objects.all().delete()
            self.stdout.write(f'  ✓ {books_count} libros eliminados (con historial, reseñas, favoritos y anotaciones).')

            authors_count = Author.objects.count()
            Author.objects.all().delete()
            self.stdout.write(f'  ✓ {authors_count} autores eliminados.')

            categories_count = Category.objects.count()
            Category.objects.all().delete()
            self.stdout.write(f'  ✓ {categories_count} categorías eliminadas.')

        try:
            clear_index()
            self.stdout.write('  ✓ Índice de Meilisearch limpiado.')
        except Exception as e:
            self.stdout.write(self.style.WARNING(f'  ⚠ No se pudo limpiar el índice de Meilisearch: {e}'))

        self.stdout.write(self.style.SUCCESS('\nReset completado. El catálogo está vacío y listo para importar datos frescos.'))
