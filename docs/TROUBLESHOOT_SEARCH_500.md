# Troubleshooting: Error 500 en Búsqueda

## 🔴 Problema

Al usar el SearchBar en el dashboard, aparece el siguiente error en la consola:

```
AxiosError: Request failed with status code 500
```

## 🔍 Diagnóstico

El error 500 indica que el **backend** está fallando al procesar la búsqueda. Las causas más comunes son:

### 1. Elasticsearch no está corriendo
**Síntomas:**
- Error 500 inmediato
- Logs del backend muestran: `ConnectionError` o `ConnectionRefusedError`

**Verificar:**
```bash
docker compose ps elasticsearch
curl http://localhost:9200
```

**Debe retornar:**
```json
{
  "name" : "...",
  "cluster_name" : "docker-cluster",
  "version" : { ... }
}
```

**Solución:**
```bash
docker compose up -d elasticsearch
# Esperar 30 segundos
timeout /t 30
```

---

### 2. Índice 'books' no existe
**Síntomas:**
- Error 500 al buscar
- Logs del backend: `index_not_found_exception`

**Verificar:**
```bash
curl http://localhost:9200/books
```

**Si NO existe, verás:**
```json
{
  "error": {
    "type": "index_not_found_exception",
    "reason": "no such index [books]"
  }
}
```

**Solución:**
```bash
# Crear índice
docker compose exec backend python -c "from apps.content.documents import BookDocument; BookDocument.init(); print('Index created')"
```

---

### 3. Libros no están indexados
**Síntomas:**
- Búsqueda funciona pero retorna 0 resultados
- Autocomplete no muestra sugerencias

**Verificar:**
```bash
curl http://localhost:9200/books/_count
```

**Debe retornar:**
```json
{
  "count": 49,  // O el número de libros que tengas
  "_shards": { ... }
}
```

**Si `count: 0`, los libros no están indexados.**

**Solución:**
Ejecutar script de indexación.

---

## ✅ Solución Automatizada

### Opción 1: Script BAT (Recomendado)

```bash
FIX_SEARCH_500_ERROR.bat
```

Este script:
1. ✅ Verifica que Elasticsearch esté corriendo
2. ✅ Inicia Elasticsearch si no está corriendo
3. ✅ Crea el índice 'books' si no existe
4. ✅ Indexa todos los libros (49 actualmente)
5. ✅ Verifica que todo funcione correctamente

---

### Opción 2: Manual (Paso a Paso)

#### Paso 1: Verificar Elasticsearch
```bash
docker compose ps elasticsearch
```

Si no está corriendo:
```bash
docker compose up -d elasticsearch
timeout /t 30
```

#### Paso 2: Crear índice
```bash
docker compose exec backend python manage.py shell
```

```python
from apps.content.documents import BookDocument

# Crear índice
BookDocument.init()
print("✅ Índice creado")
exit()
```

#### Paso 3: Indexar libros
```bash
docker compose exec backend python manage.py shell
```

```python
from apps.content.models import Book
from apps.content.documents import BookDocument

# Obtener todos los libros
books = Book.objects.select_related('author', 'category').all()
count = 0

# Indexar cada libro
for book in books:
    doc = BookDocument.from_django_model(book)
    doc.save()
    count += 1
    if count % 10 == 0:
        print(f"Indexados: {count}/{books.count()}")

print(f"✅ Total indexados: {count}")
exit()
```

#### Paso 4: Verificar
```bash
# Verificar count
curl http://localhost:9200/books/_count

# Probar autocomplete
curl "http://localhost:8000/api/content/search/autocomplete/?q=harry"

# Probar búsqueda
curl "http://localhost:8000/api/content/search/?q=harry"
```

---

### Opción 3: Script de Python (Más robusto)

```bash
docker compose exec backend python backend/scripts/index_books_to_elasticsearch.py
```

Este script:
- Maneja errores de conexión
- Muestra progreso detallado
- Verifica al final que todo esté correcto

---

## 🧪 Pruebas de Verificación

### 1. Verificar Elasticsearch Health
```bash
curl http://localhost:9200/_cluster/health
```

**Respuesta esperada:**
```json
{
  "cluster_name": "docker-cluster",
  "status": "yellow",  // yellow es OK en desarrollo (1 nodo)
  "number_of_nodes": 1
}
```

### 2. Verificar Índice
```bash
curl http://localhost:9200/books
```

**Debe mostrar mappings y settings del índice.**

### 3. Verificar Documentos
```bash
curl http://localhost:9200/books/_search?size=1
```

**Debe retornar al menos 1 libro.**

### 4. Probar Autocomplete
```bash
curl "http://localhost:8000/api/content/search/autocomplete/?q=har"
```

**Respuesta esperada:**
```json
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

### 5. Probar Búsqueda Completa
```bash
curl "http://localhost:8000/api/content/search/?q=harry&page=1&page_size=5"
```

**Respuesta esperada:**
```json
{
  "count": 7,
  "page": 1,
  "page_size": 5,
  "total_pages": 2,
  "results": [ ... ]
}
```

### 6. Probar Facetas
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

---

## 🐛 Errores Comunes

### Error: "Connection refused"
**Causa:** Elasticsearch no está corriendo

**Solución:**
```bash
docker compose up -d elasticsearch
timeout /t 30
```

### Error: "index_not_found_exception"
**Causa:** Índice no creado

**Solución:**
```bash
docker compose exec backend python -c "from apps.content.documents import BookDocument; BookDocument.init()"
```

### Error: "No module named 'elasticsearch_dsl'"
**Causa:** Dependencia faltante

**Solución:**
```bash
# Verificar requirements.txt
docker compose exec backend pip list | findstr elasticsearch

