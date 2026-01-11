# Solución - Error 500 (Internal Server Error)

## 🔴 Error Identificado

```
AxiosError: Request failed with status code 500
```

**Error 500 = Internal Server Error** - Hay un problema en el backend de Django.

---

## 🔍 Diagnóstico Rápido

### Paso 1: Ejecutar Diagnóstico Automático

```bash
CHECK_BACKEND_ERROR.bat
```

Este script verifica:
- ✅ Estado del contenedor backend
- ✅ Logs recientes con errores
- ✅ Conectividad al backend
- ✅ Estado de la base de datos

### Paso 2: Ver Logs Completos

```bash
VER_LOGS_BACKEND.bat
```

Esto muestra los logs del backend en tiempo real.

---

## 🎯 Causas Comunes y Soluciones

### Causa 1: Base de Datos No Migrada

**Síntoma:** Logs muestran errores como:
```
django.db.utils.OperationalError: no such table
django.db.utils.ProgrammingError: relation does not exist
```

**Solución:**

```bash
# Ejecutar migraciones
docker compose exec backend python manage.py migrate

# Verificar que funcionó
docker compose exec backend python manage.py showmigrations
```

---

### Causa 2: Falta Elasticsearch

**Síntoma:** Logs muestran:
```
elasticsearch.exceptions.ConnectionError
Failed to connect to Elasticsearch
```

**Solución Temporal (Desactivar Elasticsearch):**

Edita `backend/apps/content/documents.py` y comenta las funciones de Elasticsearch.

**Solución Permanente (Iniciar Elasticsearch):**

```bash
# Iniciar Elasticsearch
docker compose up -d elasticsearch

# Esperar 15 segundos
timeout /t 15 /nobreak

# Verificar que está corriendo
curl http://localhost:9200

# Reiniciar backend
docker compose restart backend
```

---

### Causa 3: Error en el Código Python

**Síntoma:** Logs muestran:
```
Traceback (most recent call last):
  File ...
NameError, AttributeError, TypeError, etc.
```

**Solución:**

1. Lee el traceback completo en los logs
2. Identifica el archivo y línea del error
3. Corrige el código
4. Reinicia el backend:

```bash
docker compose restart backend
```

---

### Causa 4: Variables de Entorno Faltantes

**Síntoma:** Logs muestran:
```
KeyError: 'SOME_ENV_VAR'
django.core.exceptions.ImproperlyConfigured
```

**Solución:**

Verifica el archivo `.env`:

```bash
# Ver contenido del .env
type .env

# Verificar variables requeridas
# Debe tener: DEBUG, SECRET_KEY, POSTGRES_*, etc.
```

Si falta algo, agrégalo al `.env` y reinicia:

```bash
docker compose restart backend
```

---

### Causa 5: Permisos de Archivos (Media/Static)

**Síntoma:** Logs muestran:
```
PermissionError: [Errno 13] Permission denied
```

**Solución:**

```bash
# Dar permisos a las carpetas
docker compose exec backend chmod -R 755 /app/media
docker compose exec backend chmod -R 755 /app/staticfiles

# Reiniciar backend
docker compose restart backend
```

---

### Causa 6: Puerto Ocupado

**Síntoma:** Backend no inicia, logs muestran:
```
Error: That port is already in use
```

**Solución:**

```bash
# Ver qué está usando el puerto 8000
netstat -ano | findstr :8000

# Detener el proceso
# O cambiar el puerto en docker-compose.yml
```

---

## 🛠️ Comandos Útiles para Diagnóstico

### Ver estado de todos los servicios

```bash
docker compose ps
```

### Ver logs de un servicio específico

```bash
# Backend (últimas 100 líneas)
docker compose logs --tail=100 backend

# En tiempo real
docker compose logs -f backend

# Solo errores
docker compose logs backend | findstr /i "error exception traceback"
```

### Ejecutar comandos dentro del backend

