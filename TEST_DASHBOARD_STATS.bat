@echo off
cls
echo ========================================
echo Probando Endpoint de Dashboard Stats
echo ========================================
echo.

echo [1/3] Probando sin autenticacion...
curl -i http://localhost:8000/api/content/dashboard/stats/
echo.
echo.

echo [2/3] Verificando si requiere autenticacion...
echo (Si ves 401 Unauthorized, necesitas token)
echo.
pause
echo.

echo [3/3] Verificando backend logs para ver el error exacto...
docker compose logs --tail=20 backend | findstr /i "dashboard stats error exception"
echo.
echo.

echo ========================================
echo Comandos Utiles
echo ========================================
echo.
echo Ver logs completos:
echo   docker compose logs -f backend
echo.
echo Probar con token (reemplaza YOUR_TOKEN):
echo   curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8000/api/content/dashboard/stats/
echo.
echo Ejecutar migraciones:
echo   docker compose exec backend python manage.py migrate
echo.
pause
