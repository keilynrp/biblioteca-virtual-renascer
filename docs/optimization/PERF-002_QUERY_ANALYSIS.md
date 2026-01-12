# Análisis de Optimización de Queries PostgreSQL - PERF-002

**Fecha**: 2026-01-12
**Estado**: En Progreso
**Prioridad**: P1 - Alta

---

## 🎯 Objetivos

1. Eliminar queries N+1
2. Agregar índices compuestos faltantes
3. Optimizar propiedades de modelos con annotate/aggregate
4. Reducir el tiempo de respuesta de APIs críticas

---

## 📊 Análisis de Queries Actuales

### ✅ Áreas Bien Optimizadas

#### Views con `select_related` Correcto:
- `BookListView`: `select_related('author', 'category')` ✅
- `BookDetailView`: `select_related('author', 'category')` ✅
- `ReviewListCreateView`: `select_related('user')` ✅
- `FavoriteListView`: `select_related('book', 'book__author', 'book__category')` ✅
- `ReadingHistoryListView`: `select_related('book', 'book__author', 'book__category')` ✅
- `ReadingListView`: `select_related('book', 'book__author', 'book__category')` ✅
- `BookmarkListCreateView`: `select_related('book')` ✅
- `HighlightListCreateView`: `select_related('book')` ✅
- `AnnotationListCreateView`: `select_related('book', 'highlight')` ✅

#### Índices Existentes Bien Diseñados:
```python
# Category
indexes = [
    models.Index(fields=['slug'], name='category_slug_idx'),
    models.Index(fields=['name'], name='category_name_idx'),
]

# Author
indexes = [
    models.Index(fields=['name'], name='author_name_idx'),
]

# Book
indexes = [
    models.Index(fields=['category', '-created_at'], name='book_cat_created_idx'),
    models.Index(fields=['author', '-created_at'], name='book_auth_created_idx'),
    models.Index(fields=['is_premium', '-created_at'], name='book_prem_created_idx'),
    models.Index(fields=['-created_at'], name='book_created_idx'),
    models.Index(fields=['slug'], name='book_slug_idx'),
    models.Index(fields=['title'], name='book_title_idx'),
]
```

---

## ❌ Problemas Identificados

### 1. **CRÍTICO: Propiedades que causan N+1 queries**

**Ubicación**: `backend/apps/content/models.py` - Book model

```python
@property
def average_rating(self):
    """Calculate average rating from reviews"""
    from django.db.models import Avg
    avg = self.reviews.aggregate(Avg('rating'))['rating__avg']  # ⚠️ QUERY PER BOOK!
    return round(avg, 1) if avg else 0.0

@property
def review_count(self):
    """Count total reviews"""
    return self.reviews.count()  # ⚠️ QUERY PER BOOK!

@property
def favorite_count(self):
    """Count total favorites"""
    return self.favorited_by.count()  # ⚠️ QUERY PER BOOK!
```

**Impacto**: Cuando se listan 12 libros en la página principal:
- Sin optimización: **1 query inicial + 36 queries adicionales (3 por libro)**
- Con optimización: **1 query con annotate**

**Solución**: Usar `annotate()` en el queryset de las views.

---

### 2. **CRÍTICO: Serializer methods que causan N+1**

**Ubicación**: `backend/apps/content/serializers.py` - BookDetailSerializer

```python
def get_user_has_favorited(self, obj):
    request = self.context.get('request')
    if request and request.user.is_authenticated:
        return obj.favorited_by.filter(user=request.user).exists()  # ⚠️ QUERY PER BOOK!
    return False

def get_user_review(self, obj):
    request = self.context.get('request')
    if request and request.user.is_authenticated:
        review = obj.reviews.filter(user=request.user).first()  # ⚠️ QUERY PER BOOK!
        if review:
            return ReviewSerializer(review, context=self.context).data
    return None

def get_user_reading_status(self, obj):
    request = self.context.get('request')
    if request and request.user.is_authenticated:
        history = obj.readers.filter(user=request.user).first()  # ⚠️ QUERY PER BOOK!
        if history:
            return ReadingHistorySerializer(history, context=self.context).data
    return None
```

**Impacto**: Para un usuario autenticado viendo 12 libros:
- Sin optimización: **1 query inicial + 36 queries adicionales (3 por libro)**
- Con optimización: **1 query inicial + 3 prefetch queries**

**Solución**: Usar `prefetch_related()` con `Prefetch` objects.

---

### 3. **MENOR: Índices compuestos faltantes**

Algunos filtros comunes no tienen índices compuestos:

```python
# ReadingHistory - filtrado frecuente por user + status
# Actual: Index solo en ['user', 'status', '-last_read_at']
# Recomendación: Ya está bien

# Bookmark - filtrado frecuente por user + book
# Actual: Index en ['user', 'book']
# Recomendación: Ya está bien
```

