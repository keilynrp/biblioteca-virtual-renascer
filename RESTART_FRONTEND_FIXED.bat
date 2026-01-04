@echo off
echo ==================================================
echo Reiniciando Frontend - Aplicando Cambios de Diseño
echo ==================================================
echo.

echo 1. Deteniendo contenedor frontend...
docker compose stop frontend

echo.
echo 2. Iniciando contenedor frontend...
docker compose up -d frontend

echo.
echo 3. Esperando a que el frontend esté listo...
timeout /t 10 /nobreak > nul

echo.
echo 4. Mostrando logs del frontend...
docker compose logs --tail=30 frontend

echo.
echo ==================================================
echo Completado - Frontend Reiniciado
echo ==================================================
echo.
echo Abre http://localhost:3000 en tu navegador
echo Si no ves cambios, presiona Ctrl+Shift+R para limpiar cache del navegador
echo.
pause
