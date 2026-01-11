# Diagnóstico del Error Actual

## El Problema

El archivo `docker-compose.yml` **está correcto y actualizado para Docker Compose v2**.

El error que ves **NO es del archivo**, sino del **comando que usas para ejecutarlo**.

---

## ¿Qué está pasando?

### Tienes dos versiones de Docker Compose:

```
docker-compose  ← v1 (Python) - ROTO con Python 3.13
docker compose  ← v2 (nativo) - FUNCIONA
```

### El error ocurre cuando ejecutas:

```bash
docker-compose up
# Error: No module named 'docker-compose'
# Causa: docker-compose v1 no funciona con Python 3.13
```

### La solución es usar:

```bash
docker compose up
# ✓ Funciona correctamente
```

---

## Verificación Rápida

### 1. Verifica qué versiones tienes

```bash
# Versión 1 (la que NO funciona)
docker-compose version
# Si ves error de Python, esta versión está rota

# Versión 2 (la que SÍ funciona)
docker compose version
# Si muestra "Docker Compose version v2.x.x", esta funciona
```

### 2. Prueba usar v2

```bash
# Desde WSL, en el directorio del proyecto
cd /mnt/d/bvs_framework

# Usar Docker Compose v2
docker compose ps
docker compose up -d
docker compose logs -f
```

---

## Soluciones

### Solución 1: Instalar Docker Compose v2 (Recomendado)

```bash
# Ejecuta el script que instala v2 automáticamente
chmod +x INSTALAR_Y_OPTIMIZAR.sh
./INSTALAR_Y_OPTIMIZAR.sh
```

Este script:
- ✅ Detecta si tienes Docker Compose v2
- ✅ Si no, lo instala automáticamente
- ✅ Usa el comando correcto (`docker compose`)
- ✅ Aplica las optimizaciones

### Solución 2: Usar el Script Todo-en-Uno desde Windows

```batch
# Desde CMD/PowerShell en Windows
cd d:\bvs_framework
CONFIGURAR_TODO_16GB.bat
```

Este script:
- ✅ Configura WSL
- ✅ Instala Docker Compose v2
- ✅ Aplica optimizaciones
- ✅ Todo automático

### Solución 3: Usar Docker Compose v2 Manualmente

Si ya tienes v2 instalado, solo usa el comando correcto:

```bash
# Reemplaza todos tus comandos:

# Antes (v1 - NO funciona)
docker-compose up -d

# Ahora (v2 - SÍ funciona)
docker compose up -d
```

**Lista de cambios:**

| Antes (v1) | Ahora (v2) |
|------------|------------|
| `docker-compose up` | `docker compose up` |
| `docker-compose down` | `docker compose down` |
| `docker-compose ps` | `docker compose ps` |
| `docker-compose logs` | `docker compose logs` |
| `docker-compose build` | `docker compose build` |

**Nota:** El guion (`-`) se convierte en espacio.

---

## El Archivo docker-compose.yml Está Correcto

Tu archivo `docker-compose.yml` **ya está optimizado para 16GB** y **es compatible con v2**:

### ✅ Configuraciones aplicadas:

```yaml
Frontend:
  memory: 4G              # ✓ Optimizado
  NODE_OPTIONS: 4096MB    # ✓ Optimizado

Elasticsearch:
  memory: 2G              # ✓ Optimizado
  ES_JAVA_OPTS: 1g        # ✓ Optimizado

Backend:
  memory: 1G              # ✓ Correcto

PostgreSQL:
  memory: 512M            # ✓ Correcto

Redis:
  memory: 256M            # ✓ Correcto
```

### ✅ Sintaxis de v2:

```yaml
# ✓ No tiene "version:" (sintaxis moderna)
services:
  backend:
    # ✓ depends_on con condition (solo v2)
    depends_on:
      db:
        condition: service_healthy

    # ✓ deploy.resources (sintaxis v2)
    deploy:
      resources:
        limits:
          memory: 1G

    # ✓ healthcheck (compatible v2)
    healthcheck:
      test: ["CMD-SHELL", "curl -f http://localhost:8000/ || exit 1"]
```

**No necesitas modificar el archivo docker-compose.yml.**

---

## Comandos de Verificación

### Verificar Docker Compose v2

```bash
# ¿Está instalado?
docker compose version

# Salida esperada:
# Docker Compose version v2.24.0 (o superior)

# Si no funciona, necesitas instalarlo
```

### Verificar que el archivo es válido

```bash
# Validar sintaxis
docker compose config

# Si muestra la configuración completa sin errores, está OK
```

### Probar los servicios

```bash
# Ver servicios
docker compose ps

# Iniciar servicios
docker compose up -d

# Ver logs
docker compose logs -f

# Ver uso de recursos
docker stats
```

---

## Siguiente Paso

### Si NO tienes Docker Compose v2 instalado:

```bash
# Ejecuta este script que lo instala automáticamente
chmod +x INSTALAR_Y_OPTIMIZAR.sh
./INSTALAR_Y_OPTIMIZAR.sh
```

### Si SÍ tienes Docker Compose v2 instalado:

```bash
# Solo ejecuta con el comando correcto
docker compose down
docker compose up -d
docker compose ps
```

---

## Resumen

| Item | Estado |
|------|--------|
| docker-compose.yml | ✅ **Correcto y actualizado** |
| Sintaxis v2 | ✅ **Compatible** |
| Optimización 16GB | ✅ **Aplicada** |
| Docker Compose v2 | ⚠️ **Necesita instalarse o usar comando correcto** |

**El único problema es que necesitas usar `docker compose` (v2) en lugar de `docker-compose` (v1).**

---

## Ejecuta Ahora

### Opción A: Todo Automático (Recomendado)

```batch
# Desde Windows
cd d:\bvs_framework
CONFIGURAR_TODO_16GB.bat
```

### Opción B: Solo Instalar Docker Compose v2

```bash
# Desde WSL
cd /mnt/d/bvs_framework
chmod +x instalar-docker-compose-v2.sh
./instalar-docker-compose-v2.sh
```

### Opción C: Si ya tienes v2, úsalo

```bash
# Desde WSL
cd /mnt/d/bvs_framework
docker compose up -d
```

---

**¡El archivo docker-compose.yml está perfecto! Solo necesitas usar Docker Compose v2.** ✅
