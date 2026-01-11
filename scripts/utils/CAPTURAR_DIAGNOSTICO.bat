@echo off
chcp 65001 >nul

echo ========== ESTADO DE CONTENEDORES ==========
docker ps --format "table {{.Names}}\t{{.Status}}" 2>&1

echo.
echo ========== PUERTOS MAPEADOS ==========
docker ps --format "{{.Names}}: {{.Ports}}" 2>&1

echo.
echo ========== HEALTH STATUS ==========
docker inspect bvs_framework-frontend-1 -f "Frontend: {{.State.Health.Status}}" 2>&1
docker inspect bvs_framework-backend-1 -f "Backend: {{.State.Health.Status}}" 2>&1

echo.
echo ========== LOGS FRONTEND (ultimas 30 lineas) ==========
docker logs --tail 30 bvs_framework-frontend-1 2>&1

echo.
echo ========== LOGS BACKEND (ultimas 30 lineas) ==========
docker logs --tail 30 bvs_framework-backend-1 2>&1

echo.
echo ========== LOGS DB (ultimas 15 lineas) ==========
docker logs --tail 15 bvs_framework-db-1 2>&1

echo.
echo ========== LOGS REDIS (ultimas 15 lineas) ==========
docker logs --tail 15 bvs_framework-redis-1 2>&1

echo.
echo ========== LOGS ELASTICSEARCH (ultimas 15 lineas) ==========
docker logs --tail 15 bvs_framework-elasticsearch-1 2>&1

echo.
echo ========== FIN DEL DIAGNOSTICO ==========
