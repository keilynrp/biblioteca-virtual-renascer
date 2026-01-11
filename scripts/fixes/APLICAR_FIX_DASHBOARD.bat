@echo off
cls
echo ========================================
echo Aplicando Fix: Dashboard Stats
echo ========================================
echo.

echo El cambio ya fue aplicado en el codigo:
echo   @permission_classes([permissions.AllowAny])
echo.
echo Ahora vamos a reiniciar el backend para que surta efecto.
echo.

echo [1/3] Reiniciando backend...
docker compose restart backend
echo.
echo Esperando 8 segundos a que el backend inicie...
timeout /t 8 /nobreak > nul
echo [OK] Backend reiniciado
echo.

echo [2/3] Probando endpoint de dashboard stats...
curl http://localhost:8000/api/content/dashboard/stats/
echo.
echo.

echo [3/3] Verificando estado...
docker compose ps backend
echo.

echo ========================================
echo Verificacion Completada
echo ========================================
echo.
echo Si viste datos JSON arriba, el problema esta RESUELTO.
echo.
echo Ahora abre: http://localhost:3000/home
echo.
echo Deberia cargar el dashboard sin error.
echo.
pause