**Índices sugeridos adicionales**:

```python
# Review - búsquedas por rating y book
models.Index(fields=['book', '-rating', '-created_at'], name='review_book_rating_idx')

# Favorite - conteo por libro (para favorite_count)
# Ya existe unique_together que crea índice

# ISBN búsqueda (para búsquedas por ISBN)
models.Index(fields=['isbn'], name='book_isbn_idx')
```

---

## 🔧 Plan de Implementación

### Fase 1: Optimizar Propiedades de Book (CRÍTICO)

**Archivo**: `backend/apps/content/views.py`

Modificar `BookListView` y `BookDetailView` para agregar annotate:

```python
from django.db.models import Count, Avg, Exists, OuterRef

class BookListView(generics.ListCreateAPIView):
    def get_queryset(self):
        queryset = Book.objects.select_related('author', 'category').annotate(
            average_rating_annotated=Avg('reviews__rating'),
            review_count_annotated=Count('reviews', distinct=True),
            favorite_count_annotated=Count('favorited_by', distinct=True)
        )
        return queryset
```

### Fase 2: Optimizar Serializer Methods (CRÍTICO)

**Archivo**: `backend/apps/content/views.py`

Agregar prefetch_related con Prefetch objects:

```python
from django.db.models import Prefetch

class BookDetailView(generics.RetrieveUpdateDestroyAPIView):
    def get_queryset(self):
        user = self.request.user
        queryset = Book.objects.select_related('author', 'category').annotate(
            average_rating_annotated=Avg('reviews__rating'),
            review_count_annotated=Count('reviews', distinct=True),
            favorite_count_annotated=Count('favorited_by', distinct=True)
        )

        if user.is_authenticated:
            queryset = queryset.prefetch_related(
                Prefetch(
                    'favorited_by',
                    queryset=Favorite.objects.filter(user=user),
                    to_attr='user_favorites'
                ),
                Prefetch(
                    'reviews',
                    queryset=Review.objects.filter(user=user),
                    to_attr='user_reviews_cached'
                ),
                Prefetch(
                    'readers',
                    queryset=ReadingHistory.objects.filter(user=user),
                    to_attr='user_reading_cached'
                )
            )

        return queryset
```

**Archivo**: `backend/apps/content/serializers.py`

Modificar serializer para usar datos prefetched:

```python
def get_user_has_favorited(self, obj):
    if hasattr(obj, 'user_favorites'):
        return len(obj.user_favorites) > 0
    # Fallback a query si no está prefetched
    request = self.context.get('request')
    if request and request.user.is_authenticated:
        return obj.favorited_by.filter(user=request.user).exists()
    return False
```

### Fase 3: Agregar Índices Compuestos

**Archivo**: `backend/apps/content/models.py`

Agregar nuevos índices:

```python
class Book(models.Model):
    class Meta:
        indexes = [
            # Existentes...
            # Nuevos:
            models.Index(fields=['isbn'], name='book_isbn_idx'),
        ]

class Review(models.Model):
    class Meta:
        indexes = [
            # Existentes...
            # Nuevos:
            models.Index(fields=['book', '-rating', '-created_at'], name='review_book_rating_idx'),
        ]
```

### Fase 4: Migración y Testing

1. Crear migración para nuevos índices
2. Ejecutar tests de performance
3. Comparar tiempos antes/después
4. Validar que no hay regresiones

---

## 📈 Impacto Esperado

### Queries Reducidas

**BookListView (12 libros):**
- Antes: ~37 queries (1 inicial + 36 adicionales)
- Después: **1 query con annotate**
- Mejora: **97% menos queries**

**BookDetailView (1 libro, usuario autenticado):**
- Antes: ~7 queries (1 inicial + 3 properties + 3 serializer methods)
- Después: **4 queries** (1 inicial + 3 prefetch)
- Mejora: **43% menos queries**

### Tiempo de Respuesta

- BookListView: 150ms → **~50ms** (66% más rápido)
- BookDetailView: 80ms → **~40ms** (50% más rápido)

---

## ✅ Checklist de Implementación

- [ ] Optimizar propiedades de Book con annotate
- [ ] Actualizar BookListView para usar annotate
- [ ] Actualizar BookDetailView para usar annotate + prefetch
- [ ] Modificar BookDetailSerializer para usar datos prefetched
- [ ] Agregar índice en ISBN
- [ ] Agregar índice en Review (book, rating, created_at)
- [ ] Crear migración para nuevos índices
- [ ] Ejecutar tests de performance
- [ ] Documentar resultados
- [ ] Commit y push

---

**Próximo paso**: Implementar Fase 1 (Annotate para propiedades)
