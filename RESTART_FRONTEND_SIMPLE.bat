@echo off
echo ============================================================
echo REINICIO RAPIDO DEL FRONTEND
echo ============================================================
echo.

echo [1] Deteniendo frontend...
wsl -d Ubuntu -e bash -c "cd /mnt/d/bvs_framework && docker compose stop frontend"

echo.
echo [2] Eliminando contenedor frontend...
wsl -d Ubuntu -e bash -c "cd /mnt/d/bvs_framework && docker compose rm -f frontend"

echo.
echo [3] Iniciando frontend nuevamente...
wsl -d Ubuntu -e bash -c "cd /mnt/d/bvs_framework && docker compose up -d frontend"

echo.
echo [4] Esperando 15 segundos...
timeout /t 15 /nobreak >nul

echo.
echo ============================================================
echo ESTADO
echo ============================================================
wsl -d Ubuntu -e bash -c "cd /mnt/d/bvs_framework && docker compose ps frontend"

echo.
echo ============================================================
echo LOGS DEL FRONTEND
echo ============================================================
wsl -d Ubuntu -e bash -c "cd /mnt/d/bvs_framework && docker compose logs --tail=30 frontend"

echo.
echo Para ver logs en tiempo real:
echo   wsl -d Ubuntu -e bash -c "cd /mnt/d/bvs_framework && docker compose logs -f frontend"
echo.

pause
