# 📚 Guía de Importación de Libros desde OpenLibrary.org

## 🎯 Opciones Disponibles

### Opción 1: Importación Rápida de 100 Libros (Recomendada)

Ejecuta el script más simple que importará automáticamente 100 libros variados:

**Windows:**
```batch
IMPORTAR_100_LIBROS.bat
```

**Linux/Mac:**
```bash
chmod +x importar-100-libros.sh
./importar-100-libros.sh
```

**Características del script bash:**
- ✅ Colores en la salida para mejor legibilidad
- ✅ Verificación de errores en cada paso
- ✅ Mensajes informativos con emojis
- ✅ Manejo automático de fallos

Esta opción importará libros de las siguientes categorías:
- Programming (Programación)
- Science (Ciencia)
- Fiction (Ficción)
- History (Historia)
- Philosophy (Filosofía)
- Mathematics (Matemáticas)
- Art (Arte)
- Psychology (Psicología)
- Business (Negocios)
- Health (Salud)

---

### Opción 2: Importación Personalizada

Ejecuta el script interactivo para elegir qué tipo de libros importar:

**Windows:**
```batch
IMPORTAR_LIBROS_CUSTOM.bat
```

**Linux/Mac:**
```bash
chmod +x importar-libros-custom.sh
./importar-libros-custom.sh
```

Este script te permite:
1. Importar 100 libros de programación
2. Importar 100 libros de ciencia
3. Importar 100 libros de ficción
4. Importar colección variada
5. Buscar por término personalizado
6. Importación masiva (200 libros) - **Exclusivo en bash**
7. Salir

---

### Opción 3: Importación Rápida con Parámetros (Linux/Mac)

Script avanzado que acepta parámetros desde la línea de comandos:

```bash
chmod +x quick-import-books.sh
./quick-import-books.sh [opciones]
```

**Opciones disponibles:**
- `-l, --limit N` - Número de libros (default: 100)
- `-s, --subjects TEMAS` - Temas separados por comas
- `-q, --query TEXTO` - Búsqueda por query
- `--skip-index` - No indexar en Elasticsearch
- `-h, --help` - Mostrar ayuda

**Ejemplos:**
```bash
# Importar 50 libros de temas variados
./quick-import-books.sh --limit 50

# Importar libros específicos de programación
./quick-import-books.sh --subjects "python,javascript,rust"

# Buscar por término específico
./quick-import-books.sh --query "machine learning" --limit 30

# Importar sin indexar (más rápido)
./quick-import-books.sh --limit 100 --skip-index
```

---

### Opción 4: Verificar Estado de la Importación (Linux/Mac)

Script para verificar cuántos libros tienes y su distribución:

```bash
chmod +x verificar-importacion.sh
./verificar-importacion.sh
```

Este script muestra:
- 📊 Estadísticas generales (total de libros, autores, categorías)
- 📈 Distribución de libros por categoría
- ✍️ Autores más prolíficos
- 🖼️ Libros con/sin portada
- 💎 Libros premium vs gratuitos
- 🆕 Últimos libros importados
- 🔍 Estado del índice de Elasticsearch

---

### Opción 5: Comando Manual

Si prefieres más control, puedes ejecutar el comando directamente:

```bash
# Importar por temas/subjects
docker compose exec backend python manage.py import_openlibrary \
    --subjects "tema1,tema2,tema3" \
    --limit 100

# Importar por búsqueda
docker compose exec backend python manage.py import_openlibrary \
    --query "python programming" \
    --limit 100
```

---

## 📖 Ejemplos de Temas Populares

### Tecnología y Programación
```
programming, python, javascript, web_development, software_engineering,
algorithms, data_structures, computer_science, machine_learning,
artificial_intelligence, databases, cybersecurity
```

### Ciencias
```
science, physics, chemistry, biology, astronomy, geology, mathematics,
statistics, research, scientific_method, neuroscience, genetics
```

### Ficción y Literatura
```
fiction, fantasy, science_fiction, mystery, thriller, romance, horror,
adventure, classic_literature, contemporary_fiction, dystopian,
young_adult
```

### Historia y Filosofía
```
history, world_history, ancient_history, medieval_history, philosophy,
ethics, logic, metaphysics, political_philosophy, existentialism
```

### Negocios y Desarrollo Personal
```
business, entrepreneurship, marketing, finance, leadership, management,
productivity, self_help, personal_development, economics
```

### Arte y Cultura
```
art, music, photography, design, architecture, film, theater,
cultural_studies, humanities, creative_writing
```

