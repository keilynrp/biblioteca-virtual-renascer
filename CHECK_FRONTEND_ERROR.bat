@echo off
color 0E
echo.
echo ============================================================
echo    DIAGNOSTICO - FRONTEND NO CARGA
echo ============================================================
echo.

echo [1/3] Verificando estado del contenedor frontend...
echo.
docker compose ps frontend
echo.

echo [2/3] Verificando logs recientes (ultimos 50 lineas)...
echo.
docker compose logs --tail=50 frontend
echo.

echo [3/3] Buscando errores de compilacion...
echo.
docker compose logs frontend | findstr /i "error failed"
echo.

echo ============================================================
echo    INTERPRETACION
echo ============================================================
echo.
echo Busca en los logs arriba:
echo.
echo   ❌ "SyntaxError" - Error de sintaxis en el codigo
echo   ❌ "Module not found" - Falta un import
echo   ❌ "Failed to compile" - Error de compilacion
echo   ❌ "ECONNREFUSED" - No puede conectar a algo
echo.
echo Si ves errores, compartelos conmigo.
echo.
pause
