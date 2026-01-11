# Sprint 10: Lector de Documentos - Parte 2 (Fase 1: Backend) ✅

**Fecha de inicio**: 2026-01-11
**Fecha de finalización Fase 1**: 2026-01-11
**Estado**: ✅ FASE 1 COMPLETADA (Backend API)
**Duración Fase 1**: 1 día

---

## 🎯 Objetivos del Sprint 10

Implementar funcionalidades avanzadas del lector de documentos incluyendo:
- Sistema de marcadores (bookmarks)
- Resaltado de texto (highlights)
- Anotaciones personales
- Búsqueda dentro del documento

## ✅ Fase 1: Backend API - COMPLETADA

### 📋 Modelos Implementados

#### 1. **Modelo Bookmark**
```python
class Bookmark(models.Model):
    """User bookmarks for specific pages in books"""
    user = ForeignKey(User)
    book = ForeignKey(Book)
    page_number = PositiveIntegerField
    title = CharField(max_length=200)
    notes = TextField
    created_at, updated_at = DateTimeField
```

**Características**:
- ✅ Marcadores por usuario y libro
- ✅ Número de página específico
- ✅ Título y notas opcionales
- ✅ Unique constraint: user + book + page_number
- ✅ Índices optimizados para queries

**Casos de uso**:
- Marcar páginas importantes
- Agregar notas rápidas
- Navegación rápida a secciones específicas

#### 2. **Modelo Highlight**
```python
class Highlight(models.Model):
    """Text highlights in books"""
    user = ForeignKey(User)
    book = ForeignKey(Book)
    page_number = PositiveIntegerField
    selected_text = TextField
    color = CharField(choices=COLOR_CHOICES)
    position_data = JSONField  # Coordinates and selection info
    created_at, updated_at = DateTimeField
```

**Colores disponibles**:
- 🟡 Amarillo (yellow) - Default
- 🟢 Verde (green)
- 🔵 Azul (blue)
- 🩷 Rosa (pink)
- 🟣 Púrpura (purple)

**Características**:
- ✅ Resaltado de texto con colores
- ✅ Almacenamiento del texto seleccionado
- ✅ Posición JSON para rendering preciso
- ✅ Múltiples highlights por página
- ✅ Índices en page_number y created_at

**position_data structure**:
```json
{
  "start": { "offset": 0, "x": 100, "y": 200 },
  "end": { "offset": 50, "x": 300, "y": 200 },
  "rect": { "top": 200, "left": 100, "width": 200, "height": 20 }
}
```

#### 3. **Modelo Annotation**
```python
class Annotation(models.Model):
    """User annotations/notes on specific parts of books"""
    user = ForeignKey(User)
    book = ForeignKey(Book)
    page_number = PositiveIntegerField
    highlight = ForeignKey(Highlight, null=True)  # Optional link
    content = TextField  # The actual note
    selected_text = TextField  # Optional reference text
    position_data = JSONField
    is_private = BooleanField(default=True)
    created_at, updated_at = DateTimeField
```

**Características**:
- ✅ Anotaciones de texto completas
- ✅ Opcional: vinculadas a highlights
- ✅ Texto de referencia opcional
- ✅ Control de privacidad
- ✅ Posicionamiento preciso

**Casos de uso**:
- Notas de estudio personales
- Comentarios sobre el contenido
- Anotaciones académicas
- Futuro: Anotaciones compartidas (is_private=False)

---

### 🔌 API Endpoints Implementados

#### Bookmarks API

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/content/user/bookmarks/` | Listar bookmarks del usuario |
| POST | `/api/content/user/bookmarks/` | Crear nuevo bookmark |
| GET | `/api/content/user/bookmarks/{id}/` | Detalle de bookmark |
| PUT/PATCH | `/api/content/user/bookmarks/{id}/` | Actualizar bookmark |
| DELETE | `/api/content/user/bookmarks/{id}/` | Eliminar bookmark |

**Filtros disponibles**:
- `?book={book_id}` - Bookmarks de un libro específico
- `?page_number={number}` - Bookmarks en una página específica
- `?ordering=page_number` - Ordenar por página
- `?ordering=-created_at` - Ordenar por fecha (más reciente primero)

**Ejemplo Request - Crear Bookmark**:
```http
POST /api/content/user/bookmarks/
Authorization: Bearer {token}
Content-Type: application/json

