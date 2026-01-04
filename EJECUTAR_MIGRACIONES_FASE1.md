# Instrucciones para Ejecutar Migraciones - Fase 1

## Backend completado ✅

Se han creado todos los archivos necesarios para la Fase 1 (Reviews, Favoritos, Reading History):

### Archivos modificados:
- ✅ `backend/apps/content/models.py` - Nuevos modelos: Review, ReviewHelpful, Favorite, ReadingHistory
- ✅ `backend/apps/content/serializers.py` - Serializers para las nuevas funcionalidades
- ✅ `backend/apps/content/views.py` - 9 nuevas vistas (reviews, favoritos, reading history)
- ✅ `backend/apps/content/urls.py` - 9 nuevos endpoints
- ✅ `backend/apps/content/signals.py` - Signals para logging
- ✅ `backend/apps/content/permissions.py` - Nueva permission IsOwnerOrReadOnly

## Pasos para ejecutar las migraciones

### Opción 1: Desde Docker (Recomendado)

```bash
# 1. Crear las migraciones
docker compose exec backend python manage.py makemigrations content

# 2. Aplicar las migraciones
docker compose exec backend python manage.py migrate

# 3. Verificar que se crearon las tablas
docker compose exec backend python manage.py shell
```

En el shell de Django:
```python
from apps.content.models import Review, Favorite, ReadingHistory
print(f"Reviews: {Review.objects.count()}")
print(f"Favorites: {Favorite.objects.count()}")
print(f"Reading History: {ReadingHistory.objects.count()}")
exit()
```

### Opción 2: Script automatizado

Crear un archivo `backend/aplicar_migraciones_fase1.sh`:

```bash
#!/bin/bash
echo "==================================="
echo "Aplicando Migraciones - Fase 1"
echo "==================================="
echo ""

echo "[1/3] Creando migraciones..."
docker compose exec backend python manage.py makemigrations content

echo ""
echo "[2/3] Aplicando migraciones..."
docker compose exec backend python manage.py migrate

echo ""
echo "[3/3] Verificando tablas creadas..."
docker compose exec backend python manage.py shell -c "
from apps.content.models import Review, Favorite, ReadingHistory, ReviewHelpful
print('✅ Tablas creadas:')
print(f'  - reviews: {Review._meta.db_table}')
print(f'  - review_helpful: {ReviewHelpful._meta.db_table}')
print(f'  - favorites: {Favorite._meta.db_table}')
print(f'  - reading_history: {ReadingHistory._meta.db_table}')
"

echo ""
echo "==================================="
echo "✅ Migraciones completadas!"
echo "==================================="
```

## Tablas que se crearán

1. **reviews** - Reseñas de libros
   - Campos: id, book_id, user_id, rating, title, comment, is_verified_reader, helpful_count, created_at, updated_at
   - Constraints: unique_together(book, user)

2. **review_helpful** - Votos útiles en reseñas
   - Campos: id, review_id, user_id, created_at
   - Constraints: unique_together(review, user)

3. **favorites** - Libros favoritos
   - Campos: id, user_id, book_id, notes, created_at
   - Constraints: unique_together(user, book)

4. **reading_history** - Historial de lectura
   - Campos: id, user_id, book_id, status, progress_percentage, started_at, completed_at, last_read_at, created_at
   - Constraints: unique_together(user, book)

## Endpoints disponibles después de migrar

### Reviews
- `GET/POST /api/content/books/<slug>/reviews/` - Listar/crear reviews
- `GET/PUT/DELETE /api/content/reviews/<pk>/` - Detalle de review
- `POST /api/content/reviews/<pk>/helpful/` - Marcar como útil (toggle)
- `GET /api/content/user/reviews/` - Mis reviews

### Favoritos
- `GET /api/content/user/favorites/` - Mis favoritos
- `POST /api/content/user/favorites/<book_id>/` - Toggle favorito

### Reading History
- `GET /api/content/user/reading-history/` - Mi historial (filtrable por status)
- `POST /api/content/user/reading-history/<book_id>/` - Actualizar estado

## Siguiente paso

Una vez ejecutadas las migraciones, continuar con el frontend (bookStore, componentes React).
