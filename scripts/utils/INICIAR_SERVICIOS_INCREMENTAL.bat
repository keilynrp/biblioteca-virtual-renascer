@echo off
echo ========================================
echo Inicio Incremental de Servicios Docker
echo ========================================
echo.
echo Este script inicia los servicios uno por uno
echo para evitar timeouts por carga simultanea.
echo.

set COMPOSE_HTTP_TIMEOUT=300
set DOCKER_CLIENT_TIMEOUT=300

echo [1/5] Iniciando PostgreSQL...
docker compose up -d db
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: No se pudo iniciar PostgreSQL
    pause
    exit /b 1
)
echo OK - PostgreSQL iniciado
timeout /t 10 /nobreak
echo.

echo [2/5] Iniciando Redis...
docker compose up -d redis
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: No se pudo iniciar Redis
    pause
    exit /b 1
)
echo OK - Redis iniciado
timeout /t 5 /nobreak
echo.

echo [3/5] Iniciando Elasticsearch (esto puede tomar un momento)...
docker compose up -d elasticsearch
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: No se pudo iniciar Elasticsearch
    pause
    exit /b 1
)
echo OK - Elasticsearch iniciado
echo Esperando que Elasticsearch este listo (30 segundos)...
timeout /t 30 /nobreak
echo.

echo [4/5] Iniciando Backend...
docker compose up -d backend
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: No se pudo iniciar el Backend
    pause
    exit /b 1
)
echo OK - Backend iniciado
echo Esperando que el backend este listo (20 segundos)...
timeout /t 20 /nobreak
echo.

echo [5/5] Iniciando Frontend...
docker compose up -d frontend
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: No se pudo iniciar el Frontend
    echo.
    echo Si ves errores de timeout, prueba:
    echo 1. Aumentar memoria de Docker Desktop (minimo 4GB)
    echo 2. Reiniciar Docker Desktop
    echo 3. Ejecutar LIMPIAR_DOCKER.bat primero
    pause
    exit /b 1
)
echo OK - Frontend iniciado
timeout /t 15 /nobreak
echo.

echo ========================================
echo Verificando servicios
echo ========================================
docker compose ps
echo.

echo ========================================
echo Todos los servicios iniciados!
echo ========================================
echo.
echo - Frontend: http://localhost:3000
echo - Backend: http://localhost:8000
echo - PostgreSQL: localhost:5432
echo - Redis: localhost:6379
echo - Elasticsearch: http://localhost:9200
echo.
pause
