@echo off
echo ============================================================
echo Solucionando Problemas del Frontend
echo ============================================================
echo.

echo [1] Deteniendo frontend actual...
docker compose stop frontend

echo.
echo [2] Eliminando contenedor frontend...
docker compose rm -f frontend

echo.
echo [3] Limpiando cache de npm dentro del volumen...
docker compose run --rm frontend npm cache clean --force

echo.
echo [4] Reconstruyendo imagen del frontend (sin cache)...
docker compose build --no-cache frontend

echo.
echo [5] Iniciando frontend con recreacion forzada...
docker compose up -d --force-recreate frontend

echo.
echo [6] Esperando 30 segundos para que compile...
timeout /t 30 /nobreak

echo.
echo [7] Verificando estado:
docker compose ps frontend

echo.
echo [8] Ultimos logs:
docker compose logs --tail=30 frontend

echo.
echo ============================================================
echo.
echo Frontend deberia estar disponible en: http://localhost:3000
echo.
echo Si aun no funciona, ejecuta:
echo   docker compose logs -f frontend
echo.
echo Para ver los logs en tiempo real.
echo.

pause
