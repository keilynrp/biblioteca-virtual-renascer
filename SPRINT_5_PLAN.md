# Sprint #5 - Sistema de Búsqueda Avanzada con Elasticsearch

**Duración**: 2 semanas
**Fecha de inicio**: 27 de Diciembre de 2025
**Estado**: Planificación
**Prioridad**: ALTA

---

## 🎯 Objetivos del Sprint

Implementar un sistema de búsqueda avanzada con Elasticsearch para permitir búsquedas full-text eficientes, autocompletado y filtros facetados en el catálogo de libros.

---

## 📋 User Stories

### US-5.1: Búsqueda Full-Text
**Como** usuario
**Quiero** buscar libros por título, autor, descripción y categoría
**Para** encontrar rápidamente el contenido que necesito

**Criterios de Aceptación:**
- [ ] Búsqueda retorna resultados en < 500ms
- [ ] Los resultados son ordenados por relevancia
- [ ] Soporta búsqueda en español y portugués
- [ ] Maneja errores tipográficos (fuzzy search)
- [ ] Búsqueda vacía muestra todos los libros

### US-5.2: Autocompletado
**Como** usuario
**Quiero** ver sugerencias mientras escribo
**Para** descubrir contenido rápidamente

**Criterios de Aceptación:**
- [ ] Sugerencias aparecen con >2 caracteres
- [ ] Máximo 10 sugerencias
- [ ] Incluye títulos, autores y categorías
- [ ] Respuesta en < 200ms
- [ ] Navegable con teclado (↑↓ Enter)

### US-5.3: Filtros Avanzados
**Como** usuario
**Quiero** combinar múltiples filtros
**Para** refinar mis resultados de búsqueda

**Criterios de Aceptación:**
- [ ] Filtrar por categoría (múltiple)
- [ ] Filtrar por autor (múltiple)
- [ ] Filtrar por idioma
- [ ] Filtrar por tipo (premium/gratuito)
- [ ] Filtrar por año de publicación
- [ ] Los filtros se pueden combinar
- [ ] Contador de resultados por filtro

### US-5.4: Ordenamiento de Resultados
**Como** usuario
**Quiero** ordenar los resultados
**Para** ver primero lo más relevante

**Criterios de Aceptación:**
- [ ] Ordenar por relevancia (default)
- [ ] Ordenar por fecha (nuevo primero)
- [ ] Ordenar por popularidad (más leídos)
- [ ] Ordenar por calificación
- [ ] Ordenar alfabéticamente (A-Z, Z-A)

---

## 🏗️ Arquitectura Técnica

### Stack de Búsqueda

```
┌─────────────┐
│   Frontend  │
│  (Next.js)  │
└──────┬──────┘
       │ API Request
       ▼
┌─────────────┐     ┌──────────────┐
│   Django    │────▶│ Elasticsearch│
│   Backend   │◀────│   Cluster    │
└──────┬──────┘     └──────────────┘
       │
       ▼
┌─────────────┐
│ PostgreSQL  │
│  (Source)   │
└─────────────┘
```

### Flujo de Sincronización

```
1. Usuario crea/edita libro en Django
2. Django signal dispara indexación
3. Documento se envía a Elasticsearch
4. ES indexa y hace disponible para búsqueda
5. Búsquedas consultan ES directamente
```

---

## 📦 Tareas del Sprint

### Backend (Django + Elasticsearch)

#### Tarea 5.1: Setup de Elasticsearch
**Tiempo estimado**: 4 horas
**Prioridad**: Crítica

**Subtareas:**
- [ ] Agregar `elasticsearch-dsl` a requirements.txt
- [ ] Configurar conexión ES en settings
- [ ] Actualizar docker-compose.yml con servicio ES
- [ ] Crear archivo de configuración ES (`es_config.py`)
- [ ] Configurar índices y mappings
- [ ] Documentar configuración

**Configuración Docker Compose:**
```yaml
elasticsearch:
  image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0
  environment:
    - discovery.type=single-node
    - xpack.security.enabled=false
    - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
  ports:
    - "9200:9200"
  volumes:
    - es_data:/usr/share/elasticsearch/data
  networks:
    - bvs_network
```

