@echo off
echo ========================================
echo   CONFIGURANDO WSL PARA 16GB DE RAM
echo ========================================
echo.

echo [1/4] Verificando RAM del sistema...
wmic computersystem get totalphysicalmemory /value
echo.

echo [2/4] Creando configuracion de WSL optimizada...

set WSLCONFIG=%USERPROFILE%\.wslconfig

echo [wsl2] > "%WSLCONFIG%"
echo memory=10GB >> "%WSLCONFIG%"
echo processors=4 >> "%WSLCONFIG%"
echo swap=4GB >> "%WSLCONFIG%"
echo localhostForwarding=true >> "%WSLCONFIG%"

echo Configuracion creada en: %WSLCONFIG%
echo.
type "%WSLCONFIG%"
echo.

echo [3/4] Apagando WSL para aplicar cambios...
wsl --shutdown
timeout /t 5 /nobreak >nul
echo OK!
echo.

echo [4/4] Verificando configuracion...
echo Iniciando WSL...
wsl -d Ubuntu -e echo "WSL iniciado correctamente"
echo.

echo ========================================
echo   CONFIGURACION APLICADA CON EXITO
echo ========================================
echo.
echo Configuracion WSL:
echo - Memoria: 10GB (de 16GB totales)
echo - Procesadores: 4
echo - Swap: 4GB
echo.
echo Docker ahora puede usar hasta ~8GB de RAM
echo para contenedores sin problemas.
echo.
echo Siguiente paso: Ejecutar APPLY_DOCKER_OPTIMIZATIONS.bat
echo.
pause
