@echo off
echo ============================================
echo    SERVIDOR DE DEBUG
echo ============================================
echo.
echo Iniciando servidor HTTP local en puerto 8080...
echo.
echo La herramienta de debug estara disponible en:
echo   http://localhost:8080/debug-login-frontend.html
echo.
echo IMPORTANTE: Deja esta ventana abierta mientras usas la herramienta.
echo            Presiona Ctrl+C para detener el servidor.
echo.
echo ============================================
echo.

REM Try Python 3 first
python --version >nul 2>&1
if %errorlevel% equ 0 (
    echo Usando Python para servir archivos...
    echo.
    start http://localhost:8080/debug-login-frontend.html
    python -m http.server 8080
    goto :end
)

REM Try Node.js with npx
npx --version >nul 2>&1
if %errorlevel% equ 0 (
    echo Usando Node.js para servir archivos...
    echo.
    start http://localhost:8080/debug-login-frontend.html
    npx http-server -p 8080 -o debug-login-frontend.html
    goto :end
)

REM If nothing works
echo.
echo ERROR: No se encontro Python ni Node.js
echo.
echo Por favor instala uno de estos:
echo  - Python: https://www.python.org/downloads/
echo  - Node.js: https://nodejs.org/
echo.
echo O simplemente usa: HACER_LOGIN_AHORA.bat
echo.
pause

:end
