# ⚠️ Solución: Error de docker-compose con Python 3.13

## Problema Detectado

Estás viendo este error:

```
sys.exit(load_entry_point('docker-compose==1.29.2', 'console_scripts', 'docker-compose')())
importlib.metadata.PackageNotFoundError: No package metadata was found for docker-compose
```

**Causa:** docker-compose v1.29.2 es incompatible con Python 3.13

---

## ✅ Solución Rápida (Recomendada)

### Opción 1: Usar el Script Wrapper

Ejecuta este script que detecta y usa la versión correcta automáticamente:

```bash
chmod +x INICIAR_OPTIMIZACION.sh
./INICIAR_OPTIMIZACION.sh
```

Este script:
1. Detecta si tienes Docker Compose v2
2. Si no, te da instrucciones de instalación
3. Ejecuta la optimización con la versión correcta

---

### Opción 2: Instalar Docker Compose v2

Docker Compose v2 es el futuro y ya no tiene este problema:

```bash
# Para Ubuntu/Debian/WSL
sudo apt-get update
sudo apt-get install docker-compose-plugin

# Verificar instalación
docker compose version
```

Luego ejecuta:

```bash
chmod +x aplicar-optimizacion-16gb.sh
./aplicar-optimizacion-16gb.sh
```

---

### Opción 3: Remover docker-compose v1 Roto

Si prefieres solo remover la versión problemática:

```bash
# Remover docker-compose v1
sudo apt-get remove docker-compose
sudo rm /usr/bin/docker-compose 2>/dev/null

# Verificar que se removió
which docker-compose  # No debería encontrar nada
```

Luego instala Docker Compose v2 (Opción 2)

---

## 🔍 Verificar qué Versión Tienes

```bash
# Verificar docker-compose v1
docker-compose version

# Verificar docker compose v2
docker compose version
```

---

## 🚀 Ejecutar la Optimización

Una vez solucionado el problema de docker-compose:

### Con Docker Compose v2 (Recomendado)

```bash
chmod +x aplicar-optimizacion-16gb.sh
./aplicar-optimizacion-16gb.sh
```

El script detecta automáticamente que debes usar `docker compose` (v2)

### Con Script Wrapper (Más Fácil)

```bash
chmod +x INICIAR_OPTIMIZACION.sh
./INICIAR_OPTIMIZACION.sh
```

---

## 📋 Tabla Comparativa

| Versión | Comando | Python | Estado |
|---------|---------|--------|--------|
| v1 (antiguo) | `docker-compose` | Requiere Python | ❌ Roto en Python 3.13 |
| v2 (nuevo) | `docker compose` | No requiere Python | ✅ Funciona siempre |

---

## 🎯 Para WSL/Ubuntu

Si estás en WSL, la mejor solución es instalar Docker Compose v2:

```bash
# Actualizar repositorios
sudo apt-get update

# Instalar plugin de Docker Compose v2
sudo apt-get install docker-compose-plugin

# Verificar
docker compose version
# Debería mostrar: Docker Compose version v2.x.x

# Ahora ejecutar optimización
chmod +x aplicar-optimizacion-16gb.sh
./aplicar-optimizacion-16gb.sh
```

---

## ⚡ Solución Alternativa: Usar Comandos Directamente

Si no quieres instalar nada, puedes ejecutar los comandos manualmente con `docker compose`:

```bash
# Detener contenedores
docker compose down

# Construir
docker compose build --no-cache

# Iniciar
docker compose up -d

# Ver logs
docker compose logs -f
```

---

## 🆘 Si Nada Funciona

Como última alternativa, ejecuta los pasos manualmente:

```bash
# 1. Detener todo
docker compose down 2>/dev/null || docker-compose down 2>/dev/null || echo "No hay contenedores corriendo"

# 2. Limpiar
docker image prune -f

# 3. Construir (esto puede tardar)
docker compose build --no-cache 2>/dev/null || docker-compose build --no-cache

# 4. Iniciar
docker compose up -d 2>/dev/null || docker-compose up -d

# 5. Ver estado
docker compose ps 2>/dev/null || docker-compose ps

# 6. Ver recursos
docker stats --no-stream
```

---

## 📚 Recursos Adicionales

- [Documentación Docker Compose v2](https://docs.docker.com/compose/)
- [Migración de v1 a v2](https://docs.docker.com/compose/migrate/)
- [FIX_DOCKER_COMPOSE.md](FIX_DOCKER_COMPOSE.md) - Documentación completa

---

## ✅ Checklist de Solución

- [ ] Verificar versión de Docker Compose: `docker compose version`
- [ ] Si v2 funciona, usar script: `./INICIAR_OPTIMIZACION.sh`
- [ ] Si v2 no existe, instalar: `sudo apt-get install docker-compose-plugin`
- [ ] Ejecutar optimización: `./aplicar-optimizacion-16gb.sh`
- [ ] Verificar servicios: `docker compose ps`

---

**El script `aplicar-optimizacion-16gb.sh` ya está diseñado para manejar este problema automáticamente. Solo necesitas asegurarte de tener Docker Compose v2 instalado.**

🚀 **Recomendación:** Usa `INICIAR_OPTIMIZACION.sh` - maneja todo automáticamente.
