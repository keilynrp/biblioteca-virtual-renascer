# Solución de Problemas de Timeout en Docker

## 🔴 Error Encontrado

```
ERROR: for frontend  UnixHTTPConnectionPool(host='localhost', port=None): Read timed out. (read timeout=60)
ERROR: An HTTP request took too long to complete.
```

## 🎯 Causa del Problema

Este error ocurre cuando Docker tarda más de 60 segundos en construir o iniciar un contenedor. Es común con:
- **Frontend de Next.js** (muchas dependencias npm)
- **Sistemas con poca memoria asignada a Docker**
- **Primera construcción de imágenes**
- **Conexiones lentas para descargar paquetes**

## ✅ Soluciones (En Orden de Efectividad)

### Solución 1: Script con Timeout Fix (RECOMENDADO)

Usa el script mejorado que maneja timeouts automáticamente:

```cmd
MIGRAR_DOCKER_TIMEOUT_FIX.bat
```

**Qué hace**:
- ✅ Establece timeout de 5 minutos (vs 60 segundos default)
- ✅ Construye servicios uno por uno
- ✅ Inicia servicios en orden de dependencia
- ✅ Espera tiempo adecuado entre cada servicio

### Solución 2: Aumentar Memoria de Docker Desktop

1. Abre **Docker Desktop**
2. Ve a **Settings** > **Resources** > **Advanced**
3. Aumenta la **Memory** a mínimo **4GB** (recomendado **6GB**)
4. Aumenta **CPU** a mínimo **2 cores** (recomendado **4 cores**)
5. Click **Apply & Restart**

Después ejecuta:
```cmd
MIGRAR_DOCKER_TIMEOUT_FIX.bat
```

### Solución 3: Limpiar Docker y Reintentar

Si ya intentaste lo anterior, limpia Docker primero:

```cmd
LIMPIAR_DOCKER.bat
```

Luego ejecuta la migración:
```cmd
MIGRAR_DOCKER_TIMEOUT_FIX.bat
```

### Solución 4: Inicio Incremental

Si sigues teniendo problemas, inicia los servicios uno por uno:

```cmd
INICIAR_SERVICIOS_INCREMENTAL.bat
```

Este script:
1. Inicia PostgreSQL
2. Espera 10 segundos
3. Inicia Redis
4. Espera 5 segundos
5. Inicia Elasticsearch
6. Espera 30 segundos
7. Inicia Backend
8. Espera 20 segundos
9. Inicia Frontend
10. Espera 15 segundos

### Solución 5: Construcción Manual Paso a Paso

Si todo lo anterior falla, hazlo manualmente:

```cmd
# Configurar timeouts
set COMPOSE_HTTP_TIMEOUT=300
set DOCKER_CLIENT_TIMEOUT=300

# Detener todo
docker compose down --timeout 120

# Construir solo backend
docker compose build --no-cache backend

# Construir solo frontend (lo más lento)
docker compose build --no-cache --progress=plain frontend

# Iniciar servicios de base
docker compose up -d db redis elasticsearch

# Esperar 30 segundos
timeout /t 30

# Iniciar backend
docker compose up -d backend

# Esperar 20 segundos
timeout /t 20

# Iniciar frontend
docker compose up -d frontend
```

## 🔧 Configuración Permanente de Timeouts

Crea un archivo `.env` en la raíz del proyecto con:

```env
COMPOSE_HTTP_TIMEOUT=300
DOCKER_CLIENT_TIMEOUT=300
```

O configúralo globalmente en Windows:

```cmd
# Como administrador en PowerShell
[System.Environment]::SetEnvironmentVariable('COMPOSE_HTTP_TIMEOUT', '300', 'User')
[System.Environment]::SetEnvironmentVariable('DOCKER_CLIENT_TIMEOUT', '300', 'User')
```

## 🚨 Si el Frontend Sigue Fallando