{
  "book": 1,
  "page_number": 42,
  "title": "Capítulo importante",
  "notes": "Revisar para el examen"
}
```

**Ejemplo Response**:
```json
{
  "id": 1,
  "user": 1,
  "book": 1,
  "book_title": "Python Programming",
  "book_slug": "python-programming",
  "page_number": 42,
  "title": "Capítulo importante",
  "notes": "Revisar para el examen",
  "created_at": "2026-01-11T10:30:00Z",
  "updated_at": "2026-01-11T10:30:00Z"
}
```

#### Highlights API

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/content/user/highlights/` | Listar highlights del usuario |
| POST | `/api/content/user/highlights/` | Crear nuevo highlight |
| GET | `/api/content/user/highlights/{id}/` | Detalle de highlight |
| PUT/PATCH | `/api/content/user/highlights/{id}/` | Actualizar highlight (ej: cambiar color) |
| DELETE | `/api/content/user/highlights/{id}/` | Eliminar highlight |

**Filtros disponibles**:
- `?book={book_id}` - Highlights de un libro específico
- `?page_number={number}` - Highlights en una página específica
- `?color={color}` - Highlights de un color específico
- `?ordering=page_number` - Ordenar por página

**Ejemplo Request - Crear Highlight**:
```http
POST /api/content/user/highlights/
Authorization: Bearer {token}
Content-Type: application/json

{
  "book": 1,
  "page_number": 15,
  "selected_text": "La programación orientada a objetos es un paradigma...",
  "color": "yellow",
  "position_data": {
    "start": { "offset": 0, "x": 100, "y": 200 },
    "end": { "offset": 50, "x": 300, "y": 200 }
  }
}
```

**Ejemplo Response**:
```json
{
  "id": 1,
  "user": 1,
  "book": 1,
  "book_title": "Python Programming",
  "book_slug": "python-programming",
  "page_number": 15,
  "selected_text": "La programación orientada a objetos es un paradigma...",
  "color": "yellow",
  "color_display": "Amarillo",
  "position_data": {
    "start": { "offset": 0, "x": 100, "y": 200 },
    "end": { "offset": 50, "x": 300, "y": 200 }
  },
  "created_at": "2026-01-11T10:35:00Z",
  "updated_at": "2026-01-11T10:35:00Z"
}
```

#### Annotations API

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/content/user/annotations/` | Listar anotaciones del usuario |
| POST | `/api/content/user/annotations/` | Crear nueva anotación |
| GET | `/api/content/user/annotations/{id}/` | Detalle de anotación |
| PUT/PATCH | `/api/content/user/annotations/{id}/` | Actualizar anotación |
| DELETE | `/api/content/user/annotations/{id}/` | Eliminar anotación |

**Filtros disponibles**:
- `?book={book_id}` - Anotaciones de un libro específico
- `?page_number={number}` - Anotaciones en una página específica
- `?is_private=true/false` - Filtrar por privacidad
- `?ordering=page_number` - Ordenar por página

**Ejemplo Request - Crear Annotation**:
```http
POST /api/content/user/annotations/
Authorization: Bearer {token}
Content-Type: application/json

