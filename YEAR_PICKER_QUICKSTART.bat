@echo off
setlocal enabledelayedexpansion

color 0A
cls

echo.
echo    ========================================
echo    ╔══════════════════════════════════════╗
echo    ║     YEAR PICKER - QUICK START        ║
echo    ║     Instalacion y Prueba Rapida      ║
echo    ╚══════════════════════════════════════╝
echo    ========================================
echo.

timeout /t 2 >nul

echo [PASO 1/5] Verificando archivos del Year Picker...
echo.

set ERROR_COUNT=0

if exist "frontend\src\components\ui\year-picker.tsx" (
    echo [OK] year-picker.tsx encontrado
) else (
    echo [ERROR] year-picker.tsx NO encontrado
    set /a ERROR_COUNT+=1
)

if exist "frontend\src\components\ui\popover.tsx" (
    echo [OK] popover.tsx encontrado
) else (
    echo [ERROR] popover.tsx NO encontrado
    set /a ERROR_COUNT+=1
)

findstr /C:"YearPicker" "frontend\src\app\(dashboard)\admin\books\page.tsx" >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] YearPicker integrado en admin books
) else (
    echo [ERROR] YearPicker NO integrado
    set /a ERROR_COUNT+=1
)

echo.

if %ERROR_COUNT% gtr 0 (
    echo.
    echo [ERROR] Faltan %ERROR_COUNT% componentes!
    echo.
    echo Los archivos del Year Picker no estan completos.
    echo Por favor, asegurate de que todos los archivos fueron creados.
    echo.
    pause
    exit /b 1
)

echo [OK] Todos los archivos verificados correctamente!
echo.
timeout /t 2 >nul

echo.
echo [PASO 2/5] Verificando contenedor frontend...
echo.

docker ps | findstr "bvs_framework-frontend-1" >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Contenedor frontend esta corriendo
) else (
    echo [WARN] Contenedor frontend no esta corriendo
    echo Intentando iniciar contenedor...
    docker compose up -d frontend
    timeout /t 5 >nul

    docker ps | findstr "bvs_framework-frontend-1" >nul 2>&1
    if %errorlevel% equ 0 (
        echo [OK] Contenedor frontend iniciado
    ) else (
        echo [ERROR] No se pudo iniciar el contenedor
        echo Por favor, ejecuta: docker compose up -d
        pause
        exit /b 1
    )
)

echo.
timeout /t 2 >nul

echo.
echo [PASO 3/5] Instalando dependencias...
echo.

echo Instalando @radix-ui/react-popover...
docker exec bvs_framework-frontend-1 npm install @radix-ui/react-popover 2>nul

if %errorlevel% equ 0 (
    echo [OK] Dependencia instalada correctamente
) else (
    echo [WARN] Posible error al instalar (puede ser que ya este instalada)
)

echo.
timeout /t 2 >nul

echo.
echo [PASO 4/5] Reiniciando frontend...
echo.

docker compose restart frontend >nul 2>&1

if %errorlevel% equ 0 (
    echo [OK] Frontend reiniciado
    echo.
    echo Esperando a que el frontend inicie...

    for /L %%i in (1,1,10) do (
        echo [%%i/10] Esperando...
        timeout /t 1 /nobreak >nul
    )

    echo.
    echo [OK] Frontend deberia estar listo
) else (
    echo [ERROR] Error al reiniciar frontend
    pause
    exit /b 1
)

echo.
timeout /t 2 >nul

echo.
echo [PASO 5/5] Verificacion de instalacion...
echo.

docker exec bvs_framework-frontend-1 npm list @radix-ui/react-popover 2>nul | findstr "react-popover" >nul 2>&1

if %errorlevel% equ 0 (
    echo [OK] Paquete @radix-ui/react-popover instalado
) else (
    echo [WARN] No se pudo verificar el paquete
)

echo.
timeout /t 2 >nul

cls
color 0B

echo.
echo    ========================================
echo    ╔══════════════════════════════════════╗
echo    ║   INSTALACION COMPLETADA CON EXITO   ║
echo    ╚══════════════════════════════════════╝
echo    ========================================
echo.
echo.
echo   ┌─────────────────────────────────────┐
echo   │  YEAR PICKER LISTO PARA USAR!       │
echo   └─────────────────────────────────────┘
echo.
echo.
echo   PROXIMOS PASOS:
echo   ═══════════════════════════════════════
echo.
echo   1. Abre tu navegador en:
echo      http://localhost:3000/admin/books
echo.
echo   2. Presiona Ctrl+Shift+R (hard reload)
echo      para limpiar el cache
echo.
echo   3. Haz clic en "Crear Libro"
echo.
echo   4. Busca el campo "Año de Publicacion"
echo      - Debe tener un boton "Seleccionar año"
echo      - Y un campo de texto "o escribe el año"
echo.
echo   5. Haz clic en "Seleccionar año"
echo      - Debe abrirse un popover
echo      - Con selector visual de años
echo      - Campo de busqueda
echo      - Navegacion por decadas
echo.
echo.
echo   PRUEBA RAPIDA (30 segundos):
echo   ═══════════════════════════════════════
echo.
echo   A. Crea un libro con año 2024
echo   B. Guardalo
echo   C. Editalo de nuevo
echo   D. Verifica que muestra "2024"
echo   E. Abre el selector
echo   F. Verifica que 2024 esta seleccionado
echo.
echo   Si esto funciona = TODO OK! ✓
echo.
echo.
echo   DOCUMENTACION:
echo   ═══════════════════════════════════════
echo.
echo   [1] YEAR_PICKER_README.md
echo       - Guia rapida de usuario
echo.
echo   [2] YEAR_PICKER_GUIDE.md
echo       - Documentacion tecnica completa
echo.
echo   [3] TEST_YEAR_PICKER.bat
echo       - Suite interactiva de pruebas
echo.
echo   [4] YEAR_PICKER_INDEX.md
echo       - Indice de toda la documentacion
echo.
echo.
echo   TROUBLESHOOTING:
echo   ═══════════════════════════════════════
echo.
echo   Si el año no persiste al editar:
echo   ^> Ejecuta: APLICAR_FIX_YEAR_PICKER.bat
echo.
echo   Si hay errores en consola:
echo   ^> Lee: YEAR_PICKER_FIX_PERSISTENCE.md
echo.
echo   Para probar sistematicamente:
echo   ^> Ejecuta: TEST_YEAR_PICKER.bat
echo.
echo.
echo   ========================================
echo.

set /p open_browser="Quieres abrir el navegador ahora? (S/N): "

if /i "%open_browser%"=="S" (
    echo.
    echo Abriendo http://localhost:3000/admin/books...
    start http://localhost:3000/admin/books
    echo.
    echo RECUERDA: Presiona Ctrl+Shift+R para hard reload!
    timeout /t 3 >nul
)

echo.
set /p run_tests="Quieres ejecutar la suite de pruebas ahora? (S/N): "

if /i "%run_tests%"=="S" (
    echo.
    echo Iniciando TEST_YEAR_PICKER.bat...
    timeout /t 2 >nul
    call TEST_YEAR_PICKER.bat
)

echo.
echo.
echo Presiona cualquier tecla para salir...
pause >nul

color
cls
exit /b 0

endlocal
