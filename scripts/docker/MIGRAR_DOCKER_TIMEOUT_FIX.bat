@echo off
echo ========================================
echo Migracion Docker con Fix de Timeouts
echo ========================================
echo.

echo Configurando timeouts extendidos para Docker Compose...
set COMPOSE_HTTP_TIMEOUT=300
set DOCKER_CLIENT_TIMEOUT=300
echo - COMPOSE_HTTP_TIMEOUT=300 (5 minutos)
echo - DOCKER_CLIENT_TIMEOUT=300 (5 minutos)
echo.

echo [1/7] Deteniendo servicios Docker (con timeout extendido)...
docker compose down --timeout 120
if %ERRORLEVEL% NEQ 0 (
    echo WARNING: Error al detener servicios, intentando forzar...
    docker compose kill
    docker compose rm -f
)
echo OK - Servicios detenidos
echo.

echo [2/7] Limpiando recursos Docker antiguos...
echo Limpiando contenedores detenidos...
docker container prune -f
echo Limpiando redes no utilizadas...
docker network prune -f
echo OK - Recursos limpiados
echo.

echo [3/7] Reconstruyendo imagen del BACKEND...
docker compose build --no-cache backend
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Fallo la reconstruccion del backend
    pause
    exit /b 1
)
echo OK - Backend reconstruido
echo.

echo [4/7] Reconstruyendo imagen del FRONTEND (esto puede tomar varios minutos)...
docker compose build --no-cache --progress=plain frontend
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Fallo la reconstruccion del frontend
    pause
    exit /b 1
)
echo OK - Frontend reconstruido
echo.

echo [5/7] Iniciando servicios de infraestructura primero...
docker compose up -d db redis elasticsearch
echo Esperando que los servicios de infraestructura esten listos (30 segundos)...
timeout /t 30 /nobreak
echo.

echo [6/7] Iniciando backend...
docker compose up -d backend
echo Esperando que el backend este listo (20 segundos)...
timeout /t 20 /nobreak
echo.

echo [7/7] Iniciando frontend...
docker compose up -d frontend
echo Esperando que el frontend este listo (20 segundos)...
timeout /t 20 /nobreak
echo.

echo ========================================
echo Aplicando migraciones de base de datos
echo ========================================
docker compose exec backend python manage.py migrate
if %ERRORLEVEL% NEQ 0 (
    echo WARNING: Error al aplicar migraciones
    echo Intentando nuevamente con mas detalle...
    docker compose exec backend python manage.py migrate --verbosity 2
)
echo.

echo ========================================
echo Verificando estado final
echo ========================================
docker compose ps
echo.

echo ========================================
echo Migracion completada!
echo ========================================
echo.
echo Los servicios estan corriendo en:
echo - Frontend: http://localhost:3000
echo - Backend API: http://localhost:8000
echo - PostgreSQL: localhost:5432
echo - Redis: localhost:6379
echo - Elasticsearch: http://localhost:9200
echo.
echo Para ver logs: docker compose logs -f [servicio]
echo Para detener: docker compose down
echo.
pause
