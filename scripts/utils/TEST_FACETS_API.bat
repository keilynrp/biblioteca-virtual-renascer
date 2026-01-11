@echo off
color 0E
echo.
echo ============================================================
echo    PROBAR API DE FACETAS (FILTROS)
echo ============================================================
echo.

echo [1/3] Probando endpoint de facetas...
echo.
echo GET http://localhost:8000/api/content/search/facets/
echo.
curl -s "http://localhost:8000/api/content/search/facets/" | python -m json.tool
echo.
echo.

echo [2/3] Verificando que haya categorias...
echo.
curl -s "http://localhost:8000/api/content/categories/" | python -m json.tool
echo.
echo.

echo [3/3] Verificando que haya autores...
echo.
curl -s "http://localhost:8000/api/content/authors/" | python -m json.tool
echo.
echo.

echo ============================================================
echo    RESULTADO
echo ============================================================
echo.
echo Si ves categorias y autores arriba, el backend esta OK.
echo El problema esta en el frontend.
echo.
echo Si NO ves datos, ejecuta primero: FIX_SEARCH_500_ERROR.bat
echo.
pause
