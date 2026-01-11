# Fix: Backend Healthcheck Issue

## El Problema

```
dependency failed to start: container bvs_framework-backend-1 is unhealthy
```

### Causa
El healthcheck del backend estaba configurado para verificar `GET /` (raíz), pero este endpoint no existe en Django y retorna 404.

```yaml
# ❌ Incorrecto
healthcheck:
  test: ["CMD-SHELL", "curl -f http://localhost:8000/ || exit 1"]
```

### Logs Típicos
```
WARNING: Not Found: /
WARNING: "GET / HTTP/1.1" 404 3110
```

---

## ✅ La Solución

Cambiar el healthcheck para usar un endpoint válido que siempre responda.

### Opción 1: `/admin/` (Recomendado)
```yaml
healthcheck:
  test: ["CMD-SHELL", "curl -f http://localhost:8000/admin/ || exit 1"]
```

**Ventajas:**
- Siempre disponible en Django
- Retorna 302 (redirect) = éxito
- No requiere autenticación para el healthcheck

### Opción 2: Crear endpoint `/health/`
Crear un endpoint dedicado para healthchecks en `backend/config/urls.py`:

```python
from django.http import JsonResponse

def health_check(request):
    return JsonResponse({"status": "healthy"})

urlpatterns = [
    path('health/', health_check),
    # ... otros paths
]
```

---

## 🔧 Cómo Aplicar el Fix

### Ya Aplicado ✅

El fix ya fue aplicado a [docker-compose.yml](d:/bvs_framework/docker-compose.yml):

```yaml
healthcheck:
  test: ["CMD-SHELL", "curl -f http://localhost:8000/admin/ || exit 1"]
  interval: 30s
  timeout: 10s
  retries: 5
  start_period: 60s
```

### Verificar el Fix

```bash
# Ver estado de contenedores
wsl docker compose ps

# Debe mostrar:
# backend - Up X minutes (healthy) ✅
```

---

## 🎯 Endpoints Disponibles

Según el análisis del backend, estos son los endpoints activos:

```
✅ /admin/              - Panel de administración Django
✅ /api/auth/          - Autenticación
✅ /api/institutions/  - Instituciones
✅ /api/subscriptions/ - Suscripciones
✅ /api/payments/      - Pagos
✅ /api/content/       - Contenido (libros)
✅ /media/<path>       - Archivos multimedia
```

---

## 📊 Estado del Sistema

Después del fix:

```
✅ db:            healthy
✅ redis:         healthy
✅ elasticsearch: healthy
✅ backend:       healthy ← FIXED!
⏳ frontend:      starting
```

---

## 🔍 Diagnóstico

Si el backend sigue "unhealthy", verifica:

```bash
# 1. Ver logs del backend
wsl docker compose logs backend --tail 50

# 2. Verificar endpoint manualmente
wsl curl -v http://localhost:8000/admin/

# 3. Revisar healthcheck
wsl docker inspect bvs_framework-backend-1 | grep -A 10 Healthcheck

# 4. Ver historial de healthcheck
wsl docker inspect bvs_framework-backend-1 | grep -A 20 Health
```

---

## 💡 Mejoras Futuras

### Crear endpoint dedicado `/api/health/`

Este sería el approach ideal para producción:

```python
# backend/apps/core/views.py
from django.http import JsonResponse
from django.db import connection

def health_check(request):
    # Verificar DB
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        db_status = "healthy"
    except:
        db_status = "unhealthy"

    return JsonResponse({
        "status": "healthy",
        "database": db_status,
        "version": "1.0.0"
    })
```

```python
# backend/config/urls.py
urlpatterns = [
    path('api/health/', health_check),
    # ... resto de paths
]
```

Luego actualizar docker-compose.yml:
```yaml
healthcheck:
  test: ["CMD-SHELL", "curl -f http://localhost:8000/api/health/ || exit 1"]
```

---

## 🆘 Troubleshooting

### Backend permanece "starting" por mucho tiempo

Aumentar `start_period`:
```yaml
healthcheck:
  start_period: 90s  # Dar más tiempo al inicio
```

### Backend alterna entre healthy/unhealthy

Ajustar `interval` y `timeout`:
```yaml
healthcheck:
  interval: 60s    # Verificar cada minuto
  timeout: 15s     # Dar más tiempo para responder
```

### Logs muestran "Broken pipe"

Esto es normal - es el healthcheck desconectando después de verificar.

---

## Referencias

- [Docker Compose Healthchecks](https://docs.docker.com/compose/compose-file/compose-file-v3/#healthcheck)
- [Django URL Dispatcher](https://docs.djangoproject.com/en/stable/topics/http/urls/)
