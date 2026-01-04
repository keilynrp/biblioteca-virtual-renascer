@echo off
color 0E
echo.
echo ============================================================
echo    DIAGNOSTICO DE ERROR 500 EN BUSQUEDA
echo ============================================================
echo.

echo [1/5] Verificando estado de contenedores...
echo.
docker compose ps
echo.

echo [2/5] Verificando Elasticsearch...
echo.
curl -s http://localhost:9200 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ✅ Elasticsearch respondiendo
) else (
    echo ❌ Elasticsearch NO responde
    echo.
    echo Iniciando Elasticsearch...
    docker compose up -d elasticsearch
    timeout /t 10
)
echo.

echo [3/5] Verificando indice de libros en Elasticsearch...
echo.
curl -s http://localhost:9200/books/_count 2>nul
echo.

echo [4/5] Ultimos logs del backend (errores)...
echo.
docker compose logs --tail=50 backend | findstr /i "error exception traceback"
echo.

echo [5/5] Probando endpoint de autocomplete...
echo.
curl -s "http://localhost:8000/api/content/search/autocomplete/?q=test"
echo.
echo.

echo ============================================================
echo    DIAGNOSTICO COMPLETO
echo ============================================================
echo.
pause
