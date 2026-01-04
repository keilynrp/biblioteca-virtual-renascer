@echo off
color 0A
echo.
echo ============================================================
echo    PROBAR API DE FACETAS DIRECTAMENTE
echo ============================================================
echo.

echo Probando: GET http://localhost:8000/api/content/search/facets/
echo.
curl -s "http://localhost:8000/api/content/search/facets/" > facets_response.json
echo.

echo Response guardado en: facets_response.json
echo.
echo Mostrando response:
echo.
type facets_response.json
echo.
echo.

echo ============================================================
echo Formateado (si tienes Python):
echo.
python -m json.tool facets_response.json 2>nul
echo.

echo ============================================================
echo.
echo VERIFICACION:
echo.
echo 1. Busca "categories": [...]
echo    - Debe tener al menos 1 categoria
echo.
echo 2. Busca "authors": [...]
echo    - Debe tener al menos 1 autor
echo.
echo Si ambos arrays estan vacios [], los libros no estan indexados.
echo Si tienen datos pero frontend no muestra, es problema de rendering.
echo.
pause
