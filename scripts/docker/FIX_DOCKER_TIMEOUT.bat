@echo off
echo ============================================================
echo Solucionando Timeout de Docker
echo ============================================================
echo.

echo [Opcion 1] Reintentar build con timeout mayor
echo ============================================================
echo.
echo Esto puede tomar mas tiempo, pero dara mas oportunidad
echo a Docker de descargar las imagenes.
echo.

set /p retry="Deseas reintentar el build? (s/n): "
if /i "%retry%"=="s" (
    echo.
    echo Reconstruyendo con configuracion de timeout extendida...
    echo.

    echo [1] Limpiando cache de build...
    docker builder prune -f

    echo.
    echo [2] Reconstruyendo backend con timeout extendido...
    set DOCKER_BUILDKIT=1
    set BUILDKIT_PROGRESS=plain
    docker compose build --no-cache --pull backend

    echo.
    echo [3] Reconstruyendo frontend...
    docker compose build --no-cache frontend

    echo.
    echo [4] Iniciando servicios...
    docker compose up -d

    echo.
    echo ============================================================
    echo Build completado
    echo ============================================================
    docker compose ps
)

echo.
echo ============================================================
echo Otras Soluciones:
echo ============================================================
echo.
echo 1. Verificar conexion a internet
echo 2. Desactivar temporalmente antivirus/firewall
echo 3. Usar imagenes en cache (sin rebuild):
echo    docker compose up -d
echo.
echo 4. Si usas VPN, desconectala temporalmente
echo.
echo 5. Cambiar DNS a Google DNS (8.8.8.8, 8.8.4.4)
echo.

pause
