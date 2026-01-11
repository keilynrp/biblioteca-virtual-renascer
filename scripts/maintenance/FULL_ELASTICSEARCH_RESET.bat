@echo off
color 0C
echo.
echo ============================================================
echo    RESET COMPLETO DE ELASTICSEARCH Y REINDEXACION
echo ============================================================
echo.
echo Este script va a:
echo   1. Verificar que Elasticsearch este corriendo
echo   2. ELIMINAR el indice 'books' existente (si hay)
echo   3. Crear el indice desde cero con mappings correctos
echo   4. Indexar todos los libros nuevamente
echo   5. Verificar que todo funcione
echo.
echo ATENCION: Esto eliminara los datos de busqueda existentes
echo y los recreara desde cero.
echo.
echo ============================================================
echo.
pause

echo.
echo [1/7] Verificando que Elasticsearch este corriendo...
echo.
docker compose ps elasticsearch
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Elasticsearch no esta corriendo
    echo Iniciando Elasticsearch...
    docker compose up -d elasticsearch
    echo Esperando 30 segundos...
    timeout /t 30 /nobreak
) else (
    echo ✅ Elasticsearch corriendo
)
echo.

echo [2/7] Verificando conexion...
echo.
curl -s http://localhost:9200
echo.
echo.

echo [3/7] Eliminando indice 'books' existente (si existe)...
echo.
curl -X DELETE "http://localhost:9200/books" 2>nul
echo.
echo ✅ Indice eliminado (o no existia)
echo.

echo [4/7] Creando indice 'books' con mappings correctos...
echo.
docker compose exec -T backend python -c "from apps.content.documents import BookDocument; BookDocument.init(); print('✅ Indice creado')"
echo.

echo [5/7] Verificando que el indice fue creado...
echo.
curl -s "http://localhost:9200/books/_mapping" | python -m json.tool
echo.
echo.

echo [6/7] Indexando TODOS los libros (esto puede tardar 1-2 minutos)...
echo.
docker compose exec backend python manage.py shell <<EOF
from apps.content.models import Book
from apps.content.documents import BookDocument

books = Book.objects.select_related('author', 'category').all()
total = books.count()
print(f'📚 Total de libros a indexar: {total}')

indexed = 0
errors = 0

for i, book in enumerate(books, 1):
    try:
        doc = BookDocument.from_django_model(book)
        doc.save()
        indexed += 1

        if i %% 10 == 0 or i == total:
            print(f'   Progreso: {i}/{total} ({indexed} indexados, {errors} errores)')
    except Exception as e:
        errors += 1
        print(f'   ❌ Error en libro "{book.title}": {str(e)[:50]}')

print(f'\n✅ Indexación completa: {indexed}/{total} libros indexados')
exit()
EOF
echo.

echo [7/7] Verificando indexacion...
echo.
echo Count de documentos:
curl -s "http://localhost:9200/books/_count" | python -m json.tool
echo.
echo.

echo Probando agregaciones:
curl -s -X POST "http://localhost:9200/books/_search?size=0" -H "Content-Type: application/json" -d "{\"aggs\":{\"categories\":{\"terms\":{\"field\":\"category_name.raw\",\"size\":5}},\"authors\":{\"terms\":{\"field\":\"author_name.raw\",\"size\":5}}}}" | python -m json.tool
echo.
echo.

echo ============================================================
echo    VERIFICACION FINAL - ENDPOINTS
echo ============================================================
echo.

echo [TEST 1] Autocomplete:
curl -s "http://localhost:8000/api/content/search/autocomplete/?q=harry" | python -m json.tool
echo.
echo.

echo [TEST 2] Busqueda:
curl -s "http://localhost:8000/api/content/search/?q=harry&page=1&page_size=3" | python -m json.tool
echo.
echo.

echo [TEST 3] Facetas:
curl -s "http://localhost:8000/api/content/search/facets/" | python -m json.tool
echo.
echo.

echo ============================================================
echo    RESET COMPLETADO
echo ============================================================
echo.
echo AHORA DEBES:
echo.
echo   1. Verificar arriba que:
echo      - Count sea 49 (o el numero de libros que tengas)
echo      - Agregaciones muestren categorias y autores
echo      - Autocomplete retorne sugerencias
echo      - Busqueda retorne resultados
echo      - Facetas retornen arrays con datos
echo.
echo   2. Abrir: http://localhost:3000/dashboard
echo.
echo   3. Hard refresh: Ctrl + Shift + R
echo.
echo   4. Probar SearchBar:
echo      - Escribir en el search bar
echo      - NO debe haber error 500
echo      - Deben aparecer sugerencias
echo.
echo   5. Abrir: http://localhost:3000/search?q=test
echo      - Deben aparecer resultados
echo      - Sidebar debe mostrar filtros (categorias, autores)
echo.
echo ============================================================
echo.
pause
