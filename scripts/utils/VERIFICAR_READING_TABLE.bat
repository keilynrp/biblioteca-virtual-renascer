@echo off
echo ==========================================
echo Verificando tabla Reading en la base de datos
echo ==========================================
echo.

echo 1. Verificando migraciones aplicadas...
docker compose exec backend python manage.py showmigrations content
echo.

echo 2. Intentando acceder a la tabla readings...
docker compose exec db psql -U postgres -d bvs_db -c "\d readings"
echo.

echo 3. Contando registros en la tabla readings...
docker compose exec db psql -U postgres -d bvs_db -c "SELECT COUNT(*) FROM readings;"
echo.

echo 4. Verificando estructura completa de la tabla...
docker compose exec db psql -U postgres -d bvs_db -c "\d+ readings"
echo.

echo ==========================================
echo Verificacion completada
echo ==========================================
pause
