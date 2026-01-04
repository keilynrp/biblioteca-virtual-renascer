@echo off
echo ============================================================
echo Estado del Sprint 6 - Lector de Documentos PDF
echo ============================================================
echo.

echo [1] Estado de Contenedores Docker
echo ============================================================
docker compose ps
echo.

echo [2] Verificando Migraciones Aplicadas
echo ============================================================
docker compose exec backend python manage.py showmigrations content | findstr "0005"
echo.

echo [3] Verificando Tabla Reading en la Base de Datos
echo ============================================================
docker compose exec db psql -U postgres -d biblioteca_virtual -c "SELECT COUNT(*) as total_readings FROM content_reading;"
echo.

echo [4] Verificando Libros con Archivo PDF
echo ============================================================
docker compose exec backend python manage.py shell -c "from apps.content.models import Book; print(f'Libros totales: {Book.objects.count()}'); print(f'Libros con PDF: {Book.objects.exclude(file=\"\").count()}')"
echo.

echo [5] Ultimos Logs del Backend
echo ============================================================
docker compose logs backend --tail=20
echo.

echo [6] Ultimos Logs del Frontend
echo ============================================================
docker compose logs frontend --tail=20
echo.

echo [7] Puertos Abiertos
echo ============================================================
netstat -ano | findstr ":3000 " | findstr LISTENING
netstat -ano | findstr ":8000 " | findstr LISTENING
netstat -ano | findstr ":5432 " | findstr LISTENING
echo.

echo ============================================================
echo Resumen
echo ============================================================
echo.
echo Servicios esperados:
echo   [X] PostgreSQL - Puerto 5432
echo   [X] Elasticsearch - Puerto 9200
echo   [X] Backend - Puerto 8000
echo   [X] Frontend - Puerto 3000
echo.
echo Archivos del Sprint 6:
echo   Backend:
echo     - backend/apps/content/models.py (Reading model)
echo     - backend/apps/content/serializers.py (2 serializers)
echo     - backend/apps/content/views.py (5 views)
echo     - backend/apps/content/urls.py (5 rutas)
echo     - backend/apps/content/migrations/0005_add_reading_model.py
echo.
echo   Frontend:
echo     - frontend/src/components/pdf-viewer.tsx
echo     - frontend/src/app/(dashboard)/reader/[bookId]/page.tsx
echo     - frontend/src/components/continue-reading.tsx
echo     - frontend/src/lib/pdfjs-config.ts
echo     - frontend/src/store/bookStore.ts (actualizado)
echo.
echo Para probar el lector:
echo   http://localhost:3000/reader/BOOK_ID
echo.
pause
