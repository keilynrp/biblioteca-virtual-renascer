# BVS Framework — Claude Code Context

> Este archivo es el punto de entrada para Claude Code al trabajar en
> **Biblioteca Virtual Renascer do Saber**. Léelo completo antes de
> modificar cualquier archivo del proyecto.

---

## 1. Visión del proyecto

Plataforma de biblioteca virtual orientada a instituciones educativas.
Combina gestión de contenido, suscripciones, lector PDF con anotaciones
y comunidades de lectura. Meta comercial a corto plazo.

Stack: Django 6 (backend) + Next.js 16 / React 19 (frontend) + PostgreSQL
16 + Meilisearch 0.31 + Redis 7 + Celery 5 + Stripe + Docker Compose.

---

## 2. Estructura de directorios críticos

```
bvs_framework/
├── backend/
│   ├── apps/
│   │   ├── authentication/   # JWT, tipos de usuario, 2FA prep
│   │   ├── content/          # ← NÚCLEO: libros, autores, reseñas, búsqueda
│   │   ├── subscriptions/    # Planes individuales e institucionales
│   │   ├── payments/         # Stripe, webhooks, transacciones
│   │   ├── loans/            # Préstamos físicos con códigos de barras
│   │   ├── communities/      # Clubes de lectura, discusiones
│   │   ├── notifications/    # 8 tipos de notificaciones
│   │   ├── institutions/     # Gestión institucional
│   │   └── core/             # Utilidades compartidas, health checks
│   └── config/
│       ├── settings.py
│       └── urls.py
├── frontend/
│   └── src/
│       ├── app/
│       │   ├── (auth)/
│       │   ├── (marketing)/  # Landing, About, Pricing, Contact
│       │   └── (dashboard)/  # Rutas protegidas
│       ├── components/
│       │   ├── ui/           # shadcn/ui base components
│       │   ├── reader/       # Lector PDF
│       │   └── subscriptions/
│       ├── hooks/
│       ├── store/            # Zustand stores
│       ├── services/         # API services (axios)
│       ├── lib/
│       └── types/
├── docker/
├── nginx/
├── scripts/
│   ├── docker/
│   ├── maintenance/
│   └── utils/
└── docker-compose.yml
```

---

## 3. App `content` — la más importante

Es la app central. Antes de cualquier cambio en ella, entender su estructura:

```
backend/apps/content/
├── models.py          # Book, Author, Category, Review, Favorite, ReadingHistory
├── serializers.py
├── views.py
├── urls.py
├── admin.py
├── search.py          # Integración Meilisearch
└── management/
    └── commands/
        ├── import_openlibrary.py   # ← REFERENCIA para nuevos importers
        └── rebuild_search_index.py
```

### Modelo `Book` (campos conocidos)
- `title`, `slug` (autogenerado), `description`
- `authors` (M2M → Author)
- `categories` (M2M → Category)
- `is_premium` (boolean)
- `pdf_file` (FileField, límite 50MB)
- `cover_image` (ImageField, límite 5MB)
- `created_at`, `updated_at`

### Campos a agregar para integración DOAB
```python
doi = models.CharField(max_length=255, blank=True, null=True, unique=True)
is_open_access = models.BooleanField(default=False)
source = models.CharField(
    max_length=50,
    choices=[('manual', 'Manual'), ('openlibrary', 'OpenLibrary'), ('doab', 'DOAB')],
    default='manual'
)
external_url = models.URLField(blank=True, null=True)  # URL al PDF externo OA
```

---

## 4. Patrón de Management Commands

**Siempre seguir el patrón de `import_openlibrary`:**

```python
from django.core.management.base import BaseCommand
from django.db import transaction

class Command(BaseCommand):
    help = 'Descripción del comando'

    def add_arguments(self, parser):
        parser.add_argument('--query', type=str, default='')
        parser.add_argument('--limit', type=int, default=50)
        # agregar argumentos específicos aquí

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Iniciando importación...'))
        
        try:
            # lógica principal
            with transaction.atomic():
                pass
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error: {e}'))
            raise
        
        self.stdout.write(self.style.SUCCESS('Importación completada'))
```

**Ejecutar dentro del contenedor:**
```bash
docker exec -it backend python manage.py <comando> --query "..." --limit 50
```

---

## 5. API DOAB — referencia de endpoints

Base URL: `https://directory.doabooks.org/rest/`

```python
# Búsqueda general
GET /search?query=<término>&limit=50&expand=metadata

# Por subject
GET /search?query=dc.subject:<subject>&expand=metadata

# Por editorial
GET /search?query=oapen.relation.isPublishedBy:<uuid>&expand=metadata

# Por financiador
GET /search?query=oapen.relation.isFundedBy:<uuid>&expand=metadata

# Peer review por DOI
GET /peerReviews?doi=<doi>
```

### Mapeo de campos DOAB → Modelo Book

| Campo DOAB | Campo en metadata | Modelo BVS |
|---|---|---|
| Título | `dc.title` | `Book.title` |
| Autor(es) | `dc.contributor.author` | `Author` (M2M) |
| Subject | `dc.subject` | `Category` (M2M) |
| DOI | `oapen.identifier.doi` | `Book.doi` |
| Editorial | `dc.publisher` | `publisher` (campo a agregar) |
| Descripción | `dc.description.abstract` | `Book.description` |
| Idioma | `dc.language` | campo opcional |
| URL PDF | `bitstreams[0].retrieveLink` | `Book.external_url` |
| Año | `dc.date.issued` | `Book.published_year` |

### Estructura de respuesta DOAB

