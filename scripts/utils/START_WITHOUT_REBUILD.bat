@echo off
echo ============================================================
echo Iniciando Servicios SIN Reconstruir
echo ============================================================
echo.
echo Esta opcion inicia los contenedores existentes sin
echo descargar ni reconstruir imagenes.
echo.

echo [1] Verificando imagenes existentes...
docker images | findstr "bvs_framework\|postgres\|redis\|elasticsearch"

echo.
echo [2] Deteniendo contenedores actuales...
docker compose down

echo.
echo [3] Iniciando servicios con imagenes existentes...
echo ============================================================

echo.
echo [3.1] Iniciando PostgreSQL y Elasticsearch...
docker compose up -d db elasticsearch
echo Esperando 15 segundos...
timeout /t 15 /nobreak >nul

echo.
echo [3.2] Iniciando Redis...
docker compose up -d redis
echo Esperando 5 segundos...
timeout /t 5 /nobreak >nul

echo.
echo [3.3] Iniciando Backend...
docker compose up -d backend
echo Esperando 10 segundos...
timeout /t 10 /nobreak >nul

echo.
echo [3.4] Ejecutando migraciones...
docker compose exec backend python manage.py migrate

echo.
echo [3.5] Iniciando Frontend...
docker compose up -d frontend

echo.
echo ============================================================
echo Estado de los Servicios
echo ============================================================
docker compose ps

echo.
echo ============================================================
echo Verificando Conectividad
echo ============================================================
echo.
timeout /t 10 /nobreak >nul

echo Probando Backend...
curl -s -o nul -w "Backend: HTTP %%{http_code}\n" http://localhost:8000/api/auth/health/ 2>nul || echo Backend: No responde aun

echo.
echo Probando Frontend...
curl -s -o nul -w "Frontend: HTTP %%{http_code}\n" http://localhost:3000 2>nul || echo Frontend: No responde aun (puede tomar 1-2 minutos)

echo.
echo ============================================================
echo Servicios Iniciados
echo ============================================================
echo.
echo Accede a:
echo   - Frontend: http://localhost:3000
echo   - Backend: http://localhost:8000
echo   - Admin: http://localhost:8000/admin
echo.
echo Para ver logs del frontend:
echo   docker compose logs -f frontend
echo.

pause
