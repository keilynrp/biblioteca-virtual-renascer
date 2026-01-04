#!/bin/bash

echo "=========================================="
echo "APLICANDO CAMBIOS - FASE 1"
echo "Reviews, Favoritos y Reading History"
echo "=========================================="
echo ""

# ============================================
# BACKEND - MIGRACIONES
# ============================================
echo "📦 PASO 1: BACKEND - Migraciones de Base de Datos"
echo "=================================================="
echo ""

echo "[1/4] Creando migraciones..."
docker compose exec backend python manage.py makemigrations content

if [ $? -ne 0 ]; then
    echo "❌ ERROR: No se pudieron crear las migraciones"
    echo "Verifica que Docker esté corriendo: docker compose ps"
    exit 1
fi

echo ""
echo "[2/4] Aplicando migraciones a la base de datos..."
docker compose exec backend python manage.py migrate

if [ $? -ne 0 ]; then
    echo "❌ ERROR: No se pudieron aplicar las migraciones"
    exit 1
fi

echo ""
echo "[3/4] Verificando tablas creadas..."
docker compose exec backend python manage.py shell -c "
from apps.content.models import Review, Favorite, ReadingHistory, ReviewHelpful
print('\n✅ Tablas creadas exitosamente:')
print(f'  - {Review._meta.db_table}')
print(f'  - {ReviewHelpful._meta.db_table}')
print(f'  - {Favorite._meta.db_table}')
print(f'  - {ReadingHistory._meta.db_table}')
print(f'\n📊 Contadores actuales:')
print(f'  Reviews: {Review.objects.count()}')
print(f'  Favoritos: {Favorite.objects.count()}')
print(f'  Reading History: {ReadingHistory.objects.count()}')
"

echo ""
echo "[4/4] Reiniciando backend para aplicar cambios en código..."
docker compose restart backend

echo ""
echo "✅ Backend actualizado correctamente"
echo ""

# ============================================
# FRONTEND - REINSTALAR DEPENDENCIAS
# ============================================
echo "🎨 PASO 2: FRONTEND - Verificar dependencias"
echo "=============================================="
echo ""

echo "[1/2] Verificando que el frontend esté corriendo..."
docker compose ps frontend

echo ""
echo "[2/2] Reiniciando frontend para aplicar cambios..."
docker compose restart frontend

echo ""
echo "✅ Frontend actualizado correctamente"
echo ""

# ============================================
# RESUMEN
# ============================================
echo "=========================================="
echo "✅ TODOS LOS CAMBIOS APLICADOS"
echo "=========================================="
echo ""
echo "🎯 Nuevos endpoints de API disponibles:"
echo ""
echo "📝 REVIEWS:"
echo "  - GET/POST   /api/content/books/<slug>/reviews/"
echo "  - GET/PUT/DELETE /api/content/reviews/<pk>/"
echo "  - POST       /api/content/reviews/<pk>/helpful/"
echo "  - GET        /api/content/user/reviews/"
echo ""
echo "❤️  FAVORITOS:"
echo "  - GET        /api/content/user/favorites/"
echo "  - POST       /api/content/user/favorites/<book_id>/"
echo ""
echo "📚 READING HISTORY:"
echo "  - GET        /api/content/user/reading-history/"
echo "  - POST       /api/content/user/reading-history/<book_id>/"
echo ""
echo "🎨 Nuevos componentes de React disponibles:"
echo "  - ReviewForm"
echo "  - ReviewList"
echo "  - FavoriteButton"
echo "  - ReadingStatusSelector"
echo "  - BookCard (actualizado con ratings y favoritos)"
echo ""
echo "🔗 URLs de acceso:"
echo "  - Backend:  http://localhost:8000"
echo "  - Frontend: http://localhost:3000"
echo "  - API Docs: http://localhost:8000/api/docs"
echo ""
echo "📋 Siguiente paso:"
echo "  1. Verifica que los servicios estén corriendo: docker compose ps"
echo "  2. Accede al frontend y prueba las nuevas funcionalidades"
echo "  3. Revisa los logs si hay algún error: docker compose logs -f"
echo ""
