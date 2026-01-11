@echo off
REM Script para corregir el error de hidratación en React/Next.js
REM Error: "A tree hydrated but some attributes of the server rendered HTML didn't match the client properties"

echo ========================================
echo   Fix para Error de Hidratacion
echo ========================================
echo.
echo Este script corregira el error de hidratacion en el layout del dashboard.
echo.
echo Problema: Los IDs de Radix UI no coinciden entre servidor y cliente
echo Solucion: Agregar suppressHydrationWarning y sincronizar estados
echo.
pause

echo.
echo [INFO] Aplicando correcciones al layout...
echo.

REM Aplicar el fix usando WSL
wsl bash /mnt/d/bvs_framework/fix-hydration.sh

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   Correccion Aplicada
    echo ========================================
    echo.
    echo El error de hidratacion ha sido corregido.
    echo Reinicia el servidor de desarrollo para ver los cambios.
    echo.
    echo Comando: docker-compose restart frontend
    echo.
) else (
    echo.
    echo ========================================
    echo   Error al Aplicar Correccion
    echo ========================================
    echo.
    echo Revisa los mensajes anteriores para mas detalles.
    echo.
)

pause
