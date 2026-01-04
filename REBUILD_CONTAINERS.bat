@echo off
echo ============================================================
echo Verificando y Reconstruyendo Contenedores Docker
echo ============================================================
echo.

echo [1] Verificando estado actual de contenedores...
echo.
docker ps -a

echo.
echo ============================================================
echo [2] Deteniendo todos los contenedores...
echo ============================================================
docker compose down

echo.
echo ============================================================
echo [3] Limpiando volumenes huerfanos (opcional)...
echo ============================================================
docker volume prune -f

echo.
echo ============================================================
echo [4] Reconstruyendo imagenes desde cero...
echo ============================================================
docker compose build --no-cache

echo.
echo ============================================================
echo [5] Iniciando servicios en orden...
echo ============================================================

echo.
echo [5.1] Iniciando PostgreSQL y Elasticsearch...
docker compose up -d db elasticsearch
echo Esperando 15 segundos...
timeout /t 15 /nobreak >nul

echo.
echo [5.2] Iniciando Backend...
docker compose up -d backend
echo Esperando 10 segundos...
timeout /t 10 /nobreak >nul

echo.
echo [5.3] Ejecutando migraciones...
docker compose exec backend python manage.py migrate

echo.
echo [5.4] Iniciando Frontend...
docker compose up -d frontend
echo Esperando 10 segundos...
timeout /t 10 /nobreak >nul

echo.
echo ============================================================
echo [6] Estado final de contenedores
echo ============================================================
docker compose ps

echo.
echo ============================================================
echo Reconstruccion completada!
echo ============================================================
echo.
echo Accede a:
echo   - Frontend: http://localhost:3000
echo   - Backend: http://localhost:8000
echo   - Admin: http://localhost:8000/admin
echo.

pause
