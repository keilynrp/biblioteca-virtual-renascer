# Script PowerShell para verificar estado del Sprint 6
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Estado del Sprint 6 - Lector de Documentos PDF" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Estado de contenedores
Write-Host "[1] Estado de Contenedores Docker" -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Cyan
docker compose ps
Write-Host ""

# 2. Verificar migraciones
Write-Host "[2] Verificando Migraciones Aplicadas" -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Cyan
docker compose exec backend python manage.py showmigrations content 2>$null | Select-String "0005"
Write-Host ""

# 3. Verificar tabla Reading
Write-Host "[3] Verificando Tabla Reading en la Base de Datos" -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Cyan
docker compose exec db psql -U postgres -d biblioteca_virtual -c 'SELECT COUNT(*) as total_readings FROM content_reading;' 2>$null
Write-Host ""

# 4. Verificar libros con PDF
Write-Host "[4] Verificando Libros con Archivo PDF" -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Cyan
$shellCmd = 'from apps.content.models import Book; print(f"Libros totales: {Book.objects.count()}"); print(f"Libros con PDF: {Book.objects.exclude(file=\"\").count()}")'
docker compose exec backend python manage.py shell -c $shellCmd 2>$null
Write-Host ""

# 5. Últimos logs del backend
Write-Host "[5] Últimos Logs del Backend" -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Cyan
docker compose logs backend --tail=10
Write-Host ""

# 6. Últimos logs del frontend
Write-Host "[6] Últimos Logs del Frontend" -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Cyan
docker compose logs frontend --tail=10
Write-Host ""

# 7. Puertos abiertos
Write-Host "[7] Verificando Puertos" -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Cyan

$ports = @(3000, 8000, 5432, 9200)
foreach ($port in $ports) {
    $connection = Test-NetConnection -ComputerName localhost -Port $port -InformationLevel Quiet -WarningAction SilentlyContinue
    if ($connection) {
        Write-Host "✓ Puerto $port abierto" -ForegroundColor Green
    } else {
        Write-Host "✗ Puerto $port cerrado" -ForegroundColor Red
    }
}
Write-Host ""

# Resumen
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Resumen" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Servicios esperados:" -ForegroundColor White
Write-Host "  [X] PostgreSQL - Puerto 5432" -ForegroundColor White
Write-Host "  [X] Elasticsearch - Puerto 9200" -ForegroundColor White
Write-Host "  [X] Backend - Puerto 8000" -ForegroundColor White
Write-Host "  [X] Frontend - Puerto 3000" -ForegroundColor White
Write-Host ""
Write-Host "Archivos del Sprint 6:" -ForegroundColor White
Write-Host "  Backend:" -ForegroundColor Cyan
Write-Host "    - backend/apps/content/models.py (Reading model)" -ForegroundColor White
Write-Host "    - backend/apps/content/serializers.py (2 serializers)" -ForegroundColor White
Write-Host "    - backend/apps/content/views.py (5 views)" -ForegroundColor White
Write-Host "    - backend/apps/content/urls.py (5 rutas)" -ForegroundColor White
Write-Host "    - backend/apps/content/migrations/0005_add_reading_model.py" -ForegroundColor White
Write-Host ""
Write-Host "  Frontend:" -ForegroundColor Cyan
Write-Host "    - frontend/src/components/pdf-viewer.tsx" -ForegroundColor White
Write-Host "    - frontend/src/app/(dashboard)/reader/[bookId]/page.tsx" -ForegroundColor White
Write-Host "    - frontend/src/components/continue-reading.tsx" -ForegroundColor White
Write-Host "    - frontend/src/lib/pdfjs-config.ts" -ForegroundColor White
Write-Host "    - frontend/src/store/bookStore.ts (actualizado)" -ForegroundColor White
Write-Host ""
Write-Host "Para probar el lector:" -ForegroundColor Yellow
Write-Host "  1. Ejecuta: .\obtener-libro-prueba.ps1" -ForegroundColor White
Write-Host "  2. Accede a: http://localhost:3000/reader/BOOK_ID" -ForegroundColor White
Write-Host ""

pause
