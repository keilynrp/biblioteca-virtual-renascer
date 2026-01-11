# Script PowerShell para obtener libros de prueba
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Obteniendo Libro de Prueba para el Lector PDF" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Buscando libros con archivos PDF..." -ForegroundColor Yellow
Write-Host ""

$shellCommand = @"
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
"@

docker compose exec backend python manage.py shell -c $shellCommand

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Consulta completada exitosamente" -ForegroundColor Green
} else {
    Write-Host "✗ Error al consultar la base de datos" -ForegroundColor Red
    Write-Host ""
    Write-Host "Verifica que:" -ForegroundColor Yellow
    Write-Host "  1. Los servicios estén corriendo: docker compose ps" -ForegroundColor White
    Write-Host "  2. La migración se haya ejecutado: .\iniciar-sprint6.ps1" -ForegroundColor White
}

Write-Host ""
pause
