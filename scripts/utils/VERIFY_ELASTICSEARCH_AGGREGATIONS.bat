@echo off
color 0E
echo.
echo ============================================================
echo    VERIFICAR AGREGACIONES DE ELASTICSEARCH
echo ============================================================
echo.

echo [1/4] Verificando documentos en el indice...
echo.
curl -s "http://localhost:9200/books/_count" | python -m json.tool
echo.
echo.

echo [2/4] Verificando mappings del campo category_name.raw...
echo.
curl -s "http://localhost:9200/books/_mapping/field/category_name" | python -m json.tool
echo.
echo.

echo [3/4] Verificando mappings del campo author_name.raw...
echo.
curl -s "http://localhost:9200/books/_mapping/field/author_name" | python -m json.tool
echo.
echo.

echo [4/4] Probando agregaciones directamente en Elasticsearch...
echo.
curl -s -X POST "http://localhost:9200/books/_search?size=0" -H "Content-Type: application/json" -d "{\"aggs\":{\"categories\":{\"terms\":{\"field\":\"category_name.raw\",\"size\":20}},\"authors\":{\"terms\":{\"field\":\"author_name.raw\",\"size\":20}}}}" | python -m json.tool
echo.
echo.

echo ============================================================
echo    INTERPRETACION
echo ============================================================
echo.
echo 1. Count debe ser ^> 0 (deberia ser 49)
echo.
echo 2. Mappings deben mostrar:
echo    - category_name.raw: type "keyword"
echo    - author_name.raw: type "keyword"
echo.
echo 3. Agregaciones deben mostrar buckets con:
echo    - categories.buckets: [{key: "Fiction", doc_count: X}]
echo    - authors.buckets: [{key: "J.K. Rowling", doc_count: Y}]
echo.
echo Si buckets estan vacios [], el problema es:
echo   - Los libros no tienen category_name o author_name
echo   - El campo .raw no esta mapeado correctamente
echo.
echo ============================================================
echo.
pause
