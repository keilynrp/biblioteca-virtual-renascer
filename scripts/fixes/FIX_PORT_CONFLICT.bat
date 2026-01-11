@echo off
echo ============================================================
echo Solucionando Conflicto de Puertos
echo ============================================================
echo.

echo [1] Identificando proceso usando el puerto 9200...
echo ============================================================
netstat -ano | findstr :9200

echo.
set /p kill="Deseas detener los contenedores y liberar puertos? (s/n): "

if /i "%kill%"=="s" (
    echo.
    echo [2] Deteniendo todos los contenedores de Docker...
    docker compose down

    echo.
    echo [3] Verificando puertos nuevamente...
    netstat -ano | findstr ":3000 :8000 :9200 :5432 :6379"

    echo.
    echo [4] Si aun hay procesos usando los puertos, ejecuta:
    echo.

    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :9200') do (
        echo    Elasticsearch ^(9200^): taskkill /F /PID %%a
    )

    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
        echo    Frontend ^(3000^): taskkill /F /PID %%a
    )

    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000') do (
        echo    Backend ^(8000^): taskkill /F /PID %%a
    )

    echo.
    echo [5] Reiniciando servicios...
    docker compose up -d

    echo.
    echo [6] Estado final:
    docker compose ps
)

echo.
pause
