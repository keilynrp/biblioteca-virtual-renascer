@echo off
echo ========================================
echo Iniciando Backend con Docker
echo ========================================
echo.

echo Construyendo imagen del backend...
docker-compose build backend

echo.
echo Iniciando contenedor...
docker-compose up backend

pause
