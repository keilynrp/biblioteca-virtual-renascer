@echo off
color 0E
echo.
echo ============================================================
echo    FIX DEFINITIVO - ERROR 400 SOLUCIONADO
echo ============================================================
echo.
echo Se encontro el problema:
echo   - Next.js Image API rechazaba las URLs (HTTP 400)
echo   - Solucion: Desactivar optimizacion en desarrollo
echo.
echo Este script va a:
echo   1. Reiniciar SOLO el frontend con la nueva configuracion
echo   2. Esperar a que Next.js compile
echo.
echo ============================================================
echo.
pause

echo.
echo [PASO 1/3] Reiniciando contenedor FRONTEND...
echo.
docker compose restart frontend
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: No se pudo reiniciar el frontend
    echo Verifica que Docker Desktop este corriendo
    pause
    exit /b 1
)
echo ✅ Frontend reiniciado correctamente
echo.

echo [PASO 2/3] Esperando 25 segundos a que Next.js compile...
echo.
echo Por favor espera... Next.js esta compilando
timeout /t 25 /nobreak
echo.

echo [PASO 3/3] Verificando estado del frontend...
echo.
docker compose logs frontend --tail=20
echo.

echo ============================================================
echo    SOLUCION APLICADA!
echo ============================================================
echo.
echo Cambios realizados en next.config.ts:
echo   ✅ unoptimized: true (para desarrollo)
echo   ✅ Desactiva la API de optimizacion de Next.js
echo   ✅ Sirve imagenes directamente sin procesar
echo.
echo AHORA DEBES:
echo.
echo   1. Abrir navegador: http://localhost:3000
echo.
echo   2. Presionar Ctrl + Shift + Del
echo      - Seleccionar "Imagenes en cache"
echo      - Hacer clic en "Borrar datos"
echo.
echo   3. Presionar Ctrl + Shift + R (hard refresh)
echo.
echo   4. Ir a: http://localhost:3000/library
echo.
echo   5. VERIFICAR:
echo      ✅ 49 libros visibles
echo      ✅ Portadas mostrando correctamente
echo      ✅ Sin error 400 en consola
echo.
echo ============================================================
echo.
echo Si TODAVIA no aparecen las portadas:
echo.
echo   1. Abre F12 ^(Dev Tools^)
echo   2. Ve a Console
echo   3. Copia cualquier error y envialo
echo.
echo   4. Ve a Network
echo   5. Filtra por "img"
echo   6. Haz clic en una imagen
echo   7. Copia el "Request URL" y envialo
echo.
echo ============================================================
echo.
pause
