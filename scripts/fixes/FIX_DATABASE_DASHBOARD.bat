@echo off
cls
echo ========================================
echo Solucion: Error 500 en Dashboard Stats
echo ========================================
echo.

echo El error 500 puede ser por:
echo   1. Migraciones pendientes
echo   2. Base de datos vacia
echo   3. Error en las queries
echo.
echo Vamos a verificar y corregir...
echo.

echo [1/6] Verificando migraciones pendientes...
docker compose exec backend python manage.py showmigrations | findstr /i "\[ \]"
echo.

echo [2/6] Aplicando migraciones (si hay pendientes)...
docker compose exec backend python manage.py migrate
echo.

echo [3/6] Verificando datos en la base de datos...
echo.
echo Libros:
docker compose exec backend python manage.py shell -c "from apps.content.models import Book; print(f'Total libros: {Book.objects.count()}')"
echo.
echo Usuarios:
docker compose exec backend python manage.py shell -c "from django.contrib.auth import get_user_model; User = get_user_model(); print(f'Total usuarios: {User.objects.count()}')"
echo.
echo Categorias:
docker compose exec backend python manage.py shell -c "from apps.content.models import Category; print(f'Total categorias: {Category.objects.count()}')"
echo.

echo [4/6] Reiniciando backend...
docker compose restart backend
timeout /t 8 /nobreak > nul
echo [OK] Backend reiniciado
echo.

echo [5/6] Probando endpoint...
curl http://localhost:8000/api/content/dashboard/stats/
echo.
echo.

echo [6/6] Mostrando logs recientes (si hay error)...
docker compose logs --tail=30 backend | findstr /i "error exception traceback dashboard"
echo.

echo ========================================
echo Diagnostico Completado
echo ========================================
echo.
echo Si aun ves error 500, ejecuta:
echo   VER_ERROR_DASHBOARD.bat
echo.
echo Para crear datos de prueba:
echo   docker compose exec backend python manage.py createsuperuser
echo.
pause