**Archivo de Configuración:**
```python
# backend/apps/content/search.py
from elasticsearch_dsl import Document, Text, Keyword, Integer, Date, Boolean
from elasticsearch_dsl import analyzer

# Analyzer para español/portugués
custom_analyzer = analyzer('custom_analyzer',
    tokenizer='standard',
    filter=['lowercase', 'asciifolding', 'stop', 'snowball']
)

class BookDocument(Document):
    title = Text(analyzer=custom_analyzer)
    description = Text(analyzer=custom_analyzer)
    author = Text(fields={'raw': Keyword()})
    category = Text(fields={'raw': Keyword()})
    isbn = Keyword()
    language = Keyword()
    publication_year = Integer()
    is_premium = Boolean()
    created_at = Date()

    class Index:
        name = 'books'
        settings = {
            'number_of_shards': 1,
            'number_of_replicas': 0
        }
```

#### Tarea 5.2: Sincronización Django → Elasticsearch
**Tiempo estimado**: 6 horas
**Prioridad**: Alta

**Subtareas:**
- [ ] Crear signals para indexación automática
- [ ] Implementar `index_book()` function
- [ ] Implementar `update_book()` function
- [ ] Implementar `delete_book()` function
- [ ] Crear comando de management para reindexación completa
- [ ] Agregar logging de sincronización
- [ ] Tests de sincronización

**Signals:**
```python
# backend/apps/content/signals.py
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import Book
from .search import BookDocument

@receiver(post_save, sender=Book)
def index_book(sender, instance, **kwargs):
    """Indexar libro en ES cuando se crea/actualiza"""
    doc = BookDocument(
        meta={'id': instance.id},
        title=instance.title,
        description=instance.description,
        author=instance.author.name,
        category=instance.category.name,
        isbn=instance.isbn,
        language=instance.language,
        publication_year=instance.publication_year,
        is_premium=instance.is_premium,
        created_at=instance.created_at
    )
    doc.save()

@receiver(post_delete, sender=Book)
def delete_book_from_index(sender, instance, **kwargs):
    """Eliminar libro de ES cuando se elimina"""
    BookDocument.get(id=instance.id).delete()
```

**Management Command:**
```python
# backend/apps/content/management/commands/reindex_books.py
from django.core.management.base import BaseCommand
from apps.content.models import Book
from apps.content.search import BookDocument

class Command(BaseCommand):
    help = 'Reindexar todos los libros en Elasticsearch'

    def handle(self, *args, **options):
        # Recrear índice
        BookDocument.init()

        # Indexar todos los libros
        books = Book.objects.select_related('author', 'category').all()
        for book in books:
            # Usar signal existente
            index_book(None, book)

        self.stdout.write(
            self.style.SUCCESS(f'Indexados {books.count()} libros')
        )
```

#### Tarea 5.3: Endpoints de Búsqueda
**Tiempo estimado**: 8 horas
**Prioridad**: Alta

**Subtareas:**
- [ ] Endpoint de búsqueda full-text
- [ ] Endpoint de autocompletado
- [ ] Endpoint de sugerencias
- [ ] Serializers para resultados
- [ ] Paginación de resultados
- [ ] Documentación API (Swagger)
- [ ] Tests de endpoints

**Endpoints:**

**1. Búsqueda Full-Text**
```python
# GET /api/search/?q=python&category=programming&page=1
# Response:
{
  "count": 42,
  "next": "...",
  "previous": null,
  "results": [
    {
      "id": 1,
      "title": "Learning Python",
      "author": "Mark Lutz",
      "category": "Programming",
      "description": "...",
      "score": 8.5,
      "is_premium": false
    }
  ],
  "facets": {
    "categories": [
      {"key": "Programming", "count": 25},
      {"key": "Data Science", "count": 17}
    ],
    "authors": [...],
    "languages": [...]
  }
}
```

**2. Autocompletado**
```python
# GET /api/search/autocomplete/?q=pyt
# Response:
{
  "suggestions": [
    {
      "type": "title",
      "text": "Python Crash Course",
      "id": 123
    },
    {
      "type": "author",
      "text": "Mark Lutz",
      "count": 5
    },
    {
      "type": "category",
      "text": "Python Programming",
      "count": 42
    }
  ]
}
```

