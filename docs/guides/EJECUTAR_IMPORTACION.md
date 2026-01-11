# 🚀 Ejecutar Importación de Libros - Instrucciones

## 📋 Comandos para Ejecutar en WSL

Abre tu terminal **WSL** y ejecuta estos comandos uno por uno:

---

## Paso 1: Navegar al Proyecto

```bash
cd /mnt/d/bvs_framework
```

---

## Paso 2: Crear Migraciones

```bash
sudo docker-compose exec backend python manage.py makemigrations
```

**Salida esperada:**
```
Migrations for 'content':
  apps/content/migrations/000X_alter_book_slug_alter_category_slug.py
    - Alter field slug on book
    - Alter field slug on category
    - Alter field file on book
```

---

## Paso 3: Aplicar Migraciones

```bash
sudo docker-compose exec backend python manage.py migrate
```

**Salida esperada:**
```
Running migrations:
  Applying content.000X_alter_book_slug_alter_category_slug... OK
```

---

## Paso 4: Importar Libros desde OpenLibrary

```bash
sudo docker-compose exec backend python manage.py import_openlibrary \
  --subjects "programming,science,fiction,history,philosophy" \
  --limit 30
```

**Esto tomará 2-3 minutos.** Verás:
```
📚 IMPORTANDO LIBROS DESDE OPENLIBRARY
======================================================================
📖 Procesando tema: programming
----------------------------------------------------------------------
  ✅ Importado: Python Programming for Beginners - John Doe
  ✅ Importado: JavaScript: The Good Parts - Douglas Crockford
  ⏭️  Omitido (ya existe): Clean Code
  ...
```

---

## Paso 5: Indexar en Elasticsearch

```bash
sudo docker-compose exec backend python manage.py search_index --rebuild -f
```

**Salida esperada:**
```
Deleting index 'books'
Creating index 'books'
Indexing 30 'Book' objects
Successfully indexed 30 'Book' objects
```

---

## Paso 6: Verificar Resultados

### Ver estadísticas:

```bash
sudo docker-compose exec backend python manage.py shell -c "
from apps.content.models import Book, Author, Category;
print(f'📚 Libros: {Book.objects.count()}');
print(f'✍️  Autores: {Author.objects.count()}');
print(f'📁 Categorías: {Category.objects.count()}')
"
```

### Ver en el navegador:

- **Django Admin:** http://localhost:8000/admin/content/book/
- **API Libros:** http://localhost:8000/api/content/books/
- **API Búsqueda:** http://localhost:8000/api/content/search/?q=python
- **Frontend:** http://localhost:3000

---

## 🎯 Script Todo-en-Uno (Opcional)

Si prefieres ejecutar todo de una vez, copia y pega esto en WSL:

```bash
cd /mnt/d/bvs_framework

echo "1️⃣  Creando migraciones..."
sudo docker-compose exec backend python manage.py makemigrations

echo ""
echo "2️⃣  Aplicando migraciones..."
sudo docker-compose exec backend python manage.py migrate

echo ""
echo "3️⃣  Importando 30 libros..."
sudo docker-compose exec backend python manage.py import_openlibrary \
  --subjects "programming,science,fiction,history,philosophy" \
  --limit 30

echo ""
echo "4️⃣  Indexando en Elasticsearch..."
sudo docker-compose exec backend python manage.py search_index --rebuild -f

echo ""
echo "✅ ¡Completado!"
sudo docker-compose exec backend python manage.py shell -c "
from apps.content.models import Book, Author, Category;
print(f'\n📊 Estadísticas:');
print(f'  📚 Libros: {Book.objects.count()}');
print(f'  ✍️  Autores: {Author.objects.count()}');
print(f'  📁 Categorías: {Category.objects.count()}')
"
```

---

## 🔍 Probar la Importación

### Desde la terminal (curl):

```bash
# Listar libros
curl http://localhost:8000/api/content/books/ | python -m json.tool

# Buscar libros sobre Python
curl "http://localhost:8000/api/content/search/?q=python" | python -m json.tool

# Ver categorías
curl http://localhost:8000/api/content/categories/ | python -m json.tool
```

### Desde el navegador:

1. **Django Admin:**
   - URL: http://localhost:8000/admin/
   - Login: admin / admin123456
   - Ve a Content → Books

2. **API en el navegador:**
   - http://localhost:8000/api/content/books/
   - http://localhost:8000/api/content/search/?q=programming

3. **Frontend:**
   - http://localhost:3000
   - Deberías ver los libros en el catálogo

---

## ⏱️ Tiempos Estimados

- Migraciones: ~10 segundos
- Importación de 30 libros: ~2-3 minutos
- Indexación: ~20-30 segundos
- **Total: ~3-4 minutos**

---

## 🐛 Solución de Problemas

### Si falla makemigrations:

Verifica que el modelo esté actualizado:
```bash
sudo docker-compose exec backend cat apps/content/models.py | grep -A 2 "slug ="
```

Deberías ver:
```python
slug = models.SlugField(max_length=255, unique=True, blank=True)
```

### Si falla migrate:

Verifica que el backend esté corriendo:
```bash
sudo docker-compose ps backend
sudo docker-compose logs backend --tail=20
```

### Si falla la importación:

Verifica conexión a internet y OpenLibrary:
```bash
curl https://openlibrary.org/subjects/programming.json
```

### Si no aparecen en la búsqueda:

Verifica Elasticsearch:
```bash
curl http://localhost:9200/books/_count
```

Debería mostrar el número de libros indexados.

---

## 📚 ¡Listo!

Después de ejecutar estos comandos, tendrás:

- ✅ 30 libros importados con portadas
- ✅ Autores y categorías creados automáticamente
- ✅ Todo indexado en Elasticsearch
- ✅ Disponible en API y Frontend
- ✅ Búsqueda funcionando

¡Disfruta tu biblioteca! 🎉
