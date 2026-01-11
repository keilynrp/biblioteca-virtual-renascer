# Fix: Error de Visualización de Lectura PDF

## Problema

Error al intentar abrir el visor de PDF: **"Error al iniciar la sesión de lectura"**

## Solución Rápida ⚡

### En Windows (Git Bash o WSL):

```bash
bash fix-reading-session-error.sh
```

### Solución Ultra Rápida (1 minuto):

```bash
bash quick-fix-reading.sh
```

## Scripts Disponibles

### 1. `fix-reading-session-error.sh` (RECOMENDADO)

Script completo que:
- ✅ Verifica Docker
- ✅ Aplica migraciones
- ✅ Verifica tabla `readings`
- ✅ Crea usuario de prueba
- ✅ Prueba el endpoint
- ✅ Reinicia servicios
- ✅ Muestra diagnóstico completo

**Uso:**
```bash
bash fix-reading-session-error.sh
```

### 2. `quick-fix-reading.sh`

Script rápido para solución inmediata:
- Aplica migraciones
- Verifica tabla
- Reinicia servicios

**Uso:**
```bash
bash quick-fix-reading.sh
```

### 3. `debug-reading-error.sh`

Script de diagnóstico detallado:
- Muestra logs del backend
- Verifica estructura de tabla
- Lista sesiones de lectura
- Estado de migraciones
- Estado de contenedores

**Uso:**
```bash
bash debug-reading-error.sh
```

## Solución Manual (Si los scripts no funcionan)

### Paso 1: Aplicar Migraciones

```bash
docker compose exec backend python manage.py migrate
```

### Paso 2: Verificar Tabla

```bash
docker compose exec db psql -U postgres -d bvs_db -c "\d readings"
```

Deberías ver la estructura de la tabla con estos campos:
- `id`
- `user_id`
- `book_id`
- `current_page`
- `total_pages`
- `progress_percentage`
- `zoom_level`
- `started_at`
- `last_read_at`
- `total_reading_time`

### Paso 3: Reiniciar Servicios

```bash
docker compose restart backend frontend
```

### Paso 4: Verificar Logs

```bash
# Ver logs del backend
docker compose logs backend --tail=50

# Ver logs del frontend
docker compose logs frontend --tail=50

# Ver logs en tiempo real
docker compose logs -f backend
```

## Diagnóstico de Problemas Comunes

### Error: "Table readings does not exist"

**Solución:**
```bash
# Forzar aplicación de migración específica
docker compose exec backend python manage.py migrate content 0005_add_reading_model

# Reiniciar
docker compose restart backend
```

### Error: "No such file or directory: /app/books/..."

**Problema:** El archivo PDF no existe en el contenedor.

**Solución:**
```bash
# Verificar volúmenes
docker compose exec backend ls -la /app/media/books/

# Verificar que el libro tiene archivo
docker compose exec db psql -U postgres -d bvs_db -c "SELECT id, title, file FROM books WHERE file IS NOT NULL LIMIT 5;"
```

### Error: "401 Unauthorized"

**Problema:** Token expirado o inválido.

**Solución:**
```bash
# Renovar token desde el frontend
# O crear nuevo usuario
docker compose exec backend python manage.py createsuperuser
```

### Error: "500 Internal Server Error"

**Problema:** Error en el backend.

**Solución:**
```bash
# Ver logs detallados
docker compose logs backend --tail=100 | grep -i error

# Verificar que el modelo está registrado
docker compose exec backend python manage.py shell -c "from apps.content.models import Reading; print('OK')"
```

## Probar el Endpoint Manualmente

### 1. Obtener Token

```bash
# Ejecutar en el backend
docker compose exec backend python manage.py shell
```

```python
from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token

User = get_user_model()
user = User.objects.filter(is_superuser=True).first()
token, _ = Token.objects.get_or_create(user=user)
print(f"Token: {token.key}")
```

### 2. Probar con cURL

