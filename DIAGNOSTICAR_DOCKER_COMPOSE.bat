@echo off
REM Script para diagnosticar Docker Compose desde Windows

echo ========================================
echo   DIAGNOSTICO DOCKER COMPOSE
echo ========================================
echo.

echo Ejecutando diagnostico desde WSL...
echo.

wsl bash -c "cd /mnt/d/bvs_framework && chmod +x diagnosticar-docker-compose.sh && ./diagnosticar-docker-compose.sh"

echo.
echo ========================================
echo   DIAGNOSTICO COMPLETADO
echo ========================================
echo.
pause
