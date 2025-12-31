# Elasticsearch Search Feature

## 📋 Overview

Implementación completa de búsqueda avanzada con Elasticsearch, incluyendo autocomplete en tiempo real, búsqueda full-text, filtros facetados y navegación por teclado.

## ✨ Features

### 1. **SearchBar Component**
- Autocomplete en tiempo real con debounce de 300ms
- Navegación por teclado (flechas, Enter, Escape)
- Muestra hasta 5 sugerencias relevantes
- Click fuera cierra el dropdown automáticamente
- Botón de limpiar (X) cuando hay texto
- Indicador de carga (spinner)

### 2. **Search Results Page**
- Página dedicada en `/search`
- Grid responsive de resultados (1-3 columnas)
- Paginación para más de 12 resultados
- Ordenamiento múltiple (relevancia, fecha, título, publicación)
- Estados de carga, vacío y error

### 3. **Advanced Filters**
- Sidebar con filtros facetados
- Categorías con contador de documentos
- Autores (top 10) con scroll
- Tipo de acceso (Premium/Gratis)
- Filtros activos mostrados como badges
- Botón "Limpiar todo" para resetear
- Colapso/expansión de secciones

### 4. **Elasticsearch Features**
- Multi-match en múltiples campos (título, autor, descripción, categoría)
- Fuzzy matching para tolerancia a errores tipográficos
- Scoring por relevancia (_score)
- Analizador personalizado para español
- Edge n-grams para autocomplete
- Agregaciones para filtros facetados

## 🔧 Architecture

### Frontend Components

```
frontend/src/
├── components/
│   ├── search-bar.tsx           # SearchBar con autocomplete
│   ├── search-filters.tsx       # Filtros sidebar
│   ├── book-card.tsx           # Card de libro (reusado)
│   └── pagination.tsx          # Paginación (reusado)
├── app/(dashboard)/
│   ├── layout.tsx              # Layout con SearchBar en header
│   └── search/
│       └── page.tsx            # Página de resultados
└── hooks/
    ├── use-debounce.ts         # Hook para debounce
    └── use-pagination.ts       # Hook para paginación
```

### Backend Endpoints

```
backend/apps/content/
├── views.py                     # API views
├── documents.py                # Elasticsearch documents
└── urls.py                     # URL routing
```

**API Endpoints:**

1. **Autocomplete**: `GET /api/content/search/autocomplete/`
   - Query params: `q` (query string), `size` (max suggestions)
   - Returns: `{ suggestions: [{ id, title, author, slug }] }`

2. **Search**: `GET /api/content/search/`
   - Query params: `q`, `category`, `author`, `is_premium`, `page`, `page_size`, `sort_by`
   - Returns: `{ count, page, page_size, total_pages, results }`

3. **Facets**: `GET /api/content/search/facets/`
   - Returns: `{ categories: [...], authors: [...], is_premium: [...] }`

4. **Rebuild Index**: `POST /api/content/search/rebuild-index/` (Admin only)
   - Reindexes all books in Elasticsearch

## 💾 Data Flow

### Autocomplete Flow

```
User types "harry"
  ↓
Debounce 300ms
  ↓
if (query.length >= 2)
  ↓
GET /api/content/search/autocomplete/?q=harry&size=5
  ↓
Backend: BookDocument.autocomplete(query)
  ↓
Elasticsearch: multi_match on title.autocomplete, author_name.autocomplete
  ↓
Returns top 5 results ordered by score
  ↓
Frontend: Display suggestions dropdown
  ↓
User clicks suggestion
  ↓
Navigate to /library/{slug}
```

### Full Search Flow

