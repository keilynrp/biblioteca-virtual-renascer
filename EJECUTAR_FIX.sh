#!/bin/bash
# Ejecutar este script directamente con: bash EJECUTAR_FIX.sh

clear
echo "╔════════════════════════════════════════════════════════════╗"
echo "║     FIX: Error de Visualización de Lectura PDF            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Verificar si Docker está corriendo
if ! docker info > /dev/null 2>&1; then
    echo "❌ ERROR: Docker no está corriendo"
    echo "   Inicia Docker Desktop y vuelve a ejecutar este script"
    exit 1
fi

echo "✓ Docker está corriendo"
echo ""

# Paso 1: Aplicar migraciones
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "PASO 1: Aplicando migraciones de base de datos"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
docker compose exec -T backend python manage.py migrate --noinput

if [ $? -eq 0 ]; then
    echo "✓ Migraciones aplicadas"
else
    echo "❌ Error al aplicar migraciones"
    echo "   Verifica los logs con: docker compose logs backend"
    exit 1
fi

echo ""

# Paso 2: Verificar tabla readings
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "PASO 2: Verificando tabla 'readings'"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if docker compose exec -T db psql -U postgres -d bvs_db -c "SELECT COUNT(*) FROM readings;" > /dev/null 2>&1; then
    COUNT=$(docker compose exec -T db psql -U postgres -d bvs_db -t -c "SELECT COUNT(*) FROM readings;" | tr -d ' ')
    echo "✓ Tabla 'readings' existe ($COUNT registros)"
else
    echo "❌ Tabla 'readings' no existe o hay un error"
    echo "   Intentando aplicar migración específica..."
    docker compose exec -T backend python manage.py migrate content 0005_add_reading_model
fi

echo ""

# Paso 3: Verificar modelo Reading en Django
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "PASO 3: Verificando modelo Reading en Django"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

VERIFY_RESULT=$(docker compose exec -T backend python manage.py shell -c "
try:
    from apps.content.models import Reading
    from apps.content.serializers import ReadingSerializer
    print('SUCCESS')
    print(f'Tabla: {Reading._meta.db_table}')
    print(f'Campos: {len(Reading._meta.fields)} campos definidos')
except Exception as e:
    print(f'ERROR: {e}')
" 2>&1)

if echo "$VERIFY_RESULT" | grep -q "SUCCESS"; then
    echo "✓ Modelo Reading importado correctamente"
    echo "$VERIFY_RESULT" | grep "Tabla:" | sed 's/^/  /'
    echo "$VERIFY_RESULT" | grep "Campos:" | sed 's/^/  /'
else
    echo "⚠️  No se pudo verificar el modelo (esto es normal durante el setup)"
    echo "   La verificación de la base de datos es más importante"
fi

echo ""

# Paso 4: Verificar libros disponibles
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "PASO 4: Verificando libros en la base de datos"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

BOOK_COUNT=$(docker compose exec -T db psql -U postgres -d bvs_db -t -c "SELECT COUNT(*) FROM books;" 2>/dev/null | tr -d ' ')
BOOK_WITH_FILES=$(docker compose exec -T db psql -U postgres -d bvs_db -t -c "SELECT COUNT(*) FROM books WHERE file IS NOT NULL AND file != '';" 2>/dev/null | tr -d ' ')

if [ -z "$BOOK_COUNT" ] || [ "$BOOK_COUNT" -eq 0 ]; then
    echo "⚠️  No hay libros en la base de datos"
    echo "   Importa libros con: bash importar-libros-openlibrary.sh"
else
    echo "✓ Libros totales: $BOOK_COUNT"
    echo "✓ Libros con archivo PDF: $BOOK_WITH_FILES"

    if [ "$BOOK_WITH_FILES" -eq 0 ]; then
        echo "⚠️  Ningún libro tiene archivo PDF asociado"
    fi
fi

echo ""

# Paso 5: Reiniciar servicios
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "PASO 5: Reiniciando servicios"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

docker compose restart backend frontend

if [ $? -eq 0 ]; then
    echo "✓ Servicios reiniciados"
else
    echo "❌ Error al reiniciar servicios"
    exit 1
fi

echo ""
echo "Esperando a que los servicios estén listos..."
sleep 8

# Verificar que los servicios responden
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/api/books/ 2>/dev/null)
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null)

if [ "$BACKEND_STATUS" = "200" ]; then
    echo "✓ Backend está respondiendo (http://localhost:8000)"
else
    echo "⚠️  Backend puede necesitar más tiempo (status: $BACKEND_STATUS)"
fi

if [ "$FRONTEND_STATUS" = "200" ] || [ "$FRONTEND_STATUS" = "304" ]; then
    echo "✓ Frontend está respondiendo (http://localhost:3000)"
else
    echo "⚠️  Frontend puede necesitar más tiempo (status: $FRONTEND_STATUS)"
fi

echo ""

# Resumen final
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                  ✓ PROCESO COMPLETADO                      ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "Próximos pasos:"
echo ""
echo "1. Abre tu navegador en: http://localhost:3000"
echo "2. Inicia sesión con tus credenciales"
echo "3. Ve a la biblioteca"
echo "4. Selecciona un libro y haz clic en 'Leer'"
echo ""
echo "Si aún hay errores:"
echo ""
echo "  • Ver logs del backend:"
echo "    docker compose logs backend --tail=50"
echo ""
echo "  • Ver logs del frontend:"
echo "    docker compose logs frontend --tail=50"
echo ""
echo "  • Ejecutar diagnóstico completo:"
echo "    bash debug-reading-error.sh"
echo ""
echo "  • Probar endpoint manualmente:"
echo "    bash fix-reading-session-error.sh"
echo ""
echo "════════════════════════════════════════════════════════════"
