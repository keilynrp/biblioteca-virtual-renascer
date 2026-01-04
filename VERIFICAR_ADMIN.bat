@echo off
echo ================================================================================
echo    VERIFICAR CONFIGURACION DE ADMIN
echo ================================================================================
echo.

echo [1/4] Verificando que los archivos existan...
echo.

if exist "frontend\src\app\(dashboard)\admin\page.tsx" (
    echo ✓ Pagina de admin existe
) else (
    echo ✗ Pagina de admin NO existe
)

if exist "frontend\src\components\admin\book-import-panel.tsx" (
    echo ✓ Componente de importacion existe
) else (
    echo ✗ Componente de importacion NO existe
)

if exist "frontend\src\components\admin\import-stats-panel.tsx" (
    echo ✓ Componente de estadisticas existe
) else (
    echo ✗ Componente de estadisticas NO existe
)

echo.
echo [2/4] Verificando endpoints del backend...
echo.

docker compose exec backend python -c "from apps.content.views import import_books_from_openlibrary, get_import_stats; print('✓ Endpoints importados correctamente')" 2>nul && echo ✓ Backend configurado correctamente || echo ✗ Error en backend

echo.
echo [3/4] Verificando estado de contenedores...
echo.

docker compose ps

echo.
echo [4/4] Recomendaciones:
echo.
echo 1. Si los archivos existen pero no ves el menu:
echo    - Ejecuta: REINICIAR_FRONTEND.bat
echo    - Luego recarga la pagina web con Ctrl+Shift+R
echo.
echo 2. Si no eres admin:
echo    - Ejecuta: DAR_PERMISOS_ADMIN.bat
echo    - Introduce tu nombre de usuario
echo.
echo 3. Si el backend no esta corriendo:
echo    - Ejecuta: docker compose up -d backend
echo.
pause
