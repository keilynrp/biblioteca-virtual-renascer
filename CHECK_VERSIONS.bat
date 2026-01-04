@echo off
echo ========================================
echo   VERIFICACION DE VERSIONES
echo   Biblioteca Virtual - Flipbook Preview
echo ========================================
echo.

echo [1] Node.js Version:
node --version
echo.

echo [2] npm Version:
npm --version
echo.

echo [3] Ubicacion de Node.js:
where node
echo.

echo [4] Verificando Next.js...
cd frontend
echo Next.js version:
npm list next 2>nul | findstr "next@"
echo.

echo [5] Verificando React...
echo React version:
npm list react 2>nul | findstr "react@"
echo.

echo ========================================
echo   REQUISITOS
echo ========================================
echo Node.js:  >= 20.9.0 (Requerido)
echo npm:      >= 10.0.0 (Recomendado)
echo Next.js:  16.1.0 (Actual)
echo React:    19.2.3 (Actual)
echo.

echo ========================================
echo   ESTADO
echo ========================================

for /f "tokens=1" %%v in ('node --version') do set NODE_VERSION=%%v
set NODE_VERSION=%NODE_VERSION:v=%

for /f "tokens=1,2 delims=." %%a in ("%NODE_VERSION%") do (
    set MAJOR=%%a
    set MINOR=%%b
)

if %MAJOR% LSS 20 (
    echo [X] Node.js: DESACTUALIZADO
    echo     Tu version: %NODE_VERSION%
    echo     Necesitas:  20.9.0 o superior
    echo.
    echo [!] ACCION REQUERIDA:
    echo     1. Descargar Node.js 20 LTS desde: https://nodejs.org/
    echo     2. Ejecutar el instalador
    echo     3. Reiniciar esta terminal
    echo     4. Ejecutar este script nuevamente
    echo.
    echo     O leer: NODE_VERSION_UPGRADE.md
) else if %MAJOR% EQU 20 (
    if %MINOR% LSS 9 (
        echo [!] Node.js: VERSION MINIMA
        echo     Tu version: %NODE_VERSION%
        echo     Recomendado: 20.11.0 o superior
        echo.
        echo [i] OPCIONAL: Considera actualizar a 20.11.0
    ) else (
        echo [OK] Node.js: COMPATIBLE
        echo     Tu version: %NODE_VERSION%
    )
) else (
    echo [OK] Node.js: COMPATIBLE
    echo     Tu version: %NODE_VERSION%
)

echo.
echo ========================================
pause
