"""
Comando de Django para importar libros Open Access desde DOAB (Directory of Open Access Books).

Uso:
    python manage.py import_doab --query "library science" --limit 50
    python manage.py import_doab --subject "library science" --limit 20
    python manage.py import_doab --publisher-id "some-uuid" --limit 30
    python manage.py import_doab --query "education" --dry-run
"""

import requests
import time
from collections import defaultdict
from datetime import datetime
from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from django.db import transaction
from django.utils.text import slugify
from apps.content.models import Book, Author, Category


DOAB_BASE_URL = 'https://directory.doabooks.org/rest'
DOAB_SITE_URL = 'https://directory.doabooks.org'


class Command(BaseCommand):
    help = 'Importa libros Open Access desde DOAB (Directory of Open Access Books)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--query',
            type=str,
            help='Termino de busqueda libre',
            default=''
        )
        parser.add_argument(
            '--subject',
            type=str,
            help='Materia/subject (ej: "library science")',
            default=''
        )
        parser.add_argument(
            '--publisher-id',
            type=str,
            help='UUID de editorial en DOAB',
            default=''
        )
        parser.add_argument(
            '--limit',
            type=int,
            help='Numero maximo de libros a importar (default: 50, max: 200)',
            default=50
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Mostrar resultados sin guardar en la base de datos'
        )

    def handle(self, *args, **options):
        query = options['query']
        subject = options['subject']
        publisher_id = options['publisher_id']
        limit = min(options['limit'], 200)
        dry_run = options['dry_run']

        if not query and not subject and not publisher_id:
            self.stdout.write(self.style.ERROR(
                'Debes especificar al menos --query, --subject o --publisher-id'
            ))
            return

        self.stdout.write(self.style.SUCCESS('=' * 70))
        self.stdout.write(self.style.SUCCESS('IMPORTANDO LIBROS DESDE DOAB'))
        self.stdout.write(self.style.SUCCESS('=' * 70))
        if dry_run:
            self.stdout.write(self.style.WARNING('MODO DRY-RUN: no se guardaran datos'))
        self.stdout.write('')

        # Build search query
        search_query = self._build_query(query, subject, publisher_id)
        self.stdout.write(f'  Busqueda: {search_query}')
        self.stdout.write('')

        # Fetch from DOAB API
        items = self._fetch_from_doab(search_query, limit)
        if items is None:
            return

        self.stdout.write(f'  Resultados obtenidos: {len(items)}')
        self.stdout.write('-' * 70)

        # Process results
        imported = 0
        skipped = 0
        errors = 0

        for item in items[:limit]:
            try:
                meta = self._parse_metadata(item)
                title = meta.get('dc.title', [''])[0]

                if not title:
                    errors += 1
                    continue

                if dry_run:
                    self._print_dry_run(meta, item)
                    imported += 1
                    continue

                result = self._import_book(meta, item)
                if result == 'imported':
                    imported += 1
                elif result == 'skipped':
                    skipped += 1
                else:
                    errors += 1

                time.sleep(0.2)

            except Exception as e:
                errors += 1
                self.stdout.write(self.style.ERROR(f'  Error: {str(e)[:100]}'))
                continue

        # Summary
        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS('=' * 70))
        self.stdout.write(self.style.SUCCESS('IMPORTACION COMPLETADA'))
        self.stdout.write(self.style.SUCCESS('=' * 70))
        action = 'Libros encontrados' if dry_run else 'Libros importados'
        self.stdout.write(f'{action}: {self.style.SUCCESS(str(imported))}')
        if not dry_run:
            self.stdout.write(f'Libros omitidos (duplicados): {skipped}')
        self.stdout.write(f'Errores: {errors}')
        self.stdout.write('')

        if not dry_run:
            self.stdout.write(self.style.SUCCESS('ESTADISTICAS DE LA BASE DE DATOS'))
            self.stdout.write('-' * 70)
            self.stdout.write(f'Total de libros: {Book.objects.count()}')
            self.stdout.write(f'Total de libros DOAB: {Book.objects.filter(source="doab").count()}')
            self.stdout.write(f'Total de autores: {Author.objects.count()}')
            self.stdout.write(f'Total de categorias: {Category.objects.count()}')
            self.stdout.write('')

    def _build_query(self, query, subject, publisher_id):
        """Construye el query string para la API DOAB."""
        if subject:
            return f'dc.subject:{subject}'
        if publisher_id:
            return f'oapen.relation.isPublishedBy:{publisher_id}'
        return query

    def _fetch_from_doab(self, search_query, limit):
        """Realiza la peticion a la API REST de DOAB."""
        url = f'{DOAB_BASE_URL}/search'
        params = {
            'query': search_query,
            'limit': limit,
            'expand': 'metadata,bitstreams'
        }

        try:
            response = requests.get(url, params=params, timeout=30)
            response.raise_for_status()
            data = response.json()
            return data if isinstance(data, list) else []
        except requests.RequestException as e:
            self.stdout.write(self.style.ERROR(f'  Error al conectar con DOAB: {e}'))
            return None

    def _parse_metadata(self, item):
        """Agrupa los campos de metadata por key."""
        meta = defaultdict(list)
        for entry in item.get('metadata', []):
            meta[entry['key']].append(entry['value'])
        return meta

    def _print_dry_run(self, meta, item):
        """Imprime informacion del libro en modo dry-run."""
        title = meta.get('dc.title', ['Sin titulo'])[0]
        authors = (
            meta.get('dc.contributor.author', [])
            or meta.get('dc.contributor.editor', [])
            or meta.get('dc.creator', [])
            or ['Desconocido']
        )
        doi = meta.get('oapen.identifier.doi', [''])[0]
        subjects = meta.get('dc.subject', [])

        self.stdout.write(f'  Titulo: {title[:70]}')
        self.stdout.write(f'    Autor(es): {", ".join(authors[:3])}')
        if doi:
            self.stdout.write(f'    DOI: {doi}')
        if subjects:
            self.stdout.write(f'    Subjects: {", ".join(subjects[:5])}')

        has_cover = False
        has_pdf = False
        for bs in (item.get('bitstreams') or []):
            mime = bs.get('mimeType', '')
            link = bs.get('retrieveLink', '')
            if not link:
                continue
            if mime.startswith('image/') and not has_cover:
                self.stdout.write(f'    Cover: {DOAB_SITE_URL}{link}')
                has_cover = True
            elif not has_pdf:
                self.stdout.write(f'    PDF: {DOAB_SITE_URL}{link}')
                has_pdf = True
        self.stdout.write('')

    def _import_book(self, meta, item):
        """Importa un libro individual desde DOAB."""
        title = meta.get('dc.title', [''])[0].strip()
        if not title:
            return 'error'

        # Check for duplicate by slug
        slug = slugify(title)
        if not slug:
            return 'error'

        # Check for duplicate by DOI first, then by slug
        doi = meta.get('oapen.identifier.doi', [''])[0].strip() or None
        if doi and Book.objects.filter(doi=doi).exists():
            self.stdout.write(f'  Omitido (DOI duplicado): {title[:60]}')
            return 'skipped'

        if Book.objects.filter(slug=slug).exists():
            self.stdout.write(f'  Omitido (ya existe): {title[:60]}')
            return 'skipped'

        # Author - use first author, fallback to editor
        author_names = (
            meta.get('dc.contributor.author', [])
            or meta.get('dc.contributor.editor', [])
            or meta.get('dc.creator', [])
        )
        if author_names:
            author_name = author_names[0].strip()
        else:
            author_name = 'Autor Desconocido'

        author, _ = Author.objects.get_or_create(
            name=author_name,
            defaults={'bio': f'Informacion sobre {author_name}'}
        )

        # Categories from subjects
        subjects = meta.get('dc.subject', [])
        category = None
        if subjects:
            category_name = subjects[0].strip().title()
            category, _ = Category.objects.get_or_create(
                name=category_name,
                defaults={'description': f'Libros sobre {category_name}'}
            )

        # Description
        descriptions = meta.get('dc.description.abstract', [])
        description = descriptions[0].strip() if descriptions else 'Sin descripcion disponible.'

        # Publisher and language
        publishers = meta.get('dc.publisher', [])
        publisher = publishers[0].strip() if publishers else ''
        languages = meta.get('dc.language', [])
        language = languages[0].strip() if languages else ''

        # Publication date and year
        date_issued = meta.get('dc.date.issued', [''])[0]
        publication_date = None
        published_year = None
        if date_issued:
            try:
                year = int(date_issued[:4])
                published_year = year
                publication_date = datetime(year=year, month=1, day=1).date()
            except (ValueError, TypeError):
                pass

        # Parse bitstreams: separate PDF link and cover image
        external_url = None
        cover_link = None
        for bs in (item.get('bitstreams') or []):
            mime = bs.get('mimeType', '')
            link = bs.get('retrieveLink', '')
            if not link:
                continue
            if mime.startswith('image/') and cover_link is None:
                cover_link = f'{DOAB_SITE_URL}{link}'
            elif mime == 'application/pdf' and external_url is None:
                external_url = f'{DOAB_SITE_URL}{link}'

        # Fallback: if no PDF was found by mimeType, use first non-image bitstream
        if external_url is None:
            for bs in (item.get('bitstreams') or []):
                mime = bs.get('mimeType', '')
                link = bs.get('retrieveLink', '')
                if link and not mime.startswith('image/'):
                    external_url = f'{DOAB_SITE_URL}{link}'
                    break

        with transaction.atomic():
            book = Book.objects.create(
                title=title,
                slug=slug,
                author=author,
                category=category,
                description=description,
                publication_date=publication_date,
                published_year=published_year,
                publisher=publisher,
                language=language,
                is_premium=False,
                doi=doi,
                is_open_access=True,
                source='doab',
                external_url=external_url,
            )

        # Download cover image after commit
        if cover_link:
            self._download_cover(book, cover_link)

        self.stdout.write(
            self.style.SUCCESS(f'  Importado: {title[:60]} - {author_name[:30]}')
        )
        return 'imported'

    def _download_cover(self, book, cover_url):
        """Descarga la imagen de portada del libro desde DOAB."""
        try:
            response = requests.get(cover_url, timeout=10)
            if response.status_code == 200:
                content_type = response.headers.get('Content-Type', '')
                if content_type.startswith('image/'):
                    ext = 'jpg'
                    if 'png' in content_type:
                        ext = 'png'
                    elif 'webp' in content_type:
                        ext = 'webp'
                    filename = f'{book.slug}.{ext}'
                    book.cover_image.save(filename, ContentFile(response.content), save=True)
                    self.stdout.write(f'    Portada descargada: {filename}')
        except Exception:
            # No es critico si falla la descarga de la portada
            pass
