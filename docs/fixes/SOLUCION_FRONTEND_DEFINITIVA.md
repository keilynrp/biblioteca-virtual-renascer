# 🎯 Solución Definitiva para el Frontend

## 🔍 Problema Diagnosticado

El frontend no se estabiliza debido a una **cadena de dependencias rotas**:

```
Elasticsearch (reiniciando) → Backend (falla) → Frontend (nunca inicia)
```

### Causas Raíz Identificadas:

1. **Elasticsearch con memoria insuficiente** (256MB) → Reinicio constante
2. **Backend esperando a Elasticsearch** → No puede iniciar
3. **Frontend esperando al Backend** → Se queda en estado "Created"
4. **Sin healthchecks** → Docker no sabe cuándo los servicios están listos

---

## ✅ Cambios Implementados

### 1. Optimización de Elasticsearch

**Antes:**
- Memoria: 256MB (Java heap) / 512MB (límite Docker)
- Sin healthcheck
- Sin límites de ulimit

**Después:**
- Memoria: 512MB (Java heap) / 1GB (límite Docker) ✅
- Healthcheck activo cada 30s ✅
- Ulimits configurados para mejor rendimiento ✅

```yaml
ES_JAVA_OPTS: -Xms512m -Xmx512m
memory: 1G
healthcheck: curl http://localhost:9200/_cluster/health
```

### 2. Mejora en el Frontend

**Antes:**
- Sin curl (no puede hacer healthchecks)
- Dependencia genérica del backend

**Después:**
- Curl instalado en el contenedor ✅
- Healthcheck cada 30s ✅
- 90 segundos de gracia para iniciar ✅

```yaml
healthcheck:
  test: ["CMD-SHELL", "curl -f http://localhost:3000 || exit 1"]
  start_period: 90s
```

### 3. Scripts de Solución

#### **FIX_FRONTEND_DEFINITIVO.bat** (Solución completa)
- Detiene todos los contenedores
- Limpia cachés de Docker
- Reconstruye frontend sin caché
- Inicia servicios en orden correcto con tiempos de espera
- Verifica el estado de todos los servicios

#### **RESTART_FRONTEND_SIMPLE.bat** (Reinicio rápido)
- Solo reinicia el frontend
- Útil para cambios de código
- Muestra logs automáticamente

---

## 🚀 Cómo Usar la Solución

### Opción 1: Solución Completa (Primera Vez o Problemas Graves)

```batch
FIX_FRONTEND_DEFINITIVO.bat
```

Este script:
1. ⏹️ Detiene todo
2. 🧹 Limpia cachés
3. 🔨 Reconstruye frontend
4. ⚙️ Inicia servicios en orden:
   - PostgreSQL + Redis (8s)
   - Elasticsearch (20s)
   - Backend + Migraciones (10s)
   - Frontend (30s)
5. ✅ Verifica estado

**Tiempo total:** ~2-3 minutos

---

### Opción 2: Reinicio Rápido (Solo Frontend)

```batch
RESTART_FRONTEND_SIMPLE.bat
```

Úsalo cuando:
- Solo cambiaste código del frontend
- Los otros servicios están funcionando
- Necesitas un reinicio rápido

**Tiempo total:** ~20-30 segundos

---

## 📊 Verificación Post-Ejecución

Después de ejecutar el script, verifica:

### 1. Estado de Contenedores

```bash
wsl -d Ubuntu -e bash -c "cd /mnt/d/bvs_framework && docker compose ps"
```

**Esperado:**
- ✅ `db` - Up
- ✅ `redis` - Up
- ✅ `elasticsearch` - Up (healthy)
- ✅ `backend` - Up
- ✅ `frontend` - Up (healthy)

### 2. Healthchecks

```bash
wsl -d Ubuntu -e bash -c "docker ps --format 'table {{.Names}}\t{{.Status}}'"
```

**Esperado:**
- `frontend`: Up (healthy)
- `elasticsearch`: Up (healthy)

### 3. Acceso a Servicios

- **Frontend:** http://localhost:3000 → ✅ Debe cargar
- **Backend API:** http://localhost:8000/api → ✅ JSON response
- **Admin:** http://localhost:8000/admin → ✅ Login page
- **Elasticsearch:** http://localhost:9200 → ✅ Cluster info

---

## 🐛 Troubleshooting

### Error: "Bind for :::6379 failed: port is already allocated"

Este error significa que los puertos están ocupados por contenedores anteriores.

**Solución Rápida:**
```batch
FIX_PORTS_Y_FRONTEND.bat
```

Este script:
1. Detiene todos los contenedores correctamente
2. Libera todos los puertos (3000, 8000, 5432, 6379, 9200)
3. Verifica que estén libres
4. Reinicia servicios en orden

**Si aún falla, usa el Reset Completo:**
```batch
RESET_COMPLETO_WSL.bat
```

Este script:
1. Apaga WSL completamente (`wsl --shutdown`)
2. Libera TODOS los recursos
3. Reinicia Docker
4. Te indica qué script ejecutar después

**Verificar manualmente qué está usando los puertos:**
```bash
netstat -ano | findstr ":3000 :8000 :9200 :5432 :6379"
```

---

### Frontend sigue sin responder después de 2 minutos

**Ver logs en tiempo real:**
```bash
wsl -d Ubuntu -e bash -c "cd /mnt/d/bvs_framework && docker compose logs -f frontend"
```

