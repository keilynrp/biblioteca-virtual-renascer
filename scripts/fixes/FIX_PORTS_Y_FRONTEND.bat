@echo off
echo ============================================================
echo SOLUCION: Puertos en Uso + Frontend
echo ============================================================
echo.
echo Este script va a:
echo 1. Detener TODOS los contenedores correctamente
echo 2. Liberar TODOS los puertos (3000, 8000, 5432, 6379, 9200)
echo 3. Verificar que los puertos esten libres
echo 4. Reconstruir y reiniciar servicios en orden
echo.
pause

echo.
echo [PASO 1/7] Deteniendo Docker Compose...
echo ============================================================
wsl -d Ubuntu -e bash -c "cd /mnt/d/bvs_framework && docker compose down -v" 2>nul

echo.
echo [PASO 2/7] Esperando a que se liberen los puertos (10 segundos)...
echo ============================================================
timeout /t 10 /nobreak >nul

echo.
echo [PASO 3/7] Verificando puertos...
echo ============================================================
netstat -ano | findstr ":3000 :8000 :9200 :5432 :6379" && (
    echo.
    echo ADVERTENCIA: Algunos puertos aun estan en uso.
    echo Intentando detener contenedores huerfanos...
    wsl -d Ubuntu -e bash -c "docker ps -aq | xargs -r docker stop" 2>nul
    timeout /t 5 /nobreak >nul
) || (
    echo ✓ Todos los puertos estan libres
)

echo.
echo [PASO 4/7] Limpiando recursos de Docker...
echo ============================================================
wsl -d Ubuntu -e bash -c "docker system prune -f"
wsl -d Ubuntu -e bash -c "docker volume prune -f"

echo.
echo [PASO 5/7] Reconstruyendo frontend sin cache...
echo ============================================================
wsl -d Ubuntu -e bash -c "cd /mnt/d/bvs_framework && docker compose build --no-cache frontend"

echo.
echo [PASO 6/7] Iniciando servicios en ORDEN CORRECTO...
echo ============================================================

echo.
echo   [6.1] Bases de datos (PostgreSQL + Redis)...
wsl -d Ubuntu -e bash -c "cd /mnt/d/bvs_framework && docker compose up -d db redis"
if errorlevel 1 (
    echo ERROR: No se pudo iniciar DB/Redis
    echo Intentando limpiar puertos manualmente...
    goto :error_handler
)
echo   ✓ DB y Redis iniciados
timeout /t 10 /nobreak >nul

echo.
echo   [6.2] Elasticsearch (motor de busqueda)...
wsl -d Ubuntu -e bash -c "cd /mnt/d/bvs_framework && docker compose up -d elasticsearch"
echo   Esperando a que Elasticsearch este listo (25 segundos)...
timeout /t 25 /nobreak >nul

echo.
echo   [6.3] Verificando Elasticsearch...
wsl -d Ubuntu -e bash -c "curl -s http://localhost:9200/_cluster/health?pretty 2>/dev/null" | findstr "status" || (
    echo ADVERTENCIA: Elasticsearch puede no estar listo aun
    echo Continuando de todos modos...
)

echo.
echo   [6.4] Backend (Django)...
wsl -d Ubuntu -e bash -c "cd /mnt/d/bvs_framework && docker compose up -d backend"
timeout /t 10 /nobreak >nul

echo.
echo   [6.5] Ejecutando migraciones de base de datos...
wsl -d Ubuntu -e bash -c "cd /mnt/d/bvs_framework && docker compose exec -T backend python manage.py migrate"

echo.
echo   [6.6] FRONTEND (Next.js)...
wsl -d Ubuntu -e bash -c "cd /mnt/d/bvs_framework && docker compose up -d frontend"
echo   ✓ Frontend iniciado

echo.
echo [PASO 7/7] Esperando estabilizacion (30 segundos)...
echo ============================================================
timeout /t 30 /nobreak >nul

goto :show_status

:error_handler
echo.
echo ============================================================
echo ERROR: Puertos aun ocupados
echo ============================================================
echo.
echo Los siguientes puertos estan en uso:
netstat -ano | findstr ":3000 :8000 :9200 :5432 :6379"
echo.
echo SOLUCION MANUAL:
echo 1. Reinicia WSL: wsl --shutdown
echo 2. Espera 10 segundos
echo 3. Vuelve a ejecutar este script
echo.
pause
exit /b 1

:show_status
echo.
echo ============================================================
echo ESTADO FINAL DE LOS CONTENEDORES
echo ============================================================
wsl -d Ubuntu -e bash -c "cd /mnt/d/bvs_framework && docker compose ps"

echo.
echo ============================================================
echo VERIFICACION DE SERVICIOS
echo ============================================================

echo.
echo Puertos en uso ahora:
netstat -ano | findstr ":3000 :8000 :9200 :5432 :6379" || echo   Ningun puerto del proyecto en uso (RARO!)

echo.
echo Elasticsearch:
wsl -d Ubuntu -e bash -c "curl -s http://localhost:9200/_cluster/health?pretty 2>/dev/null | grep status" || echo   No responde

echo.
echo Backend API:
wsl -d Ubuntu -e bash -c "curl -s -o /dev/null -w 'HTTP %%{http_code}\n' http://localhost:8000/api/ 2>/dev/null" || echo   No responde

echo.
echo Frontend:
wsl -d Ubuntu -e bash -c "curl -s -o /dev/null -w 'HTTP %%{http_code}\n' http://localhost:3000 2>/dev/null" || echo   No responde (normal, puede tardar 1-2 minutos mas)

echo.
echo ============================================================
echo LOGS DEL FRONTEND (ultimas 30 lineas)
echo ============================================================
wsl -d Ubuntu -e bash -c "cd /mnt/d/bvs_framework && docker compose logs --tail=30 frontend"

echo.
echo ============================================================
echo SIGUIENTE PASO
echo ============================================================
echo.
echo Espera 1-2 minutos mas y accede a:
echo   - Frontend: http://localhost:3000
echo   - Backend API: http://localhost:8000/api
echo   - Admin: http://localhost:8000/admin
echo.
echo Si el frontend no carga despues de 2 minutos:
echo   wsl -d Ubuntu -e bash -c "cd /mnt/d/bvs_framework && docker compose logs -f frontend"
echo.
echo Si los puertos siguen ocupados:
echo   1. wsl --shutdown
echo   2. Espera 10 segundos
echo   3. Ejecuta este script de nuevo
echo.

pause
