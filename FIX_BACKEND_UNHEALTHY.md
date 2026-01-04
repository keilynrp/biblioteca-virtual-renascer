# Solución: Backend Unhealthy Error

## Problema

Al intentar iniciar los contenedores optimizados, el backend falla con:

```
dependency failed to start: container bvs_framework-backend-1 is unhealthy
```

## Causa

Este error puede tener varias causas:

1. **Usuario no-root con volúmenes montados**: El usuario `django` creado en el Dockerfile no tiene permisos de escritura en el volumen montado desde el host
2. **Gunicorn requiere compilación de módulos**: Primera vez que se ejecuta puede necesitar permisos adicionales
3. **Healthcheck falla antes del inicio completo**: El backend necesita más tiempo para estar listo

## Solución Aplicada

Se han realizado los siguientes cambios:

### 1. Dockerfile del Backend Actualizado

El usuario no-root ha sido deshabilitado para desarrollo (comentado):

```dockerfile
# Run as root in development to avoid permission issues with volume mounts
# In production, you should create a non-root user
# RUN addgroup --system django \
#     && adduser --system --ingroup django django \
#     && chown -R django:django /app
# USER django
```

### 2. Comando por Defecto Cambiado a Runserver

Para desarrollo, ahora usa `runserver` por defecto:

```yaml
command: python manage.py runserver 0.0.0.0:8000
# command: gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 2 --threads 4 --timeout 60 --max-requests 1000 --max-requests-jitter 50
```

### 3. Archivo de Producción Separado

Se creó `docker-compose.production.yml` para usar Gunicorn en producción.

## Cómo Usar

### Modo Desarrollo (Actual)

```bash
docker compose up -d
```

Usa `runserver` con auto-reload para desarrollo.

### Modo Producción

```bash
docker compose -f docker-compose.yml -f docker-compose.production.yml up -d
```

Usa Gunicorn para mejor rendimiento.

## Verificar Logs del Backend

Si el problema persiste, verifica los logs:

```bash
# Ver logs del backend
docker compose logs backend

# Ver logs en tiempo real
docker compose logs -f backend

# Ver últimas 100 líneas
docker compose logs backend --tail=100
```

## Errores Comunes y Soluciones

### Error: "Permission denied"

**Solución**: Asegúrate de que el Dockerfile NO use `USER django` en desarrollo.

### Error: "No module named 'config'"

**Solución**: Verifica que el volumen esté montado correctamente:

```bash
docker compose exec backend ls -la
docker compose exec backend pwd
```

### Error: "Database connection refused"

**Solución**: Espera a que PostgreSQL esté completamente iniciado:

```bash
docker compose logs db
docker compose exec db pg_isready -U postgres
```

### Error: "curl: command not found" en healthcheck

**Solución**: Ya está instalado curl en el Dockerfile actualizado.

## Healthcheck Ajustado

El healthcheck ahora tiene:

- `start_period: 40s` - Da 40 segundos antes de comenzar a verificar
- `interval: 30s` - Verifica cada 30 segundos
- `timeout: 10s` - Cada verificación tiene 10 segundos
- `retries: 3` - 3 intentos antes de marcar como unhealthy

## Pasos para Reiniciar Limpiamente

Si el problema persiste, reinicia completamente:

```bash
# 1. Detener todo
docker compose down

# 2. Limpiar volúmenes de aplicación (NO borra datos de DB)
docker compose down -v

# 3. Reconstruir imágenes
docker compose build --no-cache backend

# 4. Iniciar servicios
docker compose up -d

# 5. Ver logs
docker compose logs -f backend
```

## Verificar Estado del Backend

```bash
# Ver estado de contenedores
docker compose ps

# Verificar salud del backend
docker compose exec backend curl http://localhost:8000/api/

# Verificar proceso de Python
docker compose exec backend ps aux

# Verificar conexión a la base de datos
docker compose exec backend python manage.py dbshell
```

## Cambiar a Gunicorn Manualmente

Si quieres usar Gunicorn en desarrollo:

1. Edita `docker-compose.yml`:

```yaml
# Comenta runserver
# command: python manage.py runserver 0.0.0.0:8000
# Descomenta gunicorn
command: gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 2 --threads 4 --timeout 60
```

2. Aumenta el `start_period` del healthcheck:

```yaml
healthcheck:
  start_period: 60s  # Aumenta de 40s a 60s
```

3. Reinicia:

```bash
docker compose restart backend
```

## Configuración Recomendada por Entorno

### Desarrollo Local

- ✅ Usar `runserver` para auto-reload
- ✅ Correr como root (sin problemas de permisos)
- ✅ DEBUG=True
- ✅ Volúmenes montados para hot-reload

### Staging/QA

- ✅ Usar Gunicorn con 2 workers
- ✅ Usuario no-root
- ✅ DEBUG=False
- ⚠️ No montar volúmenes (usar COPY en Dockerfile)

### Producción

- ✅ Usar Gunicorn con 4+ workers
- ✅ Usuario no-root obligatorio
- ✅ DEBUG=False
- ✅ Servidor web reverso (Nginx)
- ⚠️ No montar volúmenes del código

## Estado Actual

Los archivos han sido actualizados con:

- ✅ Backend usa `runserver` por defecto (desarrollo)
- ✅ Gunicorn disponible pero comentado
- ✅ Usuario no-root deshabilitado en desarrollo
- ✅ `docker-compose.production.yml` creado para producción
- ✅ Healthcheck con tiempos apropiados

## Herramientas de Diagnóstico

### Script de Diagnóstico Automático

Ejecuta el script de diagnóstico para ver exactamente qué está fallando:

```bash
# Windows
DIAGNOSE_BACKEND.bat

# Linux/Mac/WSL
chmod +x diagnose-backend.sh
./diagnose-backend.sh
```

Este script verificará:
- Estado de contenedores
- Logs del backend
- Existencia de archivos
- Conectividad a servicios dependientes

### Modo de Desarrollo Simplificado

Si los healthchecks están causando problemas, usa el archivo simplificado:

```bash
# Detener contenedores actuales
docker compose down

# Iniciar sin healthchecks
docker compose -f docker-compose.dev.yml up
```

El archivo `docker-compose.dev.yml` no usa healthchecks, facilitando el debug.

## Aplicar los Cambios

### Opción 1: Con Healthchecks (Recomendado)

Ejecuta el script de optimización actualizado:

```bash
# Windows
APPLY_DOCKER_OPTIMIZATIONS.bat

# Linux/Mac/WSL
./apply-docker-optimizations.sh
```

### Opción 2: Sin Healthchecks (Debug)

```bash
docker compose -f docker-compose.dev.yml up -d
docker compose -f docker-compose.dev.yml logs -f backend
```

### Opción 3: Manual con Healthchecks

```bash
docker compose down
docker compose build backend
docker compose up -d
docker compose logs -f backend
```

## Cambios Recientes al Healthcheck

El healthcheck del backend ha sido ajustado:

```yaml
healthcheck:
  test: ["CMD-SHELL", "curl -f http://localhost:8000/ || exit 1"]
  interval: 30s
  timeout: 10s
  retries: 5          # Aumentado de 3 a 5
  start_period: 60s   # Aumentado de 40s a 60s
```

Cambios:
- URL simplificada de `/api/` a `/` (más probable que funcione)
- Más reintentos (5 en lugar de 3)
- Más tiempo de inicio (60s en lugar de 40s)
