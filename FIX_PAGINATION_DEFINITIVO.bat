@echo off
color 0C
echo.
echo ============================================================
echo    FIX DEFINITIVO - PAGINACION 49 LIBROS
echo ============================================================
echo.
echo PROBLEMA ENCONTRADO:
echo   ❌ backend/config/settings/base.py tenia PAGE_SIZE: 20
echo   ❌ Esto causaba que solo se mostraran 20 libros
echo.
echo SOLUCION APLICADA:
echo   ✅ Cambiado PAGE_SIZE: 20 a PAGE_SIZE: 1000
echo   ✅ Ahora retornara todos los 49 libros
echo.
echo ============================================================
echo.
pause

echo.
echo [1/3] Reiniciando BACKEND para aplicar nueva configuracion...
echo.
docker compose restart backend
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: No se pudo reiniciar el backend
    pause
    exit /b 1
)
echo ✅ Backend reiniciado
echo.

echo [2/3] Esperando 15 segundos a que el backend inicie...
echo.
timeout /t 15 /nobreak
echo.

echo [3/3] Verificando respuesta del API...
echo.
curl -s "http://localhost:8000/api/content/books/" | findstr /C:"\"count\"" 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ✅ API respondiendo correctamente
) else (
    echo ⚠️  No se pudo verificar la respuesta del API
)
echo.

echo ============================================================
echo    FIX COMPLETADO!
echo ============================================================
echo.
echo Cambio realizado en:
echo   📄 backend/config/settings/base.py (linea 47)
echo   Antes: PAGE_SIZE: 20
echo   Ahora: PAGE_SIZE: 1000
echo.
echo AHORA DEBES:
echo.
echo   1. Abrir: http://localhost:3000/library
echo.
echo   2. Hard refresh: Ctrl + Shift + R
echo.
echo   3. VERIFICAR:
echo      ✅ Se muestran 49 libros (no 20)
echo      ✅ Paginacion local funciona (12 por pagina)
echo      ✅ Total: 5 paginas (49 libros / 12 por pagina)
echo.
echo ============================================================
echo.
echo Como funciona ahora:
echo.
echo   Backend API:
echo     - Devuelve TODOS los 49 libros en 1 request
echo     - PAGE_SIZE: 1000 (suficiente para biblioteca actual)
echo.
echo   Frontend (library/page.tsx):
echo     - Recibe los 49 libros
echo     - Hace paginacion LOCAL (cliente)
echo     - Muestra 12 libros por pagina
echo     - Total: 5 paginas
echo.
echo ============================================================
echo.
echo Prueba rapida en el navegador:
echo.
echo   1. Abre la consola (F12)
echo   2. Ve a Network tab
echo   3. Filtra por "books"
echo   4. Recarga la pagina
echo   5. Haz clic en la request "/api/content/books/"
echo   6. Ve a Response tab
echo   7. Busca "count": deberia decir 49
echo   8. Cuenta los items en "results": deberian ser 49
echo.
echo ============================================================
echo.
pause
