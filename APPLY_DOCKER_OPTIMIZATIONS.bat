@echo off
setlocal enabledelayedexpansion

REM Detectar si usar docker-compose o docker compose
docker-compose version >nul 2>&1
if %errorlevel% equ 0 (
    set DOCKER_COMPOSE=docker-compose
) else (
    docker compose version >nul 2>&1
    if %errorlevel% equ 0 (
        set DOCKER_COMPOSE=docker compose
    ) else (
        echo Error: Ni docker-compose ni docker compose estan disponibles
        pause
        exit /b 1
    )
)

echo ========================================
echo    APLICANDO OPTIMIZACIONES DE DOCKER
echo ========================================
echo Usando: %DOCKER_COMPOSE%
echo.

echo [1/6] Deteniendo contenedores actuales...
%DOCKER_COMPOSE% down
if %errorlevel% neq 0 (
    echo Error al detener contenedores
    pause
    exit /b 1
)
echo OK!
echo.

echo [2/6] Limpiando imagenes antiguas...
docker image prune -f
echo OK!
echo.

echo [3/6] Construyendo nuevas imagenes con optimizaciones...
%DOCKER_COMPOSE% build --no-cache
if %errorlevel% neq 0 (
    echo Error al construir imagenes
    pause
    exit /b 1
)
echo OK!
echo.

echo [4/6] Creando volumenes persistentes...
docker volume create bvs_framework_postgres_data 2>nul
docker volume create bvs_framework_elasticsearch_data 2>nul
docker volume create bvs_framework_redis_data 2>nul
docker volume create bvs_framework_frontend_cache 2>nul
echo OK!
echo.

echo [5/6] Iniciando servicios optimizados...
%DOCKER_COMPOSE% up -d
if %errorlevel% neq 0 (
    echo Error al iniciar servicios
    pause
    exit /b 1
)
echo OK!
echo.

echo [6/6] Esperando que los servicios esten saludables...
timeout /t 30 /nobreak >nul
echo.

echo ========================================
echo      VERIFICANDO ESTADO DE SERVICIOS
echo ========================================
%DOCKER_COMPOSE% ps
echo.

echo ========================================
echo      USO DE RECURSOS
echo ========================================
docker stats --no-stream
echo.

echo ========================================
echo    OPTIMIZACIONES APLICADAS CON EXITO
echo ========================================
echo.
echo Para ver los logs en tiempo real:
echo   %DOCKER_COMPOSE% logs -f
echo.
echo Para ver el uso de recursos:
echo   docker stats
echo.
echo Para detener los servicios:
echo   %DOCKER_COMPOSE% down
echo.
echo Documentacion completa: DOCKER_OPTIMIZATIONS.md
echo.
pause
