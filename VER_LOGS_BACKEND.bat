@echo off
echo ========================================
echo Mostrando logs del Backend
echo ========================================
echo.
echo Presiona Ctrl+C para detener
echo.
docker compose logs -f backend
