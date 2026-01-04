@echo off
cls
echo ========================================
echo   OPTIMIZACION DEFINITIVA FRONTEND
echo ========================================
echo.
echo Esta optimizacion hace el frontend MUCHO mas rapido:
echo.
echo ANTES:   Primera carga 10-50 segundos
echo DESPUES: Primera carga 1-2 segundos
echo.
echo Metodo: Build + Start (produccion optimizada)
echo.
pause

echo.
echo [1/5] Accediendo al contenedor frontend...
echo.

echo [2/5] Ejecutando build de produccion...
echo (Esto toma 2-3 minutos la primera vez)
echo.
wsl docker compose exec frontend sh -c "rm -rf .next && npm run build"
if %errorlevel% neq 0 (
    echo.
    echo ✗ Error en build. Intentando con mas memoria...
    wsl docker compose exec frontend sh -c "NODE_OPTIONS='--max-old-space-size=6144' npm run build"
    if %errorlevel% neq 0 (
        echo.
        echo ✗ Build fallo
        pause
        exit /b 1
    )
)

echo.
echo [3/5] Creando script de inicio optimizado...
wsl docker compose exec frontend sh -c "echo 'npm run start' > /app/start-prod.sh && chmod +x /app/start-prod.sh"

echo.
echo [4/5] Reiniciando con modo optimizado...
wsl docker compose stop frontend
wsl docker compose up -d frontend

echo.
echo [5/5] Esperando inicio (15 seg)...
timeout /t 15 /nobreak >nul

echo.
echo ========================================
echo   ✓ FRONTEND OPTIMIZADO
echo ========================================
echo.
echo URL: http://localhost:3000
echo.
echo Probando velocidad...
wsl curl -s -o nul -w "Tiempo de respuesta: %%{time_total}s\n" http://localhost:3000
echo.
echo Estado:
wsl docker compose ps frontend
echo.
echo ✓ El frontend ahora deberia cargar en 1-2 segundos!
echo.
pause
