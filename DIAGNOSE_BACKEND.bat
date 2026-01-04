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
echo    DIAGNOSTICO DEL BACKEND
echo ========================================
echo.

echo [1] Estado de contenedores:
echo ----------------------------------------
%DOCKER_COMPOSE% ps
echo.

echo [2] Logs del backend (ultimas 50 lineas):
echo ----------------------------------------
%DOCKER_COMPOSE% logs backend --tail=50
echo.

echo [3] Verificando si el backend esta corriendo:
echo ----------------------------------------
%DOCKER_COMPOSE% exec -T backend ps aux 2>nul || echo Backend no esta corriendo
echo.

echo [4] Verificando archivos en /app:
echo ----------------------------------------
%DOCKER_COMPOSE% exec -T backend ls -la /app 2>nul || echo No se puede acceder al backend
echo.

echo [5] Verificando si manage.py existe:
echo ----------------------------------------
%DOCKER_COMPOSE% exec -T backend test -f /app/manage.py && echo "manage.py existe" || echo "manage.py NO existe"
echo.

echo [6] Intentando ejecutar manage.py:
echo ----------------------------------------
%DOCKER_COMPOSE% exec -T backend python manage.py --version 2>nul || echo "Error al ejecutar manage.py"
echo.

echo [7] Verificando conectividad a base de datos:
echo ----------------------------------------
%DOCKER_COMPOSE% exec -T db pg_isready -U postgres 2>nul || echo "Base de datos no esta lista"
echo.

echo [8] Verificando conectividad a Redis:
echo ----------------------------------------
%DOCKER_COMPOSE% exec -T redis redis-cli ping 2>nul || echo "Redis no esta listo"
echo.

echo [9] Verificando conectividad a Elasticsearch:
echo ----------------------------------------
%DOCKER_COMPOSE% exec -T elasticsearch curl -f http://localhost:9200/_cluster/health 2>nul || echo "Elasticsearch no esta listo"
echo.

echo ========================================
echo    DIAGNOSTICO COMPLETO
echo ========================================
echo.
echo Si ves errores arriba, revisa FIX_BACKEND_UNHEALTHY.md
echo.
pause
