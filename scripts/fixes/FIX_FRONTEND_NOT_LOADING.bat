@echo off
color 0C
echo.
echo ============================================================
echo    FIX - FRONTEND NO CARGA
echo ============================================================
echo.

echo [1/3] Reiniciando frontend...
echo.
docker compose restart frontend
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Error al reiniciar
    pause
    exit /b 1
)
echo ✅ Frontend reiniciado
echo.

echo [2/3] Esperando 25 segundos a que compile...
echo.
timeout /t 25 /nobreak
echo.

echo [3/3] Verificando logs...
echo.
docker compose logs --tail=20 frontend
echo.

echo ============================================================
echo    VERIFICACION
echo ============================================================
echo.

echo Probando conexion...
curl -s -o nul -w "Status: %%{http_code}\n" http://localhost:3000
echo.

echo ============================================================
echo.
echo Abre: http://localhost:3000/dashboard
echo.
echo Si aun no carga:
echo   1. Ejecuta: CHECK_FRONTEND_ERROR.bat
echo   2. Comparte los logs conmigo
echo.
pause
