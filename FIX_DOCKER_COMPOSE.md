# Solución al Error de docker-compose

## Problema Detectado

El error que estás viendo indica un problema de compatibilidad entre `docker-compose` v1 y Python 3.13:

```
importlib.metadata.PackageNotFoundError: No package metadata was found for docker-compose
```

## Soluciones

### Opción 1: Usar Docker Compose V2 (Recomendado)

Docker Compose V2 viene integrado con Docker Desktop y se ejecuta como un plugin de Docker:

```bash
# En lugar de:
docker-compose up

# Usa:
docker compose up
```

**Los scripts ya han sido actualizados para detectar automáticamente la versión correcta.**

### Opción 2: Instalar Docker Compose V2 Manualmente

Si no tienes Docker Compose V2, instálalo:

#### En Linux/WSL:
```bash
# Descargar la última versión
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Dar permisos de ejecución
sudo chmod +x /usr/local/bin/docker-compose

# Verificar instalación
docker-compose --version
```

#### En Windows con Docker Desktop:
Docker Compose V2 ya está incluido. Solo usa `docker compose` en lugar de `docker-compose`.

### Opción 3: Crear un Alias (Temporal)

Si prefieres seguir usando `docker-compose`:

```bash
# En Linux/WSL (agrega a ~/.bashrc o ~/.zshrc)
alias docker-compose='docker compose'

# Recargar configuración
source ~/.bashrc
```

## Comandos Actualizados

Todos los comandos han sido actualizados para funcionar con ambas versiones:

### Aplicar Optimizaciones

**Linux/Mac/WSL:**
```bash
chmod +x apply-docker-optimizations.sh
./apply-docker-optimizations.sh
```

**Windows:**
```cmd
APPLY_DOCKER_OPTIMIZATIONS.bat
```

### Comandos Manuales con Docker Compose V2

```bash
# Detener servicios
docker compose down

# Construir imágenes
docker compose build --no-cache

# Iniciar servicios
docker compose up -d

# Ver logs
docker compose logs -f

# Ver estado
docker compose ps

# Reiniciar un servicio
docker compose restart backend
```

## Verificar Versión de Docker Compose

```bash
# Docker Compose V1 (antiguo)
docker-compose --version
# Salida: docker-compose version 1.29.2

# Docker Compose V2 (nuevo)
docker compose version
# Salida: Docker Compose version v2.x.x
```

## Scripts Actualizados

Los siguientes scripts ahora detectan automáticamente la versión correcta:

1. ✅ `apply-docker-optimizations.sh`
2. ✅ `APPLY_DOCKER_OPTIMIZATIONS.bat`

Ambos intentarán usar:
1. Primero `docker-compose` (V1)
2. Si falla, usan `docker compose` (V2)
3. Si ambos fallan, muestran un error

## Aplicar las Optimizaciones Ahora

```bash
# Opción 1: Usar el script actualizado
./apply-docker-optimizations.sh

# Opción 2: Manualmente con Docker Compose V2
docker compose down
docker compose build --no-cache
docker compose up -d
docker stats --no-stream
```

## Notas Importantes

- **Docker Compose V2 es el futuro**: V1 está deprecado desde 2021
- **Mayor rendimiento**: V2 está escrito en Go y es más rápido
- **Mejor integración**: V2 es un plugin nativo de Docker
- **Sintaxis idéntica**: Los comandos son prácticamente iguales

## Siguiente Paso

Ejecuta nuevamente el script de optimización:

```bash
./apply-docker-optimizations.sh
```

El script ahora debería detectar y usar la versión correcta de Docker Compose automáticamente.
