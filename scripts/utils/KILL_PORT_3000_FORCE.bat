@echo off
echo Matando proceso en puerto 3000...

REM Matar proceso específico 11424
taskkill /F /PID 11424 >nul 2>&1

REM Encontrar y matar todos los procesos en el puerto 3000
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000" ^| find "LISTENING"') do (
    echo Matando proceso %%a
    taskkill /F /PID %%a >nul 2>&1
)

REM Esperar 2 segundos
timeout /t 2 /nobreak >nul

REM Limpiar archivos de bloqueo
echo Limpiando archivos de bloqueo...
if exist "frontend\.next\dev\lock" del /F /Q "frontend\.next\dev\lock" >nul 2>&1
if exist "frontend\.next" rmdir /S /Q "frontend\.next" >nul 2>&1

echo.
echo Puerto 3000 liberado y cache limpiado
echo.
pause
