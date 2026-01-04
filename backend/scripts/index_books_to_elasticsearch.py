#!/usr/bin/env python
"""
Script para indexar todos los libros en Elasticsearch.
Uso: python manage.py shell < scripts/index_books_to_elasticsearch.py
"""

import sys
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.content.models import Book
from apps.content.documents import BookDocument
from elasticsearch.exceptions import ConnectionError, RequestError
import logging

logger = logging.getLogger(__name__)

def create_index():
    """Crear índice de Elasticsearch con mappings."""
    try:
        # Eliminar índice existente si hay (opcional)
        # BookDocument._index.delete(ignore=404)

        # Crear índice
        BookDocument.init()
        print("✅ Índice 'books' creado exitosamente")
        return True
    except RequestError as e:
        if 'resource_already_exists_exception' in str(e):
            print("⚠️  Índice 'books' ya existe, continuando...")
            return True
        else:
            print(f"❌ Error al crear índice: {e}")
            return False
    except ConnectionError as e:
        print(f"❌ No se puede conectar a Elasticsearch: {e}")
        print("   Verifica que Elasticsearch esté corriendo en http://elasticsearch:9200")
        return False
    except Exception as e:
        print(f"❌ Error inesperado: {e}")
        return False

def index_all_books():
    """Indexar todos los libros de la base de datos."""
    try:
        # Obtener todos los libros
        books = Book.objects.select_related('author', 'category').all()
        total = books.count()

        if total == 0:
            print("⚠️  No hay libros en la base de datos para indexar")
            return 0

        print(f"📚 Encontrados {total} libros para indexar...")

        indexed = 0
        errors = 0

        for i, book in enumerate(books, 1):
            try:
                # Crear documento de Elasticsearch
                doc = BookDocument.from_django_model(book)
                doc.save()
                indexed += 1

                # Progreso
                if i % 10 == 0 or i == total:
                    print(f"   Progreso: {i}/{total} ({indexed} indexados, {errors} errores)")

            except Exception as e:
                errors += 1
                print(f"   ❌ Error indexando libro '{book.title}' (ID: {book.id}): {e}")

        print(f"\n✅ Indexación completa:")
        print(f"   - Total: {total}")
        print(f"   - Indexados: {indexed}")
        print(f"   - Errores: {errors}")

        return indexed

    except Exception as e:
        print(f"❌ Error al indexar libros: {e}")
        return 0

def verify_indexing():
    """Verificar que los libros están indexados correctamente."""
    try:
        # Buscar todos los documentos
        s = BookDocument.search()
        s = s[:0]  # No queremos resultados, solo el count
        response = s.execute()

        total_indexed = response.hits.total.value
        total_db = Book.objects.count()

        print(f"\n📊 Verificación:")
        print(f"   - Libros en PostgreSQL: {total_db}")
        print(f"   - Libros en Elasticsearch: {total_indexed}")

        if total_indexed == total_db:
            print(f"   ✅ Todos los libros están indexados correctamente")
        elif total_indexed < total_db:
            print(f"   ⚠️  Faltan {total_db - total_indexed} libros por indexar")
        else:
            print(f"   ⚠️  Hay más libros indexados que en la BD (puede haber duplicados)")

        return total_indexed

    except ConnectionError:
        print("❌ No se puede verificar: Elasticsearch no responde")
        return 0
    except Exception as e:
        print(f"❌ Error al verificar indexación: {e}")
        return 0

if __name__ == '__main__':
    print("=" * 60)
    print("  INDEXAR LIBROS EN ELASTICSEARCH")
    print("=" * 60)
    print()

    # Paso 1: Crear índice
    print("[1/3] Creando índice...")
    if not create_index():
        print("\n❌ No se pudo crear el índice. Abortando.")
        sys.exit(1)

    print()

    # Paso 2: Indexar libros
    print("[2/3] Indexando libros...")
    indexed_count = index_all_books()

    if indexed_count == 0:
        print("\n⚠️  No se indexaron libros. Verifica la conexión a Elasticsearch.")

    print()

    # Paso 3: Verificar
    print("[3/3] Verificando indexación...")
    verify_indexing()

    print()
    print("=" * 60)
    print("  PROCESO COMPLETADO")
    print("=" * 60)