```
User submits search (Enter or "Ver todos")
  ↓
Navigate to /search?q=harry
  ↓
SearchPage extracts query params
  ↓
GET /api/content/search/?q=harry&page=1&page_size=12&sort_by=_score
  ↓
Backend: BookDocument.search_books(...)
  ↓
Elasticsearch:
  - multi_match query on multiple fields
  - Fuzzy matching with 'AUTO'
  - Field boosting (title^3, author^2)
  - Filters applied (category, author, is_premium)
  - Sorting by _score, created_at, title, or publication_date
  ↓
Returns paginated results with total count
  ↓
Frontend: Render grid of BookCards + Pagination
```

### Filters Flow

```
Page loads
  ↓
GET /api/content/search/facets/
  ↓
Backend: BookDocument.get_aggregations()
  ↓
Elasticsearch: Terms aggregations on category, author, is_premium
  ↓
Returns facets with document counts
  ↓
Frontend: Render SearchFilters sidebar
  ↓
User clicks filter (e.g., category "Fiction")
  ↓
Update URL: /search?q=harry&category=Fiction
  ↓
Triggers new search request with filter
  ↓
Results update
```

## 🎨 UI/UX Features

### SearchBar Component

**States:**
- Empty: Search icon visible
- Typing: Debounce indicator (300ms delay)
- Loading: Spinner animation
- Has text: Clear button (X) visible
- Has suggestions: Dropdown with results
- No results: "No se encontraron resultados" message

**Keyboard Navigation:**
- `ArrowDown`: Select next suggestion
- `ArrowUp`: Select previous suggestion
- `Enter`:
  - If suggestion selected → Navigate to book detail
  - If no selection → Navigate to search page
- `Escape`: Close dropdown
- Click outside: Close dropdown

**Visual Feedback:**
- Selected suggestion highlighted with `bg-muted`
- Hover effects on all interactive elements
- Smooth transitions (200ms-300ms)
- Icons for visual clarity (BookOpen, Search, X)

### Search Results Page

**Layout:**
```
┌────────────────────────────────────────────────────────────┐
│  [SearchBar]                                               │
├──────────────┬─────────────────────────────────────────────┤
│              │  Resultados para "harry"                    │
│  FILTROS     │  49 libros encontrados    [Sort ▼] [Filters]│
│              │                                             │
│  Categorías  │  ┌────────┐ ┌────────┐ ┌────────┐         │
│  ☑ Fiction   │  │ Book 1 │ │ Book 2 │ │ Book 3 │         │
│  ☐ Fantasy   │  └────────┘ └────────┘ └────────┘         │
│              │                                             │
│  Autores     │  ┌────────┐ ┌────────┐ ┌────────┐         │
│  ☑ J.K.      │  │ Book 4 │ │ Book 5 │ │ Book 6 │         │
│    Rowling   │  └────────┘ └────────┘ └────────┘         │
│  ☐ Tolkien   │                                             │
│              │  [1] 2 3 4 5 >                              │
│  Tipo        │                                             │
│  ☐ Premium   │                                             │
│  ☐ Gratis    │                                             │
│              │                                             │
│  Filtros     │                                             │
│  activos:    │                                             │
│  [Fiction ✕] │                                             │
│              │                                             │
│  Limpiar todo│                                             │
└──────────────┴─────────────────────────────────────────────┘
```

**Responsive Behavior:**
- **Desktop (>1024px)**: Sidebar visible, 3 columns grid
- **Tablet (768px-1024px)**: Sidebar collapses to toggle, 2 columns
- **Mobile (<768px)**: Sidebar in modal, 1 column

**Empty States:**
- No results found: Search icon + message + "Limpiar filtros" button
- Loading: Skeleton cards (6 placeholders)
- Error: Error message with retry option

### Search Filters

**Features:**
- **Collapsible sections**: ChevronUp/ChevronDown icons
- **Checkbox UI**: Material-style checkboxes with primary color
- **Counts**: Number of documents per filter option
- **Scroll**: Authors list scrollable (max 10 shown, max-h-64)
- **Active filters**: Shown as badges with X button to remove
- **Clear all**: Button to reset all filters

**Filter Types:**
1. **Categorías** (Categories)
   - Radio-like behavior (only one at a time)
   - Clicking active filter deselects it