{
  "book": 1,
  "page_number": 20,
  "content": "Esta sección explica muy bien el concepto de herencia múltiple",
  "selected_text": "herencia múltiple en Python",
  "highlight": 1,  // Optional: link to existing highlight
  "is_private": true,
  "position_data": {
    "x": 150,
    "y": 250
  }
}
```

**Ejemplo Response**:
```json
{
  "id": 1,
  "user": 1,
  "book": 1,
  "book_title": "Python Programming",
  "book_slug": "python-programming",
  "page_number": 20,
  "highlight": 1,
  "highlight_data": {
    "id": 1,
    "selected_text": "herencia múltiple en Python",
    "color": "yellow"
  },
  "content": "Esta sección explica muy bien el concepto de herencia múltiple",
  "selected_text": "herencia múltiple en Python",
  "position_data": {
    "x": 150,
    "y": 250
  },
  "is_private": true,
  "created_at": "2026-01-11T10:40:00Z",
  "updated_at": "2026-01-11T10:40:00Z"
}
```

---

### 🔒 Seguridad y Permisos

#### Autenticación
- ✅ Todos los endpoints requieren autenticación (`IsAuthenticated`)
- ✅ JWT token requerido en header Authorization

#### Autorización
- ✅ Usuarios solo ven sus propios bookmarks/highlights/annotations
- ✅ Filtrado automático por `user=request.user`
- ✅ Usuario asignado automáticamente en `create()`

#### Validaciones

**Bookmark**:
- `page_number >= 1`
- Unique constraint: user + book + page_number

**Highlight**:
- `page_number >= 1`
- `selected_text` no vacío
- `selected_text` máximo 5000 caracteres
- Color debe estar en choices válidos

**Annotation**:
- `page_number >= 1`
- `content` no vacío
- `content` máximo 10000 caracteres
- Si se vincula a highlight, debe ser del mismo libro

---

### 🗄️ Base de Datos

#### Migraciones Aplicadas

```bash
# Migration 0008_highlight_annotation_bookmark_and_more.py
✅ Create model Highlight
✅ Create model Annotation
✅ Create model Bookmark
✅ Create 10 indexes for performance optimization
```

#### Índices Creados

**Highlight**:
- `(user, book)` - Queries de highlights por usuario y libro
- `page_number` - Búsqueda por página
- `created_at` - Ordenamiento temporal

**Annotation**:
- `(user, book)` - Queries de annotations por usuario y libro
- `page_number` - Búsqueda por página
- `created_at` - Ordenamiento temporal
- `is_private` - Filtrado por privacidad

**Bookmark**:
- `(user, book)` - Queries de bookmarks por usuario y libro
- `created_at` - Ordenamiento temporal

---

### 🎨 Django Admin

Administración completa en Django Admin:

#### Bookmark Admin
- ✅ List display: user, book, page_number, title, created_at
- ✅ Search: username, book title, notes
- ✅ Filters: created_at, book
- ✅ Date hierarchy

#### Highlight Admin
- ✅ List display: user, book, page_number, color, text_preview
- ✅ Search: username, book title, selected_text
- ✅ Filters: color, created_at, book
- ✅ Text preview truncado

#### Annotation Admin
- ✅ List display: user, book, page_number, content_preview, is_private
- ✅ Search: username, book title, content
- ✅ Filters: is_private, created_at, book
- ✅ Content preview truncado

---

### 📊 Casos de Uso

#### 1. Estudiante Estudiando
```
1. Lee el capítulo 3
2. Resalta conceptos importantes (amarillo)
3. Resalta definiciones (verde)
4. Crea marcador en "Teorema de Pitágoras"
5. Agrega anotación: "Preguntar al profesor sobre la demostración"
```

#### 2. Investigador Académico
```
1. Resalta citas relevantes (azul)
2. Crea anotaciones con referencias cruzadas
3. Usa marcadores para secciones importantes
4. Exporta anotaciones para paper (futuro)
```

#### 3. Lector Casual
```
1. Marca páginas donde dejó de leer
2. Resalta frases inspiradoras (rosa)
3. Agrega notas personales
```

---

### 📁 Archivos Modificados

#### Backend
1. **[backend/apps/content/models.py](../../backend/apps/content/models.py)**
   - ✅ Agregados modelos Bookmark, Highlight, Annotation
   - ✅ Relaciones con User y Book
   - ✅ Índices y constraints

2. **[backend/apps/content/serializers.py](../../backend/apps/content/serializers.py)**
   - ✅ BookmarkSerializer con validaciones
   - ✅ HighlightSerializer con validaciones
   - ✅ AnnotationSerializer con validaciones
   - ✅ User auto-assignment en create()

3. **[backend/apps/content/views.py](../../backend/apps/content/views.py)**
   - ✅ BookmarkListCreateView
   - ✅ BookmarkDetailView
   - ✅ HighlightListCreateView
   - ✅ HighlightDetailView
   - ✅ AnnotationListCreateView
   - ✅ AnnotationDetailView
   - ✅ Rate limiting aplicado
   - ✅ Filtros y ordering

4. **[backend/apps/content/urls.py](../../backend/apps/content/urls.py)**
   - ✅ 6 nuevos endpoints registrados
   - ✅ Patrón RESTful consistente

5. **[backend/apps/content/admin.py](../../backend/apps/content/admin.py)**
   - ✅ Admin para Bookmark
   - ✅ Admin para Highlight
   - ✅ Admin para Annotation
   - ✅ Custom display methods

6. **[backend/apps/content/migrations/0008_highlight_annotation_bookmark_and_more.py](../../backend/apps/content/migrations/)**
   - ✅ Migración aplicada exitosamente

---

## 🚀 Fase 2: Frontend Implementation (Pendiente)

La Fase 2 implementará la interfaz de usuario para utilizar estas APIs.

### Componentes Planificados

#### 1. **AnnotationsSidebar Component**
```tsx
<AnnotationsSidebar
  bookId={bookId}
  currentPage={currentPage}
  bookmarks={bookmarks}
  highlights={highlights}
  annotations={annotations}
  onNavigateToPage={(page) => goToPage(page)}
  onEditAnnotation={(id) => editAnnotation(id)}
  onDeleteAnnotation={(id) => deleteAnnotation(id)}
