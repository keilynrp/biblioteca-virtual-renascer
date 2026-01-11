@echo off
echo ========================================
echo   FRONTEND RAPIDO - Modo Produccion
echo ========================================
echo.
echo Este script inicia el frontend en modo produccion
echo para eliminar los tiempos de compilacion.
echo.
echo TRADE-OFF:
echo   ✓ Carga INSTANTANEA (sin compilacion)
echo   ✗ Sin hot-reload (necesitas rebuild para cambios)
echo.
pause

echo [1] Construyendo frontend en modo produccion...
wsl docker compose exec frontend npm run build
if %errorlevel% neq 0 (
    echo ✗ Error en build
    pause
    exit /b 1
)

echo.
echo [2] Deteniendo frontend actual...
wsl docker compose stop frontend

echo.
echo [3] Actualizando comando a modo produccion...
wsl docker compose up -d frontend

echo.
echo [4] Esperando que inicie...
timeout /t 10 /nobreak >nul

echo.
echo ========================================
echo   ✓ FRONTEND EN MODO PRODUCCION
echo ========================================
echo.
echo URL: http://localhost:3000
echo.
echo Carga: INSTANTANEA (sin compilacion)
echo.
echo Para volver a desarrollo:
echo   wsl docker compose restart frontend
echo.
pause
