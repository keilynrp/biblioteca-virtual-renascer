@echo off
echo ========================================
echo Limpieza Completa de Docker
echo ========================================
echo.
echo ADVERTENCIA: Esto eliminara:
echo - Todos los contenedores detenidos
echo - Todas las imagenes no utilizadas
echo - Todas las redes no utilizadas
echo - Cache de build
echo.
echo Los volumenes (datos) NO seran eliminados.
echo.
set /p confirm="¿Continuar con la limpieza? (S/N): "
if /i not "%confirm%"=="S" (
    echo Operacion cancelada
    pause
    exit /b 0
)
echo.

echo [1/6] Deteniendo todos los contenedores del proyecto...
docker compose down --timeout 120
if %ERRORLEVEL% NEQ 0 (
    docker compose kill
    docker compose rm -f
)
echo.

echo [2/6] Eliminando contenedores detenidos...
docker container prune -f
echo.

echo [3/6] Eliminando imagenes no utilizadas...
docker image prune -a -f
echo.

echo [4/6] Eliminando redes no utilizadas...
docker network prune -f
echo.

echo [5/6] Eliminando cache de build...
docker builder prune -a -f
echo.

echo [6/6] Mostrando espacio liberado...
docker system df
echo.

echo ========================================
echo Limpieza completada!
echo ========================================
echo.
echo Siguiente paso: MIGRAR_DOCKER_TIMEOUT_FIX.bat
echo.
pause
