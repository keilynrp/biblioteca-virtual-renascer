@echo off
color 0A
echo.
echo ============================================================
echo    FIX AUTOMATICO - PORTADAS DE LIBROS
echo ============================================================
echo.
echo Este script va a:
echo   1. Reiniciar el contenedor del backend
echo   2. Reiniciar el contenedor del frontend
echo   3. Esperar a que los servicios esten listos
echo.
echo ============================================================
echo.
pause

echo.
echo [PASO 1/4] Reiniciando contenedor BACKEND...
echo.
docker compose restart backend
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: No se pudo reiniciar el backend
    echo Verifica que Docker Desktop este corriendo
    pause
    exit /b 1
)
echo ✅ Backend reiniciado correctamente
echo.

echo [PASO 2/4] Reiniciando contenedor FRONTEND...
echo.
docker compose restart frontend
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: No se pudo reiniciar el frontend
    pause
    exit /b 1
)
echo ✅ Frontend reiniciado correctamente
echo.

echo [PASO 3/4] Esperando 20 segundos a que los servicios inicien...
echo.
echo Por favor espera...
timeout /t 20 /nobreak
echo.

echo [PASO 4/4] Verificando estado de los servicios...
echo.
docker compose ps
echo.

echo ============================================================
echo    FIX COMPLETADO!
echo ============================================================
echo.
echo AHORA DEBES:
echo.
echo   1. Abrir tu navegador en: http://localhost:3000
echo.
echo   2. Presionar Ctrl + Shift + R para limpiar cache
echo.
echo   3. Ir a la biblioteca: http://localhost:3000/library
echo.
echo   4. Verificar que:
echo      ✅ Se muestran 49 libros (no solo 20)
echo      ✅ Las portadas estan visibles
echo      ✅ El grid tiene 6 columnas en pantallas grandes
echo.
echo ============================================================
echo.
echo Si las portadas AUN NO aparecen:
echo   - Abre la consola del navegador (F12)
echo   - Ve a la tab Network
echo   - Busca errores en las imagenes
echo   - Prueba abrir una URL de imagen directamente:
echo     http://localhost:8000/media/books/covers/also-sprach-zarathustra.jpg
echo.
echo ============================================================
echo.
pause
