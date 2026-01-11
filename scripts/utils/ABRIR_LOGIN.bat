@echo off
echo ============================================
echo    ABRIENDO LOGIN DIRECTO
echo ============================================
echo.
echo Este archivo abrira login-directo.html
echo que te permitira autenticarte directamente.
echo.

REM Try to open with default browser
start "" "login-directo.html"

if errorlevel 1 (
    echo.
    echo No se pudo abrir automaticamente.
    echo.
    echo Por favor:
    echo 1. Abre tu navegador
    echo 2. Arrastra el archivo login-directo.html
    echo 3. O abre: file:///d:/bvs_framework/login-directo.html
    echo.
)

echo.
echo ============================================
echo    CREDENCIALES
echo ============================================
echo.
echo Usuario: admin
echo Password: admin123
echo.
echo Click "Iniciar Sesion" y espera la redireccion.
echo.
pause