/>
```

**Características**:
- Tabs: Bookmarks | Highlights | Annotations
- Agrupación por página
- Navegación rápida
- CRUD inline
- Drag & drop ordering

#### 2. **HighlightTool Component**
```tsx
<HighlightTool
  enabled={highlightMode}
  color={selectedColor}
  onTextSelected={(selection) => createHighlight(selection)}
  onHighlightClick={(id) => showHighlightMenu(id)}
/>
```

**Características**:
- Selección de texto en PDF
- Picker de color
- Overlay de highlights
- Editar/eliminar al click

#### 3. **BookmarkButton Component**
```tsx
<BookmarkButton
  pageNumber={currentPage}
  isBookmarked={isBookmarked}
  onToggle={() => toggleBookmark()}
/>
```

#### 4. **AnnotationEditor Component**
```tsx
<AnnotationEditor
  highlight={selectedHighlight}
  onSave={(content) => saveAnnotation(content)}
  onCancel={() => closeEditor()}
/>
```

**Características**:
- Rich text editor
- Link to highlight
- Privacy toggle
- Auto-save

---

### Integración Técnica Propuesta

#### Opción 1: React-PDF con Overlays Personalizados
```tsx
import { Document, Page } from 'react-pdf';

<Document file={pdfUrl}>
  <Page pageNumber={currentPage}>
    <HighlightOverlay highlights={pageHighlights} />
    <AnnotationMarkers annotations={pageAnnotations} />
  </Page>
</Document>
```

**Pros**:
- Control total sobre rendering
- Fácil integración con React
- Buen performance

**Contras**:
- Requiere cálculos de posicionamiento
- Más código personalizado

#### Opción 2: PDF.js con Canvas Customizado
```tsx
import * as pdfjsLib from 'pdfjs-dist';

// Render PDF nativo
// Overlay canvas para annotations
```

**Pros**:
- Rendering nativo más rápido
- Más opciones de bajo nivel

**Contras**:
- Integración React más compleja
- Requiere más código

#### Opción 3: Biblioteca de Anotaciones (ej: PSPDFKit, Annotorious)
```tsx
import PSPDFKit from 'pspdfkit';

// Solución completa out-of-the-box
```

**Pros**:
- Feature-complete
- Menos desarrollo

**Contras**:
- Costo (licencia)
- Menor flexibilidad

---

### Flujo de Usuario Planificado

#### Crear Highlight
```
1. Usuario activa modo highlight
2. Selecciona texto en PDF
3. Popup muestra palette de colores
4. Usuario elige color
5. Highlight se crea y sincroniza con backend
6. Highlight aparece en sidebar
```

#### Crear Bookmark
```
1. Usuario hace click en botón bookmark
2. Modal solicita título y notas
3. Bookmark se crea
4. Aparece en sidebar de bookmarks
5. Click en bookmark navega a la página
```

#### Crear Annotation
```
1. Usuario selecciona texto (opcional)
2. Click derecho > "Agregar anotación"
3. Editor se abre
4. Usuario escribe contenido
5. Guarda anotación
6. Aparece marker en PDF
7. Aparece en sidebar
```

---

## 🧪 Testing

### Tests Backend (Pendiente)

```python
# tests/test_bookmarks.py
def test_create_bookmark():
    # Test bookmark creation
    pass