# Si no está, instalar
docker compose exec backend pip install elasticsearch-dsl
```

### Error: "resource_already_exists_exception"
**Causa:** Índice ya existe (esto es OK)

**Acción:** Ninguna, continuar con la indexación de libros

### Autocomplete retorna 0 sugerencias
**Causa:** Libros no indexados o campo `title.autocomplete` no mapeado

**Verificar mapping:**
```bash
curl http://localhost:9200/books/_mapping
```

**Buscar:**
```json
{
  "mappings": {
    "properties": {
      "title": {
        "type": "text",
        "fields": {
          "autocomplete": {  // <-- Debe existir
            "type": "text"
          }
        }
      }
    }
  }
}
```

**Si falta, recrear índice:**
```bash
# CUIDADO: Esto elimina el índice
curl -X DELETE http://localhost:9200/books

# Recrear
docker compose exec backend python -c "from apps.content.documents import BookDocument; BookDocument.init()"

# Reindexar
docker compose exec backend python backend/scripts/index_books_to_elasticsearch.py
```

---

## 📊 Logs Útiles

### Ver logs del backend
```bash
# Últimas 50 líneas con errores
docker compose logs --tail=50 backend | findstr /i "error"

# Seguir logs en tiempo real
docker compose logs -f backend
```

### Ver logs de Elasticsearch
```bash
docker compose logs --tail=50 elasticsearch

# Seguir logs en tiempo real
docker compose logs -f elasticsearch
```

### Buscar errores específicos
```bash
# ConnectionError
docker compose logs backend | findstr "ConnectionError"

# 500 errors
docker compose logs backend | findstr "500"

# Elasticsearch errors
docker compose logs backend | findstr "elasticsearch"
```

---

## �� Reiniciar Servicios

### Solo Elasticsearch
```bash
docker compose restart elasticsearch
timeout /t 30
```

### Solo Backend
```bash
docker compose restart backend
timeout /t 15
```

### Ambos
```bash
docker compose restart elasticsearch backend
timeout /t 30
```

### Todos los servicios
```bash
docker compose down
docker compose up -d
timeout /t 45
```

---

## 🎯 Checklist de Diagnóstico

Sigue este checklist en orden:

- [ ] **1. Elasticsearch corriendo**
  ```bash
  docker compose ps elasticsearch
  curl http://localhost:9200
  ```

- [ ] **2. Backend corriendo**
  ```bash
  docker compose ps backend
  curl http://localhost:8000/api/content/books/
  ```

- [ ] **3. Índice 'books' existe**
  ```bash
  curl http://localhost:9200/books
  ```

- [ ] **4. Libros indexados**
  ```bash
  curl http://localhost:9200/books/_count
  # count debe ser > 0
  ```

- [ ] **5. Autocomplete funciona**
  ```bash
  curl "http://localhost:8000/api/content/search/autocomplete/?q=test"
  # debe retornar suggestions
  ```

- [ ] **6. Búsqueda funciona**
  ```bash
  curl "http://localhost:8000/api/content/search/?q=test"
  # debe retornar results
  ```

- [ ] **7. Frontend puede buscar**
  - Abrir http://localhost:3000/dashboard
  - Escribir en search bar
  - NO debe haber error 500

---

## 📞 Si Nada Funciona

Si después de todos estos pasos aún hay error 500:

1. **Captura logs completos:**
   ```bash
   docker compose logs backend > backend_logs.txt
   docker compose logs elasticsearch > elasticsearch_logs.txt
   ```

2. **Captura error de browser:**
   - Abrir DevTools (F12)
   - Ir a Console tab
   - Copiar el stack trace completo

3. **Verifica configuración:**
   ```bash
   # Ver configuración de Elasticsearch en Django
   docker compose exec backend python manage.py shell
   ```
   ```python
   from apps.content.documents import BookDocument
   print(BookDocument._index.name)  # Debe ser 'books'
   print(BookDocument._index._using)  # Conexión
   ```

4. **Comparte:**
   - Logs del backend
   - Logs de Elasticsearch
   - Error del browser
   - Salida de `docker compose ps`

---

## 🚀 Prevención

Para evitar este error en el futuro:

1. **Siempre arrancar Elasticsearch con el stack:**
   ```bash
   docker compose up -d
   ```

2. **Verificar health antes de usar búsqueda:**
   ```bash
   curl http://localhost:9200/_cluster/health
   ```

3. **Reindexar después de importar libros:**
   ```bash
   docker compose exec backend python backend/scripts/index_books_to_elasticsearch.py
   ```

4. **Monitorear logs periódicamente:**
   ```bash
   docker compose logs -f elasticsearch backend
   ```

---

**Fecha:** 2025-12-28
**Problema:** Error 500 en búsqueda
**Causa Principal:** Elasticsearch no corriendo o libros no indexados
**Solución:** Ejecutar `FIX_SEARCH_500_ERROR.bat`
**Status:** ✅ Solucionable
