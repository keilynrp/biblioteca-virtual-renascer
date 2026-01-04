#!/bin/bash

# Script Shell para obtener libros de prueba
echo "============================================================"
echo "Obteniendo Libro de Prueba para el Lector PDF"
echo "============================================================"
echo ""

echo "Buscando libros con archivos PDF..."
echo ""

# Python script para listar libros
shell_command="
from apps.content.models import Book

books = Book.objects.exclude(file='')

print('')
print('=' * 70)
print('LIBROS CON PDF DISPONIBLES:')
print('=' * 70)
print('')

if books.exists():
    for i, book in enumerate(books[:10], 1):
        author_name = book.author.name if book.author else 'Desconocido'
        print(f'{i:2d}. ID: {book.id:3d} | {book.title[:45]:45s} | {author_name[:20]:20s}')

    print('')
    print('=' * 70)
    print(f'Total de libros con PDF: {books.count()}')
    print('=' * 70)
    print('')

    if books.count() > 0:
        first_book = books.first()
        print('Para probar el lector, usa este enlace:')
        print(f'http://localhost:3000/reader/{first_book.id}')
        print('')
        print('O elige cualquier ID de la lista anterior y usa:')
        print('http://localhost:3000/reader/ID_DEL_LIBRO')

else:
    print('No se encontraron libros con archivos PDF.')
    print('')
    print('Para agregar libros:')
    print('1. Ve a http://localhost:8000/admin')
    print('2. Login con tu superusuario')
    print('3. Crea un libro y sube un archivo PDF')

print('')
"

docker compose exec backend python manage.py shell -c "$shell_command"

echo ""
echo "============================================================"
echo ""

if [ $? -eq 0 ]; then
    echo "✓ Consulta completada exitosamente"
else
    echo "✗ Error al consultar la base de datos"
    echo ""
    echo "Verifica que:"
    echo "  1. Los servicios estén corriendo: docker compose ps"
    echo "  2. La migración se haya ejecutado: ./iniciar-sprint6.sh"
fi

echo ""