---

## 🔧 Qué Hace el Script de Importación

1. **Conexión a OpenLibrary API**: Se conecta a la API pública de OpenLibrary.org
2. **Búsqueda de Libros**: Busca libros según los temas especificados
3. **Descarga de Datos**: Obtiene título, autor, descripción, año de publicación, ISBN
4. **Descarga de Portadas**: Descarga automáticamente las imágenes de portada
5. **Creación de Autores**: Crea o encuentra autores existentes
6. **Creación de Categorías**: Crea las categorías necesarias
7. **Importación a Base de Datos**: Guarda todo en PostgreSQL
8. **Indexación en Elasticsearch**: Indexa los libros para búsqueda rápida

---

## ⚙️ Características del Comando

### Parámetros Disponibles

| Parámetro | Descripción | Default |
|-----------|-------------|---------|
| `--subjects` | Temas separados por comas | `programming,science,fiction,history,philosophy` |
| `--limit` | Número máximo de libros | `30` |
| `--query` | Búsqueda por término general | `None` |

### Comportamiento

- **Evita Duplicados**: No importa libros que ya existan (compara por slug)
- **Rate Limiting**: Espera 0.2 segundos entre peticiones para no saturar la API
- **Manejo de Errores**: Continúa aunque falle la importación de algún libro
- **Descarga de Portadas**: Intenta descargar portadas, pero no falla si no están disponibles
- **Información Detallada**: Muestra estadísticas al finalizar

---

## 📊 Ejemplo de Salida

```
======================================================================
📚 IMPORTANDO LIBROS DESDE OPENLIBRARY
======================================================================

📖 Procesando tema: programming
----------------------------------------------------------------------
  ✅ Importado: Clean Code - Robert C. Martin
  ✅ Importado: The Pragmatic Programmer - Andrew Hunt
  ⏭️  Omitido (ya existe): Design Patterns
  ✅ Importado: Refactoring - Martin Fowler
  ...

======================================================================
✅ IMPORTACIÓN COMPLETADA
======================================================================
Libros importados: 98
Libros omitidos (duplicados): 2
Errores: 0

📊 ESTADÍSTICAS DE LA BASE DE DATOS
----------------------------------------------------------------------
Total de libros: 250
Total de autores: 180
Total de categorías: 15
```

---

## 🚀 Después de la Importación

Una vez completada la importación:

1. **Verifica en el Dashboard**: Ve a tu dashboard para ver las estadísticas actualizadas
2. **Explora la Biblioteca**: Navega a la sección de biblioteca para ver todos los libros
3. **Prueba la Búsqueda**: Usa la búsqueda para encontrar libros por título, autor o tema
4. **Filtros**: Usa los filtros por categoría para explorar los libros importados

---

## 🔍 Búsquedas Avanzadas

### Buscar libros en español
```bash
docker compose exec backend python manage.py import_openlibrary \
    --query "literatura española" \
    --limit 50
```

### Buscar libros de un autor específico
```bash
docker compose exec backend python manage.py import_openlibrary \
    --query "Gabriel García Márquez" \
    --limit 20
```

### Buscar libros por año
```bash
docker compose exec backend python manage.py import_openlibrary \
    --query "2020 programming" \
    --limit 30
```

---

## ⚠️ Notas Importantes

1. **Conexión a Internet**: Necesitas conexión a internet para descargar los libros
2. **Tiempo de Ejecución**: 100 libros pueden tardar aproximadamente 5-10 minutos
3. **Espacio en Disco**: Las portadas ocuparán aproximadamente 10-20 MB
4. **API Pública**: OpenLibrary es gratuito pero tiene límites de tasa
5. **Archivos PDF**: Los libros importados NO incluyen PDFs (solo metadatos y portadas)

---

## 🐛 Solución de Problemas

### Error: "docker: command not found"
Asegúrate de que Docker está instalado y corriendo.

### Error: "Connection timeout"
Verifica tu conexión a internet o intenta con menos libros (--limit 50).

### Error: "Backend container not running"
Inicia los contenedores con: `docker compose up -d`

### Los libros no aparecen en la búsqueda
Ejecuta: `docker compose exec backend python manage.py index_books`

---

## 📝 Logs y Debugging

Para ver logs detallados durante la importación:

```bash
docker compose logs -f backend
```

---

## 🎨 Personalización

Si quieres modificar el comportamiento del comando, edita:
```
backend/apps/content/management/commands/import_openlibrary.py
```

---

¡Disfruta tu biblioteca virtual! 📚✨
