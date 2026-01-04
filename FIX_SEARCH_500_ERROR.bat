@echo off
color 0C
echo.
echo ============================================================
echo    FIX ERROR 500 EN BUSQUEDA - ELASTICSEARCH
echo ============================================================
echo.
echo PROBLEMA DETECTADO:
echo   ❌ Error 500 al usar el search bar
echo   ❌ Backend no puede conectar con Elasticsearch
echo.
echo POSIBLES CAUSAS:
echo   1. Elasticsearch no esta corriendo
echo   2. Indice 'books' no existe
echo   3. Libros no estan indexados
echo.
echo ============================================================
echo.
pause

echo.
echo [1/6] Verificando estado de Elasticsearch...
echo.
docker compose ps elasticsearch
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Elasticsearch no esta corriendo
    echo Iniciando Elasticsearch...
    docker compose up -d elasticsearch
    timeout /t 30
) else (
    echo ✅ Elasticsearch esta corriendo
)
echo.

echo [2/6] Esperando a que Elasticsearch este listo...
echo.
timeout /t 15
echo.

echo [3/6] Verificando conexion a Elasticsearch...
echo.
curl -s http://localhost:9200
echo.
echo.

echo [4/6] Verificando si el indice 'books' existe...
echo.
curl -s http://localhost:9200/books 2>nul | findstr /C:"\"error\"" >nul
if %ERRORLEVEL% EQU 0 (
    echo ❌ Indice 'books' NO existe
    echo Necesitamos crear el indice e indexar los libros
    echo.
    echo Ejecutando script de indexacion...
    docker compose exec -T backend python -c "from apps.content.documents import BookDocument; BookDocument.init(); print('Index created')"
    echo.
) else (
    echo ✅ Indice 'books' existe
)
echo.

echo [5/6] Verificando cuantos libros estan indexados...
echo.
curl -s http://localhost:9200/books/_count
echo.
echo.

echo [6/6] Indexando todos los libros en Elasticsearch...
echo.
docker compose exec backend python backend/scripts/index_books_to_elasticsearch.py
echo.

echo ============================================================
echo    VERIFICACION FINAL
echo ============================================================
echo.

echo Probando endpoint de autocomplete...
curl -s "http://localhost:8000/api/content/search/autocomplete/?q=harry"
echo.
echo.

echo Probando endpoint de busqueda...
curl -s "http://localhost:8000/api/content/search/?q=harry&page=1&page_size=5"
echo.
echo.

echo ============================================================
echo    FIX COMPLETADO
echo ============================================================
echo.
echo AHORA DEBES:
echo.
echo   1. Abrir: http://localhost:3000/dashboard
echo.
echo   2. Hard refresh: Ctrl + Shift + R
echo.
echo   3. PROBAR SEARCH BAR:
echo      - Escribe "harry" en el search bar
echo      - Deben aparecer sugerencias
echo      - No debe haber error 500
echo.
echo   4. Si aun hay error 500:
echo      - Abre DevTools (F12)
echo      - Ve a Console tab
echo      - Copia el error completo
echo      - Compartelo conmigo
echo.
echo ============================================================
echo.
echo Informacion tecnica:
echo.
echo   Elasticsearch URL: http://localhost:9200
echo   Indice: books
echo   Backend URL: http://localhost:8000
echo.
echo   Endpoints:
echo   - GET /api/content/search/autocomplete/?q=harry
echo   - GET /api/content/search/?q=harry^&page=1
echo   - GET /api/content/search/facets/
echo.
echo ============================================================
echo.
pause
