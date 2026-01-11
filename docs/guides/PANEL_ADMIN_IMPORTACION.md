# 📚 Panel de Administración - Importación de Libros

## 🎯 Descripción

Se ha implementado un panel de administración completo en la interfaz web que permite a los usuarios con privilegios de administrador importar libros desde OpenLibrary.org de manera fácil e intuitiva.

---

## 🔑 Requisitos

- **Permisos:** Solo usuarios con privilegios de administrador (`is_staff=True` o `is_superuser=True` en Django)
- **Contenedores activos:** Backend y Elasticsearch deben estar corriendo
- **Conexión a Internet:** Necesaria para acceder a la API de OpenLibrary.org

---

## 🚀 Acceso al Panel

### Desde la Interfaz Web

1. **Iniciar sesión** con un usuario administrador
2. En el menú lateral, buscar la opción **"Panel Admin"** con el icono de escudo (Shield)
3. Click en "Panel Admin" para acceder al panel de importación

### URL Directa

```
http://localhost:3000/admin
```

---

## 📊 Funcionalidades del Panel

### 1. **Estadísticas de la Biblioteca**

El panel muestra estadísticas en tiempo real:

- 📖 **Total de Libros** (con/sin portada)
- ✍️ **Total de Autores**
- 🏷️ **Total de Categorías**
- 🖼️ **Porcentaje de libros con portada**
- 📈 **Top 10 Categorías** (con gráficos de barras)

### 2. **Panel de Importación**

Dos modos de importación disponibles:

#### **Modo 1: Por Temas (Subjects)**

- **Temas Predefinidos:** Lista de 20+ temas populares (programación, ciencia, ficción, etc.)
- **Temas Personalizados:** Agregar temas manualmente
- **Selección Múltiple:** Seleccionar varios temas simultáneamente
- Los libros se distribuyen equitativamente entre los temas seleccionados

**Ejemplo:**
```
Temas: programming, science, fiction
Límite: 100 libros
Resultado: ~33 libros por tema
```

#### **Modo 2: Por Búsqueda (Query)**

- Búsqueda libre por cualquier término
- Buscar por:
  - Título del libro
  - Nombre del autor
  - ISBN
  - Tema general

**Ejemplo:**
```
Búsqueda: "Gabriel García Márquez"
Límite: 50 libros
Resultado: 50 libros del autor
```

---

## ⚙️ Configuración de Importación

### Parámetros Disponibles

| Parámetro | Descripción | Valores | Default |
|-----------|-------------|---------|---------|
| **Número de Libros** | Cantidad máxima a importar | 1 - 500 | 100 |
| **Auto-indexar** | Indexar automáticamente en Elasticsearch | Sí / No | Sí |

### Consideraciones

- **Límite Máximo:** 500 libros por importación (para evitar sobrecarga)
- **Duplicados:** Los libros existentes se omiten automáticamente
- **Rate Limiting:** 0.2 segundos entre cada libro (requisito de OpenLibrary)
- **Tiempo Estimado:**
  - 50 libros ≈ 3-5 minutos
  - 100 libros ≈ 5-10 minutos
  - 500 libros ≈ 20-30 minutos

---

## 📋 Proceso de Importación

### Paso a Paso

1. **Seleccionar Modo de Importación**
   - Click en la pestaña "Por Temas" o "Por Búsqueda"

2. **Configurar la Importación**
   - **Por Temas:** Seleccionar uno o más temas
   - **Por Búsqueda:** Escribir el término de búsqueda
   - Establecer número de libros a importar
   - Activar/desactivar auto-indexación

3. **Iniciar Importación**
   - Click en el botón **"Iniciar Importación"**
   - El botón mostrará "Importando..." durante el proceso
   - **No cerrar la página** durante la importación

4. **Ver Resultados**
   - Al finalizar, se mostrará un resumen con:
     - ✅ Libros importados
     - ⚠️ Libros omitidos (duplicados)
     - ❌ Errores
     - 🔍 Libros indexados
     - 📚 Total en la base de datos
     - Lista de los primeros 10 títulos importados

---

## 🎨 Ejemplo de Uso

### Caso 1: Importar 100 Libros de Programación

```
1. Acceder a /admin
2. Seleccionar pestaña "Por Temas"
3. Click en los siguientes badges:
   - programming
   - python
   - javascript
   - web_development
4. Establecer límite: 100
5. Mantener auto-indexar activado
6. Click en "Iniciar Importación"
7. Esperar 5-10 minutos
8. Revisar resultados
```

**Resultado Esperado:**
- ~25 libros de cada tema
- Portadas descargadas automáticamente
- Autores y categorías creados
- Libros disponibles en la biblioteca inmediatamente

### Caso 2: Importar Libros de un Autor Específico

```
1. Acceder a /admin
2. Seleccionar pestaña "Por Búsqueda"
3. Escribir: "Stephen King"
4. Establecer límite: 30
5. Click en "Iniciar Importación"
6. Esperar 3-5 minutos
```

**Resultado Esperado:**
- 30 libros de Stephen King
- Categoría "Stephen King" creada automáticamente
- Libros listos para leer

---

## 🔒 Seguridad

### Verificación de Permisos

El panel implementa múltiples niveles de seguridad:

1. **Frontend:**
   - Verificación al cargar la página
   - Redirección automática si no es admin
   - Mensaje de "Acceso Denegado"

