@echo off
echo ========================================
echo Verificacion Post-Migracion Docker
echo ========================================
echo.

echo [1/7] Verificando estado de servicios Docker...
docker compose ps
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Docker compose no esta corriendo
    pause
    exit /b 1
)
echo.

echo [2/7] Verificando salud de contenedores...
docker compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
echo.

echo [3/7] Verificando migraciones de base de datos...
docker compose exec backend python manage.py showmigrations content
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: No se pudo verificar migraciones
)
echo.

echo [4/7] Verificando conectividad con PostgreSQL...
docker compose exec backend python manage.py dbshell --command "SELECT version();"
if %ERRORLEVEL% NEQ 0 (
    echo WARNING: No se pudo conectar a PostgreSQL
) else (
    echo OK - PostgreSQL conectado
)
echo.

echo [5/7] Verificando Elasticsearch...
curl -s http://localhost:9200/_cluster/health?pretty
if %ERRORLEVEL% NEQ 0 (
    echo WARNING: Elasticsearch no responde
) else (
    echo OK - Elasticsearch funcionando
)
echo.

echo [6/7] Verificando API del Backend...
curl -s http://localhost:8000/api/books/ | findstr /C:"results"
if %ERRORLEVEL% NEQ 0 (
    echo WARNING: API del backend no responde correctamente
) else (
    echo OK - API funcionando
)
echo.

echo [7/7] Verificando Frontend...
curl -s http://localhost:3000 | findstr /C:"html"
if %ERRORLEVEL% NEQ 0 (
    echo WARNING: Frontend no responde
) else (
    echo OK - Frontend funcionando
)
echo.

echo ========================================
echo Verificacion completada
echo ========================================
echo.
echo Si todos los checks pasaron, la migracion fue exitosa.
echo Si hay errores, revisa los logs con: docker compose logs [servicio]
echo.
pause
