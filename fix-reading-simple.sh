#!/bin/bash

# Script simple y robusto para corregir error de lectura PDF

set -e

clear
echo "════════════════════════════════════════════════════════════"
echo "  FIX SIMPLE: Error de Lectura PDF"
echo "════════════════════════════════════════════════════════════"
echo ""

# 1. Verificar Docker
echo "→ Verificando Docker..."
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker no está corriendo. Inicia Docker Desktop."
    exit 1
fi
echo "✓ Docker OK"
echo ""

# 2. Aplicar migraciones
echo "→ Aplicando migraciones..."
docker compose exec -T backend python manage.py migrate --noinput
echo "✓ Migraciones aplicadas"
echo ""

# 3. Verificar tabla en base de datos
echo "→ Verificando tabla 'readings'..."
if docker compose exec -T db psql -U postgres -d bvs_db -c "SELECT 1 FROM readings LIMIT 1;" > /dev/null 2>&1; then
    echo "✓ Tabla 'readings' existe y es accesible"
else
    echo "⚠️  Tabla 'readings' no existe o no es accesible"
    echo "   Verificando estructura de tabla..."
    docker compose exec -T db psql -U postgres -d bvs_db -c "\dt" | grep readings || echo "   Tabla no encontrada en \dt"
fi
echo ""

# 4. Contar libros
echo "→ Verificando libros..."
BOOK_COUNT=$(docker compose exec -T db psql -U postgres -d bvs_db -t -c "SELECT COUNT(*) FROM books;" 2>/dev/null | tr -d ' \n\r')
if [ -n "$BOOK_COUNT" ] && [ "$BOOK_COUNT" -gt 0 ]; then
    echo "✓ Hay $BOOK_COUNT libro(s) disponible(s)"
else
    echo "⚠️  No hay libros en la base de datos"
fi
echo ""

# 5. Reiniciar servicios
echo "→ Reiniciando backend y frontend..."
docker compose restart backend frontend
echo "✓ Servicios reiniciados"
echo ""

# 6. Esperar a que los servicios estén listos
echo "→ Esperando a que los servicios estén listos..."
sleep 10

# 7. Verificar que responden
BACKEND_OK=0
FRONTEND_OK=0

if curl -s http://localhost:8000/api/books/ > /dev/null 2>&1; then
    echo "✓ Backend respondiendo en http://localhost:8000"
    BACKEND_OK=1
else
    echo "⚠️  Backend no responde aún (puede necesitar más tiempo)"
fi

if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✓ Frontend respondiendo en http://localhost:3000"
    FRONTEND_OK=1
else
    echo "⚠️  Frontend no responde aún (puede necesitar más tiempo)"
fi

echo ""
echo "════════════════════════════════════════════════════════════"
echo "  ✓ PROCESO COMPLETADO"
echo "════════════════════════════════════════════════════════════"
echo ""

if [ $BACKEND_OK -eq 1 ] && [ $FRONTEND_OK -eq 1 ]; then
    echo "✅ Todo está funcionando correctamente!"
    echo ""
    echo "Próximos pasos:"
    echo "  1. Abre http://localhost:3000 en tu navegador"
    echo "  2. Inicia sesión"
    echo "  3. Ve a la biblioteca y selecciona un libro"
    echo "  4. Haz clic en 'Leer' para abrir el visor PDF"
else
    echo "⚠️  Los servicios pueden necesitar más tiempo para iniciar"
    echo ""
    echo "Comandos útiles:"
    echo "  • Ver estado: docker compose ps"
    echo "  • Ver logs backend: docker compose logs backend --tail=50"
    echo "  • Ver logs frontend: docker compose logs frontend --tail=50"
    echo "  • Esperar y reintentar: sleep 20 && curl http://localhost:8000/api/books/"
fi

echo ""
echo "Si el error persiste:"
echo "  • Ejecuta: bash debug-reading-error.sh"
echo "  • O revisa: cat README_FIX_READING.md"
echo ""
