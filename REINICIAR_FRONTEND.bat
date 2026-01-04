@echo off
echo ================================================
echo Reiniciando Frontend con cambios del PDF Reader
echo ================================================
echo.

echo Deteniendo contenedor frontend...
docker compose stop frontend

echo.
echo Iniciando frontend nuevamente...
docker compose up -d frontend

echo.
echo Esperando 10 segundos para que inicie...
timeout /t 10 /nobreak

echo.
echo Verificando logs del frontend...
docker compose logs frontend --tail=30

echo.
echo ================================================
echo Frontend reiniciado!
echo ================================================
echo.
echo Abre el navegador en: http://localhost:3000
echo.
echo IMPORTANTE:
echo 1. Refresca la pagina con Ctrl+Shift+R (hard refresh)
echo 2. O abre en ventana incognito para ver los cambios
echo 3. Limpia el cache del navegador si es necesario
echo.
pause
