@echo off
echo ================================================================================
echo    IMPORTANDO 100 LIBROS DESDE OPENLIBRARY.ORG
echo ================================================================================
echo.
echo Este script importara 100 libros con sus portadas desde OpenLibrary.org
echo Los libros se distribuiran en diferentes categorias.
echo.
pause

echo.
echo Ejecutando importacion de libros...
echo.

docker compose exec backend python manage.py import_openlibrary --subjects "programming,science,fiction,history,philosophy,mathematics,art,psychology,business,health" --limit 100

echo.
echo ================================================================================
echo    INDEXANDO LIBROS EN ELASTICSEARCH
echo ================================================================================
echo.

docker compose exec backend python manage.py index_books

echo.
echo ================================================================================
echo    IMPORTACION COMPLETADA
echo ================================================================================
echo.
echo Los libros han sido importados y indexados correctamente.
echo Ahora puedes verlos en tu biblioteca virtual.
echo.
pause
