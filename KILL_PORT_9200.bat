@echo off
echo ============================================================
echo Liberando Puerto 9200 (Elasticsearch)
echo ============================================================
echo.

echo [1] Procesos usando el puerto 9200:
echo ============================================================
netstat -ano | findstr :9200

echo.
echo [2] Deteniendo contenedores de Docker...
docker compose down

echo.
echo [3] Buscando y matando procesos en el puerto 9200...
echo ============================================================

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :9200') do (
    echo Matando proceso con PID: %%a
    taskkill /F /PID %%a 2>nul
)

echo.
echo [4] Verificando que el puerto este libre...
netstat -ano | findstr :9200

if errorlevel 1 (
    echo ✓ Puerto 9200 liberado
) else (
    echo ✗ Aun hay procesos usando el puerto 9200
    echo.
    echo Ejecuta manualmente:
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :9200') do (
        echo   taskkill /F /PID %%a
    )
)

echo.
echo [5] Iniciando servicios nuevamente...
docker compose up -d

echo.
echo [6] Estado final:
docker compose ps

echo.
pause