2. **Autores** (Authors)
   - Top 10 most common authors
   - Scrollable list if more than 10

3. **Tipo de acceso** (Access Type)
   - Premium: Books requiring subscription
   - Gratis: Free books

## 🔍 Elasticsearch Configuration

### Index Settings

**File:** `backend/apps/content/documents.py`

```python
class Index:
    name = 'books'
    settings = {
        'number_of_shards': 1,
        'number_of_replicas': 0,
        'analysis': {
            'filter': {
                'spanish_stop': {
                    'type': 'stop',
                    'stopwords': '_spanish_'
                },
                'spanish_stemmer': {
                    'type': 'stemmer',
                    'language': 'spanish'
                }
            }
        }
    }
```

### Analyzers

**Spanish Analyzer** (for full-text search):
```python
spanish_analyzer = analyzer(
    'spanish_analyzer',
    tokenizer='standard',
    filter=['lowercase', 'spanish_stop', 'spanish_stemmer']
)
```

**Autocomplete Analyzer** (for prefix matching):
```python
autocomplete_analyzer = analyzer(
    'autocomplete',
    tokenizer=tokenizer('autocomplete_tokenizer', 'edge_ngram', min_gram=2, max_gram=20),
    filter=['lowercase']
)
```

### Field Mappings

```python
class BookDocument(Document):
    # Multi-field title: full-text + exact + autocomplete
    title = Text(
        analyzer=spanish_analyzer,
        fields={
            'raw': Keyword(),              # Exact matching for sorting
            'autocomplete': Text(analyzer=autocomplete_analyzer)  # Prefix matching
        }
    )

    description = Text(analyzer=spanish_analyzer)

    # Multi-field author: full-text + exact
    author_name = Text(
        analyzer=spanish_analyzer,
        fields={
            'raw': Keyword()  # Exact matching for filters
        }
    )

    # Categorical fields
    category_name = Text(
        analyzer=spanish_analyzer,
        fields={
            'raw': Keyword()  # Exact matching for filters
        }
    )

    # Metadata
    isbn = Keyword()
    publication_date = Date()
    is_premium = Boolean()
    created_at = Date()
    slug = Keyword()
    cover_image_url = Keyword()

    # IDs for joining
    author_id = Integer()
    category_id = Integer()
```

### Multi-Match Query

**Autocomplete Query:**
```python
s = s.query(
    'multi_match',
    query=query,
    fields=[
        'title.autocomplete^3',      # 3x boost on title autocomplete
        'author_name.autocomplete^2' # 2x boost on author autocomplete
    ],
    type='bool_prefix'
)
```

**Full Search Query:**
```python
s = s.query(
    'multi_match',
    query=query,
    fields=[
        'title^3',              # 3x boost on title
        'title.autocomplete^2', # 2x boost on title autocomplete
        'description',          # 1x weight on description
        'author_name^2',        # 2x boost on author
        'category_name'         # 1x weight on category
    ],
    fuzziness='AUTO',          # Auto fuzzy matching
    operator='and'             # All terms must match
)
```

### Fuzzy Matching

**AUTO fuzziness:**
- 0 edits for 1-2 characters
- 1 edit for 3-5 characters
- 2 edits for 6+ characters

**Example:**
- Search: "harrry potter" (typo)
- Elasticsearch matches: "harry potter" (1 edit distance)

### Sorting Options

1. **_score** (default): By relevance (Elasticsearch BM25 algorithm)
2. **created_at**: Newest first
3. **title**: Alphabetical A-Z (using title.raw)
4. **publication_date**: Most recent publication

## 🚀 Setup and Usage

### Prerequisites

1. **Elasticsearch running**:
   ```bash
   docker compose up -d elasticsearch
   ```

2. **Create index**:
   ```bash
   docker compose exec backend python manage.py shell
   ```
   ```python
   from apps.content.documents import BookDocument
   BookDocument.init()  # Create index with mappings
   ```