**Errores comunes:**

#### Error: "Cannot connect to backend"
```bash
# Verificar que backend esté up
wsl -d Ubuntu -e bash -c "curl http://localhost:8000/api/"
```

Si backend no responde, revisar Elasticsearch:
```bash
wsl -d Ubuntu -e bash -c "curl http://localhost:9200/_cluster/health?pretty"
```

#### Error: "ENOSPC: System limit for file watchers"
```bash
# Aumentar límite de watchers en WSL
wsl -d Ubuntu -e bash -c "echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p"
```

#### Frontend en estado "Restarting"
Significa que está fallando el healthcheck:
```bash
# Ver logs detallados
wsl -d Ubuntu -e bash -c "docker inspect bvs_framework-frontend-1 --format='{{json .State.Health}}' | jq"
```

### Elasticsearch en loop de reinicio

**Aumentar memoria disponible:**

Edita [docker-compose.yml](docker-compose.yml:90):
```yaml
ES_JAVA_OPTS: -Xms768m -Xmx768m  # Cambiar de 512m a 768m
memory: 1.5G  # Cambiar de 1G a 1.5G
```

Luego ejecuta:
```bash
FIX_FRONTEND_DEFINITIVO.bat
```

---

## 📝 Notas Importantes

### Memoria Requerida

| Servicio | Memoria Reservada | Memoria Límite | Crítico |
|----------|------------------|----------------|---------|
| PostgreSQL | 128MB | 256MB | ❌ |
| Redis | 64MB | 128MB | ❌ |
| **Elasticsearch** | 512MB | 1GB | ✅ |
| Backend | 256MB | 512MB | ⚠️ |
| **Frontend** | 1GB | 2.5GB | ✅ |
| **TOTAL** | ~2GB | ~4.4GB | - |

**Mínimo recomendado:** 8GB RAM total en el sistema

### Tiempos de Inicio

Los servicios necesitan tiempo para estabilizarse:

1. PostgreSQL/Redis: ~5-10 segundos
2. **Elasticsearch: ~15-30 segundos** ⏱️
3. Backend: ~10-15 segundos
4. **Frontend: ~30-90 segundos** ⏱️

**No te alarmes si el frontend tarda hasta 2 minutos en responder la primera vez.**

### Orden de Inicio Importante

**NUNCA inicies frontend antes que el backend:**

❌ **Incorrecto:**
```bash
docker compose up -d  # Inicia todo a la vez
```

✅ **Correcto:**
```bash
docker compose up -d db redis           # Paso 1
sleep 10
docker compose up -d elasticsearch      # Paso 2
sleep 20
docker compose up -d backend            # Paso 3
sleep 10
docker compose up -d frontend           # Paso 4
```

Los scripts `FIX_FRONTEND_DEFINITIVO.bat` y `RESTART_ALL_CLEAN.bat` ya hacen esto automáticamente.

---

## 🎓 Cómo Prevenir Problemas Futuros

### 1. Siempre usa los scripts proporcionados
- `FIX_FRONTEND_DEFINITIVO.bat` → Para reinicios completos
- `RESTART_FRONTEND_SIMPLE.bat` → Para reinicios rápidos
- `RESTART_ALL_CLEAN.bat` → Para reinicio limpio de todo

### 2. Monitorea la memoria
```bash
# Ver uso de recursos
wsl -d Ubuntu -e docker stats
```

### 3. Mantén WSL actualizado
```bash
wsl --update
```

### 4. No uses `docker compose up -d` directamente
Siempre usa los scripts que inician servicios en orden.

---

## 🔄 Flujo de Trabajo Recomendado

### Inicio del Día
```batch
# En WSL primero:
wsl -d Ubuntu -e sudo service docker start

# Luego:
FIX_FRONTEND_DEFINITIVO.bat
```

### Cambios en Código Frontend
```batch
RESTART_FRONTEND_SIMPLE.bat
```

### Cambios en Backend
```bash
wsl -d Ubuntu -e bash -c "cd /mnt/d/bvs_framework && docker compose restart backend"
```

### Problemas Persistentes
```batch
FIX_FRONTEND_DEFINITIVO.bat
```

### Fin del Día (Liberar Recursos)
```bash
wsl -d Ubuntu -e bash -c "cd /mnt/d/bvs_framework && docker compose down"
```

---

## ✅ Resumen de la Solución

La solución definitiva incluye:

1. ✅ **Elasticsearch con memoria suficiente** (512MB → 1GB)
2. ✅ **Healthchecks en servicios críticos** (Elasticsearch, Frontend)
3. ✅ **Scripts automatizados** con orden correcto de inicio
4. ✅ **Tiempos de espera apropiados** entre servicios
5. ✅ **Curl instalado** en frontend para healthchecks
6. ✅ **Ulimits configurados** para Elasticsearch
7. ✅ **Verificación automática** del estado final

**Resultado esperado:** Frontend estable y funcionando en 2-3 minutos.

---

## 📞 Siguiente Paso

**Ejecuta ahora:**
```batch
FIX_FRONTEND_DEFINITIVO.bat
```

Y espera 2-3 minutos. El frontend debería estar funcionando en http://localhost:3000

Si después de 3 minutos sigue sin funcionar, comparte los logs:
```bash
wsl -d Ubuntu -e bash -c "cd /mnt/d/bvs_framework && docker compose logs frontend"
```
