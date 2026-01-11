@echo off
echo ==========================================
echo Aplicando migraciones para tabla Reading
echo ==========================================
echo.

echo 1. Verificando estado actual de migraciones...
docker compose exec backend python manage.py showmigrations content
echo.

echo 2. Aplicando migraciones...
docker compose exec backend python manage.py migrate content
echo.

echo 3. Verificando que la tabla se creo correctamente...
docker compose exec db psql -U postgres -d bvs_db -c "\d readings"
echo.

echo 4. Verificando estructura completa...
docker compose exec db psql -U postgres -d bvs_db -c "\d+ readings"
echo.

echo ==========================================
echo Migraciones aplicadas exitosamente
echo ==========================================
echo.
echo Ahora puedes reiniciar el frontend para probar:
echo   docker compose restart frontend
echo.
pause
