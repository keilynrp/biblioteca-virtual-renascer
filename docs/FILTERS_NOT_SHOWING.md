# Filtros No Se Muestran - Troubleshooting

## 🔴 Problema

Los filtros de **Categorías** y **Autores** no se visualizan en la página de búsqueda (`/search`).

## 🔍 Causas Posibles

### 1. Elasticsearch no está corriendo o libros no indexados
**Síntoma:** Sidebar de filtros vacío o muestra "No se pudieron cargar los filtros"

**Verificar:**
```bash
DIAGNOSE_FILTERS.bat
```

**Solución:**
```bash
FIX_SEARCH_500_ERROR.bat
```

### 2. API de facetas retorna arrays vacíos
**Síntoma:** Sidebar muestra solo el título "Filtros" pero sin opciones

**Verificar:**
```bash
curl "http://localhost:8000/api/content/search/facets/"
```

**Respuesta esperada:**
```json
{
  "categories": [
    {"name": "Fiction", "count": 25},
    {"name": "Fantasy", "count": 15}
  ],
  "authors": [
    {"name": "J.K. Rowling", "count": 7}
  ],
  "is_premium": [
    {"is_premium": false, "count": 40},
    {"is_premium": true, "count": 9}
  ]
}
```

**Si retorna arrays vacíos `[]`:**
Los libros NO están indexados en Elasticsearch.

**Solución:**
```bash
FIX_SEARCH_500_ERROR.bat
```

### 3. Frontend no puede conectar con backend
**Síntoma:** Error en Console del navegador

**Verificar:**
1. Abrir DevTools (F12)
2. Ir a Console tab
3. Buscar errores rojos

**Errores comunes:**

**Error CORS:**
```
Access to XMLHttpRequest at 'http://localhost:8000/api/content/search/facets/'
from origin 'http://localhost:3000' has been blocked by CORS policy
```

**Solución:**
```python
# backend/config/settings/development.py
CORS_ALLOW_ALL_ORIGINS = True  # Debe estar presente
```

**Error 500:**
```
Request failed with status code 500
```

**Solución:**
```bash
FIX_SEARCH_500_ERROR.bat
```

**Error de red:**
```
Network Error
```

**Solución:**
Verificar que el backend esté corriendo:
```bash
docker compose ps backend
curl http://localhost:8000/api/content/books/
```

### 4. Componente SearchFilters con error de renderizado
**Síntoma:** Filtros no aparecen pero no hay errores en console

**Verificar en Console:**
```javascript
// Buscar estos logs (agregados para debug)
Facets response: {...}
Categories count: X
Authors count: Y
```

**Si NO ves estos logs:**
El componente SearchFilters no se está renderizando o el API call está fallando silenciosamente.

**Si ves:**
```
Categories count: 0
Authors count: 0
```

Los libros no están indexados.

**Solución:**
```bash
FIX_SEARCH_500_ERROR.bat
```

---

## ✅ Diagnóstico Paso a Paso

### Paso 1: Verificar Backend
```bash
DIAGNOSE_FILTERS.bat
```

Este script verifica:
- ✅ Elasticsearch corriendo
- ✅ Libros indexados (count > 0)
- ✅ API de facetas responde
- ✅ Hay categorías y autores en PostgreSQL

**Interpretación:**

✅ **TODO OK:**
```
Elasticsearch: status "yellow" (OK)
Libros indexados: {"count": 49}
API facetas: {"categories": [...], "authors": [...]}
Categorias: Total: 5
Autores: Total: 42
```

❌ **PROBLEMA:**
```
Elasticsearch: Connection refused
O
Libros indexados: {"count": 0}
O
API facetas: {"categories": [], "authors": []}
```

**Solución si hay problema:**
```bash
FIX_SEARCH_500_ERROR.bat
```

### Paso 2: Verificar Frontend

1. **Abrir página de búsqueda:**
   ```
   http://localhost:3000/search?q=test
   ```

