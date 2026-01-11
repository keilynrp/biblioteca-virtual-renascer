@echo off
echo ========================================
echo Setup Completo Post-Migracion
echo ========================================
echo.
echo Este script realiza todas las tareas necesarias
echo despues de migrar Docker.
echo.
pause

echo.
echo [1/5] Aplicando migraciones de base de datos...
docker compose exec backend python manage.py migrate
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Fallo al aplicar migraciones
    pause
    exit /b 1
)
echo OK - Migraciones aplicadas
echo.

echo [2/5] Creando superusuario (si no existe)...
echo.
echo Ingresa los datos del superusuario:
docker compose exec backend python manage.py createsuperuser
echo.

echo [3/5] Reindexando Elasticsearch...
docker compose exec backend python manage.py search_index --delete -f
docker compose exec backend python manage.py search_index --create
docker compose exec backend python manage.py search_index --populate
if %ERRORLEVEL% NEQ 0 (
    echo WARNING: Error al reindexar (esto es normal si no hay datos)
)
echo.

echo [4/5] Verificando servicios...
docker compose ps
echo.

echo [5/5] Probando endpoints...
echo.
echo - API Health Check:
curl -s http://localhost:8000/api/
echo.
echo.
echo - Frontend:
curl -s http://localhost:3000 | findstr /C:"html"
if %ERRORLEVEL% NEQ 0 (
    echo WARNING: Frontend no responde
) else (
    echo OK - Frontend funcionando
)
echo.

echo ========================================
echo Setup completado!
echo ========================================
echo.
echo Accede a:
echo - Frontend: http://localhost:3000
echo - Admin Django: http://localhost:8000/admin/
echo - API: http://localhost:8000/api/
echo.
echo Siguiente paso recomendado:
echo - Importar libros de OpenLibrary: .\importar-libros-rapido.sh
echo.
pause
