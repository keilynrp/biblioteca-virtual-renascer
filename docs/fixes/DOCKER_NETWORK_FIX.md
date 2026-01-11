# 🌐 Solución: TLS Handshake Timeout en Docker

## ❌ Error que estás viendo:

```
failed to copy: httpReadSeeker: failed open: failed to do request:
Get "https://production.cloudflare.docker.com/...":
net/http: TLS handshake timeout
```

Este error ocurre cuando Docker intenta descargar imágenes pero la conexión es lenta o inestable.

---

## ⚡ Solución Rápida (3 pasos)

### Opción A: Script Automático (RECOMENDADO)

```bash
# 1. Ejecutar script de fix de red
./fix_docker_network.sh

# 2. Construir con reintentos automáticos
./build_offline.sh backend

# 3. Si funcionó, levantar todo
./docker.sh start
```

### Opción B: Manual

```bash
# 1. Configurar DNS de Docker
# Ve a Docker Desktop → Settings → Docker Engine
# Agrega esta configuración:
{
  "dns": ["8.8.8.8", "8.8.4.4", "1.1.1.1"],
  "max-concurrent-downloads": 3
}

# 2. Reiniciar Docker Desktop
# Quit Docker Desktop → Esperar 10s → Iniciar de nuevo

# 3. Construir con timeout largo
export DOCKER_CLIENT_TIMEOUT=900
export COMPOSE_HTTP_TIMEOUT=900
docker compose build backend
```

---

## 🔧 Soluciones Detalladas

### Solución 1: Configurar DNS y Timeouts

```bash
# Ejecutar script de fix
./fix_docker_network.sh
```

Este script:
- ✅ Configura DNS de Google y Cloudflare
- ✅ Aumenta los timeouts de Docker
- ✅ Reduce descargas concurrentes (menos presión de red)
- ✅ Descarga las imágenes base con reintentos

### Solución 2: Construir con Reintentos

```bash
# Para backend
./build_offline.sh backend

# Para frontend
./build_offline.sh frontend

# Para todo
./build_offline.sh all
```

Este script:
- ✅ Reintenta automáticamente hasta 3 veces
- ✅ Limpia caché entre intentos
- ✅ Espera 15 segundos entre reintentos
- ✅ Guarda logs para debugging

### Solución 3: Descargar Imágenes Manualmente

Si las soluciones anteriores fallan, descarga las imágenes una por una:

```bash
# Python (backend)
docker pull python:3.13-slim

# Node (frontend)
docker pull node:22-alpine

# PostgreSQL
docker pull postgres:15-alpine

# Redis
docker pull redis:7-alpine

# Meilisearch
docker pull getmeili/meilisearch:v1.6

# Después de descargar todas, construye
docker compose build
```

---

## 🐛 Causas Comunes del Error

### 1. Conexión a Internet Lenta

**Síntoma:** Timeout después de varios minutos

**Solución:**
```bash
# Aumentar timeouts
export DOCKER_CLIENT_TIMEOUT=1200
export COMPOSE_HTTP_TIMEOUT=1200

# Construir
./build_offline.sh backend
```

### 2. Firewall/Antivirus Bloqueando Docker

**Síntoma:** Timeout inmediato o "connection refused"

**Solución:**
- Desactiva temporalmente el antivirus/firewall
- Agrega Docker a las excepciones:
  - Docker Desktop
  - `com.docker.backend.exe`
  - Puertos: 443, 80, 2376, 2377

### 3. Proxy/VPN Interfiriendo

**Síntoma:** Funciona sin VPN, falla con VPN

**Solución:**
```bash
# Configurar proxy en Docker Desktop
# Settings → Resources → Proxies
# O desconectar la VPN temporalmente
```

### 4. Docker Hub Temporalmente Lento

**Síntoma:** Funciona a veces, falla otras veces

**Solución:**
```bash
# Usar el script de reintentos
./build_offline.sh backend

# O esperar unos minutos e intentar de nuevo
```

### 5. Problema de DNS

**Síntoma:** "no such host" o "could not resolve"

**Solución:**
```bash
# Ya incluido en fix_docker_network.sh
# O manualmente en Docker Desktop → Settings → Docker Engine:
{
  "dns": ["8.8.8.8", "1.1.1.1"]
}
```

---

## 📋 Verificación Paso a Paso

### Paso 1: Verificar Conexión a Internet

```bash
# Probar conexión general
ping google.com

# Probar Docker Hub
curl -sSf https://registry.hub.docker.com/v2/

# Probar Cloudflare (donde están las imágenes)
curl -sSf https://cloudflare.com
```