def test_bookmark_unique_constraint():
    # Test user can't have duplicate bookmarks
    pass

# tests/test_highlights.py
def test_create_highlight():
    pass

def test_change_highlight_color():
    pass

# tests/test_annotations.py
def test_create_annotation():
    pass

def test_annotation_privacy():
    pass

def test_annotation_linked_to_highlight():
    pass
```

### Tests Frontend (Pendiente)

```typescript
// __tests__/AnnotationsSidebar.test.tsx
describe('AnnotationsSidebar', () => {
  it('renders bookmarks grouped by page', () => {});
  it('navigates to page on bookmark click', () => {});
  it('deletes bookmark on delete button', () => {});
});
```

---

## 📊 Métricas de Éxito

### Backend (Completado)
- ✅ 3 modelos creados
- ✅ 6 endpoints implementados
- ✅ 10 índices de base de datos
- ✅ 3 serializers con validaciones
- ✅ Admin completo
- ✅ Rate limiting aplicado
- ✅ Filtrado automático por usuario

### Frontend (Pendiente)
- ⏳ Sidebar de anotaciones
- ⏳ Herramienta de highlighting
- ⏳ Sistema de bookmarks
- ⏳ Editor de anotaciones
- ⏳ Búsqueda en documento

---

## 🎯 Próximos Pasos

### Inmediato (Fase 2 - Frontend)
1. Decidir biblioteca PDF (react-pdf vs PDF.js vs PSPDFKit)
2. Implementar sidebar de anotaciones
3. Crear herramienta de highlighting
4. Implementar sistema de bookmarks
5. Crear editor de anotaciones

### Corto Plazo
1. Búsqueda en documento
2. Export de anotaciones (PDF, Markdown)
3. Estadísticas de lectura avanzadas
4. Compartir anotaciones (is_private=False)

### Largo Plazo
1. Anotaciones colaborativas
2. AI-powered summaries de anotaciones
3. Flashcards desde highlights
4. Sync entre dispositivos

---

## 📝 Consideraciones Técnicas

### Performance
- ✅ Índices optimizados para queries frecuentes
- ✅ Select_related en queries
- ⏳ Pagination en frontend (React Query)
- ⏳ Lazy loading de highlights por página

### Escalabilidad
- ✅ JSONField para position_data (flexible)
- ✅ Relaciones bien diseñadas
- ⏳ Considerar ElasticSearch para búsqueda en anotaciones
- ⏳ Cache de highlights por página

### UX
- ⏳ Real-time sync (WebSockets opcional)
- ⏳ Offline mode con IndexedDB
- ⏳ Keyboard shortcuts
- ⏳ Touch gestures para móvil

---

## 🐛 Issues Conocidos

Ninguno hasta el momento. Backend completamente funcional.

---

## 📚 Recursos

### Bibliotecas PDF React
- [react-pdf](https://github.com/wojtekmaj/react-pdf) - React wrapper para PDF.js
- [PDF.js](https://mozilla.github.io/pdf.js/) - Mozilla PDF renderer
- [PSPDFKit](https://pspdfkit.com/) - Solución comercial completa

### Bibliotecas de Anotaciones
- [Annotorious](https://recogito.github.io/annotorious/) - Image annotations (adaptable)
- [Hypothesis](https://web.hypothes.is/) - Web annotations (inspiración)

### Referencias
- [Web Annotations Data Model](https://www.w3.org/TR/annotation-model/) - W3C Standard
- [PDF.js API](https://mozilla.github.io/pdf.js/api/draft/index.html)

---

**Versión**: 1.0 (Fase 1 - Backend)
**Última Actualización**: 2026-01-11
**Estado**: ✅ BACKEND COMPLETADO
**Próximo**: Fase 2 - Frontend Implementation
