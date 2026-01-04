@echo off
color 0A
echo.
echo ============================================================
echo    REINDEXACION SIMPLE Y RAPIDA
echo ============================================================
echo.

echo [1/4] Eliminando indice viejo...
curl -X DELETE "http://localhost:9200/books" 2>nul
echo.

echo [2/4] Creando indice nuevo...
docker compose exec -T backend python -c "from apps.content.documents import BookDocument; BookDocument.init(); print('Indice creado')"
echo.

echo [3/4] Indexando libros...
docker compose exec -T backend python -c "from apps.content.models import Book; from apps.content.documents import BookDocument; [BookDocument.from_django_model(b).save() for b in Book.objects.select_related('author', 'category').all()]; print(f'Indexados: {Book.objects.count()} libros')"
echo.

echo [4/4] Verificando...
curl -s "http://localhost:9200/books/_count"
echo.
echo.

echo ✅ LISTO! Prueba en el navegador.
pause
