# 🔧 Solución: Error de Longitud de Campo

## ❌ Error Encontrado

```
Error: value too long for type character varying(50)
```

## 🔍 Causa del Problema

El campo `slug` en los modelos `Book` y `Category` tenía el límite por defecto de Django (`max_length=50`), pero algunos títulos de libros generan slugs más largos.

**Ejemplo:**
```python
# Título largo
"Introduction to Machine Learning and Artificial Intelligence with Python"

# Slug generado (muy largo)
"introduction-to-machine-learning-and-artificial-intelligence-with-python"
# ^^ Esto excede los 50 caracteres
```

---

## ✅ Solución Aplicada

Se actualizaron los modelos para soportar slugs más largos:

### Cambios en `backend/apps/content/models.py`:

**Antes:**
```python
class Category(models.Model):
    slug = models.SlugField(unique=True, blank=True)  # max_length=50 (default)

class Book(models.Model):
    slug = models.SlugField(unique=True, blank=True)  # max_length=50 (default)
```

**Después:**
```python
class Category(models.Model):
    slug = models.SlugField(max_length=150, unique=True, blank=True)  # ✅ 150 caracteres

class Book(models.Model):
    slug = models.SlugField(max_length=255, unique=True, blank=True)  # ✅ 255 caracteres
```

---

## 🚀 Aplicar la Corrección

### Opción 1: Script Automático (Recomendado)

Ejecuta este script que hará TODO:

```bash
cd /mnt/d/bvs_framework
chmod +x fix-and-import.sh
./fix-and-import.sh
```

Este script:
1. ✅ Crea las migraciones necesarias
2. ✅ Aplica las migraciones a la BD
3. ✅ Ejecuta la importación de libros
4. ✅ Indexa en Elasticsearch
5. ✅ Muestra estadísticas finales

---

### Opción 2: Paso a Paso Manual

Si prefieres hacerlo manualmente:

#### Paso 1: Crear Migraciones

```bash
sudo docker-compose exec backend python manage.py makemigrations
```

Deberías ver algo como:
```
Migrations for 'content':
  apps/content/migrations/000X_alter_book_slug_alter_category_slug.py
    - Alter field slug on book
    - Alter field slug on category
```

#### Paso 2: Aplicar Migraciones

```bash
sudo docker-compose exec backend python manage.py migrate
```

Deberías ver:
```
Running migrations:
  Applying content.000X_alter_book_slug_alter_category_slug... OK
```

#### Paso 3: Reintentar Importación

```bash
sudo docker-compose exec backend python manage.py import_openlibrary \
  --subjects "programming,science,fiction" \
  --limit 30
```

#### Paso 4: Indexar en Elasticsearch

```bash
sudo docker-compose exec backend python manage.py search_index --rebuild -f
```

---

## 🔍 Verificar que Funcionó

### 1. Ver las Migraciones Aplicadas

```bash
sudo docker-compose exec backend python manage.py showmigrations content
```

Deberías ver `[X]` en todas las migraciones.

### 2. Verificar Libros Importados

```bash
sudo docker-compose exec backend python manage.py shell -c "
from apps.content.models import Book;
print(f'Total de libros: {Book.objects.count()}')
"
```

### 3. Probar en el Admin

http://localhost:8000/admin/content/book/

### 4. Probar en la API

```bash
curl http://localhost:8000/api/content/books/ | python -m json.tool
```

---

## 🐛 Si el Error Persiste

### Verificar la Estructura de la Base de Datos

```bash
sudo docker-compose exec backend python manage.py dbshell
```

Luego ejecutar:
```sql
\d+ content_book
```

Deberías ver:
```
slug | character varying(255) | not null
```

### Limpiar y Recrear Migraciones (Última Opción)

⚠️ **ADVERTENCIA:** Esto eliminará todos los datos

```bash
# Eliminar todas las migraciones de content (excepto __init__.py)
sudo docker-compose exec backend bash -c "rm apps/content/migrations/0*.py"

# Recrear migraciones
sudo docker-compose exec backend python manage.py makemigrations content

# Eliminar datos de la BD y reaplicar
sudo docker-compose exec backend python manage.py migrate content --fake-initial

# O si prefieres empezar de cero:
sudo docker-compose down -v
sudo docker-compose up -d
sudo docker-compose exec backend python manage.py migrate
```

---

## 📝 Otros Cambios Realizados

Además de corregir el slug, también se aplicaron estos cambios:

### 1. Campo `file` Opcional

```python
file = models.FileField(upload_to='books/files/', null=True, blank=True)
```

### 2. Ordenamiento por Defecto

```python
class Meta:
    ordering = ['-created_at']  # Más recientes primero
```

Esto elimina la advertencia de paginación.

---

## 🎯 Resumen

**Problema:** Los slugs generados eran demasiado largos (>50 caracteres)

**Solución:** Aumentar `max_length` de los campos slug:
- `Category.slug`: 150 caracteres
- `Book.slug`: 255 caracteres

**Cómo aplicar:**
```bash
./fix-and-import.sh
```

---

## ✅ Resultado Esperado

Después de aplicar la corrección:

- ✅ Importación de libros funciona sin errores
- ✅ Títulos largos generan slugs correctamente
- ✅ No más errores de "value too long"
- ✅ Todos los libros se importan exitosamente

---

¡Listo para importar libros! 📚✨
