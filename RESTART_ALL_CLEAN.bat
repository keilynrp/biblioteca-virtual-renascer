@echo off
echo ============================================================
echo Reinicio Completo Limpio
echo ============================================================
echo.

echo [1] Deteniendo TODOS los contenedores...
docker compose down

echo.
echo [2] Esperando 5 segundos...
timeout /t 5 /nobreak >nul

echo.
echo [3] Verificando puertos antes de iniciar...
echo ============================================================
netstat -ano | findstr ":3000 :8000 :9200 :5432 :6379" && (
    echo.
    echo ADVERTENCIA: Algunos puertos aun estan en uso.
    echo Esto puede causar conflictos.
    echo.
    set /p continue="Deseas continuar de todos modos? (s/n): "
    if /i not "!continue!"=="s" exit /b
) || (
    echo ✓ Todos los puertos estan libres
)

echo.
echo [4] Iniciando servicios en orden...
echo ============================================================

echo.
echo [4.1] PostgreSQL y Redis...
docker compose up -d db redis
timeout /t 10 /nobreak >nul

echo.
echo [4.2] Elasticsearch...
docker compose up -d elasticsearch
timeout /t 15 /nobreak >nul

echo.
echo [4.3] Backend...
docker compose up -d backend
timeout /t 10 /nobreak >nul

echo.
echo [4.4] Ejecutando migraciones...
docker compose exec backend python manage.py migrate

echo.
echo [4.5] Frontend...
docker compose up -d frontend

echo.
echo [5] Esperando a que todo inicie (30 segundos)...
timeout /t 30 /nobreak >nul

echo.
echo ============================================================
echo Estado Final
echo ============================================================
docker compose ps

echo.
echo ============================================================
echo Verificacion de Servicios
echo ============================================================

echo.
echo Backend:
curl -s -o nul -w "  HTTP %%{http_code}\n" http://localhost:8000 2>nul || echo   No responde aun

echo.
echo Frontend:
curl -s -o nul -w "  HTTP %%{http_code}\n" http://localhost:3000 2>nul || echo   No responde aun (puede tomar 1-2 minutos)

echo.
echo ============================================================
echo.
echo Si todo esta OK, accede a:
echo   - Frontend: http://localhost:3000
echo   - Backend: http://localhost:8000/api
echo   - Admin: http://localhost:8000/admin
echo.
echo Para ver logs del frontend:
echo   docker compose logs -f frontend
echo.

pause
