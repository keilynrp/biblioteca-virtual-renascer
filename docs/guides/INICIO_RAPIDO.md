# 🚀 Inicio Rápido - Optimización 16GB

## ⚡ La Forma MÁS FÁCIL (Todo desde Windows)

### Paso 1: Configurar WSL y Docker (Un Solo Comando)

```batch
CONFIGURAR_TODO_16GB.bat
```

**Esto hace TODO automáticamente desde Windows:**
- ✅ Configura WSL para usar 10GB de tus 16GB
- ✅ Reinicia WSL para aplicar cambios
- ✅ Instala Docker Compose v2 en WSL (si no lo tienes)
- ✅ Soluciona el error de apt_pkg (lo ignora)
- ✅ Aplica todas las optimizaciones de 16GB
- ✅ Reconstruye contenedores
- ✅ Verifica que todo funcione

**Tiempo:** 25-30 minutos

---

## 🐧 Alternativa: Desde Linux/WSL (Dos Pasos)

### Paso 1: Configurar WSL (desde Windows)

```powershell
# Opción A: PowerShell
.\CONFIGURAR_WSL_16GB.ps1

# Opción B: CMD
CONFIGURAR_WSL_16GB.bat
```

### Paso 2: Instalar Docker (desde WSL)

```bash
chmod +x INSTALAR_Y_OPTIMIZAR.sh
./INSTALAR_Y_OPTIMIZAR.sh
```

**Tiempo:** 25-30 minutos (5 min WSL + 20 min Docker)

---

## 📋 Alternativas Paso a Paso

### Opción A: Si ya tienes Docker Compose v2

```bash
chmod +x aplicar-optimizacion-16gb.sh
./aplicar-optimizacion-16gb.sh
```

### Opción B: Si necesitas instalar Docker Compose v2 primero

```bash
# 1. Instalar Docker Compose v2
chmod +x instalar-docker-compose-v2.sh
./instalar-docker-compose-v2.sh

# 2. Aplicar optimizaciones
chmod +x aplicar-optimizacion-16gb.sh
./aplicar-optimizacion-16gb.sh
```

### Opción C: Con el wrapper inteligente

```bash
chmod +x INICIAR_OPTIMIZACION.sh
./INICIAR_OPTIMIZACION.sh
```

---

## 🔧 Si Ves Errores

### Error: "apt_pkg" o "cnf-update-db"

**Solución:** Ignóralo, no afecta la instalación.

O ejecuta:
```bash
chmod +x fix-apt-pkg.sh
./fix-apt-pkg.sh
```

### Error: "docker-compose" con Python

**Solución:** Ya está solucionado en los scripts.

O lee:
```bash
cat SOLUCION_ERROR_DOCKER_COMPOSE.md
```

### Error: Backend unhealthy

**Solución:** El backend está configurado para esperar 60s.

O lee:
```bash
cat FIX_BACKEND_UNHEALTHY.md
```

---

## ✅ Verificación Post-Instalación

```bash
# Ver estado
docker compose ps

# Ver recursos
docker stats

# Ver logs
docker compose logs -f
```

---

## 📚 Scripts Disponibles

| Script | Propósito | Cuándo Usar |
|--------|-----------|-------------|
| `INSTALAR_Y_OPTIMIZAR.sh` | TODO-EN-UNO | ⭐ Siempre (más fácil) |
| `aplicar-optimizacion-16gb.sh` | Solo optimización | Si ya tienes Docker Compose v2 |
| `instalar-docker-compose-v2.sh` | Solo instalación | Si solo quieres instalar |
| `INICIAR_OPTIMIZACION.sh` | Wrapper inteligente | Alternativa al TODO-EN-UNO |
| `fix-apt-pkg.sh` | Solucionar apt_pkg | Si el error te molesta |

---

## 🎯 Recomendación

### Si estás en Windows (Recomendado):

**Ejecuta esto ahora desde CMD:**

```batch
cd d:\bvs_framework
CONFIGURAR_TODO_16GB.bat
```

Es el script MÁS completo. Hace todo desde Windows sin necesidad de entrar a WSL.

### Si estás en WSL/Linux:

Primero configura WSL desde Windows, luego ejecuta desde WSL:

```bash
chmod +x INSTALAR_Y_OPTIMIZAR.sh
./INSTALAR_Y_OPTIMIZAR.sh
```

---

## 📊 Qué Obtendrás

Después de ejecutar:

- ✅ Frontend: 4GB (antes 3GB) +33%
- ✅ Elasticsearch: 2GB (antes 1.5GB) +33%
- ✅ Backend: 1GB (optimizado)
- ✅ PostgreSQL: 512MB (optimizado)
- ✅ Redis: 256MB (optimizado)

**Total:** 7.8GB / 16GB (49% de uso)
**Margen:** 8GB libres para el sistema

---

## 🆘 Ayuda

Si necesitas ayuda, lee:

1. **[INSTRUCCIONES_OPTIMIZACION_16GB.md](INSTRUCCIONES_OPTIMIZACION_16GB.md)** - Guía completa
2. **[SOLUCION_ERROR_DOCKER_COMPOSE.md](SOLUCION_ERROR_DOCKER_COMPOSE.md)** - Errores de docker-compose
3. **[FIX_BACKEND_UNHEALTHY.md](FIX_BACKEND_UNHEALTHY.md)** - Errores de backend
4. **[OPTIMIZACION_16GB_APLICADA.md](OPTIMIZACION_16GB_APLICADA.md)** - Documentación técnica

---

**¡Comienza ahora!** 🚀

### Desde Windows (Más Fácil):

```batch
cd d:\bvs_framework
CONFIGURAR_TODO_16GB.bat
```

### Desde WSL (Dos Pasos):

```powershell
# 1. En PowerShell/CMD (Windows)
CONFIGURAR_WSL_16GB.bat

# 2. En WSL (Linux)
chmod +x INSTALAR_Y_OPTIMIZAR.sh
./INSTALAR_Y_OPTIMIZAR.sh
```