```json
[
  {
    "uuid": "...",
    "metadata": [
      {"key": "dc.title", "value": "Título del libro"},
      {"key": "dc.contributor.author", "value": "Apellido, Nombre"},
      {"key": "dc.subject", "value": "Library Science"},
      {"key": "oapen.identifier.doi", "value": "10.xxxx/xxxxx"}
    ],
    "bitstreams": [
      {
        "name": "book.pdf",
        "retrieveLink": "/bitstream/handle/..."
      }
    ]
  }
]
```

**Nota:** `metadata` es una lista de objetos `{key, value}` con posible
repetición de keys (ej: múltiples `dc.contributor.author`). Agrupar por key:

```python
from collections import defaultdict

meta = defaultdict(list)
for item in raw_item.get('metadata', []):
    meta[item['key']].append(item['value'])

title = meta.get('dc.title', [''])[0]
authors = meta.get('dc.contributor.author', [])
```

---

## 6. Meilisearch — búsqueda

El índice se reconstruye con:
```bash
docker exec -it backend python manage.py rebuild_search_index
```

Al agregar campos nuevos (`doi`, `is_open_access`, `source`), actualizar
el comando `rebuild_search_index` para incluirlos como atributos filtrables:

```python
index.update_filterable_attributes(['is_open_access', 'source', 'is_premium'])
index.update_sortable_attributes(['created_at', 'published_year'])
```

---

## 7. Frontend — convenciones

- **Componentes UI base**: siempre de `shadcn/ui` en `components/ui/`
- **Estado global**: Zustand en `store/`
- **Llamadas API**: axios en `services/` — nunca fetch directo en componentes
- **Tipos**: definir en `types/` antes de usar en componentes
- **Estilos**: solo Tailwind CSS — sin CSS custom salvo casos excepcionales
- **Formularios**: React Hook Form + Zod para validación

### Badge Open Access — patrón esperado

```tsx
// En el card del libro dentro de /library
{book.is_open_access && (
  <Badge variant="secondary" className="bg-green-100 text-green-800">
    Open Access
  </Badge>
)}
```

---

## 8. Docker — contenedores activos

| Contenedor | Propósito | Puerto |
|---|---|---|
| `backend` | Django API | 8000 |
| `bvs-frontend` | Next.js | 3000 |
| `bvs-db` | PostgreSQL 16 | 5432 |
| `bvs-redis` | Redis 7 | 6379 |
| `bvs-search` | Meilisearch | 7700 |
| `bvs-nginx` | Proxy reverso | 80/443 |

**Comandos frecuentes:**
```bash
# Logs en tiempo real
docker logs -f backend

# Shell Django
docker exec -it backend python manage.py shell

# Migraciones
docker exec -it backend python manage.py makemigrations
docker exec -it backend python manage.py migrate

# Reiniciar solo backend tras cambios
docker compose restart backend
```

---

## 9. Tipos de usuario y permisos

```python
# apps/authentication/models.py
class UserType(models.TextChoices):
    STUDENT = 'student'
    EMPLOYEE = 'employee'
    PROFESSOR = 'professor'
    LIBRARIAN = 'librarian'
    MODERATOR = 'moderator'
```

Los importers DOAB deben ejecutarse solo con permisos de `librarian` o superior
cuando se exponga como endpoint (vs management command que requiere acceso al servidor).

---

## 10. Roadmap activo (contexto para priorizar)

| Sprint | Fecha | Tema |
|---|---|---|
| 11 | Feb 2026 | **Recomendaciones** (historial + reseñas + favoritos) |
| 12 | Mar 2026 | Analytics y reporting |
| 13 | Mar 2026 | Búsqueda avanzada (full-text en PDFs) |
| 14 | Abr 2026 | Gamificación |
| 15 | May 2026 | App móvil |

**La integración DOAB alimenta directamente el Sprint 11:**
Los libros con `source='doab'` y `dc.subject` estructurado permiten
recomendaciones por afinidad temática más precisas que OpenLibrary.

---

## 11. Reglas para Claude Code

1. **Nunca modificar** `config/settings.py` sin preguntar primero
2. **Siempre crear migración** tras cambiar modelos — no asumir que existe
3. **Siempre verificar** si el campo ya existe antes de agregarlo al modelo
4. **Usar `/compact`** si la sesión supera 30 interacciones
5. **Un sprint a la vez** — no mezclar cambios de frontend y backend en un mismo prompt
6. **Pedir revisión** antes de ejecutar comandos destructivos (`flush`, `migrate --fake`, `drop`)
7. Al agregar nuevos campos al modelo `Book`, actualizar también:
   - `serializers.py`
   - `admin.py`
   - `search.py` (Meilisearch index)
   - `rebuild_search_index` management command

---

## 12. Prompt inicial recomendado — Sprint B (DOAB importer)

Usar este prompt exacto al iniciar la sesión de implementación:

```
Lee el archivo CLAUDE.md completo. Luego lee el contenido de:
- backend/apps/content/models.py
- backend/apps/content/management/commands/import_openlibrary.py
- backend/apps/content/search.py

Una vez leídos, necesito que:

1. Agregues los campos doi, is_open_access, source y external_url al modelo Book
2. Crees la migración correspondiente
3. Crees el management command import_doab en el mismo directorio que import_openlibrary,
   siguiendo exactamente el mismo patrón, que consuma la API REST de
   directory.doabooks.org/rest/search y mapee los campos según la tabla del CLAUDE.md
4. Actualices search.py para incluir is_open_access y source como atributos filtrables
5. Actualices rebuild_search_index para indexar los nuevos campos

Parámetros del comando:
  --query (término libre)
  --subject (materia, ej: "library science")
  --publisher-id (UUID de editorial en DOAB)
  --limit (default: 50, max: 200)
  --dry-run (mostrar sin guardar)

No empieces a escribir código hasta confirmar que leíste los 3 archivos.
```
