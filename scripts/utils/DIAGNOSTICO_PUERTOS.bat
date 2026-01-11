@echo off
echo ============================================================
echo DIAGNOSTICO DE PUERTOS - Backend y Frontend
echo ============================================================
echo.

echo [1] Verificando estado de contenedores Docker:
echo ============================================================
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo.

echo [2] Verificando puertos en Windows:
echo ============================================================
echo Puerto 3000 (Frontend):
netstat -ano | findstr ":3000"
echo.
echo Puerto 8000 (Backend):
netstat -ano | findstr ":8000"
echo.

echo [3] Logs del Frontend (ultimas 30 lineas):
echo ============================================================
docker logs --tail 30 bvs_framework-frontend-1 2>&1
echo.

echo [4] Logs del Backend (ultimas 30 lineas):
echo ============================================================
docker logs --tail 30 bvs_framework-backend-1 2>&1
echo.

echo [5] Inspeccionando configuracion de red del Frontend:
echo ============================================================
docker inspect bvs_framework-frontend-1 --format="{{.NetworkSettings.Ports}}" 2>&1
echo.

echo [6] Inspeccionando configuracion de red del Backend:
echo ============================================================
docker inspect bvs_framework-backend-1 --format="{{.NetworkSettings.Ports}}" 2>&1
echo.

echo [7] Estado de salud de los contenedores:
echo ============================================================
docker inspect bvs_framework-frontend-1 --format="Health: {{.State.Health.Status}}" 2>&1
docker inspect bvs_framework-backend-1 --format="Health: {{.State.Health.Status}}" 2>&1
echo.

echo [8] Verificando si los servicios estan escuchando DENTRO del contenedor:
echo ============================================================
echo Verificando Backend (puerto 8000):
docker exec bvs_framework-backend-1 netstat -tln 2>&1 | findstr ":8000" || echo "Backend NO esta escuchando en puerto 8000"
echo.
echo Verificando Frontend (puerto 3000):
docker exec bvs_framework-frontend-1 netstat -tln 2>&1 | findstr ":3000" || echo "Frontend NO esta escuchando en puerto 3000"
echo.

echo ============================================================
echo RESUMEN DEL DIAGNOSTICO
echo ============================================================
echo Si los puertos no aparecen en netstat, el problema puede ser:
echo 1. Los servicios dentro del contenedor no estan iniciados
echo 2. Los contenedores estan UP pero el servicio fallo
echo 3. El mapeo de puertos en docker-compose.yml no esta correcto
echo 4. Hay un firewall bloqueando las conexiones
echo.
echo Revisa los logs arriba para identificar errores especificos.
echo ============================================================
echo.
pause
