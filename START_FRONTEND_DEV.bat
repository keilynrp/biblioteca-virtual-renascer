@echo off
echo ========================================
echo   INICIANDO SERVIDOR DE DESARROLLO
echo   Frontend Next.js con Flipbook Preview
echo ========================================
echo.
echo Limpiando procesos anteriores...
powershell -Command "Get-Process -Name node -ErrorAction SilentlyContinue | Where-Object {$_.MainWindowTitle -like '*Next.js*'} | Stop-Process -Force" 2>nul

echo Limpiando lock files...
del /F /Q "frontend\.next\dev\lock" 2>nul

echo.
echo Iniciando servidor en puerto 3000...
echo.
cd frontend
npm run dev

pause