**View Implementation:**
```python
# backend/apps/content/views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from elasticsearch_dsl import Search
from .search import BookDocument

@api_view(['GET'])
def search_books(request):
    """Búsqueda full-text de libros"""
    query = request.GET.get('q', '')
    category = request.GET.getlist('category')
    author = request.GET.getlist('author')
    language = request.GET.get('language')
    is_premium = request.GET.get('is_premium')
    sort_by = request.GET.get('sort', 'relevance')
    page = int(request.GET.get('page', 1))
    page_size = 20

    # Crear búsqueda
    s = BookDocument.search()

    # Query principal
    if query:
        s = s.query("multi_match",
            query=query,
            fields=['title^3', 'description', 'author^2', 'category'],
            fuzziness='AUTO'
        )

    # Filtros
    if category:
        s = s.filter('terms', category__raw=category)
    if author:
        s = s.filter('terms', author__raw=author)
    if language:
        s = s.filter('term', language=language)
    if is_premium is not None:
        s = s.filter('term', is_premium=is_premium == 'true')

    # Ordenamiento
    if sort_by == 'date':
        s = s.sort('-created_at')
    elif sort_by == 'title':
        s = s.sort('title.raw')
    # 'relevance' es default (score)

    # Agregaciones para facets
    s.aggs.bucket('categories', 'terms', field='category.raw', size=20)
    s.aggs.bucket('authors', 'terms', field='author.raw', size=20)
    s.aggs.bucket('languages', 'terms', field='language', size=10)

    # Paginación
    start = (page - 1) * page_size
    s = s[start:start + page_size]

    # Ejecutar
    response = s.execute()

    # Formatear resultados
    results = [{
        'id': hit.meta.id,
        'title': hit.title,
        'author': hit.author,
        'category': hit.category,
        'description': hit.description[:200] + '...',
        'score': hit.meta.score,
        'is_premium': hit.is_premium
    } for hit in response]

    # Facets
    facets = {
        'categories': [
            {'key': bucket.key, 'count': bucket.doc_count}
            for bucket in response.aggregations.categories.buckets
        ],
        'authors': [
            {'key': bucket.key, 'count': bucket.doc_count}
            for bucket in response.aggregations.authors.buckets
        ],
        'languages': [
            {'key': bucket.key, 'count': bucket.doc_count}
            for bucket in response.aggregations.languages.buckets
        ]
    }

    return Response({
        'count': response.hits.total.value,
        'results': results,
        'facets': facets
    })

@api_view(['GET'])
def autocomplete(request):
    """Autocompletado de búsqueda"""
    query = request.GET.get('q', '')

    if len(query) < 2:
        return Response({'suggestions': []})

    s = BookDocument.search()

    # Búsqueda prefix en título
    s = s.query('match_phrase_prefix', title=query)
    s = s[:10]

    response = s.execute()

    suggestions = [{
        'type': 'title',
        'text': hit.title,
        'id': hit.meta.id
    } for hit in response]

    return Response({'suggestions': suggestions})
```

#### Tarea 5.4: Tests de Búsqueda
**Tiempo estimado**: 4 horas
**Prioridad**: Media

**Subtareas:**
- [ ] Setup de ES para tests (mocking)
- [ ] Tests de indexación
- [ ] Tests de búsqueda full-text
- [ ] Tests de filtros
- [ ] Tests de autocompletado
- [ ] Tests de performance

---

### Frontend (Next.js)

#### Tarea 5.5: Componente de Búsqueda
**Tiempo estimado**: 6 horas
**Prioridad**: Alta

**Subtareas:**
- [ ] Barra de búsqueda con debounce
- [ ] Dropdown de autocompletado
- [ ] Resaltado de términos en resultados
- [ ] Loading states
- [ ] Manejo de errores
- [ ] Navegación por teclado

