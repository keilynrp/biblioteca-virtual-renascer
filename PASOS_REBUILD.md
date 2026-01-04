# 🔨 Pasos para Reconstruir el Backend Correctamente

## 🎯 Problema Actual

El archivo local está correcto con `http://elasticsearch:9200`, pero el contenedor Docker sigue usando la versión antigua del archivo. Necesitamos **forzar una reconstrucción sin caché**.

---

## 🚀 Solución: Reconstrucción Forzada

### Opción 1: Script Automático (RECOMENDADO)

Ejecuta en tu terminal WSL:

```bash
cd /mnt/d/bvs_framework
chmod +x forzar-rebuild-backend.sh
./forzar-rebuild-backend.sh
```

Este script:
1. ✅ Detiene el contenedor backend
2. ✅ Elimina el contenedor backend
3. ✅ Reconstruye la imagen **SIN CACHÉ** (esto asegura que use el archivo actualizado)
4. ✅ Inicia el backend
5. ✅ Verifica los logs
6. ✅ Prueba la conectividad HTTP

---

### Opción 2: Comandos Manuales

Si prefieres ejecutar paso a paso:

```bash
cd /mnt/d/bvs_framework

# 1. Detener el backend
sudo docker-compose stop backend

# 2. Eliminar el contenedor (no la imagen, solo el contenedor)
sudo docker-compose rm -f backend

# 3. Reconstruir SIN CACHÉ (esto es CRÍTICO)
sudo docker-compose build --no-cache backend

# 4. Iniciar el backend
sudo docker-compose up -d backend

# 5. Ver los logs en tiempo real
sudo docker-compose logs -f backend
```

---

## 🔍 Por Qué Es Necesario `--no-cache`

Docker usa caché de capas para acelerar builds. Sin embargo, cuando modificas archivos Python que ya se copiaron en una capa anterior, Docker puede usar la capa cacheada (con el archivo viejo).

**`--no-cache`** fuerza a Docker a:
- Ignorar todas las capas cacheadas
- Copiar los archivos actuales desde tu disco
- Reconstruir la imagen completamente

---

## ✅ Cómo Verificar que Funcionó

### 1. Los logs NO deben mostrar el error de Elasticsearch

**Antes (error):**
```
ValueError: URL must include a 'scheme', 'host', and 'port' component
```

**Después (éxito):**
```
INFO Watching for file changes with StatReloader
Django version X.X.X, using settings 'config.settings'
Starting development server at http://0.0.0.0:8000/
```

### 2. El backend debe responder HTTP

```bash
curl http://localhost:8000/api/
# Debe devolver una respuesta JSON, no error de conexión
```

### 3. Verificar el archivo DENTRO del contenedor

```bash
sudo docker-compose exec backend cat /app/apps/content/documents.py | grep -A 3 "create_connection"
```

Debe mostrar:
```python
connections.create_connection(
    hosts=['http://elasticsearch:9200'],
    timeout=20
)
```

---

## 🐛 Si el Problema Persiste

### Paso 1: Verificar que el volumen no esté sobrescribiendo el archivo

```bash
# Ver la configuración de volúmenes en docker-compose.yml
grep -A 5 "backend:" docker-compose.yml | grep volumes
```

Si ves `./backend:/app`, significa que el directorio completo está montado como volumen. En ese caso, los cambios deberían aplicarse automáticamente.

### Paso 2: Verificar dentro del contenedor

```bash
# Entrar al contenedor
sudo docker-compose exec backend bash

# Ver el contenido del archivo
cat /app/apps/content/documents.py | head -n 15

# Salir
exit
```

### Paso 3: Última opción - Reconstruir todo

Si nada funciona, reconstruir TODOS los servicios:

```bash
sudo docker-compose down -v
sudo docker-compose up -d --build --no-cache
```

⚠️ **ADVERTENCIA:** Esto eliminará todos los volúmenes (base de datos incluida)

---

## 📋 Checklist de Verificación

Antes de considerar que está resuelto, verifica:

- [ ] El archivo local tiene `http://elasticsearch:9200`
- [ ] El contenedor se reconstruyó sin caché
- [ ] Los logs no muestran el error de Elasticsearch
- [ ] El backend responde en http://localhost:8000
- [ ] Todos los servicios están UP: `sudo docker-compose ps`

---

## 💡 Consejo Importante

Como el `docker-compose.yml` tiene esta configuración:

```yaml
backend:
  volumes:
    - ./backend:/app
```

Los cambios en archivos Python deberían aplicarse **automáticamente** sin necesidad de rebuild, porque el directorio está montado como volumen.

Sin embargo, si estás viendo el error aún después de cambiar el archivo, puede ser que:
1. El proceso Django necesite reiniciarse (auto-reload debería hacerlo)
2. Hay un problema con la sincronización de archivos en WSL
3. El volumen está usando una versión cacheada

Por eso, la reconstrucción forzada sin caché es la mejor solución.

---

Por favor ejecuta el script `forzar-rebuild-backend.sh` y comparte el resultado.
