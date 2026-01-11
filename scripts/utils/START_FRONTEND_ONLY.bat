@echo off
echo ============================================================
echo Iniciando Solo el Frontend
echo ============================================================
echo.

echo [1] Deteniendo frontend si esta corriendo...
docker compose stop frontend 2>nul

echo.
echo [2] Eliminando contenedor anterior...
docker compose rm -f frontend 2>nul

echo.
echo [3] Iniciando frontend con configuracion optimizada...
echo    (Memoria: 2.5GB, Node: 2048MB)
docker compose up -d frontend

echo.
echo [4] Mostrando logs en tiempo real...
echo ============================================================
echo.
echo ESPERA A VER: "Ready in X ms" o "compiled successfully"
echo Luego presiona Ctrl+C para salir
echo.
echo Accede a: http://localhost:3000
echo.
echo ============================================================
echo.

docker compose logs -f frontend
