📚 Integración con OpenLibrary

## 🎯 ¿Qué es OpenLibrary?

[OpenLibrary.org](https://openlibrary.org) es un proyecto de Internet Archive que provee acceso gratuito a millones de libros. Su API permite buscar y obtener información detallada de libros incluyendo:

- Título y autor
- Descripción
- Año de publicación
- ISBN
- Portada del libro
- Temas/categorías
- Y mucho más

---

## 🚀 Importación Rápida (Recomendado)

Para importar 30 libros variados automáticamente:

```bash
cd /mnt/d/bvs_framework
chmod +x importar-libros-rapido.sh
./importar-libros-rapido.sh
```

Este script:
1. ✅ Aplica las migraciones necesarias
2. ✅ Importa 30 libros de temas variados
3. ✅ Indexa todo en Elasticsearch
4. ✅ Muestra estadísticas

**Tiempo estimado:** 2-5 minutos

---

## 📖 Importación Personalizada

Para elegir temas específicos o cantidad de libros:

```bash
cd /mnt/d/bvs_framework
chmod +x importar-libros-openlibrary.sh
./importar-libros-openlibrary.sh
```

Este script te permite:
- ✅ Elegir temas específicos
- ✅ Buscar por palabra clave
- ✅ Definir cantidad de libros
- ✅ Usar colección predefinida

---

## 🔧 Comandos Manuales

### Importar por Temas

```bash
sudo docker-compose exec backend python manage.py import_openlibrary \
  --subjects "programming,python,javascript" \
  --limit 20
```

### Importar por Búsqueda

```bash
sudo docker-compose exec backend python manage.py import_openlibrary \
  --query "artificial intelligence" \
  --limit 15
```

### Ver Ayuda del Comando

```bash
sudo docker-compose exec backend python manage.py import_openlibrary --help
```

---

## 📚 Temas Disponibles

### Tecnología y Programación
- `programming` - Programación en general
- `python` - Python
- `javascript` - JavaScript
- `java` - Java
- `web_development` - Desarrollo web
- `machine_learning` - Machine Learning
- `artificial_intelligence` - IA
- `data_science` - Ciencia de datos
- `cybersecurity` - Ciberseguridad

### Ciencias
- `science` - Ciencia general
- `physics` - Física
- `mathematics` - Matemáticas
- `biology` - Biología
- `chemistry` - Química
- `astronomy` - Astronomía

### Ficción y Literatura
- `fiction` - Ficción general
- `fantasy` - Fantasía
- `science_fiction` - Ciencia ficción
- `mystery` - Misterio
- `romance` - Romance
- `thriller` - Thriller
- `horror` - Horror

### Humanidades
- `history` - Historia
- `philosophy` - Filosofía
- `psychology` - Psicología
- `economics` - Economía
- `sociology` - Sociología
- `politics` - Política

### Artes y Cultura
- `art` - Arte
- `music` - Música
- `cooking` - Cocina
- `photography` - Fotografía
- `design` - Diseño

### Otros
- `health` - Salud
- `sports` - Deportes
- `business` - Negocios
- `self_help` - Autoayuda
- `religion` - Religión

---

## 🔍 Ejemplos de Uso

### Ejemplo 1: Biblioteca de Programación

```bash
sudo docker-compose exec backend python manage.py import_openlibrary \
  --subjects "python,javascript,web_development,machine_learning,data_science" \
  --limit 50
```

### Ejemplo 2: Biblioteca Académica

```bash
sudo docker-compose exec backend python manage.py import_openlibrary \
  --subjects "mathematics,physics,chemistry,biology,history" \
  --limit 40
```

### Ejemplo 3: Biblioteca de Ficción

```bash
sudo docker-compose exec backend python manage.py import_openlibrary \
  --subjects "fantasy,science_fiction,mystery,thriller" \
  --limit 30
```

### Ejemplo 4: Búsqueda Específica

```bash
sudo docker-compose exec backend python manage.py import_openlibrary \
  --query "django web framework" \
  --limit 10
```

---

## ⚙️ Cambios Realizados en el Backend

### 1. Modelo Book Actualizado

El campo `file` ahora es opcional:

```python
file = models.FileField(upload_to='books/files/', null=True, blank=True)
```

Además, se agregó ordenamiento por defecto:

```python
class Meta:
    ordering = ['-created_at']  # Más recientes primero
```

### 2. Nuevo Comando de Django

Se creó el comando `import_openlibrary` en:
```
backend/apps/content/management/commands/import_openlibrary.py
```

**Características:**
- ✅ Importa libros desde OpenLibrary API
- ✅ Descarga portadas automáticamente
- ✅ Crea autores y categorías automáticamente
- ✅ Evita duplicados
- ✅ Manejo de errores robusto
- ✅ Rate limiting para no saturar la API
- ✅ Progreso visual en tiempo real

---

## 📊 Después de Importar

### 1. Aplicar Migraciones (Si es necesario)

```bash
sudo docker-compose exec backend python manage.py makemigrations
sudo docker-compose exec backend python manage.py migrate
```

### 2. Indexar en Elasticsearch

**Muy importante** para que la búsqueda funcione:

```bash
sudo docker-compose exec backend python manage.py search_index --rebuild
```

O forzar recreación:

```bash
sudo docker-compose exec backend python manage.py search_index --rebuild -f
```

### 3. Verificar Importación

#### En el Admin de Django:
```
http://localhost:8000/admin/content/book/
```

#### En la API:
```bash
# Listar libros
curl http://localhost:8000/api/content/books/

# Buscar libros
curl http://localhost:8000/api/content/search/?q=python

# Ver categorías
curl http://localhost:8000/api/content/categories/

# Ver autores
curl http://localhost:8000/api/content/authors/
```

#### En el Frontend:
```
http://localhost:3000
```

---

## 🔄 Indexación en Elasticsearch

### ¿Por Qué es Necesario?

Los libros importados no estarán disponibles en la búsqueda hasta que se indexen en Elasticsearch.

### Comandos de Indexación

```bash
# Reconstruir índice completo
sudo docker-compose exec backend python manage.py search_index --rebuild

# Crear índice (primera vez)
sudo docker-compose exec backend python manage.py search_index --create

# Actualizar índice (agregar nuevos)
sudo docker-compose exec backend python manage.py search_index --populate

# Eliminar índice
sudo docker-compose exec backend python manage.py search_index --delete
```

---

## 📈 Estadísticas

### Ver Estadísticas en la Base de Datos

```bash
sudo docker-compose exec backend python manage.py shell -c "
from apps.content.models import Book, Author, Category;
print(f'Libros: {Book.objects.count()}');
print(f'Autores: {Author.objects.count()}');
print(f'Categorías: {Category.objects.count()}')
"
```

### Ver Estadísticas de Elasticsearch

```bash
curl http://localhost:9200/books/_count
```

---

## 🐛 Solución de Problemas

### Error: "Field 'file' doesn't have a default value"

**Solución:** Aplicar las migraciones

```bash
sudo docker-compose exec backend python manage.py makemigrations
sudo docker-compose exec backend python manage.py migrate
```

### Error: "No module named 'requests'"

**Solución:** El módulo `requests` debería estar instalado. Verificar:

```bash
sudo docker-compose exec backend pip install requests
```

### Libros no aparecen en la búsqueda

**Solución:** Indexar en Elasticsearch

```bash
sudo docker-compose exec backend python manage.py search_index --rebuild -f
```

### Error de conexión a OpenLibrary

**Solución:** Verificar conexión a internet y esperar un momento (rate limiting):

```bash
curl https://openlibrary.org/subjects/programming.json
```

### Las portadas no se descargan

**Solución:** Esto es normal si hay problemas de red. Las portadas son opcionales.

---

## 💡 Consejos y Mejores Prácticas

### 1. No Importar Demasiados de una Vez

Limita a 30-50 libros por importación para evitar:
- Saturar la API de OpenLibrary
- Tiempos de espera muy largos
- Problemas de memoria

### 2. Verificar Antes de Re-importar

El comando detecta duplicados por título, pero es mejor verificar primero:

```bash
# Ver cuántos libros ya tienes
sudo docker-compose exec backend python manage.py shell -c "
from apps.content.models import Book;
print(Book.objects.count())
"
```

### 3. Indexar Después de Importar

Siempre indexa en Elasticsearch después de importar:

```bash
./importar-libros-rapido.sh
# Ya incluye la indexación automáticamente
```

### 4. Limpiar y Reiniciar

Si quieres empezar de cero:

```bash
# Eliminar todos los libros
sudo docker-compose exec backend python manage.py shell -c "
from apps.content.models import Book;
Book.objects.all().delete()
"

# Reindexar
sudo docker-compose exec backend python manage.py search_index --rebuild -f
```

---

## 📝 Archivos Creados

1. **[import_openlibrary.py](d:\bvs_framework\backend\apps\content\management\commands\import_openlibrary.py)** - Comando de Django
2. **[importar-libros-openlibrary.sh](d:\bvs_framework\importar-libros-openlibrary.sh)** - Script interactivo
3. **[importar-libros-rapido.sh](d:\bvs_framework\importar-libros-rapido.sh)** - Importación rápida
4. **[INTEGRACION_OPENLIBRARY.md](d:\bvs_framework\INTEGRACION_OPENLIBRARY.md)** - Esta documentación

---

## 🎯 Próximos Pasos

Después de importar los libros:

1. ✅ **Explorar el Admin**
   - http://localhost:8000/admin/content/book/
   - Editar libros, agregar más información

2. ✅ **Probar la API**
   - http://localhost:8000/api/content/books/
   - http://localhost:8000/api/content/search/?q=python

3. ✅ **Probar el Frontend**
   - http://localhost:3000
   - Navegar por el catálogo

4. ✅ **Agregar Más Contenido**
   - Subir archivos PDF a los libros
   - Agregar más descripciones
   - Crear planes de suscripción

---

## 🚀 Resumen Rápido

**Para importar libros rápidamente:**

```bash
cd /mnt/d/bvs_framework
chmod +x importar-libros-rapido.sh
./importar-libros-rapido.sh
```

**Resultado:**
- ✅ 30 libros importados
- ✅ Portadas descargadas
- ✅ Indexados en Elasticsearch
- ✅ Listos para usar

**Tiempo:** 2-5 minutos

¡Disfruta tu biblioteca! 📚✨
