# Solución: Backend Killed (Exit Code 137)

## 🔴 Problema Identificado

```
backend_1 exited with code 137
```

**Exit Code 137 = 128 + 9 (SIGKILL)**

Esto significa que el contenedor fue **terminado forzosamente** por el sistema operativo, casi siempre debido a **falta de memoria RAM** (OOM - Out of Memory).

---

## 📊 Análisis de Logs

Los logs muestran que el backend funcionaba correctamente:
- ✅ Respuestas 200 OK a todas las peticiones
- ✅ CORS funcionando
- ✅ API respondiendo correctamente
- ❌ Súbitamente terminado con código 137

**Diagnóstico:** Docker Desktop se quedó sin memoria y mató el proceso backend.

---

## 🎯 Solución Rápida (Recomendada)

### Paso 1: Ejecutar el Script de Corrección

```bash
FIX_BACKEND_KILLED.bat
```

Este script:
1. Detiene todos los servicios
2. Libera memoria del sistema
3. Inicia servicios en orden optimizado
4. Aplica límites de memoria
5. Verifica que todo funcione

### Paso 2: Aumentar Memoria de Docker Desktop

**Configuración Mínima Recomendada:**
- **Memoria:** 6 GB (mínimo 4 GB)
- **CPU:** 4 cores (mínimo 2)
- **Swap:** 2 GB
- **Disk:** 60 GB

**Cómo cambiar en Docker Desktop:**

1. Abre **Docker Desktop**
2. Click en el ícono de engranaje ⚙️ (Settings)
3. Ve a **Resources** → **Advanced**
4. Ajusta los valores:
   ```
   Memory: 6 GB
   CPUs: 4
   Swap: 2 GB
   ```
5. Click en **Apply & Restart**

---

## 🔧 Configuración Optimizada

### Opción A: Usar docker-compose.optimized.yml

Este archivo ya incluye límites de memoria para cada servicio:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 1G      # Máximo 1GB
        reservations:
          memory: 512M    # Mínimo 512MB
    restart: unless-stopped

  frontend:
    deploy:
      resources:
        limits:
          memory: 2G
        reservations:
          memory: 1G
    restart: unless-stopped

  elasticsearch:
    environment:
      - "ES_JAVA_OPTS=-Xms256m -Xmx512m"  # Reducido
    deploy:
      resources:
        limits:
          memory: 768M
        reservations:
          memory: 512M
    restart: unless-stopped

  db:
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M
    restart: unless-stopped

  redis:
    deploy:
      resources:
        limits:
          memory: 256M
        reservations:
          memory: 128M
    restart: unless-stopped
```

**Para usar:**
```bash
# Opción 1: Reemplazar el archivo actual
copy docker-compose.optimized.yml docker-compose.yml

# Opción 2: Usar directamente
docker compose -f docker-compose.optimized.yml up -d
```

### Opción B: Usar Perfiles (Servicios Opcionales)

Si no necesitas Elasticsearch (búsqueda avanzada), puedes desactivarlo:

```bash
# Sin Elasticsearch
docker compose up -d db redis backend frontend

# Iniciar Elasticsearch solo cuando lo necesites
docker compose up -d elasticsearch
```

---

## 📊 Distribución de Memoria Recomendada

| Servicio | Mínimo | Recomendado | Máximo |
|----------|---------|-------------|--------|
| Frontend | 1 GB | 2 GB | 3 GB |
| Backend | 512 MB | 1 GB | 2 GB |
| Elasticsearch | 512 MB | 768 MB | 1 GB |
| PostgreSQL | 256 MB | 512 MB | 1 GB |
| Redis | 128 MB | 256 MB | 512 MB |
| **TOTAL** | **2.4 GB** | **4.5 GB** | **7.5 GB** |

**Sistema Operativo + Docker Desktop:** ~1.5 GB

**TOTAL REQUERIDO EN EL SISTEMA:** **6 GB** (mínimo 4 GB)

---

## 🚀 Comandos para Monitoreo

### Ver uso de recursos en tiempo real
```bash
# Windows
docker stats

# Ver solo nombres y uso
docker stats --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"
```

### Verificar límites aplicados
```bash
docker inspect backend | findstr -i memory
docker inspect elasticsearch | findstr -i memory
```

### Verificar logs del backend
```bash
# Ver últimas 50 líneas
docker compose logs --tail=50 backend

# Seguir en tiempo real
docker compose logs -f backend

