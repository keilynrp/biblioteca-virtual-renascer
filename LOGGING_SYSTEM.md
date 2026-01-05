# Sistema de Logging Centralizado - BVS Backend

## 📋 Resumen

Sistema de logging completo con formato JSON estructurado, correlation IDs, rotación automática y múltiples handlers para diferentes tipos de logs.

### ✅ Estado: 100% Completado

- ✅ python-json-logger instalado
- ✅ Logs en formato JSON (producción)
- ✅ Logs en formato legible (desarrollo)
- ✅ Correlation IDs para tracking de requests
- ✅ Rotación automática (por tamaño y tiempo)
- ✅ Múltiples archivos de log (django, errors, security, performance)
- ✅ Middleware de correlation ID
- ✅ Filtros personalizados
- ✅ Integración con Sentry
- ✅ Tests unitarios
- ✅ Docker stdout compatible

---

## 🏗️ Arquitectura

### Componentes

```
┌─────────────────────────────────────────┐
│           Django Request                 │
└──────────────┬──────────────────────────┘
               │
               v
┌─────────────────────────────────────────┐
│    CorrelationIdMiddleware               │
│  - Genera/recibe X-Correlation-ID       │
│  - Almacena en thread-local             │
└──────────────┬──────────────────────────┘
               │
               v
┌─────────────────────────────────────────┐
│    RequestLoggingMiddleware              │
│  - Logs de request/response             │
│  - Duración de request                  │
└──────────────┬──────────────────────────┘
               │
               v
┌─────────────────────────────────────────┐
│         View / Logic                     │
│  logger.info("User logged in")          │
└──────────────┬──────────────────────────┘
               │
               v
┌─────────────────────────────────────────┐
│      CorrelationIdFilter                 │
│  - Agrega correlation_id a log record   │
└──────────────┬──────────────────────────┘
               │
               v
┌─────────────────────────────────────────┐
│         Log Handlers                     │
│  - Console (stdout)                     │
│  - File (django.log)                    │
│  - Error File (errors.log)              │
│  - Security File (security.log)         │
│  - Performance File (performance.log)   │
└──────────────┬──────────────────────────┘
               │
               v
┌─────────────────────────────────────────┐
│      JSON Formatter                      │
│  {"correlation_id": "...", ...}         │
└─────────────────────────────────────────┘
```

---

## 📁 Estructura de Archivos de Log

```
backend/logs/
├── django.log          # Todos los logs (rotación: 10MB, 5 backups)
├── errors.log          # Solo errores (rotación: 10MB, 10 backups)
├── security.log        # Eventos de seguridad (rotación: 5MB, 10 backups)
├── performance.log     # Performance metrics (rotación: 10MB, 5 backups)
└── daily.log           # Logs diarios (rotación: diaria, 30 días)
```

### Rotación Automática

**Por Tamaño**:
- `django.log`: 10 MB → crea `.1`, `.2`, etc.
- `errors.log`: 10 MB
- `security.log`: 5 MB

**Por Tiempo**:
- `daily.log`: Rotación a medianoche, mantiene 30 días

---

## 🔧 Configuración

### 1. Archivos Creados

- **settings.py** (líneas 407-661): Configuración completa de logging
- **apps/core/logging_filters.py**: Filtros personalizados
- **apps/core/middleware.py**: Middleware de correlation ID
- **apps/core/test_logging.py**: Tests del sistema
- **.gitignore**: Excluye `backend/logs/` del repo

### 2. Formato de Logs

**Desarrollo** (legible):
```
INFO 2026-01-05 15:30:45 [apps.authentication] User logged in
```

**Producción** (JSON):
```json
{
  "asctime": "2026-01-05 15:30:45",
  "name": "apps.authentication",
  "levelname": "INFO",
  "message": "User logged in",
  "correlation_id": "abc-123-def-456",
  "pathname": "/app/apps/authentication/views.py",
  "lineno": 45,
  "funcName": "login_view"
}
```

### 3. Niveles de Log

```python
# Por ambiente
DEVELOPMENT: DEBUG
PRODUCTION:  INFO

# Por logger
django:              INFO
django.request:      ERROR  # Solo errores de requests
django.db.backends:  DEBUG (dev) | INFO (prod)
django.security:     WARNING
apps:                DEBUG (dev) | INFO (prod)
celery:              INFO
elasticsearch:       WARNING
```

### 4. Correlation ID

**Request Header**:
```bash
curl -H "X-Correlation-ID: my-custom-id" http://localhost:8000/api/
```

**Response Header**:
```
X-Correlation-ID: abc-123-def-456
```

**En Logs**:
```json
{
  "correlation_id": "abc-123-def-456",
  "message": "User logged in"
}
```

---

## 💻 Uso

### Logging en Views

```python
import logging

logger = logging.getLogger(__name__)

def my_view(request):
    logger.info("User accessed view", extra={
        'user_id': request.user.id,
        'action': 'view_access'
    })

    try:
        # Logic
        result = do_something()
        logger.info("Operation successful", extra={'result': result})
    except Exception as e:
        logger.error(f"Operation failed: {e}", exc_info=True)

    return Response({'status': 'ok'})
```

### Logging Performance

```python
import logging
import time

perf_logger = logging.getLogger('performance')

def slow_operation(request):
    start = time.time()

    # Do expensive operation
    result = complex_calculation()

    duration = time.time() - start

    perf_logger.info("Slow operation completed", extra={
        'duration_ms': duration * 1000,
        'operation': 'complex_calculation',
        'threshold_exceeded': duration > 2.0  # 2 seconds
    })

    return result
```

### Logging Security Events

