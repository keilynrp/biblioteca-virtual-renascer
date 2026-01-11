@echo off
cls
echo ========================================
echo Verificacion Rapida de Servicios
echo ========================================
echo.

echo [1/4] Verificando estado de contenedores...
docker compose ps
echo.

echo [2/4] Probando Backend en http://localhost:8000...
curl -s http://localhost:8000/api/ >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] Backend responde
) else (
    echo [ERROR] Backend NO responde
    echo.
    echo Iniciando backend...
    docker compose up -d backend
    timeout /t 5 /nobreak > nul
)
echo.

echo [3/4] Probando Frontend en http://localhost:3000...
curl -s http://localhost:3000 >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] Frontend responde
) else (
    echo [ERROR] Frontend NO responde
    echo.
    echo Iniciando frontend...
    docker compose up -d frontend
    timeout /t 5 /nobreak > nul
)
echo.

echo [4/4] URLs disponibles:
echo   - Frontend:  http://localhost:3000
echo   - Backend:   http://localhost:8000/api
echo   - Admin:     http://localhost:8000/admin
echo.

echo ========================================
echo Verificacion Completada
echo ========================================
echo.
echo Si hay errores, ejecuta:
echo   - DIAGNOSTICO_CONEXION.bat (diagnostico completo)
echo   - REINICIAR_SERVICIOS.bat  (reinicia todo)
echo.
pause
