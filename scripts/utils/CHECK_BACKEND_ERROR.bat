@echo off
cls
echo ========================================
echo Diagnostico de Error 500 en Backend
echo ========================================
echo.

echo [1/5] Verificando estado del backend...
docker compose ps backend
echo.

echo [2/5] Ultimos 50 logs del backend (buscando errores)...
docker compose logs --tail=50 backend | findstr /i "error exception traceback 500"
echo.

echo [3/5] Verificando conectividad al backend...
curl -I http://localhost:8000/api/
echo.

echo [4/5] Probando endpoint de health...
curl http://localhost:8000/api/health/ 2>nul
echo.

echo [5/5] Verificando base de datos...
docker compose ps db
echo.

echo ========================================
echo Diagnostico Completado
echo ========================================
echo.
echo Para ver todos los logs en tiempo real:
echo   VER_LOGS_BACKEND.bat
echo.
echo Para reiniciar el backend:
echo   docker compose restart backend
echo.
pause
