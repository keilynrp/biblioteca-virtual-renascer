"""
Comando de Django para importar libros desde OpenLibrary API.

Uso:
    python manage.py import_openlibrary --subjects "python,javascript,science" --limit 50
    python manage.py import_openlibrary --query "programming" --limit 20
"""

import requests
import time
from datetime import datetime
from django.core.management.base import BaseCommand
from django.utils.text import slugify
from django.core.files.base import ContentFile
from apps.content.models import Book, Author, Category


class Command(BaseCommand):
    help = 'Importa libros desde OpenLibrary API'

    def add_arguments(self, parser):
        parser.add_argument(
            '--subjects',
            type=str,
            help='Temas separados por comas (ej: python,javascript,science)',
            default='programming,science,fiction,history,philosophy'
        )
        parser.add_argument(
            '--limit',
            type=int,
            help='Número máximo de libros a importar',
            default=30
        )
        parser.add_argument(
            '--query',
            type=str,
            help='Búsqueda por query general',
            default=None
        )

    def handle(self, *args, **options):
        subjects = options['subjects'].split(',')
        limit = options['limit']
        query = options['query']

        self.stdout.write(self.style.SUCCESS('=' * 70))
        self.stdout.write(self.style.SUCCESS('📚 IMPORTANDO LIBROS DESDE OPENLIBRARY'))
        self.stdout.write(self.style.SUCCESS('=' * 70))
        self.stdout.write('')

        total_imported = 0
        total_skipped = 0
        total_errors = 0

        if query:
            self.stdout.write(f'🔍 Buscando: "{query}"')
            self.stdout.write('')
            imported, skipped, errors = self._import_by_query(query, limit)
            total_imported += imported
            total_skipped += skipped
            total_errors += errors
        else:
            for subject in subjects:
                subject = subject.strip()
                self.stdout.write(f'📖 Procesando tema: {subject}')
                self.stdout.write('-' * 70)

                books_per_subject = limit // len(subjects)
                imported, skipped, errors = self._import_by_subject(subject, books_per_subject)

                total_imported += imported
                total_skipped += skipped
                total_errors += errors
                self.stdout.write('')

        # Resumen final
        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS('=' * 70))
        self.stdout.write(self.style.SUCCESS('✅ IMPORTACIÓN COMPLETADA'))
        self.stdout.write(self.style.SUCCESS('=' * 70))
        self.stdout.write(f'Libros importados: {self.style.SUCCESS(total_imported)}')
        self.stdout.write(f'Libros omitidos (duplicados): {total_skipped}')
        self.stdout.write(f'Errores: {total_errors}')
        self.stdout.write('')

        # Estadísticas de la base de datos
        self.stdout.write(self.style.SUCCESS('📊 ESTADÍSTICAS DE LA BASE DE DATOS'))
        self.stdout.write('-' * 70)
        self.stdout.write(f'Total de libros: {Book.objects.count()}')
        self.stdout.write(f'Total de autores: {Author.objects.count()}')
        self.stdout.write(f'Total de categorías: {Category.objects.count()}')
        self.stdout.write('')

    def _import_by_subject(self, subject, limit):
        """Importa libros por tema/subject"""
        url = f'https://openlibrary.org/subjects/{subject}.json'
        params = {'limit': limit * 2}  # Pedimos más para compensar duplicados

        try:
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
        except requests.RequestException as e:
            self.stdout.write(self.style.ERROR(f'  ❌ Error al obtener datos: {e}'))
            return 0, 0, 1

        works = data.get('works', [])
        return self._process_books(works, subject, limit)

    def _import_by_query(self, query, limit):
        """Importa libros por búsqueda general"""
        url = 'https://openlibrary.org/search.json'
        params = {
            'q': query,
            'limit': limit * 2,
            'fields': 'key,title,author_name,first_publish_year,isbn,subject,cover_i'
        }

        try:
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
        except requests.RequestException as e:
            self.stdout.write(self.style.ERROR(f'  ❌ Error al obtener datos: {e}'))
            return 0, 0, 1

        docs = data.get('docs', [])
        # Convertir formato de búsqueda al formato de works
        works = []
        for doc in docs:
            work = {
                'key': doc.get('key', ''),
                'title': doc.get('title', ''),
                'authors': [{'name': name} for name in doc.get('author_name', [])[:1]],
                'first_publish_year': doc.get('first_publish_year'),
                'cover_id': doc.get('cover_i'),
                'subject': doc.get('subject', [])[:3]  # Primeros 3 temas
            }
            works.append(work)

        return self._process_books(works, query, limit)

    def _process_books(self, works, category_name, limit):
        """Procesa una lista de libros (works)"""
        imported = 0
        skipped = 0
        errors = 0

        # Crear o obtener la categoría
        category, _ = Category.objects.get_or_create(
            name=category_name.title(),
            defaults={'description': f'Libros sobre {category_name}'}
        )

        for work in works[:limit * 2]:  # Procesamos más para compensar duplicados
            if imported >= limit:
                break

            try:
                result = self._import_book(work, category)
                if result == 'imported':
                    imported += 1
                elif result == 'skipped':
                    skipped += 1
                else:
                    errors += 1

                # Rate limiting - esperar un poco entre peticiones
                time.sleep(0.2)

            except Exception as e:
                errors += 1
                self.stdout.write(self.style.ERROR(f'  ❌ Error: {str(e)[:100]}'))
                continue

        return imported, skipped, errors

    def _import_book(self, work, category):
        """Importa un libro individual"""
        title = work.get('title', '').strip()
        if not title:
            return 'error'

        # Verificar si ya existe por título
        slug = slugify(title)
        if Book.objects.filter(slug=slug).exists():
            self.stdout.write(f'  ⏭️  Omitido (ya existe): {title[:60]}')
            return 'skipped'

        # Obtener datos del autor
        authors_data = work.get('authors', [])
        if not authors_data:
            author_name = 'Autor Desconocido'
        else:
            author_name = authors_data[0].get('name', 'Autor Desconocido')

        # Crear o obtener autor
        author, created = Author.objects.get_or_create(
            name=author_name,
            defaults={'bio': f'Información sobre {author_name}'}
        )

        # Obtener descripción (puede requerir llamada adicional)
        description = self._get_book_description(work)

        # Fecha de publicación
        first_publish_year = work.get('first_publish_year')
        publication_date = None
        if first_publish_year:
            try:
                publication_date = datetime(year=int(first_publish_year), month=1, day=1).date()
            except (ValueError, TypeError):
                pass

        # ISBN (si está disponible)
        isbn = ''
        if 'isbn' in work and work['isbn']:
            isbn = work['isbn'][0] if isinstance(work['isbn'], list) else str(work['isbn'])

        # Crear el libro
        book = Book.objects.create(
            title=title,
            slug=slug,
            author=author,
            category=category,
            description=description,
            publication_date=publication_date,
            isbn=isbn[:13],  # Limitar a 13 caracteres
            is_premium=False,
            # Nota: file es required, lo dejamos vacío por ahora o necesitamos crear un archivo dummy
        )

        # Descargar cover image si está disponible
        cover_id = work.get('cover_id')
        if cover_id:
            self._download_cover(book, cover_id)

        self.stdout.write(
            self.style.SUCCESS(f'  ✅ Importado: {title[:60]} - {author_name[:30]}')
        )
        return 'imported'

    def _get_book_description(self, work):
        """Obtiene la descripción del libro"""
        # Primero intentar con la descripción en el work
        if 'description' in work:
            desc = work['description']
            if isinstance(desc, dict):
                return desc.get('value', 'Sin descripción disponible.')
            return str(desc)

        # Si no hay descripción, usar los subjects como descripción
        subjects = work.get('subject', [])
        if subjects:
            subjects_str = ', '.join(subjects[:5])
            return f'Libro sobre: {subjects_str}'

        return 'Sin descripción disponible.'

    def _download_cover(self, book, cover_id):
        """Descarga la imagen de portada del libro"""
        try:
            # URL de la portada en tamaño mediano
            cover_url = f'https://covers.openlibrary.org/b/id/{cover_id}-M.jpg'

            response = requests.get(cover_url, timeout=5)
            if response.status_code == 200:
                # Guardar la imagen
                filename = f'{book.slug}.jpg'
                book.cover_image.save(filename, ContentFile(response.content), save=True)
        except Exception as e:
            # No es crítico si falla la descarga de la imagen
            pass
