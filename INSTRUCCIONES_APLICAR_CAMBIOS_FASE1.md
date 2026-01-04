# Instrucciones: Cómo Aplicar los Cambios de Fase 1

## 📋 Resumen de Cambios Implementados

### Backend (Python/Django)
- ✅ 4 nuevos modelos: Review, ReviewHelpful, Favorite, ReadingHistory
- ✅ 3 propiedades computadas en Book: average_rating, review_count, favorite_count
- ✅ 4 nuevos serializers
- ✅ 8 nuevas views (API endpoints)
- ✅ 9 nuevas rutas URL
- ✅ 1 nueva permission class
- ✅ 2 nuevos signals

### Frontend (Next.js/TypeScript)
- ✅ 1 nuevo store: bookStore.ts
- ✅ 4 nuevos componentes: ReviewForm, ReviewList, FavoriteButton, ReadingStatusSelector
- ✅ 1 componente modificado: BookCard (ahora muestra ratings y favoritos)

---

## 🚀 Pasos para Aplicar los Cambios

### PASO 1: Verificar que Docker esté corriendo

```bash
docker compose ps
```

Deberías ver los servicios: backend, frontend, db, elasticsearch, redis corriendo.

Si no están corriendo:
```bash
docker compose up -d
```

---

### PASO 2: Aplicar Migraciones de Base de Datos (BACKEND)

Este es el paso **MÁS IMPORTANTE**. Sin esto, el backend no funcionará.

#### Opción A: Usar el script automatizado
```bash
bash aplicar-cambios-fase1.sh
```

#### Opción B: Comandos manuales paso a paso

```bash
# 1. Crear las migraciones
docker compose exec backend python manage.py makemigrations content

# Deberías ver algo como:
# Migrations for 'content':
#   apps/content/migrations/0004_review_reviewhelpful_favorite_readinghistory.py
#     - Create model Review
#     - Create model ReviewHelpful
#     - Create model Favorite
#     - Create model ReadingHistory

# 2. Aplicar las migraciones
docker compose exec backend python manage.py migrate

# Deberías ver:
# Running migrations:
#   Applying content.0004_review_reviewhelpful_favorite_readinghistory... OK

# 3. Verificar que las tablas se crearon
docker compose exec backend python manage.py shell -c "
from apps.content.models import Review, Favorite, ReadingHistory, ReviewHelpful
print('Tablas creadas:')
print(f'  - {Review._meta.db_table}')
print(f'  - {ReviewHelpful._meta.db_table}')
print(f'  - {Favorite._meta.db_table}')
print(f'  - {ReadingHistory._meta.db_table}')
"
```

---

### PASO 3: Reiniciar Servicios (BACKEND Y FRONTEND)

Para que los cambios de código se reflejen:

```bash
# Reiniciar backend
docker compose restart backend

# Reiniciar frontend
docker compose restart frontend

# O reiniciar todo
docker compose restart
```

---

### PASO 4: Verificar que Todo Funciona

#### A. Verificar Backend (API)

Accede a: http://localhost:8000/api/content/

Deberías ver los nuevos endpoints:

```
GET  /api/content/books/<slug>/reviews/
POST /api/content/books/<slug>/reviews/
GET  /api/content/reviews/<pk>/
POST /api/content/reviews/<pk>/helpful/
GET  /api/content/user/favorites/
POST /api/content/user/favorites/<book_id>/
GET  /api/content/user/reading-history/
POST /api/content/user/reading-history/<book_id>/
```

#### B. Verificar Frontend

1. Accede a: http://localhost:3000
2. Los componentes ya están creados pero **NO están integrados en las páginas aún**
3. Necesitarás importarlos en las páginas donde quieras usarlos

---

## 🎨 Cómo Usar los Nuevos Componentes en el Frontend

### Ejemplo: Página de Detalle de Libro

Crea o modifica el archivo de detalle del libro (ejemplo: `/library/[slug]/page.tsx`):

```typescript
import { ReviewForm } from "@/components/review-form"
import { ReviewList } from "@/components/review-list"
import { FavoriteButton } from "@/components/favorite-button"
import { ReadingStatusSelector } from "@/components/reading-status-selector"

export default function BookDetailPage({ params }: { params: { slug: string } }) {
    // ... tu código existente para cargar el libro

    return (
        <div>
            {/* Información del libro */}
            <div className="book-info">
                <h1>{book.title}</h1>

                {/* Botón de favorito */}
                <FavoriteButton
                    bookId={book.id}
                    initialFavorited={book.user_has_favorited}
                />

                {/* Selector de estado de lectura */}
                <ReadingStatusSelector
                    bookId={book.id}
                    initialStatus={book.user_reading_status?.status}
                />
            </div>

            {/* Sección de Reviews */}
            <div className="reviews-section mt-8">
                <h2>Reseñas</h2>

                {/* Formulario para escribir review (solo usuarios autenticados) */}
                <ReviewForm bookSlug={params.slug} />

                {/* Lista de reviews existentes */}
                <ReviewList bookSlug={params.slug} />
            </div>
        </div>
    )
}
```

