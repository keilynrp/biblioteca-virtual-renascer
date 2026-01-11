@echo off
echo ========================================
echo   VERIFICACION DEL SISTEMA
echo ========================================
echo.

echo [1] Estado de contenedores Docker...
echo.
wsl docker compose ps
echo.

echo [2] Verificando Backend (http://localhost:8000)...
wsl curl -s -o nul -w "Status: %%{http_code}\n" http://localhost:8000/admin/
echo.

echo [3] Verificando Frontend (http://localhost:3000)...
wsl curl -s -o nul -w "Status: %%{http_code}\n" http://localhost:3000
echo.

echo [4] Verificando Elasticsearch (http://localhost:9200)...
wsl curl -s -o nul -w "Status: %%{http_code}\n" http://localhost:9200
echo.

echo [5] Resumen de servicios...
echo.
wsl docker compose ps --format "table {{.Service}}\t{{.Status}}"
echo.

echo ========================================
echo   VERIFICACION COMPLETA
echo ========================================
echo.
echo URLs de acceso:
echo   Frontend:       http://localhost:3000
echo   Backend API:    http://localhost:8000
echo   Admin Django:   http://localhost:8000/admin
echo   Elasticsearch:  http://localhost:9200
echo.
pause