2. **Backend:**
   - Decorator `@permission_classes([permissions.IsAdminUser])`
   - Solo usuarios con `is_staff=True` o `is_superuser=True`
   - HTTP 403 Forbidden si no autorizado

3. **API Endpoints:**
   ```
   POST /api/content/admin/import-books/  → Requiere admin
   GET  /api/content/admin/import-stats/  → Requiere admin
   ```

---

## 📊 Endpoints API

### 1. Importar Libros

**Endpoint:** `POST /api/content/admin/import-books/`

**Headers:**
```json
{
  "Authorization": "Bearer YOUR_ACCESS_TOKEN",
  "Content-Type": "application/json"
}
```

**Body (Por Temas):**
```json
{
  "subjects": ["programming", "science", "fiction"],
  "limit": 100,
  "auto_index": true
}
```

**Body (Por Búsqueda):**
```json
{
  "query": "machine learning",
  "limit": 50,
  "auto_index": true
}
```

**Respuesta Exitosa:**
```json
{
  "success": true,
  "imported": 98,
  "skipped": 2,
  "errors": 0,
  "indexed": 98,
  "total_books_in_db": 250,
  "imported_titles": [
    "Clean Code",
    "The Pragmatic Programmer",
    ...
  ],
  "error_details": []
}
```

### 2. Obtener Estadísticas

**Endpoint:** `GET /api/content/admin/import-stats/`

**Headers:**
```json
{
  "Authorization": "Bearer YOUR_ACCESS_TOKEN"
}
```

**Respuesta:**
```json
{
  "total_books": 250,
  "total_authors": 180,
  "total_categories": 15,
  "categories_stats": [
    {"id": 1, "name": "Programming", "book_count": 50},
    {"id": 2, "name": "Science", "book_count": 45},
    ...
  ],
  "books_with_cover": 230,
  "books_without_cover": 20,
  "premium_books": 0,
  "free_books": 250,
  "recent_books": [...]
}
```

---

## 🛠️ Comandos Alternativos (CLI)

Si prefieres usar scripts bash o comandos directos, también están disponibles:

### Scripts Bash
```bash
# Importación rápida de 100 libros
./importar-100-libros.sh

# Importación personalizada (interactiva)
./importar-libros-custom.sh

# Importación con parámetros
./quick-import-books.sh --limit 50 --subjects "python,javascript"

# Verificar estado
./verificar-importacion.sh
```

### Comando Django Directo
```bash
docker compose exec backend python manage.py import_openlibrary \
    --subjects "programming,science,fiction" \
    --limit 100
```

---

## ❌ Solución de Problemas

### Error: "Acceso Denegado"

**Causa:** El usuario no tiene permisos de administrador

**Solución:**
```bash
# Verificar permisos del usuario
docker compose exec backend python manage.py shell
>>> from django.contrib.auth import get_user_model
>>> User = get_user_model()
>>> user = User.objects.get(username='tu_usuario')
>>> print(f"is_staff: {user.is_staff}, is_superuser: {user.is_superuser}")

# Dar permisos de admin
>>> user.is_staff = True
>>> user.save()
```

### Error: "Network Error" o "Timeout"

**Causa:** Problemas de conectividad con OpenLibrary

**Solución:**
- Verificar conexión a internet
- Intentar con menos libros (--limit 30)
- Esperar unos minutos y reintentar

### Los libros no aparecen en la búsqueda

**Causa:** No están indexados en Elasticsearch

**Solución:**
```bash
# Re-indexar manualmente
docker compose exec backend python manage.py index_books
```

### La importación es muy lenta

**Causa:** Rate limiting de OpenLibrary (0.2s entre requests)

**Solución:**
- Normal para grandes importaciones
- Considera importar en lotes más pequeños
- Deja la importación corriendo en segundo plano

---

## 📈 Mejores Prácticas

### 1. **Importación Incremental**
- Mejor importar 50-100 libros a la vez
- Verificar resultados antes de continuar
- Evita saturar la API de OpenLibrary

### 2. **Selección de Temas**
- Selecciona temas específicos para mejor calidad
- Evita temas muy genéricos (pueden dar resultados irrelevantes)
- Combina temas relacionados para variedad

### 3. **Mantenimiento**
- Revisa periódicamente las estadísticas
- Reindexar después de grandes importaciones
- Verifica la calidad de los libros importados

### 4. **Monitoreo**
- Revisa los logs del backend durante la importación
```bash
docker compose logs -f backend
```

---

## 🎯 Próximos Pasos

Después de importar libros:

1. **Verificar en la Biblioteca**
   - Navega a `/library` para ver los libros
   - Usa los filtros por categoría
   - Prueba la búsqueda

2. **Explorar el Dashboard**
   - Las estadísticas se actualizan automáticamente
   - Verás las nuevas categorías
   - Los libros recientes aparecerán

3. **Gestionar Contenido**
   - Editar libros si es necesario
   - Agregar/editar autores
   - Organizar categorías

---

## 📝 Notas Adicionales

- **Portadas:** Se descargan automáticamente cuando están disponibles
- **Metadatos:** Incluyen título, autor, descripción, año, ISBN
- **Archivos PDF:** NO se importan (solo metadatos y portadas)
- **Idioma:** OpenLibrary tiene libros en múltiples idiomas
- **Calidad:** Varía según la disponibilidad en OpenLibrary

---

¡Disfruta gestionando tu biblioteca virtual! 📚✨
