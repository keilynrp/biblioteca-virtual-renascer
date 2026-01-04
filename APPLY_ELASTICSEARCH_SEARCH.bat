@echo off
color 0A
echo.
echo ============================================================
echo    APLICAR FUNCIONALIDAD DE BUSQUEDA CON ELASTICSEARCH
echo ============================================================
echo.
echo CAMBIOS REALIZADOS:
echo   ✅ Componente SearchBar con autocomplete en tiempo real
echo   ✅ Integrado en el header del dashboard
echo   ✅ Pagina de resultados de busqueda (/search)
echo   ✅ Componente SearchFilters con facetas
echo   ✅ Navegacion por teclado (flechas, Enter, Escape)
echo   ✅ Debounce de 300ms para optimizar requests
echo.
echo ARCHIVOS MODIFICADOS/CREADOS:
echo   📄 frontend/src/components/search-bar.tsx (existente, corregido)
echo   📄 frontend/src/components/search-filters.tsx (existente)
echo   📄 frontend/src/app/(dashboard)/layout.tsx (modificado)
echo   📄 frontend/src/app/(dashboard)/search/page.tsx (existente)
echo.
echo ============================================================
echo.
pause

echo.
echo [1/3] Reiniciando FRONTEND para aplicar cambios...
echo.
docker compose restart frontend
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: No se pudo reiniciar el frontend
    pause
    exit /b 1
)
echo ✅ Frontend reiniciado
echo.

echo [2/3] Esperando 15 segundos a que el frontend inicie...
echo.
timeout /t 15 /nobreak
echo.

echo [3/3] Verificando que el frontend responde...
echo.
curl -s "http://localhost:3000" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ Frontend respondiendo correctamente
) else (
    echo ⚠️  Frontend aun no responde, espera unos segundos mas
)
echo.

echo ============================================================
echo    CAMBIOS APLICADOS!
echo ============================================================
echo.
echo AHORA DEBES PROBAR:
echo.
echo   1. Abrir: http://localhost:3000/dashboard
echo.
echo   2. PROBAR SEARCH BAR EN HEADER:
echo.
echo      ✅ Escribir "harry" en el search bar
echo      ✅ Esperar 300ms - aparecen sugerencias (autocomplete)
echo      ✅ Usar flechas arriba/abajo para navegar
echo      ✅ Enter en sugerencia - va al detalle del libro
echo      ✅ Enter sin seleccionar - va a pagina de resultados
echo      ✅ Click en "Ver todos los resultados" - va a /search
echo.
echo   3. PROBAR PAGINA DE BUSQUEDA:
echo.
echo      http://localhost:3000/search?q=harry
echo.
echo      ✅ Se muestran resultados de busqueda
echo      ✅ Sidebar con filtros (categorias, autores, premium)
echo      ✅ Click en filtro - actualiza resultados
echo      ✅ Filtros activos muestran badges
echo      ✅ "Limpiar todo" - remueve todos los filtros
echo      ✅ Dropdown de ordenamiento (relevancia, fecha, titulo)
echo      ✅ Paginacion si hay mas de 12 resultados
echo.
echo   4. FUNCIONALIDADES ESPECIALES:
echo.
echo      Autocomplete:
echo      - Minimo 2 caracteres para activar
echo      - Debounce de 300ms (optimizado)
echo      - Muestra titulo y autor
echo      - Maximo 5 sugerencias
echo      - Click fuera cierra dropdown
echo.
echo      Navegacion por teclado:
echo      - Flechas arriba/abajo: navegar sugerencias
echo      - Enter: seleccionar o buscar
echo      - Escape: cerrar dropdown
echo.
echo      Busqueda con Elasticsearch:
echo      - Multi-match (titulo, autor, descripcion, categoria)
echo      - Fuzzy matching (tolerancia a errores)
echo      - Scoring por relevancia
echo      - Filtros facetados
echo.
echo ============================================================
echo.
echo Como funciona:
echo.
echo   1. SearchBar Component:
echo      - Usuario escribe query
echo      - Debounce 300ms
echo      - Request a /content/search/autocomplete/
echo      - Muestra sugerencias
echo      - Click o Enter navega
echo.
echo   2. Search Page:
echo      - Lee query params de URL
echo      - Request a /content/search/ con filtros
echo      - Elasticsearch procesa busqueda
echo      - Retorna resultados ordenados por relevancia
echo      - Filtros facetados desde /content/search/facets/
echo.
echo   3. Backend Endpoints:
echo      GET /api/content/search/autocomplete/?q=harry
echo      GET /api/content/search/?q=harry^&page=1^&sort_by=_score
echo      GET /api/content/search/facets/
echo.
echo ============================================================
echo.
echo Prueba rapida en el navegador:
echo.
echo   1. Abre http://localhost:3000/dashboard
echo   2. Click en el search bar del header
echo   3. Escribe "potter"
echo   4. Espera ver sugerencias aparecer
echo   5. Click en una sugerencia - debe ir al libro
echo   6. O presiona Enter - debe ir a /search?q=potter
echo   7. En la pagina de resultados:
echo      - Click en filtros del sidebar
echo      - Prueba el ordenamiento
echo      - Navega entre paginas si hay mas de 12 resultados
echo.
echo ============================================================
echo.
echo Verificar con DevTools:
echo.
echo   Network tab:
echo   - Busca requests a /content/search/autocomplete/
echo   - Verifica que el debounce funciona (300ms delay)
echo   - Busca requests a /content/search/
echo   - Verifica parametros: q, category, author, is_premium
echo.
echo   Console:
echo   - No deben haber errores
echo   - Si ves CORS errors, verificar ALLOWED_HOSTS en backend
echo.
echo ============================================================
echo.
pause
