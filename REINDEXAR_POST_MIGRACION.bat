@echo off
echo ========================================
echo Reindexacion de Elasticsearch
echo ========================================
echo.

echo Este script reindexara todos los libros en Elasticsearch
echo despues de la migracion.
echo.

echo [1/4] Verificando que Elasticsearch este corriendo...
curl -s http://localhost:9200/_cluster/health | findstr /C:"status"
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Elasticsearch no esta disponible
    echo Inicia los servicios con: docker compose up -d
    pause
    exit /b 1
)
echo OK - Elasticsearch disponible
echo.

echo [2/4] Eliminando indices existentes...
docker compose exec backend python manage.py search_index --delete -f
echo.

echo [3/4] Creando nuevos indices...
docker compose exec backend python manage.py search_index --create
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: No se pudieron crear los indices
    pause
    exit /b 1
)
echo OK - Indices creados
echo.

echo [4/4] Poblando indices con datos de la base de datos...
docker compose exec backend python manage.py search_index --populate
if %ERRORLEVEL% NEQ 0 (
    echo WARNING: Hubo errores al poblar los indices
    echo Puede que no haya datos en la base de datos aun
) else (
    echo OK - Indices poblados exitosamente
)
echo.

echo ========================================
echo Reindexacion completada
echo ========================================
echo.
echo Verifica que la busqueda funcione en: http://localhost:8000/api/books/search/?q=test
echo.
pause
