@echo off
color 0A
echo.
echo ============================================================
echo    FIX - REDIRECCION DESPUES DE AUTENTICARSE
echo ============================================================
echo.
echo CAMBIO APLICADO:
echo.
echo   ✅ Login ahora redirige a /dashboard
echo      - Antes: router.push("/")
echo      - Despues: router.push("/dashboard")
echo.
echo   📁 Archivo modificado:
echo      frontend/src/app/(auth)/login/page.tsx (linea 67)
echo.
echo ============================================================
echo.
pause

echo.
echo [1/2] Reiniciando frontend...
echo.
docker compose restart frontend
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Error al reiniciar
    pause
    exit /b 1
)
echo ✅ Frontend reiniciado
echo.

echo [2/2] Esperando 20 segundos a que compile...
echo.
timeout /t 20 /nobreak
echo.

echo ============================================================
echo    REDIRECCION APLICADA!
echo ============================================================
echo.
echo AHORA DEBES:
echo.
echo   1. Abrir: http://localhost:3000/login
echo.
echo   2. Iniciar sesion con tus credenciales
echo.
echo   3. VERIFICAR:
echo.
echo      ✅ Despues de iniciar sesion, debes ser redirigido a:
echo         http://localhost:3000/dashboard
echo.
echo      ✅ NO a la landing page (/)
echo.
echo ============================================================
echo.
echo Flujo de autenticacion:
echo.
echo   1. Usuario ingresa credenciales en /login
echo   2. Sistema valida credenciales con el backend
echo   3. Backend retorna tokens (access, refresh)
echo   4. Frontend obtiene datos del usuario
echo   5. Tokens y datos se guardan en authStore
echo   6. Mensaje de exito: "Inicio de sesion exitoso"
echo   7. Redireccion a: /dashboard ✅
echo.
echo ============================================================
echo.
pause
