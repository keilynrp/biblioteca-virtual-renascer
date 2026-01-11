@echo off
echo ========================================
echo DIAGNOSTICO DE SERVICIOS - BVS Framework
echo ========================================
echo.

echo [1] Verificando si Docker esta corriendo...
docker --version
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Docker no esta instalado o no esta corriendo
    echo.
    echo SOLUCION: Inicia Docker Desktop
    pause
    exit /b 1
)
echo OK: Docker encontrado
echo.

echo [2] Estado de los contenedores...
docker ps -a
echo.

echo [3] Servicios de docker-compose...
docker-compose ps
echo.

echo [4] Verificando puertos ocupados...
echo.
echo Puerto 3000 (Frontend):
netstat -ano | findstr :3000
echo.
echo Puerto 8000 (Backend):
netstat -ano | findstr :8000
echo.
echo Puerto 5432 (PostgreSQL):
netstat -ano | findstr :5432
echo.
echo Puerto 9200 (Elasticsearch):
netstat -ano | findstr :9200
echo.

echo [5] Verificando logs recientes del backend...
echo.
docker-compose logs --tail=20 backend
echo.

echo [6] Verificando logs recientes del frontend...
echo.
docker-compose logs --tail=20 frontend
echo.

echo ========================================
echo DIAGNOSTICO COMPLETADO
echo ========================================
echo.
echo Si los servicios estan "Up" pero no puedes acceder:
echo - Frontend: http://localhost:3000
echo - Backend: http://localhost:8000/admin
echo - API: http://localhost:8000/api/
echo.
pause
