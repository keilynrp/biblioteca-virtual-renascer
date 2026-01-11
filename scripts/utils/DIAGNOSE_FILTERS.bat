@echo off
color 0E
echo.
echo ============================================================
echo    DIAGNOSTICO - FILTROS NO SE MUESTRAN
echo ============================================================
echo.

echo VERIFICANDO BACKEND...
echo.

echo [1/4] Elasticsearch esta corriendo?
echo.
docker compose ps elasticsearch
echo.
curl -s http://localhost:9200/_cluster/health | python -m json.tool 2>nul
echo.
echo.

echo [2/4] Cuantos libros estan indexados?
echo.
curl -s http://localhost:9200/books/_count 2>nul
echo.
echo.

echo [3/4] API de facetas responde?
echo.
echo GET /api/content/search/facets/
echo.
curl -s "http://localhost:8000/api/content/search/facets/" 2>nul
echo.
echo.

echo [4/4] Hay categorias y autores en PostgreSQL?
echo.
echo Categorias:
docker compose exec -T backend python -c "from apps.content.models import Category; print(f'Total: {Category.objects.count()}')"
echo.
echo Autores:
docker compose exec -T backend python -c "from apps.content.models import Author; print(f'Total: {Author.objects.count()}')"
echo.
echo.

echo ============================================================
echo    DIAGNOSTICO COMPLETO
echo ============================================================
echo.
echo POSIBLES PROBLEMAS:
echo.
echo   1. Elasticsearch no esta corriendo
echo      Solucion: docker compose up -d elasticsearch
echo.
echo   2. Libros no estan indexados (count: 0)
echo      Solucion: FIX_SEARCH_500_ERROR.bat
echo.
echo   3. API de facetas retorna arrays vacios
echo      Causa: Libros no indexados en Elasticsearch
echo      Solucion: FIX_SEARCH_500_ERROR.bat
echo.
echo   4. Frontend no puede conectar con backend
echo      Verificar: DevTools Console (F12)
echo      Buscar: errores de red o CORS
echo.
echo ============================================================
echo.
pause
