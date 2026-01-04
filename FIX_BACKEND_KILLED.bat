@echo off
cls
echo ================================================================
echo SOLUCION: Backend Killed (Exit Code 137)
echo ================================================================
echo.
echo El backend fue terminado por falta de memoria (OOM - Out of Memory)
echo.
echo CAUSAS COMUNES:
echo   - Docker Desktop tiene poca memoria asignada
echo   - Elasticsearch consume mucha memoria
echo   - Multiples contenedores corriendo simultaneamente
echo.
echo ================================================================
echo Aplicando Solucion...
echo ================================================================
echo.

echo [1/6] Deteniendo todos los servicios...
docker compose down
echo.

echo [2/6] Verificando recursos de Docker...
docker system df
echo.

echo [3/6] Liberando memoria (opcional - elimina contenedores detenidos)...
echo Presiona Ctrl+C para saltar este paso, o
pause
docker system prune -f
echo.

echo [4/6] Iniciando servicios con limites de memoria optimizados...
echo.
echo Iniciando base de datos...
docker compose up -d db
timeout /t 5 /nobreak > nul
echo.

echo Iniciando Redis...
docker compose up -d redis
timeout /t 3 /nobreak > nul
echo.

echo Iniciando Elasticsearch con limite de memoria...
docker compose up -d elasticsearch
echo Esperando a que Elasticsearch inicie (15 segundos)...
timeout /t 15 /nobreak > nul
echo.

echo [5/6] Iniciando Backend...
docker compose up -d backend
echo Esperando a que el backend inicie (8 segundos)...
timeout /t 8 /nobreak > nul
echo.

echo [6/6] Iniciando Frontend...
docker compose up -d frontend
echo Esperando a que el frontend inicie (5 segundos)...
timeout /t 5 /nobreak > nul
echo.

echo ================================================================
echo Verificando Estado de Servicios
echo ================================================================
echo.
docker compose ps
echo.

echo ================================================================
echo Probando Conectividad
echo ================================================================
echo.
echo Backend:
curl -s -I http://localhost:8000/api/ 2>nul | findstr "HTTP"
echo.
echo Frontend:
curl -s -I http://localhost:3000 2>nul | findstr "HTTP"
echo.

echo ================================================================
echo COMPLETADO
echo ================================================================
echo.
echo URLs disponibles:
echo   - Frontend:  http://localhost:3000
echo   - Backend:   http://localhost:8000/api
echo   - Admin:     http://localhost:8000/admin
echo.
echo Si el backend vuelve a detenerse:
echo   1. Abre Docker Desktop
echo   2. Ve a Settings ^> Resources
echo   3. Aumenta la memoria a minimo 4GB (recomendado 6GB)
echo   4. Click en "Apply ^& Restart"
echo.
echo Para monitorear el backend:
echo   docker compose logs -f backend
echo.
pause
