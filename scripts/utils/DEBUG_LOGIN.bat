@echo off
echo ============================================
echo    DEBUG LOGIN FRONTEND
echo ============================================
echo.
echo Esta herramienta te ayudara a identificar
echo exactamente que esta fallando en el login.
echo.
echo Se abrira una pagina con:
echo  - Logs en tiempo real
echo  - Estado del sistema
echo  - Network requests
echo  - localStorage viewer
echo.

start "" "debug-login-frontend.html"

echo.
echo ============================================
echo    INSTRUCCIONES
echo ============================================
echo.
echo 1. Click en "Test Login"
echo 2. Revisa los logs que aparecen
echo 3. Copia cualquier error que veas
echo.
echo Si todo funciona bien, el problema es
echo especifico del frontend Next.js.
echo.
pause
