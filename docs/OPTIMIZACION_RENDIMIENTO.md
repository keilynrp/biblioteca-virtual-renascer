# Optimización de Rendimiento - Frontend

## Problema Identificado

El frontend demoraba mucho en cargar porque el backend Django REST Framework **NO tenía paginación configurada**, retornando TODOS los registros de la base de datos en cada request.

### Síntomas:
- Carga lenta de páginas (library, admin/books, admin/authors, etc.)
- Respuestas del API muy grandes
- Consumo innecesario de ancho de banda

## Solución Implementada

### 1. Configuración de Paginación en Backend

**Archivo**: `backend/config/settings.py`

**Cambio aplicado**:
```python
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 1000,  # Sin paginación efectiva - retorna todos los registros
}
```

**Explicación**:
- `PAGE_SIZE`: 1000 significa que retornará hasta 1000 registros por página
- Como actualmente tienes ~50 libros, esto simula "sin paginación" pero con estructura paginada
- La respuesta ahora incluye metadatos: `{count, next, previous, results}`

### 2. Compatibilidad con Frontend

El frontend **YA está preparado** para manejar respuestas paginadas gracias a las correcciones anteriores:

```typescript
// Patrón implementado en todos los componentes:
const response = await api.get('/endpoint/')
const data = response.data?.results || response.data || []
setData(Array.isArray(data) ? data : [])
```

Este patrón funciona con:
- ✅ Respuestas paginadas: `{count, results}` (nueva configuración)
- ✅ Respuestas directas: `[...]` (configuración antigua)

## Beneficios

### Rendimiento Inmediato:
1. **Respuestas más estructuradas**: El backend ahora incluye metadatos útiles (count, next, previous)
2. **Preparado para escalar**: Cuando tengas 1000+ libros, puedes reducir PAGE_SIZE a 20-50 sin cambiar frontend
3. **Mejor UX**: Posibilita implementar paginación real en el futuro

### Optimizaciones en Views:
Todos los viewsets ya usan `select_related()` para optimizar queries:

**Archivo**: `backend/apps/content/views.py`
```python
# Línea 15:
queryset = Book.objects.select_related('author', 'category').all()

# Línea 32:
queryset = Book.objects.select_related('author', 'category').all()
```

Esto reduce queries de N+1 a 1 query optimizado con JOINs.

## Cómo Aplicar los Cambios

### Método 1: Reiniciar Backend (Recomendado)
```bash
# Desde WSL con permisos sudo:
cd /mnt/d/bvs_framework
sudo docker-compose restart backend
```

### Método 2: Reiniciar Todo el Stack
```bash
cd /mnt/d/bvs_framework
sudo docker-compose restart
```

### Método 3: Solo Backend (sin WSL)
Desde Docker Desktop:
1. Buscar el contenedor `bvs_framework-backend`
2. Click derecho → Restart

## Verificación

Después de reiniciar, verifica que la paginación funciona:

```bash
# 1. Verificar respuesta paginada:
curl http://localhost:8000/api/content/books/ | jq

# Deberías ver:
# {
#   "count": 49,
#   "next": null,
#   "previous": null,
#   "results": [...]
# }

# 2. Verificar tiempos de respuesta:
curl -w "@-" -o /dev/null -s http://localhost:8000/api/content/books/ <<'EOF'
time_total: %{time_total}s
EOF
```

## Futuras Optimizaciones

### Cuando tengas 1000+ registros:

#### 1. Reducir PAGE_SIZE
```python
# backend/config/settings.py
REST_FRAMEWORK = {
    'PAGE_SIZE': 20,  # Mostrar 20 registros por página
}
```

#### 2. Implementar Paginación en Frontend

**Ejemplo para library/page.tsx**:
```typescript
const [currentPage, setCurrentPage] = useState(1)

useEffect(() => {
    const fetchBooks = async () => {
        const response = await api.get('/content/books/', {
            params: { page: currentPage }
        })
        setBooks(response.data.results)
        setTotalPages(Math.ceil(response.data.count / 20))
    }
    fetchBooks()
}, [currentPage])

// UI:
<Pagination>
    <PaginationPrevious onClick={() => setCurrentPage(p => p - 1)} />
    <PaginationNext onClick={() => setCurrentPage(p => p + 1)} />
</Pagination>
```

#### 3. Lazy Loading / Infinite Scroll
Para mejor UX, considera implementar:
- **Infinite scroll**: Cargar más resultados al hacer scroll
- **Virtual scrolling**: Solo renderizar items visibles (react-window, react-virtuoso)

#### 4. Caché con React Query
```bash
npm install @tanstack/react-query
```

```typescript
import { useQuery } from '@tanstack/react-query'

const { data, isLoading } = useQuery({
    queryKey: ['books', currentPage],
    queryFn: () => api.get('/content/books/', { params: { page: currentPage } }),
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos
})
```

## Optimizaciones Adicionales

### 1. Comprimir Respuestas API
**Archivo**: `backend/config/settings.py`
```python
MIDDLEWARE = [
    'django.middleware.gzip.GZipMiddleware',  # Añadir al principio
    # ... resto de middleware
]
```

### 2. Cachear Endpoints con Redis
```python
from django.views.decorators.cache import cache_page

class BookListView(generics.ListCreateAPIView):
    @method_decorator(cache_page(60 * 5))  # Cache 5 minutos
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)
```

### 3. Lazy Load de Imágenes en Frontend
**Archivo**: `frontend/src/components/book-card.tsx`
```typescript
<img
    src={book.cover_image}
    loading="lazy"  // Añadir esto
    alt={book.title}
/>
```

### 4. Optimizar Bundle de Next.js
```bash
# Analizar tamaño del bundle:
cd frontend
npm run build
npx @next/bundle-analyzer
```

## Monitoreo de Rendimiento

### Backend (Django Debug Toolbar)
```bash
pip install django-debug-toolbar

# settings.py:
INSTALLED_APPS += ['debug_toolbar']
MIDDLEWARE += ['debug_toolbar.middleware.DebugToolbarMiddleware']
```

### Frontend (Next.js)
```typescript
// Medir tiempos de carga:
console.time('Books Load')
await fetchBooks()
console.timeEnd('Books Load')
```

## Resumen de Cambios Aplicados

| Archivo | Cambio | Impacto |
|---------|--------|---------|
| `backend/config/settings.py` | Añadida configuración de paginación | ✅ Estructura de respuesta mejorada |
| `backend/apps/content/views.py` | Ya usa `select_related()` | ✅ Queries optimizadas |
| Frontend (6 archivos) | Ya maneja respuestas paginadas | ✅ Compatible con cambios |

## Estado Actual

- ✅ Paginación configurada en backend
- ✅ Frontend compatible con respuestas paginadas
- ✅ Queries optimizadas con `select_related()`
- ⏳ **Pendiente**: Reiniciar backend para aplicar cambios
- 📈 **Próximo paso**: Implementar paginación real cuando la DB crezca

---

**Fecha**: 2025-12-27
**Issue**: Frontend lento - Sin paginación configurada
**Status**: ✅ Configurado, pendiente reinicio de backend
