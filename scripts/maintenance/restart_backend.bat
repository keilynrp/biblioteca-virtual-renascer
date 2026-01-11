@echo off
echo ========================================
echo Reiniciando Backend
echo ========================================
echo.

echo Reiniciando contenedor del backend...
docker-compose restart backend

echo.
echo Backend reiniciado exitosamente!
echo El cambio de X-Frame-Options ya deberia estar activo.
echo.

pause
