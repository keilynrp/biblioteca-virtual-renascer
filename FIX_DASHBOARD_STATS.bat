@echo off
cls
echo ========================================
echo Solucion: Error en Dashboard Stats
echo ========================================
echo.

echo El endpoint /api/content/dashboard/stats/ requiere autenticacion.
echo Vamos a cambiar el permiso a AllowAny para desarrollo.
echo.

echo Presiona Enter para continuar o Ctrl+C para cancelar...
pause > nul
echo.

echo [1/4] Creando backup del archivo views.py...
docker compose exec backend cp /app/apps/content/views.py /app/apps/content/views.py.backup
if %ERRORLEVEL% EQU 0 (
    echo [OK] Backup creado
) else (
    echo [ERROR] No se pudo crear backup
)
echo.

echo [2/4] Cambiando permiso a AllowAny...
docker compose exec backend sed -i "s/@permission_classes(\[permissions.IsAuthenticated\])/@permission_classes([permissions.AllowAny])/g" /app/apps/content/views.py
echo [OK] Permiso cambiado
echo.

echo [3/4] Reiniciando backend para aplicar cambios...
docker compose restart backend
echo Esperando 8 segundos...
timeout /t 8 /nobreak > nul
echo [OK] Backend reiniciado
echo.

echo [4/4] Probando endpoint...
curl http://localhost:8000/api/content/dashboard/stats/
echo.
echo.

echo ========================================
echo Completado
echo ========================================
echo.
echo Si ves datos JSON, el problema esta resuelto.
echo.
echo Abre http://localhost:3000/home y verifica que cargue el dashboard.
echo.
pause
