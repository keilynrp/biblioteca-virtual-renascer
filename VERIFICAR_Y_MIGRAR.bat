@echo off
echo ============================================================
echo Verificacion y Migracion del Sprint 6
echo ============================================================
echo.

echo [1/5] Verificando servicios de Docker...
docker compose ps
echo.

echo [2/5] Ejecutando migracion del modelo Reading...
docker compose exec -T backend python manage.py migrate content
echo.

echo [3/5] Verificando que la tabla Reading existe en la base de datos...
docker compose exec -T db psql -U postgres -d biblioteca_virtual -c "\dt content_reading"
echo.

echo [4/5] Verificando migraciones aplicadas...
docker compose exec -T backend python manage.py showmigrations content
echo.

echo [5/5] Verificando conectividad de servicios...
echo.
echo Frontend (puerto 3000):
curl -s -o nul -w "Status: %%{http_code}\n" http://localhost:3000 2>nul
echo.
echo Backend (puerto 8000):
curl -s -o nul -w "Status: %%{http_code}\n" http://localhost:8000/api/auth/health/ 2>nul
echo.

echo ============================================================
echo Verificacion Completada
echo ============================================================
echo.
echo Si todos los servicios estan corriendo (status 200), puedes:
echo   1. Acceder al frontend: http://localhost:3000
echo   2. Probar el lector PDF: http://localhost:3000/reader/BOOK_ID
echo.
echo Si hay errores, revisa los logs:
echo   docker compose logs -f backend
echo   docker compose logs -f frontend
echo.
pause
