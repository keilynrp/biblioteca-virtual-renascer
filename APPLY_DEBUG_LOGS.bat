@echo off
echo ====================================
echo Aplicando Logs de Debugging
echo Year Picker - Problema N/A
echo ====================================
echo.

echo Este script agregara logs de debugging temporales
echo para identificar donde esta el problema de persistencia.
echo.
echo Los logs apareceran en la consola del navegador (F12)
echo.
set /p confirm="Continuar? (S/N): "
if /i not "%confirm%"=="S" (
    echo Operacion cancelada
    exit /b 0
)

echo.
echo [PASO 1] Creando backup del archivo...
copy "frontend\src\app\(dashboard)\admin\books\page.tsx" "frontend\src\app\(dashboard)\admin\books\page.tsx.backup-debug-%date:~-4,4%%date:~-7,2%%date:~-10,2%" >nul
echo [OK] Backup creado

echo.
echo [PASO 2] Los logs ya estan en el codigo actual
echo          No es necesario modificar archivos
echo.
echo [PASO 3] Reiniciando frontend...
docker compose restart frontend

echo.
echo [OK] Frontend reiniciado
echo.
echo ====================================
echo COMO USAR LOS LOGS DE DEBUGGING
echo ====================================
echo.
echo 1. Abre el navegador en: http://localhost:3000/admin/books
echo.
echo 2. Presiona F12 para abrir DevTools
echo.
echo 3. Ve a la pestana "Console"
echo.
echo 4. Haz clic en editar un libro
echo    Deberias ver:
echo    ^> 📖 Abriendo libro: [nombre]
echo    ^> 📅 publication_date: [fecha o null]
echo    ^> 🗓️ year extraido: [año o vacio]
echo.
echo 5. Selecciona un año en el YearPicker
echo    Deberias ver:
echo    ^> 🔄 YearPicker onChange llamado con: [año]
echo    ^> 📅 publication_date generado: [fecha]
echo    ^> ✅ Estado actualizado
echo.
echo 6. Guarda el libro
echo    Deberias ver:
echo    ^> 📅 Enviando publication_date: [fecha]
echo.
echo ====================================
echo INTERPRETACION DE LOS LOGS
echo ====================================
echo.
echo SI NO VES ningun log al editar:
echo   - El problema esta en handleOpenDialog
echo   - Los logs no se agregaron correctamente
echo.
echo SI NO VES logs de YearPicker onChange:
echo   - El YearPicker no esta llamando onChange
echo   - Verifica la integracion del componente
echo.
echo SI NO VES "Enviando publication_date":
echo   - El campo esta vacio o no pasa la validacion
echo   - Verifica que publication_date se seteo en el estado
echo.
echo SI VES "Enviando publication_date" pero sigue N/A:
echo   - El backend no esta guardando el dato
echo   - Ejecuta: DIAGNOSE_YEAR_PERSISTENCE.bat [opcion 1]
echo.
echo ====================================
echo.

set /p run_diag="Ejecutar diagnostico de base de datos ahora? (S/N): "
if /i "%run_diag%"=="S" (
    echo.
    call DIAGNOSE_YEAR_PERSISTENCE.bat
)

echo.
echo ====================================
echo.
echo Para mas informacion, lee:
echo - PATCH_YEAR_PERSISTENCE.md
echo - YEAR_PICKER_FIX_PERSISTENCE.md
echo.
echo Para restaurar el backup (si necesitas):
echo copy "frontend\src\app\(dashboard)\admin\books\page.tsx.backup-debug-*" "frontend\src\app\(dashboard)\admin\books\page.tsx"
echo.
pause
