@echo off
echo ============================================================
echo Iniciando Servicios para Sprint 6 - Lector de Documentos
echo ============================================================
echo.

echo Verificando Docker Desktop...
docker --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker no esta instalado o no esta en el PATH
    echo Por favor, instala Docker Desktop y asegurate de que este corriendo
    pause
    exit /b 1
)
echo Docker instalado correctamente
echo.

echo [1/6] Deteniendo servicios existentes...
docker compose down 2>nul
echo.

echo [2/6] Iniciando PostgreSQL y Elasticsearch...
docker compose up -d db elasticsearch
echo.
echo Esperando 15 segundos para que la base de datos inicie...
timeout /t 15 /nobreak
echo.

echo [3/6] Iniciando Backend...
docker compose up -d backend
echo.
echo Esperando 10 segundos para que el backend inicie...
timeout /t 10 /nobreak
echo.

echo [4/6] Ejecutando migracion del modelo Reading...
docker compose exec backend python manage.py migrate
echo.

echo [5/6] Verificando que la tabla Reading existe...
docker compose exec db psql -U postgres -d biblioteca_virtual -c "\dt content_reading"
echo.

echo [6/6] Iniciando Frontend...
docker compose up -d frontend
echo.
echo Esperando 10 segundos para que el frontend compile...
timeout /t 10 /nobreak
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
echo Probando Backend (http://localhost:8000)...
curl -s -o nul -w "Status Code: %%{http_code}\n" http://localhost:8000/api/auth/health/
echo.
echo Probando Frontend (http://localhost:3000)...
curl -s -o nul -w "Status Code: %%{http_code}\n" http://localhost:3000
echo.

echo ============================================================
echo Servicios Iniciados Correctamente
echo ============================================================
echo.
echo Accede a la aplicacion:
echo   - Frontend: http://localhost:3000
echo   - Backend API: http://localhost:8000/api
echo   - Admin Django: http://localhost:8000/admin
echo.
echo Para probar el lector PDF:
echo   1. Accede a http://localhost:3000
echo   2. Inicia sesion con tu usuario
echo   3. Ve a http://localhost:3000/reader/BOOK_ID
echo      (reemplaza BOOK_ID con el ID de un libro que tenga PDF)
echo.
echo Si hay errores, revisa los logs:
echo   docker compose logs -f backend
echo   docker compose logs -f frontend
echo.
pause
