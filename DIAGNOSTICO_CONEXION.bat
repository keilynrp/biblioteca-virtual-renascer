@echo off
echo ==================================================
echo Diagnostico de Conexion Frontend-Backend
echo ==================================================
echo.

echo 1. Verificando estado de contenedores...
echo.
docker compose ps
echo.

echo 2. Verificando que el backend este respondiendo...
echo.
curl -I http://localhost:8000/api/auth/health/ 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] El backend no responde en http://localhost:8000/api
    echo.
    echo Posibles causas:
    echo   - El contenedor backend no esta corriendo
    echo   - El backend esta en otro puerto
    echo   - Hay un problema de red
) else (
    echo [OK] Backend responde correctamente
)
echo.

echo 3. Verificando que el frontend este corriendo...
echo.
curl -I http://localhost:3000 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] El frontend no responde en http://localhost:3000
) else (
    echo [OK] Frontend responde correctamente
)
echo.

echo 4. Verificando configuracion de API en frontend...
echo.
type frontend\.env.local
echo.

echo 5. Mostrando logs del backend (ultimas 30 lineas)...
echo.
docker compose logs --tail=30 backend
echo.

echo 6. Mostrando logs del frontend (ultimas 30 lineas)...
echo.
docker compose logs --tail=30 frontend
echo.

echo ==================================================
echo Diagnostico Completado
echo ==================================================
echo.
echo Si el backend no responde, ejecuta:
echo   docker compose up -d backend
echo.
echo Si hay errores en los logs, ejecuta:
echo   docker compose logs -f backend
echo   docker compose logs -f frontend
echo.
pause