3. **Index books**:
   ```bash
   # Option 1: Via API (requires admin auth)
   POST /api/content/search/rebuild-index/

   # Option 2: Via Django shell
   from apps.content.models import Book
   from apps.content.documents import BookDocument

   for book in Book.objects.select_related('author', 'category').all():
       doc = BookDocument.from_django_model(book)
       doc.save()
   ```

### Apply Changes

```bash
# Run the automated script
APPLY_ELASTICSEARCH_SEARCH.bat
```

### Manual Steps

```bash
# Restart frontend
docker compose restart frontend

# Wait for startup
timeout /t 15

# Open browser
start http://localhost:3000/dashboard
```

## ✅ Verification Checklist

### SearchBar Component
- [ ] SearchBar visible in dashboard header
- [ ] Type 2+ characters triggers autocomplete
- [ ] Debounce working (300ms delay visible in Network tab)
- [ ] Suggestions appear with title + author
- [ ] Max 5 suggestions shown
- [ ] ArrowDown/Up navigates suggestions
- [ ] Enter on suggestion goes to book detail
- [ ] Enter without selection goes to search page
- [ ] Escape closes dropdown
- [ ] Click outside closes dropdown
- [ ] Clear button (X) visible when typing
- [ ] Clear button empties input and closes dropdown
- [ ] Loading spinner shows during request

### Search Results Page
- [ ] Navigate to `/search?q=test` works
- [ ] Results displayed in grid (3 columns on desktop)
- [ ] Total count shown: "X libros encontrados"
- [ ] Sort dropdown visible (4 options)
- [ ] Changing sort updates results
- [ ] Filter sidebar visible on desktop
- [ ] Filter toggle button visible on mobile
- [ ] Pagination shows when >12 results
- [ ] Page changes update URL (query param `page`)
- [ ] Clicking page scrolls to top
- [ ] Empty state shown when no results
- [ ] Loading skeletons shown during fetch

### Search Filters
- [ ] Filters load from API on page mount
- [ ] Categories section shows with counts
- [ ] Authors section shows top 10
- [ ] Tipo de acceso section shows Premium/Gratis
- [ ] Clicking filter updates URL
- [ ] Clicking filter triggers new search
- [ ] Active filters shown as badges
- [ ] Badge X button removes individual filter
- [ ] "Limpiar todo" removes all filters
- [ ] Sections can expand/collapse
- [ ] Filter counts accurate

### Elasticsearch Backend
- [ ] Elasticsearch container running
- [ ] Index `books` exists
- [ ] All 49 books indexed
- [ ] Autocomplete endpoint returns suggestions
- [ ] Search endpoint returns results
- [ ] Facets endpoint returns aggregations
- [ ] Fuzzy matching works (typos tolerated)
- [ ] Multi-field search works (title, author, description)
- [ ] Sorting by score, date, title works
- [ ] Filters work (category, author, is_premium)

## 🐛 Troubleshooting

### Elasticsearch not responding

**Symptoms:**
- API requests to `/content/search/*` return 500 error
- Console shows "Connection refused" or timeout errors

**Solution:**
```bash
# Check Elasticsearch status
docker compose ps elasticsearch

# If not running, start it
docker compose up -d elasticsearch

# Check logs
docker compose logs elasticsearch

# Verify it's accessible
curl http://localhost:9200
# Should return: { "name": "...", "cluster_name": "docker-cluster", ... }
```

### Index not created

**Symptoms:**
- Search returns empty results
- Elasticsearch logs show "index_not_found_exception"

**Solution:**
```bash
# Create index via Django shell
docker compose exec backend python manage.py shell
```
```python
from apps.content.documents import BookDocument
BookDocument.init()
print("Index created successfully")
```

### Books not indexed

**Symptoms:**
- Search returns 0 results even with valid query
- Facets return empty arrays

