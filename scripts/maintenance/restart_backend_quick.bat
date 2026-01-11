@echo off
echo ========================================
echo Reiniciando Backend Container
echo ========================================
echo.

cd /d "d:\bvs_framework"

echo Reiniciando contenedor del backend...
docker compose restart backend

if %ERRORLEVEL% EQU 0 (
    echo.
    echo [OK] Backend reiniciado exitosamente!
    echo El cambio de autenticacion ya deberia estar activo.
) else (
    echo.
    echo [ERROR] No se pudo reiniciar el backend
    echo Por favor reinicia manualmente desde Docker Desktop
)

echo.
echo Puedes cerrar esta ventana y recargar la pagina del visor PDF
echo.
pause