### Componentes Individuales

#### FavoriteButton
```typescript
<FavoriteButton
    bookId={1}
    initialFavorited={false}
    variant="default"  // "default" | "outline" | "ghost"
    size="default"     // "default" | "sm" | "lg" | "icon"
    showLabel={true}   // mostrar/ocultar texto
/>
```

#### ReadingStatusSelector
```typescript
<ReadingStatusSelector
    bookId={1}
    initialStatus="reading"  // "want_to_read" | "reading" | "completed" | "abandoned"
    onStatusChange={(status) => console.log('Nuevo estado:', status)}
/>
```

#### ReviewForm
```typescript
<ReviewForm
    bookSlug="libro-ejemplo"
    onSuccess={() => {
        // Callback cuando se crea la review exitosamente
        console.log('Review creada!')
    }}
/>
```

#### ReviewList
```typescript
<ReviewList bookSlug="libro-ejemplo" />
```

---

## 🔍 Verificar Logs en Caso de Errores

Si algo no funciona:

```bash
# Ver logs del backend
docker compose logs backend -f

# Ver logs del frontend
docker compose logs frontend -f

# Ver todos los logs
docker compose logs -f
```

---

## 🧪 Probar los Endpoints con curl o Postman

### 1. Crear una Review
```bash
curl -X POST http://localhost:8000/api/content/books/libro-slug/reviews/ \
  -H "Authorization: Bearer TU_TOKEN_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "rating": 5,
    "title": "Excelente libro",
    "comment": "Me encantó este libro, muy recomendado"
  }'
```

### 2. Marcar Review como Útil
```bash
curl -X POST http://localhost:8000/api/content/reviews/1/helpful/ \
  -H "Authorization: Bearer TU_TOKEN_JWT"
```

### 3. Toggle Favorito
```bash
curl -X POST http://localhost:8000/api/content/user/favorites/1/ \
  -H "Authorization: Bearer TU_TOKEN_JWT"
```

### 4. Actualizar Estado de Lectura
```bash
curl -X POST http://localhost:8000/api/content/user/reading-history/1/ \
  -H "Authorization: Bearer TU_TOKEN_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "reading"
  }'
```

---

## ❓ Preguntas Frecuentes

### ¿Los cambios de código ya están en el proyecto?
✅ SÍ. Todos los archivos ya han sido modificados/creados.

### ¿Qué falta hacer?
- Ejecutar las migraciones de base de datos (PASO 2)
- Reiniciar los servicios (PASO 3)
- Integrar los componentes en tus páginas (PASO 4)

### ¿Los componentes funcionarán automáticamente?
⚠️ NO. Los componentes están creados pero necesitas importarlos y usarlos en tus páginas.

### ¿Necesito instalar nuevas dependencias?
✅ NO. Todas las dependencias necesarias ya están instaladas:
- zustand
- axios
- lucide-react
- date-fns
- shadcn/ui components

---

## 📊 Estructura Final de Archivos Modificados

```
backend/
  apps/content/
    ├── models.py              (MODIFICADO - 4 nuevos modelos)
    ├── serializers.py         (MODIFICADO - 4 nuevos serializers)
    ├── views.py               (MODIFICADO - 8 nuevas views)
    ├── urls.py                (MODIFICADO - 9 nuevas rutas)
    ├── permissions.py         (NUEVO - IsOwnerOrReadOnly)
    └── signals.py             (MODIFICADO - 2 nuevos signals)

frontend/
  src/
    ├── store/
    │   └── bookStore.ts       (NUEVO - estado para reviews/favorites)
    └── components/
        ├── review-form.tsx    (NUEVO)
        ├── review-list.tsx    (NUEVO)
        ├── favorite-button.tsx (NUEVO)
        ├── reading-status-selector.tsx (NUEVO)
        └── book-card.tsx      (MODIFICADO - muestra ratings/favoritos)
```

---

## ✅ Checklist de Verificación

- [ ] Docker compose está corriendo
- [ ] Migraciones creadas (`makemigrations`)
- [ ] Migraciones aplicadas (`migrate`)
- [ ] Backend reiniciado
- [ ] Frontend reiniciado
- [ ] Endpoints de API accesibles
- [ ] No hay errores en los logs
- [ ] Componentes importados en las páginas necesarias
- [ ] Probado crear una review
- [ ] Probado marcar favorito
- [ ] Probado cambiar estado de lectura

---

¿Necesitas ayuda con algún paso específico?