**Solution:**
```bash
# Index all books via API (requires admin token)
POST http://localhost:8000/api/content/search/rebuild-index/
Authorization: Bearer <admin_token>

# Or via Django shell
docker compose exec backend python manage.py shell
```
```python
from apps.content.models import Book
from apps.content.documents import BookDocument

count = 0
for book in Book.objects.select_related('author', 'category').all():
    doc = BookDocument.from_django_model(book)
    doc.save()
    count += 1

print(f"Indexed {count} books")
```

### Autocomplete not working

**Symptoms:**
- Typing in SearchBar shows no suggestions
- Network tab shows 200 response but empty `suggestions` array

**Check:**
1. Minimum 2 characters typed
2. Debounce completed (wait 300ms after last keystroke)
3. Elasticsearch index has documents
4. Field `title.autocomplete` exists in mapping

**Debug:**
```bash
# Test autocomplete endpoint directly
curl "http://localhost:8000/api/content/search/autocomplete/?q=harry"

# Should return:
{
  "suggestions": [
    {
      "id": 1,
      "title": "Harry Potter and the Philosopher's Stone",
      "author": "J.K. Rowling",
      "slug": "harry-potter-philosophers-stone"
    }
  ]
}
```

### Search returns wrong results

**Symptoms:**
- Search for "fiction" returns non-fiction books
- Irrelevant results appear first

**Check:**
1. Elasticsearch analyzer configuration
2. Field boosting weights (title^3, author^2)
3. Fuzzy matching distance

**Debug:**
```python
# Test search with explain
from apps.content.documents import BookDocument

s = BookDocument.search()
s = s.query('multi_match', query='harry potter', fields=['title^3', 'author_name^2'])
s = s.extra(explain=True)  # Add score explanation
results = s.execute()

for hit in results:
    print(f"Score: {hit.meta.score}")
    print(f"Explanation: {hit.meta.explanation}")
```

### Filters not updating results

**Symptoms:**
- Clicking filter checkbox doesn't change results
- URL updates but results stay the same

**Check:**
1. URL params being read correctly
2. API request includes filter params
3. Elasticsearch filter syntax correct

**Debug:**
```javascript
// Browser Console
// Check URL params
const params = new URLSearchParams(window.location.search)
console.log('Category:', params.get('category'))
console.log('Author:', params.get('author'))
console.log('Is Premium:', params.get('is_premium'))

// Check API request
// Open Network tab, filter by "search"
// Look at request URL, should have filter params
```

### Frontend errors

**CORS Error:**
```
Access to XMLHttpRequest at 'http://localhost:8000/api/content/search/'
from origin 'http://localhost:3000' has been blocked by CORS policy
```

**Solution:**
```python
# backend/config/settings/development.py
CORS_ALLOW_ALL_ORIGINS = True  # Should already be set
CORS_ALLOW_CREDENTIALS = True
```

**Module not found:**
```
Module not found: Can't resolve '@/components/search-bar'
```

**Solution:**
```bash
# Restart frontend
docker compose restart frontend
```

## 📊 Performance Optimization

### Debounce Strategy

**Why 300ms?**
- **< 200ms**: Too fast, sends too many requests
- **300ms**: Sweet spot for perceived responsiveness
- **> 500ms**: Feels sluggish

**Implementation:**
```typescript
// useDebounce hook
const debouncedQuery = useDebounce(query, 300)

useEffect(() => {
  if (debouncedQuery.length >= 2) {
    fetchSuggestions(debouncedQuery)
  }
}, [debouncedQuery])
```

### Caching Strategy

**Browser Cache:**
- API responses cached by browser for 60 seconds
- Controlled by Django REST Framework cache headers

**Future: Redis Cache:**
```python
# backend/config/settings/base.py
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': 'redis://redis:6379/1',
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        },
        'KEY_PREFIX': 'search',
        'TIMEOUT': 300  # 5 minutes
    }
}
```

### Query Optimization

