@echo off
cls
echo ========================================
echo Solucion: Problema de Red en Docker
echo ========================================
echo.

echo El backend no puede conectarse a internet (openlibrary.org)
echo Vamos a solucionar los problemas de DNS y red de Docker.
echo.

echo [1/5] Reiniciando red de Docker...
docker network prune -f
echo [OK] Redes antiguas eliminadas
echo.

echo [2/5] Reiniciando Docker Desktop...
echo NOTA: Esto puede tardar unos segundos
echo.
net stop "Docker Desktop Service" 2>nul
timeout /t 3 /nobreak > nul
net start "Docker Desktop Service" 2>nul
timeout /t 10 /nobreak > nul
echo.

echo [3/5] Reconstruyendo contenedores con DNS corregido...
docker compose down
timeout /t 3 /nobreak > nul
docker compose up -d
echo.
echo Esperando a que los servicios inicien (15 segundos)...
timeout /t 15 /nobreak > nul
echo.

echo [4/5] Probando conectividad desde el backend...
echo.
echo Probando DNS:
docker compose exec backend nslookup openlibrary.org
echo.
echo Probando conectividad HTTP:
docker compose exec backend curl -I --connect-timeout 5 https://openlibrary.org 2>&1 | head -5
echo.

echo [5/5] Estado de servicios:
docker compose ps
echo.

echo ========================================
echo Diagnostico Completado
echo ========================================
echo.
echo Si aun no funciona, prueba las soluciones alternativas:
echo   1. Configurar DNS manualmente (ver SOLUCION_NETWORK_DOCKER.md)
echo   2. Usar datos de prueba locales en lugar de OpenLibrary
echo   3. Verificar firewall/antivirus
echo.
pause
