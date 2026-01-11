@echo off
echo ========================================
echo FIX: Conflicto de Puerto 3000
echo ========================================
echo.

echo [1/5] Identificando procesos en puerto 3000...
netstat -ano | findstr :3000
echo.

echo [2/5] Matando proceso Node.js nativo (PID 38596)...
taskkill /PID 38596 /F
if %ERRORLEVEL% EQU 0 (
    echo ✓ Proceso Node.js terminado exitosamente
) else (
    echo ⚠ No se pudo terminar el proceso o ya no existe
)
echo.

echo [3/5] Esperando 3 segundos...
timeout /t 3 /nobreak >nul
echo.

echo [4/5] Verificando que el puerto está libre...
netstat -ano | findstr :3000
if %ERRORLEVEL% EQU 0 (
    echo ⚠ Puerto 3000 todavía en uso, matando todos los procesos...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do taskkill /PID %%a /F
) else (
    echo ✓ Puerto 3000 liberado
)
echo.

echo [5/5] Reiniciando contenedor frontend de Docker...
echo Nota: Asegúrate de que Docker Desktop esté ejecutándose
echo.
pause
echo.

echo Para reiniciar el frontend con Docker, ejecuta:
echo     docker compose restart frontend
echo.
echo O si prefieres reconstruir:
echo     docker compose up -d --build frontend
echo.
pause