**Elasticsearch:**
- `size=5` for autocomplete (limit results)
- `from_` and `size` for pagination (don't fetch all)
- Select only needed fields (`_source` filtering)

**Django:**
- `select_related('author', 'category')` to avoid N+1 queries
- Only serialize necessary fields

### Frontend Optimization

**React:**
- `useCallback` for event handlers (prevent re-renders)
- `useMemo` for expensive computations
- Lazy load search page (React.lazy + Suspense)

**Network:**
- Request deduplication (abort previous request if new one starts)
- Parallel fetching (suggestions + facets)

## 🎯 Future Enhancements

### 1. Search History
```typescript
// Store recent searches in localStorage
const [searchHistory, setSearchHistory] = useState<string[]>([])

useEffect(() => {
  const history = JSON.parse(localStorage.getItem('searchHistory') || '[]')
  setSearchHistory(history)
}, [])

const addToHistory = (query: string) => {
  const updated = [query, ...searchHistory.filter(q => q !== query)].slice(0, 5)
  setSearchHistory(updated)
  localStorage.setItem('searchHistory', JSON.stringify(updated))
}
```

### 2. Highlighted Snippets
```python
# In BookDocument.search_books
s = s.highlight('title', 'description', pre_tags='<mark>', post_tags='</mark>')

# In results
for hit in results:
    highlighted_title = hit.meta.highlight.title[0] if hasattr(hit.meta, 'highlight') else hit.title
```

### 3. Did You Mean?
```python
# Elasticsearch suggestions
from elasticsearch_dsl import Search

s = Search()
s = s.suggest('my_suggestion', 'harry poter', term={'field': 'title'})  # Typo
response = s.execute()

# Returns: "harry potter"
```

### 4. Voice Search
```typescript
// Web Speech API
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
const recognition = new SpeechRecognition()

recognition.onresult = (event) => {
  const transcript = event.results[0][0].transcript
  setQuery(transcript)
  handleSearch()
}

recognition.start()
```

### 5. Advanced Filters
- Publication year range slider
- Page count filter
- Language filter
- Rating filter (when reviews implemented)

### 6. Saved Searches
```typescript
interface SavedSearch {
  id: string
  query: string
  filters: {
    category?: string
    author?: string
    is_premium?: boolean
  }
  name: string
  created_at: Date
}

// Save search
const saveSearch = async (search: SavedSearch) => {
  await api.post('/content/saved-searches/', search)
}

// Load saved searches
const savedSearches = await api.get('/content/saved-searches/')
```

## 📚 Related Files

### Frontend

```
frontend/src/
├── components/
│   ├── search-bar.tsx           # ✅ Autocomplete component
│   ├── search-filters.tsx       # ✅ Filters sidebar
│   ├── book-card.tsx           # Book display (reused)
│   └── pagination.tsx          # Pagination (reused)
├── app/(dashboard)/
│   ├── layout.tsx              # ✅ SearchBar integration
│   └── search/
│       └── page.tsx            # ✅ Search results page
├── hooks/
│   ├── use-debounce.ts         # Debounce utility
│   └── use-pagination.ts       # Pagination state
└── lib/
    ├── api.ts                  # API client
    └── utils.ts                # cn() utility
```

### Backend

```
backend/apps/content/
├── documents.py                # ✅ Elasticsearch documents
├── views.py                    # ✅ API endpoints
├── urls.py                     # ✅ URL routing
├── models.py                   # Django models
└── serializers.py              # API serializers
```

## 🔗 References

- [Elasticsearch Documentation](https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html)
- [elasticsearch-dsl-py](https://elasticsearch-dsl.readthedocs.io/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Debouncing in React](https://www.freecodecamp.org/news/debouncing-explained/)

---

**Date**: 2025-12-28
**Feature**: Elasticsearch Search with Autocomplete
**Status**: ✅ Implemented
**Next Action**: Run `APPLY_ELASTICSEARCH_SEARCH.bat` to test
