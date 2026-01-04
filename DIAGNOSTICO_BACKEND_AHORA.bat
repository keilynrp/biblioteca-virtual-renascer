@echo off
chcp 65001 >nul
cls

echo ================================================================
echo     DIAGNOSTICO BACKEND - Por qué no responde en puerto 8000
echo ================================================================
echo.

echo [1] Estado del contenedor Backend:
docker ps --filter "name=backend" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo.

echo [2] Health Status del Backend:
docker inspect bvs_framework-backend-1 -f "{{.State.Health.Status}}" 2>nul || echo "No health check configurado o contenedor no existe"
echo.

echo [3] Últimos logs del Backend (50 líneas):
echo ================================================================
docker logs --tail 50 bvs_framework-backend-1 2>&1
echo.

echo [4] Verificando si Django/Python está corriendo DENTRO del contenedor:
echo ================================================================
docker exec bvs_framework-backend-1 ps aux 2>&1 | findstr "python"
echo.

echo [5] Verificando si el puerto 8000 está escuchando DENTRO del contenedor:
echo ================================================================
docker exec bvs_framework-backend-1 netstat -tln 2>&1 | findstr ":8000"
if errorlevel 1 (
    echo [ERROR] El puerto 8000 NO está escuchando dentro del contenedor
    echo Esto significa que Django no inició correctamente.
)
echo.

echo [6] Estado de servicios dependientes:
echo ================================================================
echo PostgreSQL:
docker ps --filter "name=db" --format "{{.Status}}"
echo Redis:
docker ps --filter "name=redis" --format "{{.Status}}"
echo Elasticsearch:
docker ps --filter "name=elasticsearch" --format "{{.Status}}"
echo.

echo [7] Últimos logs de PostgreSQL:
echo ================================================================
docker logs --tail 10 bvs_framework-db-1 2>&1
echo.

echo ================================================================
echo RESUMEN:
echo ================================================================
echo Si el puerto 8000 NO aparece en netstat, el problema es que
echo Django/Python no está corriendo dentro del contenedor.
echo.
echo Revisa los logs del backend arriba para ver el error exacto.
echo.
echo Posibles causas comunes:
echo - Error en manage.py runserver
echo - Puerto ya en uso dentro del contenedor
echo - Error de importación en Django
echo - Base de datos no accesible
echo - Dependencias faltantes
echo ================================================================
echo.
pause