```bash
# Reemplaza TOKEN y BOOK_ID
curl -X POST \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  http://localhost:8000/api/user/readings/start/1/
```

### 3. Respuesta Esperada

```json
{
  "status": "started",
  "reading": {
    "id": 1,
    "book": {
      "id": 1,
      "title": "Ejemplo de Libro",
      "slug": "ejemplo-de-libro",
      "author": {
        "id": 1,
        "name": "Autor Ejemplo"
      }
    },
    "current_page": 1,
    "total_pages": null,
    "progress_percentage": "0.00",
    "zoom_level": "1.00",
    "is_finished": false
  }
}
```

## Verificar Frontend

### 1. Revisar Variables de Entorno

Verifica que el frontend tiene la URL correcta del backend:

```bash
# En frontend/.env o frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 2. Reiniciar Frontend

```bash
docker compose restart frontend

# O reconstruir si es necesario
docker compose up -d --build frontend
```

### 3. Ver Logs del Frontend

```bash
docker compose logs frontend --tail=50 -f
```

## Arquitectura del Feature

### Backend

**Endpoint:** `POST /api/user/readings/start/{book_id}/`

**View:** [StartReadingView](backend/apps/content/views.py#L759-L787)

**Modelo:** [Reading](backend/apps/content/models.py#L200-L260)

**Serializer:** [ReadingSerializer](backend/apps/content/serializers.py#L214-L244)

**Migración:** [0005_add_reading_model.py](backend/apps/content/migrations/0005_add_reading_model.py)

### Frontend

**Página:** [reader/[bookId]/page.tsx](frontend/src/app/(dashboard)/reader/[bookId]/page.tsx)

**Componente:** [PDFViewer](frontend/src/components/pdf-viewer.tsx)

## Mejoras Implementadas

### 1. Error Handling Mejorado

El frontend ahora muestra errores detallados del backend:

```typescript
if (!response.ok) {
  const errorData = await response.json().catch(() => null);
  const errorMessage = errorData?.detail || errorData?.error ||
    `Error ${response.status}: ${response.statusText}`;
  console.error('Backend error:', errorData);
  throw new Error(`Error al iniciar la sesión de lectura: ${errorMessage}`);
}
```

### 2. Scripts de Diagnóstico

- **fix-reading-session-error.sh** - Fix completo automático
- **quick-fix-reading.sh** - Fix rápido
- **debug-reading-error.sh** - Diagnóstico detallado

## Comandos Útiles

```bash
# Ver todos los contenedores
docker compose ps

# Reiniciar todo
docker compose restart

# Reconstruir backend
docker compose up -d --build backend

# Acceder a la shell de Django
docker compose exec backend python manage.py shell

# Acceder a PostgreSQL
docker compose exec db psql -U postgres -d bvs_db

# Ver migraciones pendientes
docker compose exec backend python manage.py showmigrations

# Crear usuario admin
docker compose exec backend python manage.py createsuperuser

# Ver logs en tiempo real
docker compose logs -f backend frontend
```

## Contacto y Soporte

Si después de ejecutar estos scripts el problema persiste:

1. Ejecuta el script de debug: `bash debug-reading-error.sh`
2. Copia la salida completa
3. Revisa los logs: `docker compose logs backend --tail=200`
4. Verifica que tienes libros con archivos PDF en la base de datos

## Checklist de Verificación

- [ ] Docker Desktop está corriendo
- [ ] Contenedores backend y db están `healthy`
- [ ] Migraciones aplicadas (especialmente `0005_add_reading_model`)
- [ ] Tabla `readings` existe en PostgreSQL
- [ ] Hay libros en la base de datos
- [ ] Los libros tienen archivos PDF asociados
- [ ] Frontend puede conectarse al backend (http://localhost:8000)
- [ ] Usuario tiene token válido
- [ ] Logs del backend no muestran errores

---

**Última actualización:** 2025-01-02
**Versión:** 1.0
