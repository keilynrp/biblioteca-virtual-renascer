@echo off
echo ============================================
echo    TEST DE CREDENCIALES EXACTAS
echo ============================================
echo.
echo Esta herramienta te ayudara a identificar
echo exactamente que esta pasando con las credenciales.
echo.
echo Se abrira una pagina que:
echo  - Muestra los valores exactos enviados
echo  - Verifica espacios extra
echo  - Prueba variaciones de mayusculas/minusculas
echo  - Te autentica automaticamente si funciona
echo.

start "" "test-login-exacto.html"

echo.
echo ============================================
echo    INSTRUCCIONES
echo ============================================
echo.
echo 1. Click en "Test Login"
echo 2. Observa el log detallado
echo 3. Si falla, prueba "Test con Trim"
echo 4. Si sigue fallando, prueba "Test Case Variations"
echo.
echo Las credenciales correctas son:
echo   Username: admin
echo   Password: admin123
echo.
echo (todo en minusculas, sin espacios)
echo.
pause