### Opción A: Construir Frontend Fuera de Docker

```cmd
# Ir a la carpeta frontend
cd frontend

# Instalar dependencias localmente (puede tomar tiempo)
npm install

# Volver a la raíz
cd ..

# Ahora construir con Docker (será más rápido)
docker compose build frontend
```

### Opción B: Usar Imagen Pre-construida Más Ligera

Edita `frontend/Dockerfile` y usa una base más ligera:

```dockerfile
FROM node:20-alpine AS base
# ... resto del Dockerfile
```

### Opción C: Desactivar Telemetría y Optimizar

Ya está en tu `docker-compose.yml`:
```yaml
environment:
  - NEXT_TELEMETRY_DISABLED=1  # ✅ Ya configurado
```

## 📊 Verificar Recursos de Docker

```cmd
# Ver uso de recursos
docker stats

# Ver espacio en disco
docker system df

# Ver qué está consumiendo memoria
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Size}}"
```

## 🔍 Diagnóstico de Problemas

### Ver logs en tiempo real durante la construcción:

```cmd
docker compose build --progress=plain frontend
```

### Ver qué proceso está colgado:

```cmd
docker compose ps
docker compose logs frontend
```

### Reiniciar Docker Desktop:

1. Haz click derecho en el icono de Docker en la bandeja
2. Selecciona **Restart**
3. Espera 1-2 minutos
4. Intenta de nuevo

## 📋 Checklist de Solución

Intenta en este orden:

- [ ] 1. Aumentar memoria de Docker Desktop a 4-6GB
- [ ] 2. Reiniciar Docker Desktop
- [ ] 3. Ejecutar `LIMPIAR_DOCKER.bat`
- [ ] 4. Ejecutar `MIGRAR_DOCKER_TIMEOUT_FIX.bat`
- [ ] 5. Si falla, ejecutar `INICIAR_SERVICIOS_INCREMENTAL.bat`
- [ ] 6. Si aún falla, construir manualmente paso a paso

## 🎯 Scripts Disponibles para Timeouts

| Script | Uso |
|--------|-----|
| [MIGRAR_DOCKER_TIMEOUT_FIX.bat](MIGRAR_DOCKER_TIMEOUT_FIX.bat) | **Migración con timeouts extendidos** |
| [LIMPIAR_DOCKER.bat](LIMPIAR_DOCKER.bat) | **Limpia recursos Docker antes de migrar** |
| [INICIAR_SERVICIOS_INCREMENTAL.bat](INICIAR_SERVICIOS_INCREMENTAL.bat) | **Inicia servicios uno por uno** |
| [MIGRAR_DOCKER.bat](MIGRAR_DOCKER.bat) | Migración normal (puede tener timeouts) |

## ⚡ Configuración Óptima de Docker Desktop

Para Windows con 8GB RAM total:
- **Memory**: 4GB
- **CPUs**: 2-4 cores
- **Swap**: 1GB
- **Disk image size**: 60GB

Para Windows con 16GB RAM total:
- **Memory**: 6-8GB
- **CPUs**: 4 cores
- **Swap**: 2GB
- **Disk image size**: 100GB

## 🔄 Si Nada Funciona

Reinstalación limpia:

```cmd
# 1. Detener todo
docker compose down -v

# 2. Eliminar todo de Docker
docker system prune -a --volumes -f

# 3. Reiniciar Docker Desktop

# 4. Reconstruir desde cero
MIGRAR_DOCKER_TIMEOUT_FIX.bat
```

## 📞 Soporte Adicional

Si después de todo esto sigues teniendo problemas:

1. Revisa los logs completos: `docker compose logs -f > logs.txt`
2. Verifica memoria disponible: `docker stats`
3. Verifica versión de Docker: `docker --version`
4. Comparte el error específico que ves

---

**Última actualización**: 2025-12-29
**Tiempo estimado de solución**: 10-15 minutos
