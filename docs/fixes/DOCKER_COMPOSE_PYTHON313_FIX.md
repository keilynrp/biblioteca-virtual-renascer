# Fix: Docker Compose + Python 3.13 Compatibility

## El Problema

```
importlib.metadata.PackageNotFoundError: No package metadata was found for docker-compose
```

### Causa
- WSL tiene Python 3.13 instalado
- `docker-compose` v1.29.2 (versión vieja) está escrito en Python
- Python 3.13 cambió el sistema de metadatos de paquetes
- `docker-compose` v1 **NO es compatible** con Python 3.13

### La Solución
Usar **Docker Compose V2** que:
- Está escrito en Go (no depende de Python)
- Es más rápido
- Es la versión oficial y moderna
- Ya está instalado (tienes v5.0.0)

---

## 🚀 Fix Rápido (1 minuto)

### Opción 1: Ejecutar Script Automático (Windows)

```batch
FIX_DOCKER_COMPOSE_PYTHON313.bat
```

**Qué hace:**
1. Verifica que tienes Docker Compose V2
2. Elimina el `docker-compose` v1 roto
3. Crea un wrapper que redirige `docker-compose` → `docker compose`
4. Verifica que funcione

### Opción 2: Manual (WSL)

```bash
# 1. Eliminar docker-compose v1
sudo rm -f /usr/bin/docker-compose /usr/local/bin/docker-compose

# 2. Crear wrapper
echo '#!/bin/bash
exec docker compose "$@"' | sudo tee /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 3. Verificar
docker-compose version
```

---

## Después del Fix

Ahora puedes usar **ambos** comandos:

```bash
# Estos son equivalentes:
docker-compose up -d    # Funciona (usa V2 internamente)
docker compose up -d     # Funciona (V2 directamente)
```

Todos tus scripts `.bat` y `.sh` funcionarán automáticamente.

---

## Verificación

```bash
# En WSL
docker compose version
# Debe mostrar: Docker Compose version v5.0.0

docker-compose version
# También debe funcionar después del fix
```

---

## Próximos Pasos

Una vez aplicado el fix, puedes continuar con:

1. **Iniciar servicios:**
   ```batch
   QUICK_START.bat
   ```

2. **Verificar estado:**
   ```batch
   CHECK_ALL_CONTAINERS.bat
   ```

3. **Ver logs:**
   ```batch
   wsl docker compose logs -f
   ```

---

## ¿Por Qué Este Fix?

### Alternativas Descartadas:
- ❌ Degradar Python 3.13 → 3.12 (complica el sistema)
- ❌ Reinstalar docker-compose v1 con pip (sigue siendo incompatible)
- ❌ Usar virtualenv para docker-compose (innecesario)

### Por Qué Este Fix Es Mejor:
- ✅ Usa la versión moderna y oficial
- ✅ No requiere cambiar Python
- ✅ Más rápido y eficiente
- ✅ Compatible con todos tus archivos `.yml`
- ✅ No requiere cambiar scripts existentes

---

## Referencias

- [SOLUCION_RAPIDA_ERROR.md](SOLUCION_RAPIDA_ERROR.md) - Guía completa
- [Docker Compose V2 Docs](https://docs.docker.com/compose/cli-command/)
- [Migration Guide](https://docs.docker.com/compose/migrate/)
