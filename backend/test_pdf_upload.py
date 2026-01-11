#!/usr/bin/env python
"""
Script de prueba para validar el upload de PDFs en la API de Books
Uso: python test_pdf_upload.py
"""

import os
import sys
import django
from io import BytesIO

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.core.files.uploadedfile import SimpleUploadedFile
from apps.content.models import Book, Author, Category
from apps.content.serializers import BookDetailSerializer

def create_test_pdf():
    """Crea un archivo PDF de prueba simple"""
    pdf_content = b"""%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj
4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
100 700 Td
(Test PDF) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000214 00000 n
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
306
%%EOF"""
    return pdf_content

def test_pdf_upload():
    """Prueba el upload de PDF"""

    print("=" * 80)
    print("TEST: Upload de PDF en Books API")
    print("=" * 80)

    # 1. Crear o obtener autor y categoría de prueba
    print("\n1. Preparando datos de prueba...")
    author, _ = Author.objects.get_or_create(
        name="Test Author",
        defaults={"bio": "Author for testing"}
    )
    category, _ = Category.objects.get_or_create(
        name="Test Category",
        defaults={"description": "Category for testing"}
    )
    print(f"   ✓ Autor: {author.name}")
    print(f"   ✓ Categoría: {category.name}")

    # 2. Crear archivo PDF de prueba
    print("\n2. Creando archivo PDF de prueba...")
    pdf_content = create_test_pdf()
    pdf_file = SimpleUploadedFile(
        "test_book.pdf",
        pdf_content,
        content_type="application/pdf"
    )
    print(f"   ✓ Archivo PDF creado: {len(pdf_content)} bytes")

    # 3. Preparar datos del libro
    print("\n3. Preparando datos del libro...")
    book_data = {
        'title': 'Test Book with PDF',
        'description': 'This is a test book with PDF upload',
        'author': author.id,
        'category': category.id,
        'isbn': '1234567890123',
        'is_premium': False,
        'file_upload': pdf_file
    }

    # 4. Crear libro usando el serializer
    print("\n4. Creando libro con PDF...")
    serializer = BookDetailSerializer(data=book_data)

    if serializer.is_valid():
        book = serializer.save()
        print(f"   ✓ Libro creado exitosamente: {book.title}")
        print(f"   ✓ Slug: {book.slug}")

        # 5. Verificar que el archivo se guardó
        print("\n5. Verificando persistencia del archivo...")
        if book.file:
            print(f"   ✓ Archivo guardado en: {book.file.name}")
            print(f"   ✓ URL del archivo: {book.file.url}")

            # Verificar que el archivo existe físicamente
            if book.file.storage.exists(book.file.name):
                print(f"   ✓ El archivo existe físicamente")
                file_size = book.file.size
                print(f"   ✓ Tamaño del archivo: {file_size} bytes")

                # 6. Probar actualización del PDF
                print("\n6. Probando actualización del PDF...")
                new_pdf_content = create_test_pdf()
                new_pdf_file = SimpleUploadedFile(
                    "updated_book.pdf",
                    new_pdf_content,
                    content_type="application/pdf"
                )

                update_data = {'file_upload': new_pdf_file}
                update_serializer = BookDetailSerializer(
                    book,
                    data=update_data,
                    partial=True
                )

                if update_serializer.is_valid():
                    updated_book = update_serializer.save()
                    print(f"   ✓ Libro actualizado exitosamente")
                    print(f"   ✓ Nuevo archivo: {updated_book.file.name}")

                    # Limpiar: eliminar el libro de prueba
                    print("\n7. Limpieza...")
                    updated_book.delete()
                    print(f"   ✓ Libro de prueba eliminado")

                    print("\n" + "=" * 80)
                    print("✅ TODAS LAS PRUEBAS PASARON EXITOSAMENTE")
                    print("=" * 80)
                    return True
                else:
                    print(f"   ✗ Error al actualizar: {update_serializer.errors}")
                    book.delete()
                    return False
            else:
                print(f"   ✗ El archivo NO existe físicamente")
                book.delete()
                return False
        else:
            print(f"   ✗ No se guardó el archivo PDF")
            book.delete()
            return False
    else:
        print(f"   ✗ Error de validación: {serializer.errors}")
        return False

if __name__ == '__main__':
    try:
        success = test_pdf_upload()
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"\n❌ ERROR INESPERADO: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
