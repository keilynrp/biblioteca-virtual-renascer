# 🚨 BACKEND NO FUNCIONA? - SOLUCIÓN RÁPIDA

## Error Actual Detectado

```
[ERROR] Missing Python dependencies detected
ModuleNotFoundError: No module named 'pythonjsonlogger'
ModuleNotFoundError: No module named 'django_ratelimit'
```

## ✅ SOLUCIÓN INMEDIATA (1 minuto)

### Opción 1: Script Ultra-Rápido (RECOMENDADO)

```bash
bash FIX_BACKEND_NOW.sh
```

Este script:
- ⏹️ Para el backend
- 📁 Crea directorio de logs
- 🔨 Reconstruye el contenedor con dependencias nuevas
- ▶️ Inicia el backend
- 🗄️ Ejecuta migraciones
- ✅ Verifica que funcione

**Tiempo estimado**: 2-3 minutos

---

### Opción 2: Script Detallado

```bash
bash scripts/install_dependencies.sh
```

Este script hace lo mismo pero con más detalles y verificaciones.

---

### Opción 3: Comandos Manuales

```bash
# 1. Crear directorio de logs
mkdir -p backend/logs

# 2. Reconstruir backend
docker compose build --no-cache backend

# 3. Reiniciar backend
docker compose up -d backend

# 4. Esperar 10 segundos
sleep 10

# 5. Ejecutar migraciones
docker compose exec backend python manage.py migrate

# 6. Verificar
curl http://localhost:8000/api/
```

---

## 🔍 ¿Por qué pasó esto?

En el **Sprint 7** agregamos nuevas funcionalidades:

1. **Sistema de Logging** → Requiere `python-json-logger`
2. **Rate Limiting** → Requiere `django-ratelimit`
3. **Sentry Integration** → Requiere `sentry-sdk`

Estas dependencias se agregaron a `requirements.txt` pero el contenedor Docker necesita ser **reconstruido** para instalarlas.

---

## ✅ Verificar que Funcionó

Después de ejecutar el fix, verifica:

1. **API responde**:
   ```bash
   curl http://localhost:8000/api/
   ```
   Debería retornar JSON

2. **Logs se crean**:
   ```bash
   ls -la backend/logs/
   ```
   Deberías ver archivos como `django.log`, `errors.log`

3. **Correlation ID funciona**:
   ```bash
   curl -I http://localhost:8000/api/ | grep X-Correlation-ID
   ```
   Debería mostrar un header `X-Correlation-ID`

4. **Contenedor está healthy**:
   ```bash
   docker compose ps backend
   ```
   Estado debe ser "Up" (no "unhealthy")

---

## 🆘 Si Aún No Funciona

### Ver logs del error:

```bash
docker compose logs --tail=50 backend
```

### Diagnóstico completo:

```bash
bash scripts/diagnose_and_fix_backend.sh
```

### Reset completo (último recurso):

```bash
# Para todo
docker compose down

# Reconstruye TODO
docker compose build --no-cache

# Inicia todo
docker compose up -d

# Espera y migra
sleep 15
docker compose exec backend python manage.py migrate
```

---

## 📋 Resumen de Scripts Disponibles

| Script | Uso | Tiempo |
|--------|-----|--------|
| `FIX_BACKEND_NOW.sh` | Fix rápido para dependencias | 2-3 min |
| `install_dependencies.sh` | Instalar y verificar dependencias | 3-4 min |
| `fix_recent_changes.sh` | Fix completo Sprint 7 | 4-5 min |
| `diagnose_and_fix_backend.sh` | Diagnóstico profundo | 5-10 min |
| `quick_fix_backend.sh` | Menú interactivo | Variable |

---

## 💡 Para el Futuro

**Cuando agregues dependencias a `requirements.txt`**, siempre:

1. Reconstruye el contenedor:
   ```bash
   docker compose build backend
   ```

2. Reinicia:
   ```bash
   docker compose up -d backend
   ```

O usa el script:
```bash
bash FIX_BACKEND_NOW.sh
```

---

## 📞 Contacto

Si los scripts no resuelven el problema:

1. Revisa `backend/logs/errors.log`
2. Ejecuta `docker compose logs backend`
3. Verifica que Docker Desktop tenga suficientes recursos (4GB RAM mínimo)
4. Revisa que `backend/.env` tenga todas las variables requeridas

---

**Última actualización**: 2026-01-05
**Sprint**: 7 - DevOps Crítico