```bash
# Shell de Python (Django shell)
docker compose exec backend python manage.py shell

# Bash
docker compose exec backend bash

# Ver migraciones pendientes
docker compose exec backend python manage.py showmigrations

# Crear superusuario
docker compose exec backend python manage.py createsuperuser
```

### Verificar conectividad

```bash
# Desde Windows
curl http://localhost:8000/api/

# Probar endpoint específico
curl http://localhost:8000/api/content/dashboard/stats/

# Con headers
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8000/api/content/dashboard/stats/
```

---

## 🔧 Soluciones por Endpoint

### Error en `/api/content/dashboard/stats/`

**Posible causa:** Problema con agregaciones o queries

**Solución:**

```bash
# Ver el código del endpoint
docker compose exec backend cat /app/apps/content/views.py | grep -A 30 "dashboard"

# Probar la query directamente
docker compose exec backend python manage.py shell
```

En el shell de Django:

```python
from apps.content.models import Book, User
from apps.subscriptions.models import Loan

# Verificar que hay datos
print(Book.objects.count())
print(User.objects.count())
print(Loan.objects.count())

# Probar las queries del endpoint
books_count = Book.objects.count()
users_count = User.objects.count()
# etc.
```

---

### Error en `/api/content/search/facets/`

**Posible causa:** Elasticsearch no está disponible

**Solución:**

```bash
# Verificar Elasticsearch
curl http://localhost:9200

# Si no responde, iniciarlo
docker compose up -d elasticsearch
timeout /t 15
docker compose restart backend
```

---

## 🚀 Solución Rápida (Reset)

Si nada funciona, haz un reset completo:

```bash
# 1. Detener todo
docker compose down

# 2. Eliminar volúmenes (CUIDADO: borra datos)
docker compose down -v

# 3. Reconstruir
docker compose build backend

# 4. Iniciar servicios
docker compose up -d db elasticsearch redis
timeout /t 15

# 5. Ejecutar migraciones
docker compose up -d backend
timeout /t 5
docker compose exec backend python manage.py migrate

# 6. Crear datos de prueba (opcional)
docker compose exec backend python manage.py createsuperuser

# 7. Iniciar frontend
docker compose up -d frontend

# 8. Verificar
docker compose ps
curl http://localhost:8000/api/
```

---

## 📋 Checklist de Verificación

Marca cada punto:

- [ ] Backend está corriendo: `docker compose ps backend`
- [ ] Base de datos está corriendo: `docker compose ps db`
- [ ] Migraciones aplicadas: `docker compose exec backend python manage.py migrate`
- [ ] No hay errores en logs: `docker compose logs --tail=50 backend`
- [ ] Backend responde: `curl http://localhost:8000/api/`
- [ ] Elasticsearch corriendo (si se usa): `curl http://localhost:9200`
- [ ] Variables de entorno correctas: `type .env`

---

## 🆘 Necesitas Más Ayuda?

### Ver el error exacto

1. Ejecuta: `VER_LOGS_BACKEND.bat`
2. Reproduce el error en el frontend
3. Busca en los logs la línea que dice "Traceback" o "ERROR"
4. Copia todo el traceback completo

### Endpoints para probar

```bash
# Health check (debe responder siempre)
curl http://localhost:8000/api/health/

# Admin panel
http://localhost:8000/admin

# API root
curl http://localhost:8000/api/

# Dashboard stats
curl http://localhost:8000/api/content/dashboard/stats/

# Books list
curl http://localhost:8000/api/content/books/
```

---

## 📞 Próximos Pasos

1. **Ejecuta** `CHECK_BACKEND_ERROR.bat` para ver el error exacto
2. **Busca** el error en las causas comunes arriba
3. **Aplica** la solución correspondiente
4. **Verifica** que funcionó con `curl http://localhost:8000/api/`

Si el error persiste, ejecuta `VER_LOGS_BACKEND.bat` y busca el traceback completo.

---

**Fecha:** 2025-12-28
**Error:** 500 Internal Server Error
**Acción:** Ejecutar CHECK_BACKEND_ERROR.bat para diagnóstico
