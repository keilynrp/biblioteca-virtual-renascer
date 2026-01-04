# Solución Rápida al Error de Docker Compose

## ⚡ FIX INMEDIATO (1 minuto)

**Ejecuta esto AHORA desde Windows:**

```batch
FIX_DOCKER_COMPOSE_PYTHON313.bat
```

Esto elimina el `docker-compose` v1 roto y crea un wrapper para usar Docker Compose V2.

---

## El Error que Estás Viendo

```
docker-compose version
...
importlib.metadata.PackageNotFoundError: No package metadata was found for docker-compose
```

---

## ¿Qué Está Pasando?

**TL;DR:** El archivo `docker-compose.yml` está **100% correcto**. El problema es que estás usando `docker-compose` (v1 con Python) que está roto en Python 3.13.

### Tu Situación:

```
docker-compose ← v1 (Python) - ❌ ROTO
docker compose ← v2 (nativo) - ✅ NECESITAS ESTE
```

---

## ✅ El Archivo docker-compose.yml Está Correcto

He revisado tu `docker-compose.yml` y está **perfectamente configurado**:

- ✅ Sintaxis moderna (sin `version:`)
- ✅ Compatible con Docker Compose v2
- ✅ Optimizado para 16GB de RAM
- ✅ Frontend: 4GB
- ✅ Elasticsearch: 2GB
- ✅ Healthchecks configurados
- ✅ Depends_on con conditions

**No necesitas cambiar NADA en el archivo.**

---

## 🔧 Soluciones (Elige una)

### Solución 1: Todo Automático desde Windows (MÁS FÁCIL) ⭐

```batch
cd d:\bvs_framework
CONFIGURAR_TODO_16GB.bat
```

**Hace:**
- ✅ Configura WSL para 16GB
- ✅ Instala Docker Compose v2
- ✅ Aplica optimizaciones
- ✅ Verifica todo

**Tiempo:** 25-30 minutos

---

### Solución 2: Todo Automático desde WSL

```bash
cd /mnt/d/bvs_framework
chmod +x INSTALAR_Y_OPTIMIZAR.sh
./INSTALAR_Y_OPTIMIZAR.sh
```

**Hace:**
- ✅ Instala Docker Compose v2
- ✅ Aplica optimizaciones
- ✅ Reconstruye contenedores

**Tiempo:** 20-25 minutos

---

### Solución 3: Solo Instalar Docker Compose v2

```bash
cd /mnt/d/bvs_framework
chmod +x instalar-docker-compose-v2.sh
./instalar-docker-compose-v2.sh
```

Luego usa `docker compose` (sin guion):

```bash
docker compose up -d
docker compose ps
docker compose logs -f
```

**Tiempo:** 5 minutos

---

### Solución 4: Si Ya Tienes v2, Solo Úsalo

Verifica si tienes Docker Compose v2:

```bash
docker compose version
```

Si funciona, solo usa ese comando (sin guion):

```bash
# Reemplaza todos los comandos:
docker-compose up    → docker compose up
docker-compose down  → docker compose down
docker-compose ps    → docker compose ps
```

---

## 🔍 Diagnosticar tu Sistema

Para ver exactamente qué tienes instalado:

### Desde Windows:

```batch
DIAGNOSTICAR_DOCKER_COMPOSE.bat
```

### Desde WSL:

```bash
chmod +x diagnosticar-docker-compose.sh
./diagnosticar-docker-compose.sh
```

Este script te dirá:
- ✅ Si tienes Docker Compose v1 (y si funciona)
- ✅ Si tienes Docker Compose v2 (y si funciona)
- ✅ Qué comando debes usar
- ✅ Si el archivo docker-compose.yml es válido

---

## 📊 Comparación de Comandos

| Acción | docker-compose (v1) ❌ | docker compose (v2) ✅ |
|--------|----------------------|----------------------|
| Iniciar | `docker-compose up -d` | `docker compose up -d` |
| Detener | `docker-compose down` | `docker compose down` |
| Ver logs | `docker-compose logs -f` | `docker compose logs -f` |
| Ver estado | `docker-compose ps` | `docker compose ps` |
| Reconstruir | `docker-compose build` | `docker compose build` |

**La diferencia:** El guion (`-`) se convierte en espacio.

---

## ❓ FAQs

### ¿Por qué docker-compose v1 no funciona?

Python 3.13 cambió la forma de manejar metadatos de paquetes, y docker-compose v1.29.2 (que es una aplicación Python) no es compatible.

### ¿Puedo arreglar docker-compose v1?

Técnicamente sí, degradando Python a 3.12 o antes. Pero **NO lo recomiendo**. Es mejor migrar a Docker Compose v2 que es el futuro.

### ¿El archivo docker-compose.yml necesita cambios para v2?

**No.** Tu archivo ya está en formato moderno y es compatible con v2.

### ¿Puedo tener ambas versiones instaladas?

Sí, pero solo usarás v2. Los scripts detectan automáticamente cuál usar.

### ¿Qué versión es mejor?

**Docker Compose v2** es:
- ✅ Más rápido (escrito en Go, no Python)
- ✅ No depende de Python
- ✅ Es el futuro (v1 está deprecado)
- ✅ Mejor integración con Docker CLI

---

## 🎯 Recomendación Final

**Ejecuta esto AHORA:**

### Desde Windows (más fácil):

```batch
cd d:\bvs_framework
CONFIGURAR_TODO_16GB.bat
```

Este script hace **TODO** de una vez:
1. Configura WSL para 16GB
2. Instala Docker Compose v2
3. Aplica optimizaciones
4. Inicia servicios
5. Verifica que funcione

**Tiempo:** 25-30 minutos
**Esfuerzo:** Solo presionar Enter

---

### Desde WSL (si prefieres):

```bash
cd /mnt/d/bvs_framework
chmod +x INSTALAR_Y_OPTIMIZAR.sh
./INSTALAR_Y_OPTIMIZAR.sh
```

---

## 📚 Archivos Relacionados

- [DIAGNOSTICO_ERROR.md](DIAGNOSTICO_ERROR.md) - Diagnóstico detallado
- [SOLUCION_ERROR_DOCKER_COMPOSE.md](SOLUCION_ERROR_DOCKER_COMPOSE.md) - Guía completa
- [LEEME_PRIMERO.md](LEEME_PRIMERO.md) - Inicio rápido
- [CONFIGURAR_WSL_16GB.md](CONFIGURAR_WSL_16GB.md) - Configuración WSL

---

## ✅ Checklist

- [ ] Diagnosticar: `./diagnosticar-docker-compose.sh`
- [ ] Ver qué versión necesitas instalar
- [ ] Ejecutar script de instalación (elige Solución 1, 2 o 3)
- [ ] Verificar: `docker compose version` (debe funcionar)
- [ ] Usar: `docker compose up -d`
- [ ] Verificar: `docker compose ps`
- [ ] Ver logs: `docker compose logs -f`

---

## 🆘 Si Sigues con Problemas

1. **Ejecuta el diagnóstico:**
   ```bash
   ./diagnosticar-docker-compose.sh
   ```

2. **Lee el resultado** y sigue las recomendaciones

3. **Si nada funciona,** ejecuta el TODO-EN-UNO:
   ```batch
   CONFIGURAR_TODO_16GB.bat
   ```

---

**Resumen:** El archivo está bien. Solo necesitas Docker Compose v2. Ejecuta uno de los scripts de instalación. ✅
