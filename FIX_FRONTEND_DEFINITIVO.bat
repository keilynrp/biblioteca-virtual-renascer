@echo off
echo ============================================================
echo SOLUCION DEFINITIVA PARA EL FRONTEND
echo ============================================================
echo.
echo Este script va a:
echo 1. Detener TODOS los contenedores
echo 2. Limpiar volumenes problematicos
echo 3. Reconstruir solo lo necesario
echo 4. Iniciar servicios en el ORDEN CORRECTO
echo.
pause

echo.
echo [PASO 1/6] Deteniendo todos los contenedores...
echo ============================================================
wsl -d Ubuntu -e bash -c "cd /mnt/d/bvs_framework && docker compose down -v"

echo.
echo [PASO 2/6] Limpiando caches de Docker...
echo ============================================================
wsl -d Ubuntu -e bash -c "docker system prune -f"

echo.
echo [PASO 3/6] Verificando que puertos esten libres...
echo ============================================================
netstat -ano | findstr ":3000 :8000 :9200" && (
    echo ADVERTENCIA: Hay puertos en uso. Limpiando...
    timeout /t 3 /nobreak >nul
) || (
    echo ✓ Puertos libres
)

echo.
echo [PASO 4/6] Reconstruyendo frontend (forzado)...
echo ============================================================
wsl -d Ubuntu -e bash -c "cd /mnt/d/bvs_framework && docker compose build --no-cache frontend"

echo.
echo [PASO 5/6] Iniciando servicios en ORDEN...
echo ============================================================

echo.
echo   [5.1] PostgreSQL y Redis (bases de datos)...
wsl -d Ubuntu -e bash -c "cd /mnt/d/bvs_framework && docker compose up -d db redis"
timeout /t 8 /nobreak >nul

echo.
echo   [5.2] Elasticsearch (con memoria aumentada)...
wsl -d Ubuntu -e bash -c "cd /mnt/d/bvs_framework && docker compose up -d elasticsearch"
echo   Esperando a que Elasticsearch este listo (20 segundos)...
timeout /t 20 /nobreak >nul

echo.
echo   [5.3] Verificando Elasticsearch...
wsl -d Ubuntu -e bash -c "cd /mnt/d/bvs_framework && docker compose ps elasticsearch"

echo.
echo   [5.4] Backend (Django)...
wsl -d Ubuntu -e bash -c "cd /mnt/d/bvs_framework && docker compose up -d backend"
timeout /t 10 /nobreak >nul

echo.
echo   [5.5] Ejecutando migraciones...
wsl -d Ubuntu -e bash -c "cd /mnt/d/bvs_framework && docker compose exec backend python manage.py migrate"

echo.
echo   [5.6] FRONTEND (Next.js)...
wsl -d Ubuntu -e bash -c "cd /mnt/d/bvs_framework && docker compose up -d frontend"

echo.
echo [PASO 6/6] Esperando que todo se estabilice (30 segundos)...
echo ============================================================
timeout /t 30 /nobreak >nul

echo.
echo ============================================================
echo ESTADO FINAL
echo ============================================================
wsl -d Ubuntu -e bash -c "cd /mnt/d/bvs_framework && docker compose ps"

echo.
echo ============================================================
echo VERIFICACION DE SERVICIOS
echo ============================================================

echo.
echo Elasticsearch:
wsl -d Ubuntu -e bash -c "curl -s http://localhost:9200/_cluster/health?pretty 2>/dev/null | grep status || echo '  No responde'"

echo.
echo Backend:
wsl -d Ubuntu -e bash -c "curl -s -o /dev/null -w '  HTTP %%{http_code}\n' http://localhost:8000/api/ 2>/dev/null || echo '  No responde'"

echo.
echo Frontend:
wsl -d Ubuntu -e bash -c "curl -s -o /dev/null -w '  HTTP %%{http_code}\n' http://localhost:3000 2>/dev/null || echo '  No responde (puede tardar 1-2 minutos)'"

echo.
echo ============================================================
echo LOGS DEL FRONTEND (ultimas 20 lineas)
echo ============================================================
wsl -d Ubuntu -e bash -c "cd /mnt/d/bvs_framework && docker compose logs --tail=20 frontend"

echo.
echo ============================================================
echo SIGUIENTE PASO
echo ============================================================
echo.
echo Si el frontend aun no responde despues de 2 minutos:
echo   wsl -d Ubuntu -e bash -c "cd /mnt/d/bvs_framework && docker compose logs -f frontend"
echo.
echo Para acceder a la aplicacion:
echo   - Frontend: http://localhost:3000
echo   - Backend API: http://localhost:8000/api
echo   - Admin Django: http://localhost:8000/admin
echo.

pause
