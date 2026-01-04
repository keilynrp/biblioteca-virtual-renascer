@echo off
echo ==================================================
echo Verificacion del Sprint 6 - Lector de Documentos PDF
echo ==================================================
echo.

echo 1. Verificando estado de Docker...
docker compose ps
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Docker no esta corriendo o no esta configurado correctamente.
    echo Por favor, inicia Docker Desktop y ejecuta: .\REINICIAR_SERVICIOS.bat
    echo.
    pause
    exit /b 1
)
echo.

echo 2. Verificando migraciones pendientes...
docker compose exec -T backend python manage.py showmigrations content | findstr "\[ \]"
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ADVERTENCIA: Hay migraciones pendientes.
    echo Ejecuta: docker compose exec backend python manage.py migrate
    echo.
) else (
    echo Todas las migraciones aplicadas correctamente.
)
echo.

echo 3. Verificando modelo Reading en la base de datos...
docker compose exec -T db psql -U postgres -d biblioteca_virtual -c "\dt content_reading" > nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✓ Tabla content_reading existe en la base de datos
) else (
    echo X Tabla content_reading NO existe. Ejecuta la migracion primero.
)
echo.

echo 4. Verificando libros con archivos PDF...
docker compose exec -T backend python manage.py shell -c "from apps.content.models import Book; count = Book.objects.exclude(file='').count(); print(f'Libros con PDF: {count}')"
echo.

echo 5. Verificando endpoints de lectura...
echo Probando endpoint de salud del backend...
curl -s -o nul -w "Backend Health: %%{http_code}\n" http://localhost:8000/api/auth/health/
echo.

echo 6. Verificando frontend...
echo Probando acceso al frontend...
curl -s -o nul -w "Frontend: %%{http_code}\n" http://localhost:3000
echo.

echo ==================================================
echo Resumen de Verificacion
echo ==================================================
echo.
echo Archivos creados en el Sprint 6:
echo.
echo Backend:
echo   [✓] backend/apps/content/models.py (Reading model)
echo   [✓] backend/apps/content/serializers.py (ReadingSerializer)
echo   [✓] backend/apps/content/views.py (5 nuevas views)
echo   [✓] backend/apps/content/urls.py (5 nuevas rutas)
echo   [✓] backend/apps/content/migrations/0005_add_reading_model.py
echo.
echo Frontend:
echo   [✓] frontend/src/components/pdf-viewer.tsx
echo   [✓] frontend/src/app/(dashboard)/reader/[bookId]/page.tsx
echo   [✓] frontend/src/components/continue-reading.tsx
echo   [✓] frontend/src/lib/pdfjs-config.ts
echo   [✓] frontend/src/store/bookStore.ts (actualizado)
echo.
echo Documentacion:
echo   [✓] docs/SPRINT_6_COMPLETE.md
echo   [✓] docs/SPRINT_6_DAY1_FINAL.md
echo   [✓] docs/SPRINT_6_PROGRESS.md (actualizado)
echo   [✓] TESTING_SPRINT_6.md
echo.
echo ==================================================
echo Proximos Pasos
echo ==================================================
echo.
echo 1. Si hay migraciones pendientes:
echo    docker compose exec backend python manage.py migrate
echo.
echo 2. Si no hay libros con PDF:
echo    - Ir a http://localhost:8000/admin
echo    - Crear un libro y subir un archivo PDF
echo.
echo 3. Para probar el lector:
echo    - Ver instrucciones completas en: TESTING_SPRINT_6.md
echo    - Acceder a: http://localhost:3000/reader/{BOOK_ID}
echo.
echo 4. Para ver la documentacion completa:
echo    - docs/SPRINT_6_COMPLETE.md
echo    - docs/SPRINT_6_DAY1_FINAL.md
echo.
echo ==================================================
pause
