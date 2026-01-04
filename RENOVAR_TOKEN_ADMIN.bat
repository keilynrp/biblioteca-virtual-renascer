@echo off
REM Renovar token de usuario admin
echo ============================================
echo    RENOVAR TOKEN DE USUARIO ADMIN
echo ============================================
echo.

echo Ejecutando script de renovacion de token...
wsl bash -c "cd /mnt/d/bvs_framework && chmod +x renovar-token-admin.sh && ./renovar-token-admin.sh"

echo.
pause
