@echo off
echo ========================================
echo Rollback a configuracion anterior
echo ========================================
echo.
echo ADVERTENCIA: Esto revertira docker-compose.yml
echo a la version basica sin optimizaciones.
echo.
set /p confirm="¿Estas seguro? (S/N): "
if /i not "%confirm%"=="S" (
    echo Operacion cancelada
    pause
    exit /b 0
)
echo.

echo [1/4] Deteniendo servicios...
docker compose down
echo.

echo [2/4] Revirtiendo docker-compose.yml...
copy /Y docker-compose.fixed.yml docker-compose.yml
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: No se pudo copiar la configuracion basica
    pause
    exit /b 1
)
echo OK - Configuracion revertida
echo.

echo [3/4] Iniciando servicios con configuracion basica...
docker compose up -d
echo.

echo [4/4] Verificando servicios...
timeout /t 10 /nobreak
docker compose ps
echo.

echo ========================================
echo Rollback completado
echo ========================================
echo.
echo Se ha revertido a la configuracion basica.
echo Para volver a aplicar las optimizaciones, ejecuta MIGRAR_DOCKER.bat
echo.
pause
