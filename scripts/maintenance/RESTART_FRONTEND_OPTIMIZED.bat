@echo off
echo ============================================================
echo Reiniciando Frontend con Configuracion Optimizada
echo ============================================================
echo.

echo Cambios aplicados:
echo   - Memoria aumentada: 768MB -^> 2048MB (NODE_OPTIONS)
echo   - Limite de memoria: 1GB -^> 2.5GB
echo   - Memoria reservada: 512MB -^> 1GB
echo.

echo [1] Deteniendo frontend actual...
docker compose stop frontend

echo.
echo [2] Eliminando contenedor y volumen de cache...
docker compose rm -f frontend
docker volume rm bvs_framework_frontend_node_modules 2>nul
docker volume rm bvs_framework_frontend_next 2>nul

echo.
echo [3] Recreando frontend con nueva configuracion...
docker compose up -d --force-recreate --build frontend

echo.
echo [4] Mostrando logs en tiempo real (Ctrl+C para salir)...
echo ============================================================
echo.
echo Espera a ver el mensaje: "Ready in X ms"
echo Luego presiona Ctrl+C y accede a http://localhost:3000
echo.
echo ============================================================
docker compose logs -f frontend
