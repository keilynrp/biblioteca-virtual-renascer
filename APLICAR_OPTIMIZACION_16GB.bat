@echo off
setlocal enabledelayedexpansion

echo ========================================
echo   APLICANDO OPTIMIZACION COMPLETA 16GB
echo ========================================
echo.

echo Este script va a:
echo 1. Configurar WSL para 10GB de RAM
echo 2. Aplicar optimizaciones Docker para 16GB
echo 3. Reconstruir y reiniciar contenedores
echo 4. Verificar el estado final
echo.
echo IMPORTANTE: Asegurate de tener 16GB de RAM fisica
echo.
pause

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
echo   PASO 1: CONFIGURANDO WSL
echo ========================================
echo.

echo [1.1] Verificando RAM del sistema...
wmic computersystem get totalphysicalmemory /value | find "TotalPhysicalMemory"
echo.

echo [1.2] Creando .wslconfig optimizado...
set WSLCONFIG=%USERPROFILE%\.wslconfig

echo [wsl2] > "%WSLCONFIG%"
echo memory=10GB >> "%WSLCONFIG%"
echo processors=4 >> "%WSLCONFIG%"
echo swap=4GB >> "%WSLCONFIG%"
echo localhostForwarding=true >> "%WSLCONFIG%"

echo Archivo creado: %WSLCONFIG%
type "%WSLCONFIG%"
echo.

echo [1.3] Apagando WSL...
wsl --shutdown
timeout /t 5 /nobreak >nul
echo WSL apagado. Esperando 5 segundos...
echo.

echo ========================================
echo   PASO 2: OPTIMIZACIONES DOCKER
echo ========================================
echo.

echo [2.1] Deteniendo contenedores actuales...
%DOCKER_COMPOSE% down
if %errorlevel% neq 0 (
    echo Error al detener contenedores
    pause
    exit /b 1
)
echo OK!
echo.

echo [2.2] Limpiando imagenes antiguas...
docker image prune -f
echo OK!
echo.

echo [2.3] Construyendo imagenes optimizadas para 16GB...
echo Esto puede tardar 5-10 minutos...
%DOCKER_COMPOSE% build --no-cache
if %errorlevel% neq 0 (
    echo Error al construir imagenes
    pause
    exit /b 1
)
echo OK!
echo.

echo [2.4] Creando volumenes persistentes...
docker volume create bvs_framework_postgres_data 2>nul
docker volume create bvs_framework_elasticsearch_data 2>nul
docker volume create bvs_framework_redis_data 2>nul
docker volume create bvs_framework_frontend_cache 2>nul
echo OK!
echo.

echo [2.5] Iniciando servicios optimizados...
%DOCKER_COMPOSE% up -d
if %errorlevel% neq 0 (
    echo Error al iniciar servicios
    pause
    exit /b 1
)
echo OK!
echo.

echo [2.6] Esperando que servicios esten saludables...
echo Esto puede tardar 60-90 segundos...
timeout /t 60 /nobreak >nul
echo.

echo ========================================
echo   PASO 3: VERIFICACION FINAL
echo ========================================
echo.

echo [3.1] Estado de contenedores:
echo ----------------------------------------
%DOCKER_COMPOSE% ps
echo.

echo [3.2] Uso de recursos:
echo ----------------------------------------
docker stats --no-stream
echo.

echo [3.3] Verificando Elasticsearch...
echo ----------------------------------------
curl -s http://localhost:9200/_cluster/health?pretty 2>nul || echo "Elasticsearch no responde aun (espera 30s mas)"
echo.

echo ========================================
echo   OPTIMIZACION 16GB COMPLETADA
echo ========================================
echo.
echo Configuracion aplicada:
echo - WSL: 10GB de RAM asignados
echo - Frontend: 4GB (antes 3GB)
echo - Elasticsearch: 2GB (antes 1.5GB)
echo - Backend: 1GB (optimizado)
echo - PostgreSQL: 512MB (optimizado)
echo - Redis: 256MB (optimizado)
echo.
echo Total Docker: ~7.8GB / 16GB (49%%)
echo Margen disponible: ~8GB
echo.
echo Comandos utiles:
echo   %DOCKER_COMPOSE% logs -f          Ver logs en tiempo real
echo   docker stats                       Ver uso de recursos
echo   %DOCKER_COMPOSE% ps                Ver estado de servicios
echo   %DOCKER_COMPOSE% restart [servicio] Reiniciar un servicio
echo.
echo Documentacion completa: OPTIMIZACION_16GB_APLICADA.md
echo.
pause
