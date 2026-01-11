@echo off
setlocal enabledelayedexpansion

title Year Picker - Super Fix Automatizado
color 0B

echo.
echo    ╔════════════════════════════════════════════════════════════════╗
echo    ║                                                                ║
echo    ║     YEAR PICKER - FIX SUPER OPTIMIZADO                        ║
echo    ║     Solucion Definitiva de Persistencia                       ║
echo    ║                                                                ║
echo    ╚════════════════════════════════════════════════════════════════╝
echo.
echo.

echo  [*] Verificando entorno...
echo.

REM Verificar si Git Bash está disponible
where bash >nul 2>&1
if %errorlevel% neq 0 (
    echo  [ERROR] Git Bash no encontrado
    echo.
    echo  Este script requiere Git Bash para ejecutar el script .sh optimizado
    echo.
    echo  OPCION 1 - Instalar Git Bash:
    echo    1. Descarga Git desde: https://git-scm.com/download/win
    echo    2. Instala con opciones por defecto
    echo    3. Vuelve a ejecutar este script
    echo.
    echo  OPCION 2 - Usar script batch manual:
    echo    Ejecuta: APLICAR_FIX_YEAR_PICKER.bat
    echo.
    pause
    exit /b 1
)

echo  [OK] Git Bash encontrado
echo.

REM Verificar Docker
docker version >nul 2>&1
if %errorlevel% neq 0 (
    echo  [ERROR] Docker no esta corriendo
    echo.
    echo  Por favor, inicia Docker Desktop y vuelve a ejecutar este script
    echo.
    pause
    exit /b 1
)

echo  [OK] Docker esta corriendo
echo.
echo.

echo  ┌────────────────────────────────────────────────────────────────┐
echo  │  El script super optimizado realizara:                         │
echo  │                                                                 │
echo  │  [1] Diagnostico completo del sistema                          │
echo  │  [2] Verificacion y correccion de archivos                     │
echo  │  [3] Instalacion de dependencias                               │
echo  │  [4] Limpieza y reconstruccion del frontend                    │
echo  │  [5] Verificacion post-fix                                     │
echo  │  [6] Tests automatizados                                       │
echo  │  [7] Generacion de reporte detallado                           │
echo  │                                                                 │
echo  │  Tiempo estimado: 2-3 minutos                                  │
echo  └────────────────────────────────────────────────────────────────┘
echo.
echo.

set /p confirm="  Continuar? (S/N): "
if /i not "%confirm%"=="S" (
    echo.
    echo  [*] Operacion cancelada
    echo.
    pause
    exit /b 0
)

echo.
echo  ════════════════════════════════════════════════════════════════
echo  Ejecutando script super optimizado...
echo  ════════════════════════════════════════════════════════════════
echo.

REM Hacer el script ejecutable
bash -c "chmod +x fix-year-picker-complete.sh"

REM Ejecutar el script
bash fix-year-picker-complete.sh

set SCRIPT_EXIT_CODE=%errorlevel%

echo.
echo  ════════════════════════════════════════════════════════════════

if %SCRIPT_EXIT_CODE% equ 0 (
    color 0A
    echo.
    echo  ╔════════════════════════════════════════════════════════════════╗
    echo  ║                                                                ║
    echo  ║              FIX COMPLETADO EXITOSAMENTE                      ║
    echo  ║                                                                ║
    echo  ╚════════════════════════════════════════════════════════════════╝
    echo.
    echo  [+] Todos los pasos completados correctamente
    echo  [+] Reporte generado en el directorio actual
    echo.
    echo  PROXIMOS PASOS:
    echo  ---------------
    echo  1. Abre http://localhost:3000/admin/books
    echo  2. Presiona Ctrl+Shift+R (hard reload)
    echo  3. Edita un libro con año
    echo  4. Verifica que el año persiste
    echo.
) else (
    color 0C
    echo.
    echo  ╔════════════════════════════════════════════════════════════════╗
    echo  ║                                                                ║
    echo  ║              FIX COMPLETADO CON ADVERTENCIAS                  ║
    echo  ║                                                                ║
    echo  ╚════════════════════════════════════════════════════════════════╝
    echo.
    echo  [!] Algunos pasos tuvieron advertencias
    echo  [!] Revisa el reporte generado para mas detalles
    echo.
    echo  TROUBLESHOOTING:
    echo  ----------------
    echo  - Revisa logs: docker logs bvs_framework-frontend-1
    echo  - Lee: YEAR_PICKER_FIX_PERSISTENCE.md
    echo  - Ejecuta tests: TEST_YEAR_PICKER.bat
    echo.
)

echo  ════════════════════════════════════════════════════════════════
echo.

set /p open_browser="  Abrir el navegador ahora? (S/N): "
if /i "%open_browser%"=="S" (
    echo.
    echo  [*] Abriendo http://localhost:3000/admin/books...
    start http://localhost:3000/admin/books
    echo.
    echo  RECUERDA: Presiona Ctrl+Shift+R para hard reload!
    timeout /t 3 >nul
)

echo.
set /p view_report="  Ver el reporte generado? (S/N): "
if /i "%view_report%"=="S" (
    echo.
    echo  [*] Buscando reporte mas reciente...
    for /f "delims=" %%f in ('dir /b /od year-picker-fix-report-*.txt 2^>nul') do set LATEST_REPORT=%%f
    if defined LATEST_REPORT (
        echo  [*] Abriendo: !LATEST_REPORT!
        start notepad !LATEST_REPORT!
    ) else (
        echo  [!] No se encontro ningun reporte
    )
)

echo.
echo  ════════════════════════════════════════════════════════════════
echo.
echo  Para mas informacion, consulta:
echo  - YEAR_PICKER_INDEX.md (indice completo)
echo  - YEAR_PICKER_FIX_PERSISTENCE.md (detalles tecnicos)
echo.
pause

color
exit /b %SCRIPT_EXIT_CODE%

endlocal
