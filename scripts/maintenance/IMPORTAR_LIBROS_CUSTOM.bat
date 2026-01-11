@echo off
echo ================================================================================
echo    IMPORTACION PERSONALIZADA DE LIBROS DESDE OPENLIBRARY.ORG
echo ================================================================================
echo.
echo Opciones de importacion disponibles:
echo.
echo 1. Libros de Programacion (100 libros)
echo 2. Libros de Ciencia (100 libros)
echo 3. Libros de Ficcion (100 libros)
echo 4. Coleccion Variada (100 libros en 10 categorias)
echo 5. Busqueda personalizada (introducir termino de busqueda)
echo 6. Salir
echo.

set /p opcion="Selecciona una opcion (1-6): "

if "%opcion%"=="1" (
    echo.
    echo Importando libros de Programacion...
    docker compose exec backend python manage.py import_openlibrary --subjects "programming,python,javascript,web_development,software_engineering,algorithms,data_structures,computer_science,machine_learning,artificial_intelligence" --limit 100
)

if "%opcion%"=="2" (
    echo.
    echo Importando libros de Ciencia...
    docker compose exec backend python manage.py import_openlibrary --subjects "science,physics,chemistry,biology,astronomy,geology,mathematics,statistics,research,scientific_method" --limit 100
)

if "%opcion%"=="3" (
    echo.
    echo Importando libros de Ficcion...
    docker compose exec backend python manage.py import_openlibrary --subjects "fiction,fantasy,science_fiction,mystery,thriller,romance,horror,adventure,classic_literature,contemporary_fiction" --limit 100
)

if "%opcion%"=="4" (
    echo.
    echo Importando coleccion variada...
    docker compose exec backend python manage.py import_openlibrary --subjects "programming,science,fiction,history,philosophy,mathematics,art,psychology,business,health" --limit 100
)

if "%opcion%"=="5" (
    echo.
    set /p termino="Introduce el termino de busqueda: "
    echo.
    echo Buscando: !termino!
    docker compose exec backend python manage.py import_openlibrary --query "!termino!" --limit 100
)

if "%opcion%"=="6" (
    echo.
    echo Saliendo...
    exit /b 0
)

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
pause
