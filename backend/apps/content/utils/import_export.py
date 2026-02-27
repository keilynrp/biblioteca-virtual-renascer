import csv
import io
import logging
from datetime import datetime
from django.utils.text import slugify
from django.core.files.base import ContentFile
from apps.content.models import Book, Author, Category
import openpyxl
import requests
from openpyxl.utils import get_column_letter

logger = logging.getLogger(__name__)

class BookImportExport:
    """
    Utility class for importing and exporting books in CSV and XLSX formats.
    """
    
    # Define fields and their headers
    FIELD_MAPPING = {
        'id': 'ID',
        'title': 'Título',
        'author': 'Autor',
        'category': 'Categoría',
        'description': 'Descripción',
        'isbn': 'ISBN',
        'publication_date': 'Fecha de Publicación',
        'is_premium': 'Es Premium',
        'cover_image': 'Portada',
        'slug': 'Slug',
    }

    @classmethod
    def export_books(cls, queryset, format_type='csv', request=None):
        """
        Exports a queryset of books to the specified format.
        """
        if format_type == 'csv':
            return cls._export_to_csv(queryset, request)
        elif format_type == 'xlsx':
            return cls._export_to_xlsx(queryset, request)
        else:
            raise ValueError(f"Unsupported format: {format_type}")

    @classmethod
    def _export_to_csv(cls, queryset, request=None):
        output = io.StringIO()
        writer = csv.DictWriter(output, fieldnames=cls.FIELD_MAPPING.values())
        writer.writeheader()

        for book in queryset:
            writer.writerow({
                'ID': book.id,
                'Título': book.title,
                'Autor': book.author.name if book.author else '',
                'Categoría': book.category.name if book.category else '',
                'Descripción': book.description,
                'ISBN': book.isbn,
                'Fecha de Publicación': book.publication_date.strftime('%Y-%m-%d') if book.publication_date else '',
                'Es Premium': 'SÍ' if book.is_premium else 'NO',
                'Portada': request.build_absolute_uri(book.cover_image.url) if book.cover_image and request else (book.cover_image.url if book.cover_image else ''),
                'Slug': book.slug,
            })
        
        return output.getvalue().encode('utf-8-sig')

    @classmethod
    def _export_to_xlsx(cls, queryset, request=None):
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "Libros"

        # Write header
        headers = list(cls.FIELD_MAPPING.values())
        for col_num, header in enumerate(headers, 1):
            cell = ws.cell(row=1, column=col_num)
            cell.value = header
            cell.font = openpyxl.styles.Font(bold=True)

        # Write data
        for row_num, book in enumerate(queryset, 2):
            ws.cell(row=row_num, column=1).value = book.id
            ws.cell(row=row_num, column=2).value = book.title
            ws.cell(row=row_num, column=3).value = book.author.name if book.author else ''
            ws.cell(row=row_num, column=4).value = book.category.name if book.category else ''
            ws.cell(row=row_num, column=5).value = book.description
            ws.cell(row=row_num, column=6).value = book.isbn
            ws.cell(row=row_num, column=7).value = book.publication_date.strftime('%Y-%m-%d') if book.publication_date else ''
            ws.cell(row=row_num, column=8).value = 'SÍ' if book.is_premium else 'NO'
            ws.cell(row=row_num, column=9).value = request.build_absolute_uri(book.cover_image.url) if book.cover_image and request else (book.cover_image.url if book.cover_image else '')
            ws.cell(row=row_num, column=10).value = book.slug

        # Adjust column widths
        for col in ws.columns:
            max_length = 0
            column = col[0].column_letter
            for cell in col:
                try:
                    if len(str(cell.value)) > max_length:
                        max_length = len(str(cell.value))
                except:
                    pass
            adjusted_width = (max_length + 2)
            ws.column_dimensions[column].width = min(adjusted_width, 50)

        output = io.BytesIO()
        wb.save(output)
        return output.getvalue()

    @classmethod
    def import_books(cls, file_obj, format_type):
        """
        Imports books from a file object.
        """
        if format_type == 'csv':
            data = cls._parse_csv(file_obj)
        elif format_type == 'xlsx':
            data = cls._parse_xlsx(file_obj)
        else:
            raise ValueError(f"Unsupported format: {format_type}")

        return cls._process_import(data)

    @classmethod
    def _parse_csv(cls, file_obj):
        try:
            # Decode using utf-8-sig to automatically handle Byte Order Mark (BOM)
            decoded_file = file_obj.read().decode('utf-8-sig')
        except UnicodeDecodeError:
            # Fallback to general utf-8 or latin-1 if needed, but utf-8-sig is preferred
            file_obj.seek(0)
            decoded_file = file_obj.read().decode('latin-1')

        io_string = io.StringIO(decoded_file)
        reader = csv.DictReader(io_string)
        
        # Normalize headers to match our FIELD_MAPPING values or keys
        data = []
        reverse_mapping = {v.lower(): k for k, v in cls.FIELD_MAPPING.items()}
        
        for row in reader:
            normalized_row = {}
            for k, v in row.items():
                if not k: continue
                key = reverse_mapping.get(k.strip().lower(), k.strip().lower())
                normalized_row[key] = v
            data.append(normalized_row)
        return data

    @classmethod
    def _parse_xlsx(cls, file_obj):
        wb = openpyxl.load_workbook(file_obj, data_only=True)
        ws = wb.active
        
        headers = []
        for cell in ws[1]:
            headers.append(cell.value)
            
        reverse_mapping = {v.lower(): k for k, v in cls.FIELD_MAPPING.items()}
        
        data = []
        for row in ws.iter_rows(min_row=2, values_only=True):
            if not any(row): continue
            
            normalized_row = {}
            for idx, value in enumerate(row):
                if idx < len(headers) and headers[idx]:
                    header = str(headers[idx]).strip().lower()
                    key = reverse_mapping.get(header, header)
                    normalized_row[key] = value
            data.append(normalized_row)
        return data

    @classmethod
    def _process_import(cls, data):
        imported_count = 0
        skipped_count = 0
        errors = []

        for row in data:
            try:
                title = row.get('title')
                author_name = row.get('author')
                category_name = row.get('category')
                
                if not title:
                    errors.append("Fila omitida: Título faltante.")
                    continue

                # Prepare book data
                book_defaults = {
                    'description': row.get('description', ''),
                    'isbn': str(row.get('isbn', ''))[:13],
                    'is_premium': str(row.get('is_premium', '')).lower() in ['sì', 'si', 'sí', 'true', '1', 'yes'],
                }

                # Handle Author
                if author_name:
                    author, _ = Author.objects.get_or_create(name=author_name)
                    book_defaults['author'] = author
                else:
                    # Fallback to a default author or error? 
                    # For now, let's skip if no author and not provided
                    if 'author' not in row:
                        errors.append(f"Error en '{title}': Autor requerido.")
                        continue

                # Handle Category
                if category_name:
                    category, _ = Category.objects.get_or_create(
                        name=category_name,
                        defaults={'slug': slugify(category_name)}
                    )
                    book_defaults['category'] = category

                # Handle Publication Date
                pub_date = row.get('publication_date')
                if pub_date:
                    if isinstance(pub_date, datetime):
                        book_defaults['publication_date'] = pub_date.date()
                    else:
                        try:
                            # Try common formats
                            for fmt in ('%Y-%m-%d', '%d/%m/%Y', '%Y'):
                                try:
                                    dt = datetime.strptime(str(pub_date), fmt)
                                    book_defaults['publication_date'] = dt.date()
                                    break
                                except ValueError:
                                    continue
                        except Exception:
                            pass

                # Handle slug
                slug = row.get('slug') or slugify(title)
                
                # Check if book exists
                book_exists = Book.objects.filter(slug=slug).exists()
                if book_exists:
                    skipped_count += 1
                    continue

                # Handle Cover Image URL
                cover_url = row.get('cover_image')
                cover_file = None
                if cover_url and str(cover_url).startswith(('http://', 'https://')):
                    cover_file = cls._download_image(str(cover_url))

                # Create Book
                book = Book.objects.create(
                    title=title,
                    slug=slug,
                    **book_defaults
                )
                
                if cover_file:
                    book.cover_image.save(f"cover_{book.id}.jpg", cover_file, save=True)
                
                imported_count += 1

            except Exception as e:
                logger.error(f"Error importing row: {row}. Error: {str(e)}")
                errors.append(f"Error en '{row.get('title', 'Desconocido')}': {str(e)}")

        return {
            'imported': imported_count,
            'skipped': skipped_count,
            'errors': errors,
        }

    @staticmethod
    def _download_image(url):
        """Helper to download an image from a URL"""
        try:
            response = requests.get(url, timeout=10)
            if response.status_code == 200:
                return ContentFile(response.content)
            else:
                logger.error(f"Failed to download image from {url}: Status {response.status_code}")
        except Exception as e:
            logger.error(f"Exception downloading image from {url}: {str(e)}")
        return None
