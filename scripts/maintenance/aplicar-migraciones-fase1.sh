#!/bin/bash

echo "========================================"
echo "Aplicando Migraciones - Fase 1"
echo "Reviews, Favoritos y Reading History"
echo "========================================"
echo ""

echo "[1/3] Creando migraciones..."
docker compose exec backend python manage.py makemigrations content
echo ""

if [ $? -ne 0 ]; then
    echo "❌ ERROR: No se pudieron crear las migraciones"
    echo "Verifica que Docker esté corriendo: docker compose ps"
    exit 1
fi

echo "[2/3] Aplicando migraciones..."
docker compose exec backend python manage.py migrate
echo ""

if [ $? -ne 0 ]; then
    echo "❌ ERROR: No se pudieron aplicar las migraciones"
    exit 1
fi

echo "[3/3] Verificando tablas creadas..."
docker compose exec backend python manage.py shell -c "
from apps.content.models import Review, Favorite, ReadingHistory, ReviewHelpful
print('\n✅ Tablas creadas:')
print(f'  - {Review._meta.db_table}')
print(f'  - {ReviewHelpful._meta.db_table}')
print(f'  - {Favorite._meta.db_table}')
print(f'  - {ReadingHistory._meta.db_table}')
print(f'\n📊 Contadores:')
print(f'  Reviews: {Review.objects.count()}')
print(f'  Favoritos: {Favorite.objects.count()}')
print(f'  Reading History: {ReadingHistory.objects.count()}')
"
echo ""

echo "========================================"
echo "✅ Migraciones completadas exitosamente!"
echo "========================================"
echo ""
echo "Nuevos endpoints disponibles:"
echo "  - GET/POST /api/content/books/<slug>/reviews/"
echo "  - POST /api/content/reviews/<pk>/helpful/"
echo "  - GET/POST /api/content/user/favorites/"
echo "  - GET/POST /api/content/user/reading-history/"
echo ""
echo "Siguiente paso: Continuar con componentes de React"
echo ""