**Componente:**
```typescript
// frontend/src/components/search-bar.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useDebounce } from '@/hooks/use-debounce'
import api from '@/lib/api'

interface Suggestion {
  type: string
  text: string
  id: number
}

export function SearchBar() {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const debouncedQuery = useDebounce(query, 300)

  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      fetchSuggestions(debouncedQuery)
    } else {
      setSuggestions([])
    }
  }, [debouncedQuery])

  const fetchSuggestions = async (q: string) => {
    try {
      const response = await api.get(`/search/autocomplete/?q=${q}`)
      setSuggestions(response.data.suggestions)
      setIsOpen(true)
    } catch (error) {
      console.error('Error fetching suggestions:', error)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      const selected = suggestions[selectedIndex]
      window.location.href = `/library/${selected.id}`
    } else if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  return (
    <div className="relative w-full max-w-2xl">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar libros, autores, categorías..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setIsOpen(true)}
          className="pl-10 pr-10"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('')
              setSuggestions([])
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-popover rounded-lg shadow-lg border z-50">
          {suggestions.map((suggestion, index) => (
            <a
              key={index}
              href={`/library/${suggestion.id}`}
              className={`
                block px-4 py-2 hover:bg-accent cursor-pointer
                ${index === selectedIndex ? 'bg-accent' : ''}
              `}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div className="flex items-center gap-2">
                <Search className="h-3 w-3 text-muted-foreground" />
                <span>{suggestion.text}</span>
                <span className="text-xs text-muted-foreground ml-auto">
                  {suggestion.type}
                </span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
```

#### Tarea 5.6: Página de Resultados Mejorada
**Tiempo estimado**: 6 horas
**Prioridad**: Alta

**Subtareas:**
- [ ] Layout de resultados con facets
- [ ] Filtros laterales interactivos
- [ ] Contador de resultados
- [ ] Ordenamiento dropdown
- [ ] Highlight de términos buscados
- [ ] Estado de "sin resultados"

#### Tarea 5.7: Tests Frontend
**Tiempo estimado**: 4 horas
**Prioridad**: Media

**Subtareas:**
- [ ] Tests de SearchBar component
- [ ] Tests de interacción con teclado
- [ ] Tests de filtros
- [ ] Tests E2E del flujo de búsqueda

---

## 📊 Métricas de Éxito

### Performance
- [ ] Búsqueda < 500ms (p95)
- [ ] Autocompletado < 200ms (p95)
- [ ] Indexación < 100ms por documento

### Funcionalidad
- [ ] Precisión de resultados > 85%
- [ ] Recall de resultados > 90%
- [ ] Fuzzy search funciona correctamente

### UX
- [ ] Usuarios encuentran lo que buscan en < 3 intentos
- [ ] Tasa de uso de autocompletado > 40%
- [ ] Tiempo en página de resultados < 30 segundos

---

## 🎯 Definición de Done

- [ ] Elasticsearch configurado y corriendo
- [ ] Sincronización automática Django → ES funciona
- [ ] Endpoints de búsqueda implementados
- [ ] Tests backend > 80% coverage
- [ ] Componentes frontend implementados
- [ ] Tests frontend > 70% coverage
- [ ] Búsqueda funciona en producción
- [ ] Documentación actualizada
- [ ] Performance cumple métricas
- [ ] Code review completado
- [ ] Sin bugs críticos

---

## 🚧 Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Performance pobre con grandes volúmenes | Media | Alto | Usar paginación, limitar facets, índices optimizados |
| Sincronización falla | Baja | Alto | Logging robusto, comando de reindexación |
| ES se cae | Baja | Crítico | Fallback a búsqueda PostgreSQL, monitoring |
| Resultados irrelevantes | Media | Medio | Tunear scoring, agregar boosts, feedback loop |

---

## 📚 Recursos Necesarios

### Infraestructura
- Elasticsearch 8.11+ (Docker)
- 2GB RAM adicional para ES
- 10GB storage para índices

### Librerías
- `elasticsearch-dsl-py==8.11.0`
- `elasticsearch==8.11.0`

### Documentación
- [Elasticsearch Docs](https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html)
- [elasticsearch-dsl-py Docs](https://elasticsearch-dsl.readthedocs.io/)

---

## 🗓️ Timeline

### Semana 1
- **Días 1-2**: Setup ES + Configuración
- **Días 3-4**: Sincronización y signals
- **Día 5**: Endpoints básicos

### Semana 2
- **Días 6-7**: Frontend - SearchBar
- **Días 8-9**: Página de resultados
- **Día 10**: Tests y optimización

---

## 📝 Notas

- Considerar usar Algolia si ES es demasiado complejo
- Evaluar necesidad de búsqueda dentro del contenido de PDFs (Sprint futuro)
- Planear escalamiento horizontal de ES para producción
- Documentar proceso de backup de índices

---

**Estado**: ✅ Listo para iniciar
**Próxima revisión**: Al final del Sprint #5
