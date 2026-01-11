@echo off
echo ============================================================
echo Estado Completo de Contenedores Docker
echo ============================================================
echo.

echo [1] Contenedores en ejecucion:
echo ============================================================
docker compose ps

echo.
echo [2] Estado detallado de cada servicio:
echo ============================================================
echo.

for %%s in (backend frontend db redis elasticsearch) do (
    echo --- %%s ---
    docker compose ps %%s --format "{{.State}}" 2>nul
    echo.
)

echo.
echo [3] Uso de recursos:
echo ============================================================
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}"

echo.
echo [4] Puertos expuestos:
echo ============================================================
docker compose ps --format "table {{.Service}}\t{{.Ports}}"

echo.
echo [5] Verificando conectividad de servicios:
echo ============================================================

curl -s -o nul -w "Backend (8000): HTTP %%{http_code}\n" http://localhost:8000 2>nul || echo Backend (8000): No responde

curl -s -o nul -w "Frontend (3000): HTTP %%{http_code}\n" http://localhost:3000 2>nul || echo Frontend (3000): No responde

docker compose exec db pg_isready -U postgres >nul 2>&1 && echo PostgreSQL (5432): OK || echo PostgreSQL (5432): No responde

docker compose exec redis redis-cli ping 2>nul | findstr "PONG" >nul && echo Redis (6379): OK || echo Redis (6379): No responde

curl -s http://localhost:9200 >nul 2>&1 && echo Elasticsearch (9200): OK || echo Elasticsearch (9200): No responde

echo.
echo [6] Ultimos logs de cada servicio:
echo ============================================================

echo.
echo --- Backend (ultimas 10 lineas) ---
docker compose logs --tail=10 backend

echo.
echo --- Frontend (ultimas 10 lineas) ---
docker compose logs --tail=10 frontend

echo.
echo --- Database (ultimas 5 lineas) ---
docker compose logs --tail=5 db

echo.
echo --- Redis (ultimas 5 lineas) ---
docker compose logs --tail=5 redis

echo.
echo --- Elasticsearch (ultimas 5 lineas) ---
docker compose logs --tail=5 elasticsearch

echo.
echo ============================================================
echo Resumen
echo ============================================================
echo.
echo Accede a:
echo   - Frontend: http://localhost:3000
echo   - Backend API: http://localhost:8000/api
echo   - Admin Django: http://localhost:8000/admin
echo.
echo Para ver logs en tiempo real:
echo   docker compose logs -f [servicio]
echo.
echo Para reiniciar un servicio:
echo   docker compose restart [servicio]
echo.

pause
