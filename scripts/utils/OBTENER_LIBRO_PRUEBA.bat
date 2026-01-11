@echo off
echo ============================================================
echo Obteniendo Libro de Prueba para el Lector PDF
echo ============================================================
echo.

echo Buscando libros con archivos PDF...
echo.

docker compose exec backend python manage.py shell -c "from apps.content.models import Book; books = Book.objects.exclude(file=''); print(''); print('=' * 60); print('LIBROS CON PDF DISPONIBLES:'); print('=' * 60); print(''); [print(f'ID: {b.id:3d} | Titulo: {b.title[:50]:50s} | Archivo: {str(b.file)[:30]}') for b in books[:10]]; print(''); print('=' * 60); print(f'Total de libros con PDF: {books.count()}'); print('=' * 60); print(''); print('Para probar el lector, usa uno de estos IDs:'); print('http://localhost:3000/reader/ID_DEL_LIBRO'); print('')"

echo.
echo ============================================================
echo.
echo Si no hay libros con PDF, puedes:
echo   1. Ir a http://localhost:8000/admin
echo   2. Login con tu superusuario
echo   3. Crear un libro y subir un archivo PDF
echo.
echo O ejecutar el importador de OpenLibrary:
echo   docker compose exec backend python manage.py import_openlibrary
echo.
pause