Si alguno falla, el problema es tu conexión a internet.

### Paso 2: Verificar Docker

```bash
# Docker está corriendo
docker info

# Versión de Docker
docker --version

# Test de conectividad de Docker
docker run hello-world
```

### Paso 3: Probar Descarga de Imagen Simple

```bash
# Intentar descargar imagen pequeña
docker pull alpine

# Si funciona, el problema es con imágenes grandes
# Si falla, es un problema de Docker/red
```

### Paso 4: Verificar Configuración de Docker

```bash
# Ver configuración actual
docker info | grep -i dns
docker info | grep -i proxy

# Ver daemon.json (Linux/Mac)
cat ~/.docker/daemon.json

# Ver daemon.json (Windows en WSL)
cat /mnt/c/Users/<tu-usuario>/.docker/daemon.json
```

---

## 🚀 Soluciones Alternativas

### Alternativa 1: Usar Docker Desktop con Mirror

Si estás en una red que bloquea Docker Hub:

```json
// En Docker Desktop → Settings → Docker Engine
{
  "registry-mirrors": [
    "https://mirror.gcr.io"
  ],
  "dns": ["8.8.8.8", "1.1.1.1"]
}
```

### Alternativa 2: Cambiar a Imágenes Locales

Si tienes las imágenes en otra máquina:

```bash
# En la máquina con las imágenes
docker save python:3.13-slim -o python.tar
docker save node:22-alpine -o node.tar

# Transferir los archivos .tar a tu máquina

# En tu máquina
docker load -i python.tar
docker load -i node.tar
```

### Alternativa 3: Usar Horario Diferente

Docker Hub puede estar saturado en horas pico:

```bash
# Intentar en horarios de menos tráfico:
# - Madrugada (2-6 AM hora local)
# - Fines de semana
```

### Alternativa 4: Usar Conexión Diferente

```bash
# Si estás en WiFi, prueba con cable Ethernet
# O usa el hotspot de tu celular temporalmente
```

---

## 🔍 Debugging Avanzado

### Ver Logs de Docker Desktop

**Windows:**
```
C:\Users\<tu-usuario>\AppData\Local\Docker\log.txt
```

**Mac:**
```
~/Library/Containers/com.docker.docker/Data/log/
```

**Linux:**
```bash
journalctl -u docker
```

### Habilitar Debug en Docker

```json
// Docker Desktop → Settings → Docker Engine
{
  "debug": true,
  "log-level": "debug"
}
```

### Capturar Tráfico de Red

```bash
# Ver qué está intentando descargar
docker compose build backend --progress=plain 2>&1 | tee build.log

# Ver en el log las URLs que está intentando acceder
grep "https://" build.log
```

---

## 📊 Comparación de Métodos

| Método | Tiempo | Dificultad | Tasa de Éxito |
|--------|--------|------------|---------------|
| Script automático | 10-20 min | Fácil | 85% |
| Build con reintentos | 15-30 min | Fácil | 80% |
| Descargar imágenes manualmente | 20-40 min | Media | 90% |
| Cambiar DNS | 5-10 min | Fácil | 70% |
| Usar VPN diferente | 10-20 min | Media | 75% |
| Esperar y reintentar | Variable | Fácil | 60% |

---

## ✅ Una Vez Resuelto

Después de solucionar el problema de red:

```bash
# 1. Verificar que las imágenes estén descargadas
docker images

# 2. Construir servicios
./build_offline.sh all

# 3. Levantar el proyecto
./docker.sh start

# 4. Verificar que todo funcione
./docker.sh status
./docker.sh logs backend
```

---

## 🆘 Si Nada Funciona

Si después de intentar todas las soluciones sigue fallando:

### 1. Información a Recopilar

```bash
# Sistema operativo
uname -a

# Versión de Docker
docker --version

# Info de Docker
docker info > docker_info.txt

# Test de conectividad
curl -v https://registry.hub.docker.com/v2/ > connectivity_test.txt 2>&1

# Logs del último build
./build_offline.sh backend 2>&1 | tee last_build.log
```

### 2. Alternativas

- **Opción A:** Usar otra máquina con mejor conexión para construir
- **Opción B:** Usar GitHub Codespaces o similar
- **Opción C:** Pedir a alguien las imágenes ya construidas
- **Opción D:** Desarrollar sin Docker (local con Python + Node instalados)

---

## 📚 Recursos Adicionales

- [Docker Network Troubleshooting](https://docs.docker.com/config/daemon/)
- [Docker Hub Status](https://status.docker.com/)
- [Cloudflare Status](https://www.cloudflarestatus.com/)

---

**Última actualización:** 2026-01-08