2. **Abrir DevTools:**
   - Presionar F12
   - Ir a Console tab

3. **Buscar logs de debug:**
   ```
   Facets response: {...}
   Categories count: X
   Authors count: Y
   ```

4. **Verificar Network tab:**
   - F12 → Network tab
   - Filtrar por "facets"
   - Debe haber request a `/api/content/search/facets/`
   - Click en el request
   - Ver Preview/Response tab
   - Debe mostrar categorías y autores

**Si NO hay request:**
El componente SearchFilters no se está montando.

**Si hay request pero retorna arrays vacíos:**
Ejecutar `FIX_SEARCH_500_ERROR.bat`

**Si hay request y retorna datos pero filtros no se muestran:**
Problema de renderizado en el componente.

### Paso 3: Hard Refresh del Frontend

A veces el cache del navegador causa problemas:

```
Ctrl + Shift + R
```

O borrar cache:
```
Ctrl + Shift + Delete
→ Cached images and files
→ Clear data
```

### Paso 4: Reiniciar Frontend

```bash
docker compose restart frontend
timeout /t 20
```

Abrir nuevamente:
```
http://localhost:3000/search?q=test
```

---

## 🧪 Pruebas Manuales

### Prueba 1: API de Facetas Directa
```bash
curl "http://localhost:8000/api/content/search/facets/" | python -m json.tool
```

**Debe retornar:**
```json
{
    "categories": [
        {
            "name": "Fiction",
            "count": 25
        },
        {
            "name": "Fantasy",
            "count": 15
        }
    ],
    "authors": [
        {
            "name": "J.K. Rowling",
            "count": 7
        }
    ],
    "is_premium": [
        {
            "is_premium": false,
            "count": 40
        }
    ]
}
```

### Prueba 2: Elasticsearch Aggregations
```bash
curl -X GET "http://localhost:9200/books/_search?size=0" -H 'Content-Type: application/json' -d '{
  "aggs": {
    "categories": {
      "terms": {
        "field": "category_name.raw",
        "size": 10
      }
    },
    "authors": {
      "terms": {
        "field": "author_name.raw",
        "size": 10
      }
    }
  }
}'
```

**Debe retornar buckets con categorías y autores.**

### Prueba 3: Frontend Console
```javascript
// En la consola del navegador (F12)
fetch('http://localhost:8000/api/content/search/facets/')
  .then(r => r.json())
  .then(d => {
    console.log('Categories:', d.categories)
    console.log('Authors:', d.authors)
  })
```

**Debe imprimir arrays con datos.**

---

## 🔧 Soluciones Rápidas

### Solución 1: Indexar Libros (Más Común)

```bash
FIX_SEARCH_500_ERROR.bat
```

Esto:
- Inicia Elasticsearch si no está corriendo
- Crea índice 'books'
- Indexa todos los 49 libros
- Verifica que funcione

**Tiempo:** 2-3 minutos

### Solución 2: Reiniciar Servicios

```bash
docker compose restart elasticsearch backend frontend
timeout /t 45
```

**Tiempo:** 1 minuto

### Solución 3: Reiniciar Todo

```bash
docker compose down
docker compose up -d
timeout /t 60

# Esperar a que todo inicie, luego indexar
FIX_SEARCH_500_ERROR.bat
```

**Tiempo:** 4-5 minutos

---

## 📊 Estados Esperados

### SearchFilters Component States

**1. Loading (Normal - primeros 1-2 segundos):**
```
[Filtros]
▓▓▓▓▓▓▓▓▓  (skeleton loader)
▓▓▓▓▓
▓▓▓▓▓▓▓
```

**2. Error (Problema - API falló):**
```
[Filtros]

No se pudieron cargar los filtros
```

**Causa:** API no responde o retornó error

**3. Loaded - Empty (Problema - arrays vacíos):**
```
[Filtros]
Limpiar todo

(vacío - solo header visible)
```

