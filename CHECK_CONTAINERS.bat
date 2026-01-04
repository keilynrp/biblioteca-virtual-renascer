@echo off
echo ============================================================
echo Estado de Contenedores Docker
echo ============================================================
echo.

echo [1] Contenedores en ejecucion:
echo ============================================================
docker ps

echo.
echo [2] Todos los contenedores (incluidos detenidos):
echo ============================================================
docker ps -a

echo.
echo [3] Imagenes disponibles:
echo ============================================================
docker images

echo.
echo [4] Volumenes:
echo ============================================================
docker volume ls

echo.
echo [5] Redes:
echo ============================================================
docker network ls

echo.
echo [6] Uso de recursos:
echo ============================================================
docker stats --no-stream

echo.
echo [7] Estado de Docker Compose:
echo ============================================================
docker compose ps

echo.
echo ============================================================
echo Logs recientes (ultimas 20 lineas de cada servicio):
echo ============================================================

echo.
echo --- Backend ---
docker compose logs --tail=20 backend

echo.
echo --- Frontend ---
docker compose logs --tail=20 frontend

echo.
echo --- Database ---
docker compose logs --tail=20 db

echo.
pause
