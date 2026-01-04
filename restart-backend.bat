@echo off
echo Reiniciando contenedor backend...
docker compose restart backend
echo.
echo Esperando 10 segundos para que el backend se inicie...
timeout /t 10 /nobreak
echo.
echo Backend reiniciado. Por favor recarga la pagina con Ctrl+Shift+R