**Causa:** API retorna arrays vacíos, libros no indexados

**4. Loaded - Success (Correcto):**
```
[Filtros]
Limpiar todo

Categorías ∨
☐ Fiction (25)
☐ Fantasy (15)
☐ Non-Fiction (9)

Autores ∨
☐ J.K. Rowling (7)
☐ J.R.R. Tolkien (5)
☐ George Orwell (3)

Tipo de acceso ∨
☐ Premium (9)
☐ Gratis (40)
```

---

## 🐛 Debugging Avanzado

### Ver logs del componente SearchFilters

Con el logging agregado, deberías ver en Console:

```javascript
Facets response: {
  categories: Array(5),
  authors: Array(42),
  is_premium: Array(2)
}
Categories count: 5
Authors count: 42
```

**Si NO ves estos logs:**

1. El componente no se está renderizando
2. El useEffect no se está ejecutando
3. Hay un error antes del console.log

**Verificar:**
```javascript
// En Console (F12)
// Buscar errores de React
```

### Ver state del componente

Si sabes usar React DevTools:

1. Instalar React DevTools extension
2. F12 → Components tab
3. Buscar `SearchFilters`
4. Ver state:
   - `facets`: debe tener data
   - `isLoading`: debe ser false después de cargar
   - `expandedSections`: debe tener true para mostrar secciones

### Ver requests de red

F12 → Network tab:

1. Recargar página
2. Filtrar por "facets"
3. Debe aparecer:
   - `facets/` (GET request)
   - Status: 200 OK
   - Response: JSON con categorías y autores

**Si Status es 500:**
Backend error, ejecutar `FIX_SEARCH_500_ERROR.bat`

**Si no aparece request:**
Componente no se está montando o fetch no se ejecuta

---

## 📝 Checklist de Verificación

- [ ] **Elasticsearch corriendo**
  ```bash
  docker compose ps elasticsearch
  ```

- [ ] **Libros indexados**
  ```bash
  curl http://localhost:9200/books/_count
  # count debe ser > 0
  ```

- [ ] **API de facetas responde**
  ```bash
  curl "http://localhost:8000/api/content/search/facets/"
  # debe retornar arrays con datos
  ```

- [ ] **Frontend puede conectar**
  - F12 → Network → facets/ → Status 200

- [ ] **Console muestra logs de debug**
  - "Facets response"
  - "Categories count: X"
  - "Authors count: Y"

- [ ] **SearchFilters renderiza**
  - Ver sidebar en `/search`
  - Ver loading skeleton primero
  - Luego ver filtros

- [ ] **Datos mostrados correctamente**
  - Categorías con counts
  - Autores con counts
  - Checkboxes funcionan

---

## 🚀 Solución Definitiva

Si nada de lo anterior funciona:

### 1. Limpieza Completa

```bash
# Detener todo
docker compose down

# Eliminar volúmenes (CUIDADO: Borra datos)
docker volume ls | findstr bvs
# Anotar nombres de volúmenes

docker volume rm bvs_framework_es_data

# Reiniciar
docker compose up -d

# Esperar 60 segundos
timeout /t 60

# Indexar desde cero
FIX_SEARCH_500_ERROR.bat
```

### 2. Verificar desde Cero

```bash
# 1. Elasticsearch
curl http://localhost:9200

# 2. Índice books
curl http://localhost:9200/books

# 3. Count
curl http://localhost:9200/books/_count

# 4. Facets API
curl "http://localhost:8000/api/content/search/facets/"

# 5. Frontend
# Abrir http://localhost:3000/search
# F12 → Console
# Debe ver logs "Facets response"
```

---

**Fecha:** 2025-12-28
**Problema:** Filtros de categorías y autores no se visualizan
**Causa Principal:** Libros no indexados en Elasticsearch
**Solución:** Ejecutar `FIX_SEARCH_500_ERROR.bat`
**Status:** ✅ Solucionable
