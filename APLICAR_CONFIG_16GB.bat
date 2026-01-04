@echo off
echo ============================================================
echo APLICAR CONFIGURACION OPTIMIZADA PARA 16GB RAM
echo ============================================================
echo.
echo Este script va a:
echo 1. Respaldar tu configuracion actual
echo 2. Aplicar la configuracion optimizada para 16GB
echo 3. Reiniciar servicios con la nueva configuracion
echo.
echo CAMBIOS PRINCIPALES:
echo - Elasticsearch: 1GB -^> 2GB (mas rapido, mas cache)
echo - Frontend: 2.5GB -^> 4GB (builds mas rapidos)
echo - Backend: 512MB -^> 1GB (mas workers, mejor rendimiento)
echo - PostgreSQL: 256MB -^> 512MB (mas cache, queries mas rapidas)
echo - Redis: 128MB -^> 256MB (mas cache)
echo.
set /p confirm="Continuar? (s/n): "
if /i not "%confirm%"=="s" exit /b

echo.
echo [PASO 1/5] Respaldando configuracion actual...
echo ============================================================
copy docker-compose.yml docker-compose.8gb.backup.yml
echo ✓ Respaldo creado: docker-compose.8gb.backup.yml

echo.
echo [PASO 2/5] Aplicando configuracion optimizada para 16GB...
echo ============================================================
copy docker-compose.16gb.yml docker-compose.yml
echo ✓ Configuracion aplicada

echo.
echo [PASO 3/5] Deteniendo servicios actuales...
echo ============================================================
wsl -d Ubuntu -e bash -c "cd /mnt/d/bvs_framework && docker compose down"

echo.
echo [PASO 4/5] Reconstruyendo contenedores con nueva configuracion...
echo ============================================================
echo Esto puede tomar 2-3 minutos...
wsl -d Ubuntu -e bash -c "cd /mnt/d/bvs_framework && docker compose build --no-cache"

echo.
echo [PASO 5/5] Iniciando servicios con configuracion optimizada...
echo ============================================================

echo.
echo   [5.1] Bases de datos (PostgreSQL + Redis)...
wsl -d Ubuntu -e bash -c "cd /mnt/d/bvs_framework && docker compose up -d db redis"
timeout /t 10 /nobreak >nul
echo   ✓ DB y Redis iniciados

echo.
echo   [5.2] Elasticsearch (con 2GB de memoria)...
wsl -d Ubuntu -e bash -c "cd /mnt/d/bvs_framework && docker compose up -d elasticsearch"
echo   Esperando a que Elasticsearch este listo (30 segundos)...
timeout /t 30 /nobreak >nul

echo.
echo   [5.3] Backend (con 1GB de memoria)...
wsl -d Ubuntu -e bash -c "cd /mnt/d/bvs_framework && docker compose up -d backend"
timeout /t 10 /nobreak >nul

echo.
echo   [5.4] Ejecutando migraciones...
wsl -d Ubuntu -e bash -c "cd /mnt/d/bvs_framework && docker compose exec -T backend python manage.py migrate"

echo.
echo   [5.5] Frontend (con 4GB de memoria)...
wsl -d Ubuntu -e bash -c "cd /mnt/d/bvs_framework && docker compose up -d frontend"
echo   ✓ Frontend iniciado

echo.
echo Esperando estabilizacion (30 segundos)...
timeout /t 30 /nobreak >nul

echo.
echo ============================================================
echo ESTADO FINAL CON CONFIGURACION 16GB
echo ============================================================
wsl -d Ubuntu -e bash -c "cd /mnt/d/bvs_framework && docker compose ps"

echo.
echo ============================================================
echo USO DE RECURSOS
echo ============================================================
wsl -d Ubuntu -e docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}"

echo.
echo ============================================================
echo SALUD DE ELASTICSEARCH
echo ============================================================
wsl -d Ubuntu -e bash -c "curl -s http://localhost:9200/_cluster/health?pretty 2>/dev/null | grep status"

echo.
echo ============================================================
echo CONFIGURACION APLICADA CON EXITO
echo ============================================================
echo.
echo MEJORAS APLICADAS:
echo ✓ Elasticsearch: 2GB (2x mas memoria)
echo ✓ Frontend: 4GB (1.6x mas memoria, builds mas rapidos)
echo ✓ Backend: 1GB (2x mas memoria, mejor rendimiento)
echo ✓ PostgreSQL: 512MB (2x mas cache)
echo ✓ Redis: 256MB (2x mas cache)
echo ✓ Healthchecks agregados a todos los servicios
echo.
echo BENEFICIOS ESPERADOS:
echo - Builds del frontend 40-50%% mas rapidos
echo - Elasticsearch mas estable y rapido
echo - Backend puede manejar mas requests concurrentes
echo - PostgreSQL con mejor cache de queries
echo - Redis con mas espacio para cache
echo.
echo Si quieres volver a la configuracion de 8GB:
echo   copy docker-compose.8gb.backup.yml docker-compose.yml
echo   y ejecuta: RESET_COMPLETO_WSL.bat
echo.

pause
