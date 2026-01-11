#!/bin/bash

# Script Shell para verificar estado del Sprint 6
echo "============================================================"
echo "Estado del Sprint 6 - Lector de Documentos PDF"
echo "============================================================"
echo ""

# 1. Estado de contenedores
echo "[1] Estado de Contenedores Docker"
echo "============================================================"
docker compose ps
echo ""

# 2. Verificar migraciones
echo "[2] Verificando Migraciones Aplicadas"
echo "============================================================"
docker compose exec backend python manage.py showmigrations content 2>/dev/null | grep "0005"
echo ""

# 3. Verificar tabla Reading
echo "[3] Verificando Tabla Reading en la Base de Datos"
echo "============================================================"
docker compose exec db psql -U postgres -d biblioteca_virtual -c "SELECT COUNT(*) as total_readings FROM content_reading;" 2>/dev/null
echo ""

# 4. Verificar libros con PDF
echo "[4] Verificando Libros con Archivo PDF"
echo "============================================================"
shell_cmd="from apps.content.models import Book; print(f'Libros totales: {Book.objects.count()}'); print(f'Libros con PDF: {Book.objects.exclude(file=\"\").count()}')"
docker compose exec backend python manage.py shell -c "$shell_cmd" 2>/dev/null
echo ""

# 5. Últimos logs del backend
echo "[5] Últimos Logs del Backend"
echo "============================================================"
docker compose logs backend --tail=10
echo ""

# 6. Últimos logs del frontend
echo "[6] Últimos Logs del Frontend"
echo "============================================================"
docker compose logs frontend --tail=10
echo ""

# 7. Puertos abiertos
echo "[7] Verificando Puertos"
echo "============================================================"

ports=(3000 8000 5432 9200)
for port in "${ports[@]}"; do
    if nc -z localhost $port 2>/dev/null; then
        echo "✓ Puerto $port abierto"
    else
        echo "✗ Puerto $port cerrado"
    fi
done
echo ""

# Resumen
echo "============================================================"
echo "Resumen"
echo "============================================================"
echo ""
echo "Servicios esperados:"
echo "  [X] PostgreSQL - Puerto 5432"
echo "  [X] Elasticsearch - Puerto 9200"
echo "  [X] Backend - Puerto 8000"
echo "  [X] Frontend - Puerto 3000"
echo ""
echo "Archivos del Sprint 6:"
echo "  Backend:"
echo "    - backend/apps/content/models.py (Reading model)"
echo "    - backend/apps/content/serializers.py (2 serializers)"
echo "    - backend/apps/content/views.py (5 views)"
echo "    - backend/apps/content/urls.py (5 rutas)"
echo "    - backend/apps/content/migrations/0005_add_reading_model.py"
echo ""
echo "  Frontend:"
echo "    - frontend/src/components/pdf-viewer.tsx"
echo "    - frontend/src/app/(dashboard)/reader/[bookId]/page.tsx"
echo "    - frontend/src/components/continue-reading.tsx"
echo "    - frontend/src/lib/pdfjs-config.ts"
echo "    - frontend/src/store/bookStore.ts (actualizado)"
echo ""
echo "Para probar el lector:"
echo "  1. Ejecuta: ./obtener-libro-prueba.sh"
echo "  2. Accede a: http://localhost:3000/reader/BOOK_ID"
echo ""
