@echo off
echo ==================================================
echo Reiniciando Todos los Servicios
echo ==================================================
echo.

echo 1. Deteniendo todos los servicios...
docker compose down
echo.

echo 2. Verificando que los puertos esten libres...
echo.
netstat -ano | findstr ":3000"
netstat -ano | findstr ":8000"
netstat -ano | findstr ":5432"
netstat -ano | findstr ":9200"
echo.

echo 3. Iniciando servicios de base de datos y busqueda...
docker compose up -d db elasticsearch
echo.
echo Esperando 10 segundos para que los servicios inicien...
timeout /t 10 /nobreak > nul
echo.

echo 4. Iniciando backend...
docker compose up -d backend
echo.
echo Esperando 5 segundos para que el backend inicie...
timeout /t 5 /nobreak > nul
echo.

echo 5. Iniciando frontend...
docker compose up -d frontend
echo.
echo Esperando 5 segundos para que el frontend inicie...
timeout /t 5 /nobreak > nul
echo.

echo 6. Verificando estado de servicios...
docker compose ps
echo.

echo 7. Probando conectividad...
echo.
echo Backend:
curl -I http://localhost:8000/api/auth/health/ 2>nul
echo.
echo Frontend:
curl -I http://localhost:3000 2>nul
echo.

echo ==================================================
echo Servicios Reiniciados
echo ==================================================
echo.
echo Servicios disponibles en:
echo   - Frontend:      http://localhost:3000
echo   - Backend API:   http://localhost:8000/api
echo   - Admin Django:  http://localhost:8000/admin
echo.
echo Si continua el error, verifica los logs:
echo   docker compose logs -f backend
echo   docker compose logs -f frontend
echo.
pause