# Buscar errores
docker compose logs backend | findstr -i "error killed memory"
```

---

## 🔍 Diagnóstico Avanzado

### Verificar si es problema de memoria

1. **Abrir Docker Desktop**
2. Click en el contenedor **backend**
3. Ver el tab **Stats**
4. Si **Memory Usage** está cerca del 100%, es problema de memoria

### Verificar eventos del sistema

```bash
# Windows Event Viewer
eventvwr.msc

# Buscar en:
# Windows Logs > System
# Filtrar por: Docker, OOM, Killed
```

### Verificar logs de Docker

```bash
# Ver logs del daemon de Docker
docker info

# Ver eventos
docker events --since 30m
```

---

## 🛠️ Soluciones Alternativas

### 1. Reducir Consumo de Elasticsearch

Edita `.env` o `docker-compose.yml`:

```yaml
elasticsearch:
  environment:
    - "ES_JAVA_OPTS=-Xms128m -Xmx256m"  # Muy reducido
```

**Advertencia:** Esto puede hacer que la búsqueda sea más lenta.

### 2. Usar SQLite en lugar de PostgreSQL (Solo Desarrollo)

Edita `.env`:
```env
USE_SQLITE=True
```

Luego reinicia:
```bash
docker compose restart backend
```

### 3. Desactivar Servicios Opcionales

```bash
# Solo servicios esenciales
docker compose up -d db backend frontend

# Sin Elasticsearch ni Redis
docker compose up -d db backend frontend
```

### 4. Usar Docker en WSL2 (Windows)

WSL2 tiene mejor gestión de memoria que Hyper-V:

1. Abre PowerShell como Administrador
2. Ejecuta:
   ```powershell
   wsl --install
   wsl --set-default-version 2
   ```
3. En Docker Desktop: Settings → General → Use WSL2 based engine
4. Restart Docker Desktop

---

## 📝 Checklist de Verificación

Después de aplicar las soluciones:

### Configuración
- [ ] Docker Desktop tiene al menos 4 GB de RAM asignados
- [ ] Archivo `docker-compose.optimized.yml` copiado o usado
- [ ] Límites de memoria aplicados a todos los servicios
- [ ] `restart: unless-stopped` configurado en servicios críticos

### Servicios
- [ ] Todos los contenedores están corriendo: `docker compose ps`
- [ ] Backend responde: `curl http://localhost:8000/api/`
- [ ] Frontend carga: http://localhost:3000
- [ ] Sin errores en logs: `docker compose logs backend`

### Monitoreo
- [ ] `docker stats` muestra uso de memoria < 80% en todos los servicios
- [ ] Backend no se reinicia constantemente
- [ ] Sin mensajes "OOM" en logs

---

## 🎓 Prevención Futura

### Monitoreo Automático

Crea un script de monitoreo:

```batch
@echo off
:loop
cls
echo ========================================
echo Monitoreo de Docker - %date% %time%
echo ========================================
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}"
echo.
echo Presiona Ctrl+C para detener
timeout /t 5 /nobreak > nul
goto loop
```

Guarda como `MONITOR_DOCKER.bat` y ejecútalo en una ventana separada.

### Alertas de Memoria

Si el backend usa > 80% de memoria:
1. Reduce `ES_JAVA_OPTS` en Elasticsearch
2. Aumenta memoria de Docker Desktop
3. Considera usar un servidor externo para Elasticsearch

---

## 🆘 Solución de Emergencia

Si nada funciona y necesitas que el sistema funcione **ahora**:

```bash
# Detener todo
docker compose down

# Eliminar Elasticsearch temporalmente
docker compose up -d db redis backend frontend

# Desactivar búsqueda avanzada en el código
# La aplicación seguirá funcionando sin Elasticsearch
```

**Nota:** Sin Elasticsearch, la búsqueda usará filtros simples de Django en lugar de búsqueda de texto completo.

---

## 📞 Próximos Pasos

1. **Ejecuta** `FIX_BACKEND_KILLED.bat`
2. **Aumenta** memoria de Docker Desktop a 6 GB
3. **Monitorea** con `docker stats` durante 10 minutos
4. **Verifica** que el backend no se detenga

Si el problema persiste después de estos pasos:
- Revisa el uso de RAM del sistema (Task Manager)
- Cierra aplicaciones que consuman mucha memoria
- Considera actualizar Docker Desktop a la última versión

---

**Fecha:** 2025-12-28
**Problema:** Backend killed por falta de memoria (Exit 137)
**Solución:** Aumentar RAM de Docker + Límites optimizados
**Estado:** 🔧 Script de corrección creado
