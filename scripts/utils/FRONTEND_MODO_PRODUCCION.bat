@echo off
cls
echo ========================================
echo   FRONTEND - MODO PRODUCCION
echo ========================================
echo.
echo Este script construye y sirve el frontend
echo en modo PRODUCCION para carga INSTANTANEA.
echo.
echo VENTAJAS:
echo   ✓ Carga INSTANTANEA (sin compilacion)
echo   ✓ Rendimiento optimo
echo   ✓ Experiencia de produccion
echo.
echo DESVENTAJA:
echo   ✗ Sin hot-reload (rebuild para cambios)
echo.
echo ¿Continuar? (Ctrl+C para cancelar)
pause >nul

echo.
echo [1/4] Deteniendo frontend actual...
wsl docker compose stop frontend

echo.
echo [2/4] Construyendo aplicacion (esto toma 2-3 min)...
wsl docker compose run --rm frontend npm run build
if %errorlevel% neq 0 (
    echo.
    echo ✗ Error en el build
    echo.
    pause
    exit /b 1
)

echo.
echo [3/4] Iniciando en modo produccion...
wsl docker compose up -d frontend

echo.
echo [4/4] Esperando que inicie (30 seg)...
timeout /t 30 /nobreak >nul

echo.
echo ========================================
echo   ✓ FRONTEND CORRIENDO EN PRODUCCION
echo ========================================
echo.
echo URL: http://localhost:3000
echo.
echo ✓ Carga: INSTANTANEA
echo ✓ Sin tiempos de compilacion
echo ✓ Rendimiento maximo
echo.
echo Para volver a modo desarrollo:
echo   wsl docker compose restart frontend
echo.
echo Verificando estado...
wsl docker compose ps frontend
echo.
pause
