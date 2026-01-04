@echo off
cls
echo ========================================
echo Crear Datos de Prueba (Sin Internet)
echo ========================================
echo.

echo Este script crea libros de muestra sin necesitar
echo conexion a internet (openlibrary.org).
echo.
echo Se crearan:
echo   - 6 Categorias
echo   - 10 Autores
echo   - 12 Libros clasicos
echo.

echo Presiona Enter para continuar...
pause > nul
echo.

echo [1/2] Ejecutando comando de creacion...
docker compose exec backend python manage.py create_sample_books
echo.

echo [2/2] Verificando datos creados...
echo.
echo Total de libros en la base de datos:
docker compose exec backend python manage.py shell -c "from apps.content.models import Book; print(f'📚 {Book.objects.count()} libros')"
echo.
echo Total de autores:
docker compose exec backend python manage.py shell -c "from apps.content.models import Author; print(f'✍️  {Author.objects.count()} autores')"
echo.
echo Total de categorias:
docker compose exec backend python manage.py shell -c "from apps.content.models import Category; print(f'📁 {Category.objects.count()} categorias')"
echo.

echo ========================================
echo Completado!
echo ========================================
echo.
echo Ahora puedes:
echo   - Ver los libros en: http://localhost:3000/library
echo   - Ver el dashboard en: http://localhost:3000/home
echo   - Administrar en: http://localhost:8000/admin
echo.
pause
