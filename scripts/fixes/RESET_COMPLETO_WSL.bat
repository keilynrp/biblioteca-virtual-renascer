@echo off
echo ============================================================
echo RESET COMPLETO DE WSL Y DOCKER
echo ============================================================
echo.
echo ATENCION: Este script va a:
echo 1. Cerrar TODOS los contenedores Docker
echo 2. Apagar WSL completamente
echo 3. Reiniciar WSL
echo 4. Iniciar servicios desde cero
echo.
echo Esto liberara TODOS los puertos y recursos.
echo.
set /p confirm="Continuar? (s/n): "
if /i not "%confirm%"=="s" exit /b

echo.
echo [PASO 1/5] Deteniendo Docker en WSL...
echo ============================================================
wsl -d Ubuntu -e bash -c "cd /mnt/d/bvs_framework && docker compose down -v" 2>nul
wsl -d Ubuntu -e bash -c "docker stop $(docker ps -aq) 2>/dev/null; docker rm $(docker ps -aq) 2>/dev/null" 2>nul

echo.
echo [PASO 2/5] Apagando WSL completamente...
echo ============================================================
wsl --shutdown

echo.
echo [PASO 3/5] Esperando 10 segundos para que WSL se apague...
echo ============================================================
timeout /t 10 /nobreak >nul

echo.
echo [PASO 4/5] Verificando que puertos esten libres...
echo ============================================================
netstat -ano | findstr ":3000 :8000 :9200 :5432 :6379" && (
    echo ADVERTENCIA: Algunos puertos aun ocupados
    echo Esperando 5 segundos mas...
    timeout /t 5 /nobreak >nul
) || (
    echo ✓ Todos los puertos liberados correctamente
)

echo.
echo [PASO 5/5] Iniciando Docker en WSL...
echo ============================================================
wsl -d Ubuntu -e sudo service docker start

echo.
echo Esperando a que Docker este listo (5 segundos)...
timeout /t 5 /nobreak >nul

echo.
echo ============================================================
echo WSL Y DOCKER REINICIADOS
echo ============================================================
echo.
echo Ahora ejecuta uno de estos scripts para iniciar los servicios:
echo.
echo   1. FIX_PORTS_Y_FRONTEND.bat     (Recomendado - inicia todo en orden)
echo   2. FIX_FRONTEND_DEFINITIVO.bat  (Si solo hay problemas con frontend)
echo   3. RESTART_ALL_CLEAN.bat        (Reinicio limpio completo)
echo.
echo Verificacion de Docker:
wsl -d Ubuntu -e docker --version

echo.
pause
