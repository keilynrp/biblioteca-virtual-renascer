@echo off
echo ============================================================
echo Diagnostico del Frontend
echo ============================================================
echo.

echo [1] Estado del contenedor frontend:
echo ============================================================
docker compose ps frontend

echo.
echo [2] Logs del frontend (ultimas 50 lineas):
echo ============================================================
docker compose logs --tail=50 frontend

echo.
echo [3] Verificando si el frontend esta respondiendo:
echo ============================================================
curl -s -o nul -w "HTTP Status: %%{http_code}\n" http://localhost:3000 2>nul || echo No responde

echo.
echo [4] Procesos dentro del contenedor frontend:
echo ============================================================
docker compose exec frontend ps aux 2>nul || echo Contenedor no esta corriendo

echo.
echo [5] Espacio en disco del contenedor:
echo ============================================================
docker compose exec frontend df -h 2>nul || echo Contenedor no esta corriendo

echo.
echo [6] Uso de recursos del contenedor:
echo ============================================================
docker stats --no-stream frontend 2>nul || echo Contenedor no esta corriendo

echo.
echo ============================================================
echo Opciones:
echo ============================================================
echo.
echo 1. Reiniciar solo el frontend:
echo    docker compose restart frontend
echo.
echo 2. Reconstruir solo el frontend:
echo    docker compose up -d --build --force-recreate frontend
echo.
echo 3. Ver logs en tiempo real:
echo    docker compose logs -f frontend
echo.
echo 4. Entrar al contenedor:
echo    docker compose exec frontend sh
echo.

pause
