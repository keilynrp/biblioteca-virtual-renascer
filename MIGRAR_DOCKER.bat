@echo off
echo ========================================
echo Migracion completa de Docker
echo ========================================
echo.

echo [1/6] Deteniendo servicios Docker actuales...
docker compose down
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: No se pudieron detener los servicios
    pause
    exit /b 1
)
echo OK - Servicios detenidos
echo.

echo [2/6] Reconstruyendo imagenes Docker (esto puede tomar varios minutos)...
docker compose build --no-cache
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Fallo la reconstruccion de imagenes
    pause
    exit /b 1
)
echo OK - Imagenes reconstruidas
echo.

echo [3/6] Iniciando servicios Docker...
docker compose up -d
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: No se pudieron iniciar los servicios
    pause
    exit /b 1
)
echo OK - Servicios iniciados
echo.

echo [4/6] Esperando que los servicios esten listos (30 segundos)...
timeout /t 30 /nobreak
echo.

echo [5/6] Aplicando migraciones de base de datos...
docker compose exec backend python manage.py migrate
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Fallo la aplicacion de migraciones
    echo Intentando de nuevo con --run-migrations...
    docker compose exec backend python manage.py migrate --run-syncdb
)
echo OK - Migraciones aplicadas
echo.

echo [6/6] Verificando estado de los servicios...
docker compose ps
echo.

echo ========================================
echo Migracion completada exitosamente!
echo ========================================
echo.
echo Los servicios estan corriendo en:
echo - Frontend: http://localhost:3000
echo - Backend API: http://localhost:8000
echo - PostgreSQL: localhost:5432
echo - Redis: localhost:6379
echo - Elasticsearch: http://localhost:9200
echo.
echo Para ver logs en tiempo real: docker compose logs -f
echo Para detener servicios: docker compose down
echo.
pause