```python
import logging

security_logger = logging.getLogger('django.security')

def login_view(request):
    # Failed login attempt
    security_logger.warning("Failed login attempt", extra={
        'ip_address': request.META.get('REMOTE_ADDR'),
        'username': request.POST.get('username'),
        'reason': 'invalid_credentials'
    })
```

---

## 🧪 Testing

### Ejecutar Tests

```bash
# Tests de logging
pytest apps/core/test_logging.py -v

# Con coverage
pytest apps/core/test_logging.py --cov=apps.core.logging_filters --cov=apps.core.middleware -v
```

### Verificar Logs

```bash
# Ver logs en tiempo real
tail -f backend/logs/django.log

# Ver solo errores
tail -f backend/logs/errors.log

# Ver logs con formato JSON
tail -1 backend/logs/django.log | python -m json.tool

# Buscar por correlation ID
grep "abc-123-def-456" backend/logs/django.log

# Ver logs de últimas 100 líneas
tail -100 backend/logs/django.log

# Contar errores
grep "ERROR" backend/logs/errors.log | wc -l
```

---

## 🐳 Docker

### Logs en Docker Stdout

Los logs se envían automáticamente a stdout en Docker:

```bash
# Ver logs del contenedor
docker-compose logs -f backend

# Buscar en logs
docker-compose logs backend | grep "ERROR"

# Logs con timestamps
docker-compose logs -t backend

# Últimas 100 líneas
docker-compose logs --tail=100 backend
```

### Log Drivers de Docker

```yaml
# docker-compose.yml
services:
  backend:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

---

## 📊 Monitoreo

### Métricas Útiles

**Errores por Hora**:
```bash
grep "ERROR" backend/logs/django.log | awk '{print $1" "$2}' | cut -d':' -f1 | sort | uniq -c
```

**Requests más lentos**:
```bash
grep "Duration=" backend/logs/django.log | sort -t'=' -k4 -n | tail -20
```

**Endpoints más llamados**:
```bash
grep "GET\|POST\|PUT\|DELETE" backend/logs/django.log | awk '{print $3}' | sort | uniq -c | sort -nr | head -10
```

**Violaciones de seguridad**:
```bash
grep "WARNING\|ERROR" backend/logs/security.log
```

### Alertas Recomendadas

```yaml
Alert 1: High Error Rate
  - Trigger: > 100 errores en 5 minutos
  - Action: Notificar equipo

Alert 2: Slow Requests
  - Trigger: Request duration > 5 segundos
  - Action: Log to performance.log

Alert 3: Security Events
  - Trigger: Cualquier WARNING en security.log
  - Action: Notificar seguridad
```

---

## 🔍 Troubleshooting

### Problema: No se crean logs

**Solución**:
```bash
# Verificar directorio existe
ls backend/logs/

# Si no existe, crear
mkdir -p backend/logs

# Verificar permisos
chmod 755 backend/logs
```

### Problema: Logs no tienen correlation ID

**Solución**:
- Verificar `CorrelationIdMiddleware` está en `MIDDLEWARE`
- Debe estar ANTES de otros middleware custom
- Verificar filtro `correlation_id` está en handlers

### Problema: JSON inválido en logs

**Solución**:
```bash
# Verificar formatter
grep "pythonjsonlogger" backend/config/settings.py

# Debe estar:
'json': {
    '()': 'pythonjsonlogger.jsonlogger.JsonFormatter',
}
```

### Problema: Logs muy grandes

**Solución**:
```bash
# Limpiar logs viejos
find backend/logs/ -name "*.log.*" -mtime +7 -delete

# Ajustar rotación en settings.py
'maxBytes': 1024 * 1024 * 5,  # Reducir a 5 MB
'backupCount': 3,  # Solo 3 backups
```

---

## 🎯 Mejores Prácticas

### ✅ DO's

1. **Usar niveles apropiados**:
   ```python
   logger.debug("Detailed info for debugging")
   logger.info("General informational messages")
   logger.warning("Warning messages")
   logger.error("Error messages")
   logger.critical("Critical errors")
   ```

2. **Agregar contexto con `extra`**:
   ```python
   logger.info("User registered", extra={
       'user_id': user.id,
       'email': user.email,
       'timestamp': datetime.now()
   })
   ```

3. **Log excepciones con stack trace**:
   ```python
   try:
       risky_operation()
   except Exception as e:
       logger.error("Operation failed", exc_info=True)
   ```

4. **Usar loggers específicos**:
   ```python
   # En vez de
   import logging
   logger = logging.getLogger()

   # Usar
   logger = logging.getLogger(__name__)
   # O
   logger = logging.getLogger('apps.authentication')
   ```

### ❌ DON'Ts

1. **No loggear información sensible**:
   ```python
   # MAL
   logger.info(f"Password: {password}")

   # BIEN
   logger.info("User authenticated successfully")
   ```

2. **No loggear en loops sin throttling**:
   ```python
   # MAL
   for item in million_items:
       logger.debug(f"Processing {item}")

   # BIEN
   logger.info(f"Processing {len(million_items)} items")
   for i, item in enumerate(million_items):
       if i % 1000 == 0:
           logger.debug(f"Progress: {i}/{len(million_items)}")
   ```

3. **No usar print() en producción**:
   ```python
   # MAL
   print("Debug info")

   # BIEN
   logger.debug("Debug info")
   ```

---

## 📚 Referencias

- [Django Logging Docs](https://docs.djangoproject.com/en/stable/topics/logging/)
- [python-json-logger](https://github.com/madzak/python-json-logger)
- [12-Factor App Logging](https://12factor.net/logs)

---

**Última actualización**: 2026-01-05
**Versión**: 1.0.0
**Sprint**: 7 - DevOps Crítico Parte 1
