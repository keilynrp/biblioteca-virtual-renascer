@echo off
cls
echo ========================================
echo Diagnostico de Error 500 en Dashboard
echo ========================================
echo.

echo Mostrando ultimos 100 logs del backend...
echo Buscando errores relacionados con dashboard_stats
echo.
docker compose logs --tail=100 backend
echo.
echo.
echo Presiona Ctrl+C para detener
echo.
pause
