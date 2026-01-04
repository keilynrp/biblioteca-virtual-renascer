@echo off
echo ==========================================
echo Solucion: Error al iniciar sesion de lectura
echo ==========================================
echo.

echo Este script realizara las siguientes acciones:
echo 1. Verificar si las migraciones estan aplicadas
echo 2. Aplicar migraciones si es necesario
echo 3. Verificar la tabla 'readings' en la base de datos
echo 4. Reiniciar los servicios para aplicar cambios
echo.

pause

echo.
echo [PASO 1/5] Verificando estado de migraciones...
docker compose exec backend python manage.py showmigrations content
echo.

echo [PASO 2/5] Aplicando migraciones pendientes...
docker compose exec backend python manage.py migrate
echo.

echo [PASO 3/5] Verificando tabla 'readings'...
docker compose exec db psql -U postgres -d bvs_db -c "\d readings"
echo.

echo [PASO 4/5] Verificando modelo Reading en Django...
docker compose exec backend python -c "from apps.content.models import Reading; print('✓ Modelo Reading importado correctamente'); print(f'Tabla: {Reading._meta.db_table}'); print(f'Campos: {[f.name for f in Reading._meta.get_fields()]}')" 2>&1
echo.

echo [PASO 5/5] Reiniciando servicios...
docker compose restart backend frontend
echo.

echo ==========================================
echo Proceso completado
echo ==========================================
echo.
echo Ahora intenta acceder al lector de PDF nuevamente.
echo Si el problema persiste, ejecuta: TEST_READING_ENDPOINT.bat
echo para diagnosticar el problema mas a fondo.
echo.
pause
