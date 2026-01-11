@echo off
color 0E
echo.
echo ============================================================
echo    DIAGNOSTICO - FRONTEND LENTO
echo ============================================================
echo.

echo [1/6] Verificando estado de contenedores...
echo.
docker compose ps
echo.

echo [2/6] Verificando recursos del contenedor frontend...
echo.
docker stats --no-stream frontend
echo.

echo [3/6] Verificando logs del frontend (ultimas 30 lineas)...
echo.
docker compose logs --tail=30 frontend
echo.

echo [4/6] Verificando si hay errores...
echo.
docker compose logs frontend | findstr /i "error warn"
echo.

echo [5/6] Verificando tiempo de respuesta del frontend...
echo.
echo Probando http://localhost:3000 ...
curl -s -o nul -w "Tiempo de respuesta: %%{time_total}s\n" http://localhost:3000
echo.

echo [6/6] Verificando procesos en el contenedor...
echo.
docker compose exec frontend ps aux
echo.

echo ============================================================
echo    DIAGNOSTICO COMPLETO
echo ============================================================
echo.
echo POSIBLES CAUSAS DE LENTITUD:
echo.
echo   1. Next.js en modo desarrollo (Turbopack compilando)
echo   2. Muchos archivos siendo watched
echo   3. Poco CPU/RAM asignado a Docker
echo   4. Hot reload reconstruyendo todo
echo   5. node_modules muy grande
echo.
echo RECOMENDACIONES:
echo.
echo   A. Si es la primera carga: Esperar 30-60 segundos
echo   B. Si persiste: Reiniciar frontend
echo   C. Si aun lento: Aumentar recursos de Docker
echo.
pause
