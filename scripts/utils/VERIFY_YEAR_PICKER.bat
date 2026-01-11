@echo off
echo ====================================
echo Verificacion Year Picker Component
echo ====================================
echo.

echo [1/4] Verificando archivo YearPicker...
if exist "frontend\src\components\ui\year-picker.tsx" (
    echo [OK] year-picker.tsx existe
) else (
    echo [ERROR] year-picker.tsx NO encontrado
    goto :error
)

echo.
echo [2/4] Verificando archivo Popover...
if exist "frontend\src\components\ui\popover.tsx" (
    echo [OK] popover.tsx existe
) else (
    echo [ERROR] popover.tsx NO encontrado
    goto :error
)

echo.
echo [3/4] Verificando integracion en admin/books/page.tsx...
findstr /C:"YearPicker" "frontend\src\app\(dashboard)\admin\books\page.tsx" >nul
if %errorlevel% equ 0 (
    echo [OK] YearPicker integrado en admin books
) else (
    echo [ERROR] YearPicker NO integrado
    goto :error
)

echo.
echo [4/4] Verificando contenedor frontend...
docker ps | findstr "bvs_framework-frontend-1" >nul
if %errorlevel% equ 0 (
    echo [OK] Contenedor frontend corriendo
) else (
    echo [ERROR] Contenedor frontend no esta corriendo
    goto :error
)

echo.
echo ====================================
echo VERIFICACION COMPLETADA
echo ====================================
echo.
echo Todos los archivos estan en su lugar!
echo.
echo SIGUIENTE PASO:
echo Ejecuta INSTALL_YEAR_PICKER.bat para instalar las dependencias
echo.
goto :end

:error
echo.
echo ====================================
echo ERROR EN VERIFICACION
echo ====================================
echo.
echo Algunos archivos o configuraciones faltan.
echo Por favor revisa los mensajes de error arriba.
echo.

:end
pause
