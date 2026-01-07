# 🔧 Troubleshooting Guide - BVS Framework

## Error 500 después de implementar Cache Strategy

### Síntoma
El frontend muestra `AxiosError: Request failed with status code 500`

### Causa Raíz
Los nuevos cambios de Sprint 8 requieren que Redis y PostgreSQL estén corriendo. El error 500 ocurre cuando:

1. **Redis no está disponible** - El backend intenta conectar a Redis para caché
2. **PostgreSQL no está disponible** - El backend no puede conectar a la base de datos
3. **Migración de índices pendiente** - Los nuevos índices no han sido aplicados

### Solución Rápida

#### Opción 1: Iniciar con Docker (Recomendado)

```bash
# 1. Iniciar todos los servicios
docker compose up -d

# 2. Verificar que los servicios estén corriendo
docker compose ps

# 3. Crear la migración de índices
docker compose exec backend python manage.py makemigrations content --name add_query_optimization_indexes

# 4. Aplicar la migración
docker compose exec backend python manage.py migrate

# 5. Ver logs del backend
docker compose logs -f backend
```

#### Opción 2: Deshabilitar temporalmente el caché

Si necesitas ejecutar sin Docker temporalmente, puedes deshabilitar Redis:

**backend/config/settings.py**:

```python
# Cambiar de Redis a cache local (solo para desarrollo)
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'unique-snowflake',
    }
}
```

**⚠️ Advertencia**: Esto es solo para desarrollo local. En producción siempre usa Redis.

---

## Verificación de Servicios

### 1. Verificar Estado de Docker

```bash
# Ver contenedores corriendo
docker compose ps

# Salida esperada:
# NAME                STATUS              PORTS
# backend             Up                  8000/tcp
# postgres            Up                  5432/tcp
# redis               Up                  6379/tcp
# meilisearch         Up                  7700/tcp
```

### 2. Verificar Conexión a Redis

```bash
# Conectar a Redis CLI
docker compose exec redis redis-cli

# Dentro de Redis CLI:
127.0.0.1:6379> PING
PONG

127.0.0.1:6379> INFO stats
# Debería mostrar estadísticas

127.0.0.1:6379> KEYS bvs_cache:*
# Debería mostrar las claves de caché
```

### 3. Verificar Logs del Backend

```bash
# Ver logs en tiempo real
docker compose logs -f backend

# Buscar errores específicos
docker compose logs backend | grep -i error
docker compose logs backend | grep -i redis
```

### 4. Verificar Endpoints de Health

```bash
# Health check básico
curl http://localhost:8000/api/health/

# Health check detallado (incluye Redis y PostgreSQL)
curl http://localhost:8000/api/health/detailed/
```

Salida esperada del detailed health check:

```json
{
  "status": "healthy",
  "checks": {
    "database": {
      "status": "healthy",
      "type": "postgresql"
    },
    "cache": {
      "status": "healthy",
      "type": "redis"
    }
  }
}
```

---

## Problemas Comunes

### Error: "Settings object has no attribute 'CACHE_TTL'"

**Síntomas**:
```
AttributeError: 'Settings' object has no attribute 'CACHE_TTL'
ERROR: "GET /api/content/dashboard/stats/ HTTP/1.1" 500
```

**Causa**:
El contenedor backend está corriendo con código antiguo, antes de los cambios de Sprint 8.

**Solución**:
```bash
# Reiniciar backend para cargar nuevos cambios
docker compose restart backend

# Verificar logs
docker compose logs -f backend
```

**Si persiste el error**:
```bash
# Reconstruir la imagen desde cero
docker compose down
docker compose build backend --no-cache
docker compose up -d
```

### Error: "Connection refused" al conectar a Redis

**Síntomas**:
```
ConnectionRefusedError: [Errno 111] Connection refused
```

**Solución**:
```bash
# Verificar que Redis esté corriendo
docker compose ps redis

# Si no está corriendo, iniciarlo
docker compose up -d redis

# Verificar conectividad
docker compose exec backend python -c "from django.core.cache import cache; cache.set('test', 'ok'); print(cache.get('test'))"
```

### Error: "No module named 'magic'"

**Síntomas**:
```
ModuleNotFoundError: No module named 'magic'
```

**Solución**:
```bash
# Instalar dependencias faltantes
docker compose exec backend pip install python-magic

# O reconstruir la imagen
docker compose build backend
docker compose up -d backend
```

### Error: Database migration pending

**Síntomas**:
```
django.db.utils.ProgrammingError: relation "..." does not exist
```

**Solución**:
```bash
# Aplicar todas las migraciones
docker compose exec backend python manage.py migrate

# Verificar migraciones aplicadas
docker compose exec backend python manage.py showmigrations
```

### Error: "Cache key too long"

**Síntomas**:
```
ValueError: Cache key too long
```

**Solución**:
Este error puede ocurrir si usas `make_cache_key` con muchos parámetros. Usa `make_hash_key` en su lugar:

```python
# ❌ Malo - clave muy larga
cache_key = make_cache_key('search', query=long_query, filters=many_filters)

# ✅ Bueno - usa hash
cache_key = make_hash_key('search', {'query': long_query, 'filters': many_filters})
```

---

## Monitoreo de Performance

### Ver estadísticas de caché

```python
# En Django shell
docker compose exec backend python manage.py shell

>>> from apps.core.cache_utils import get_cache_stats
>>> stats = get_cache_stats()
>>> print(f"Hit rate: {stats['hit_rate']:.2%}")
>>> print(f"Hits: {stats['hits']}, Misses: {stats['misses']}")
```

### Ver queries en tiempo real con Debug Toolbar

1. Asegúrate que `DEBUG=True` en settings
2. Inicia el servidor: `docker compose up`
3. Visita http://localhost:8000 en tu navegador
4. Verás el panel de Debug Toolbar a la derecha
5. Click en "SQL" para ver las queries ejecutadas

---

## Resetear Caché

### Limpiar todo el caché

```bash
# Opción 1: Desde Django shell
docker compose exec backend python manage.py shell
>>> from django.core.cache import cache
>>> cache.clear()

# Opción 2: Desde Redis CLI
docker compose exec redis redis-cli FLUSHDB

# Opción 3: Reiniciar Redis
docker compose restart redis
```

### Limpiar caché específico

```python
# En Django shell
from apps.core.cache_utils import invalidate_cache

# Invalidar todo lo de libros
invalidate_cache('books:*')

# Invalidar categorías
invalidate_cache('categories:*')

# Invalidar dashboard
invalidate_cache('dashboard:*')
```

---

## Comandos Útiles

```bash
# Reiniciar todos los servicios
docker compose restart

# Reiniciar solo el backend
docker compose restart backend

# Ver uso de recursos
docker stats

# Limpiar containers y volúmenes (⚠️ CUIDADO: borra datos)
docker compose down -v

# Reconstruir desde cero
docker compose build --no-cache
docker compose up -d
```

---

## Contacto y Soporte

Si el problema persiste:

1. Revisa los logs completos: `docker compose logs > debug.log`
2. Verifica la configuración en `backend/config/settings.py`
3. Asegúrate que todas las variables de entorno estén configuradas en `.env`
4. Revisa la documentación de Sprint 8:
   - [CACHE_STRATEGY.md](CACHE_STRATEGY.md)
   - [QUERY_OPTIMIZATION.md](QUERY_OPTIMIZATION.md)
   - [SPRINT_8_PROGRESS.md](SPRINT_8_PROGRESS.md)

---

**Última actualización**: 2026-01-06
**Sprint**: Sprint 8 - DevOps Crítico Parte 2
