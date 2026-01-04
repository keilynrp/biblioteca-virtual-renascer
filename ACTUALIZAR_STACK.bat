@echo off
REM Script para ejecutar la actualización del stack en WSL
REM Actualiza Node.js 22.20.0, Python 3.13.2 y Django 6.0

echo ========================================
echo   Actualizacion de Stack BVS Framework
echo ========================================
echo.
echo Este script ejecutara la actualizacion en WSL...
echo.
echo Versiones objetivo:
echo   - Python 3.13.2
echo   - Node.js 22.20.0
echo   - Django 6.0
echo.
echo ADVERTENCIA: Este proceso puede tardar varios minutos.
echo.
pause

echo.
echo [INFO] Iniciando actualizacion en WSL...
echo.

REM Hacer el script ejecutable y ejecutarlo en WSL
wsl chmod +x /mnt/d/bvs_framework/actualizar-stack.sh
wsl bash /mnt/d/bvs_framework/actualizar-stack.sh

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   Actualizacion Completada
    echo ========================================
    echo.
    echo Las versiones han sido actualizadas.
    echo Revisa el output anterior para ver los detalles.
    echo.
) else (
    echo.
    echo ========================================
    echo   Error en la Actualizacion
    echo ========================================
    echo.
    echo Ocurrio un error durante la actualizacion.
    echo Revisa los mensajes anteriores para mas detalles.
    echo.
)

pause
