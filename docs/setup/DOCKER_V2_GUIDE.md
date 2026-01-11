

# 🐳 Guía Completa - Docker Compose V2

## 📦 Scripts Disponibles (Docker Compose V2)

Este proyecto incluye una suite completa de scripts para gestionar Docker Compose V2:

| Script | Descripción | Uso Principal |
|--------|-------------|---------------|
| **[docker.sh](docker.sh)** | 🎯 Script maestro - Punto de entrada único | `./docker.sh <comando>` |
| **[start_containers.sh](start_containers.sh)** | 🚀 Levantar servicios con opciones avanzadas | `./start_containers.sh [--rebuild\|--clean]` |
| **[docker_quick.sh](docker_quick.sh)** | ⚡ Comandos rápidos para operaciones comunes | `./docker_quick.sh <comando>` |
| **[docker_dev.sh](docker_dev.sh)** | 🛠️ Herramientas de desarrollo | `./docker_dev.sh <comando>` |

---

## 🚀 Inicio Rápido (3 pasos)

```bash
# 1. Levantar todos los servicios
./docker.sh start

# 2. Ejecutar migraciones
./docker.sh migrate

# 3. Crear superusuario
./docker.sh superuser
```

**URLs de acceso:**
- Frontend: http://localhost:3000
- Backend: http://localhost:8000/admin

---

## 🎯 Script Maestro: docker.sh

El script maestro es el punto de entrada recomendado para todas las operaciones:

### Comandos Principales

```bash
# Gestión de servicios
./docker.sh start              # Levantar todo
./docker.sh stop               # Detener todo
./docker.sh restart [servicio] # Reiniciar
./docker.sh rebuild [servicio] # Reconstruir

# Monitoreo
./docker.sh logs [servicio]    # Ver logs
./docker.sh status             # Ver estado
./docker.sh watch              # Modo desarrollo (logs en vivo)

# Django
./docker.sh migrate            # Migraciones
./docker.sh superuser          # Crear superusuario
./docker.sh test               # Ejecutar tests

# Base de datos
./docker.sh backup-db          # Crear backup
./docker.sh restore-db <file>  # Restaurar backup
./docker.sh reset-db           # Reiniciar DB

# Acceso
./docker.sh shell [servicio]   # Abrir shell
./docker.sh exec <srv> <cmd>   # Ejecutar comando

# Menú interactivo
./docker.sh menu               # Menú interactivo
```

---

## ⚡ Comandos Rápidos: docker_quick.sh

Para operaciones cotidianas:

```bash
# Servicios
./docker_quick.sh start        # Levantar
./docker_quick.sh stop         # Detener
./docker_quick.sh restart backend  # Reiniciar backend

# Logs
./docker_quick.sh logs backend     # Logs del backend
./docker_quick.sh logs frontend 100  # Últimas 100 líneas

# Django
./docker_quick.sh migrate          # Migraciones
./docker_quick.sh makemigrations   # Crear migraciones
./docker_quick.sh superuser        # Superusuario
./docker_quick.sh shell            # Django shell

# Mantenimiento
./docker_quick.sh fix-apt          # Fix apt_pkg
./docker_quick.sh clean            # Limpiar todo

# Ver todos los comandos
./docker_quick.sh help
```

---

## 🛠️ Desarrollo: docker_dev.sh

Herramientas para desarrollo:

```bash
# Desarrollo
./docker_dev.sh watch          # Logs en tiempo real
./docker_dev.sh install-deps   # Instalar dependencias
./docker_dev.sh check          # Verificar Django

# Base de datos
./docker_dev.sh backup-db      # Crear backup
./docker_dev.sh restore-db backup.sql  # Restaurar
./docker_dev.sh reset-db       # Reiniciar DB

# Fixtures
./docker_dev.sh fixtures-load data.json  # Cargar
./docker_dev.sh fixtures-dump content    # Exportar

# Limpieza
./docker_dev.sh clear-cache    # Limpiar caché
./docker_dev.sh fresh-install  # Instalación limpia

# Búsqueda
./docker_dev.sh index          # Reindexar Meilisearch

# Estadísticas
./docker_dev.sh stats          # Ver estadísticas del proyecto

# Ver todos los comandos
./docker_dev.sh help
```

---

## 🏗️ Inicio Avanzado: start_containers.sh

Script completo para levantar servicios con opciones:

```bash
# Uso normal
./start_containers.sh

# Reconstruir todo desde cero (sin caché)
./start_containers.sh --rebuild

# Solo backend y dependencias
./start_containers.sh --backend

# Limpiar volúmenes y empezar desde cero
./start_containers.sh --clean

# Combinaciones
./start_containers.sh --clean --rebuild
```

---

## 📖 Flujos de Trabajo Comunes

### Primera vez - Setup completo

```bash
# 1. Levantar servicios
./docker.sh start

# 2. Ejecutar migraciones
./docker.sh migrate

# 3. Crear superusuario
./docker.sh superuser

# 4. Cargar datos de prueba (opcional)
./docker_dev.sh fixtures-load initial_data.json

# 5. Acceder a la aplicación
# Frontend: http://localhost:3000
# Admin: http://localhost:8000/admin
```

### Desarrollo diario

```bash
# Levantar servicios
./docker.sh start

# Ver logs en tiempo real
./docker.sh watch

# Hacer cambios en el código...
# (los cambios se reflejan automáticamente)

# Ejecutar tests
./docker.sh test

# Crear migraciones si cambias modelos
./docker.sh makemigrations
./docker.sh migrate

# Detener al terminar
./docker.sh stop
```

### Resolver problemas

```bash
# Ver logs del backend
./docker_quick.sh logs backend

# Abrir shell en backend
./docker_quick.sh shell backend

# Verificar Django
./docker_dev.sh check

# Reiniciar servicio problemático
./docker_quick.sh restart backend

# Si todo falla, reconstruir
./docker.sh rebuild backend
```

### Backup y restauración

```bash
# Crear backup antes de cambios importantes
./docker.sh backup-db
# Archivo guardado en: ./backups/db_backup_YYYYMMDD_HHMMSS.sql

# Si algo sale mal, restaurar
./docker.sh restore-db ./backups/db_backup_20260108_123456.sql
```

### Reset completo

```bash
# Opción 1: Solo base de datos
./docker.sh reset-db

# Opción 2: Todo desde cero
./docker_dev.sh fresh-install
```

---

## 🎨 Características de los Scripts

### ✅ Colores y UX mejorada
- Mensajes con colores para mejor legibilidad
- Barras de progreso
- Confirmaciones para operaciones destructivas

### ✅ Validaciones automáticas
- Verifica que Docker Compose V2 esté instalado
- Detecta errores comunes
- Muestra ayuda contextual

### ✅ Logs informativos
- Muestra estado de cada paso
- Verifica el error de apt_pkg automáticamente
- Muestra URLs de acceso al terminar

### ✅ Manejo de errores
- Para ejecución si algo falla (`set -e`)
- Mensajes de error claros
- Sugerencias de solución

---

## 🔧 Comandos Docker Compose V2 Directos

Si prefieres usar Docker Compose directamente:

```bash
# Levantar servicios
docker compose up -d

# Detener servicios
docker compose down

# Ver logs
docker compose logs -f backend

# Ejecutar comando
docker compose exec backend python manage.py migrate

# Reconstruir
docker compose build backend

# Ver estado
docker compose ps

# Reiniciar
docker compose restart backend
```

---

## 📊 Monitoreo y Debugging

### Ver logs en tiempo real

```bash
# Todos los servicios
docker compose logs -f

# Solo backend
docker compose logs -f backend

# Solo frontend
docker compose logs -f frontend

# Últimas 100 líneas
docker compose logs --tail=100 backend
```

### Ver estado de recursos

```bash
# Estado de contenedores
./docker_quick.sh status

# Uso de CPU y memoria
docker stats

# Ver procesos
docker compose top
```

### Acceder a contenedores

```bash
# Shell en backend
./docker_quick.sh shell backend

# Shell en frontend
./docker_quick.sh shell frontend

# Ejecutar comando específico
./docker_quick.sh exec backend python manage.py check
./docker_quick.sh exec frontend npm list
```

---

## 🗃️ Gestión de Base de Datos

### Backups automáticos

El proyecto incluye un servicio de backup automático que corre cada día.

Backups manuales:

```bash
# Crear backup
./docker.sh backup-db
# Guarda en: ./backups/db_backup_YYYYMMDD_HHMMSS.sql

# Ver backups disponibles
ls -lh ./backups/

# Restaurar backup
./docker.sh restore-db ./backups/db_backup_20260108_123456.sql
```

### Operaciones de base de datos

```bash
# Reiniciar base de datos
./docker.sh reset-db

# Acceder a PostgreSQL
docker compose exec db psql -U postgres -d biblioteca

# Ver tamaño de la base de datos
docker compose exec db psql -U postgres -d biblioteca \
  -c "SELECT pg_size_pretty(pg_database_size('biblioteca'));"

# Ejecutar SQL desde archivo
docker compose exec -T db psql -U postgres -d biblioteca < query.sql
```

---

## 🧪 Testing

```bash
# Ejecutar todos los tests
./docker.sh test

# Ejecutar tests específicos
./docker_quick.sh test apps/content/tests/

# Ejecutar con coverage
docker compose exec backend pytest --cov

# Ejecutar tests en modo watch
docker compose exec backend pytest-watch
```

---

## 🔍 Búsqueda con Meilisearch

```bash
# Reindexar todos los libros
./docker_dev.sh index

# Acceder a Meilisearch
# http://localhost:7700

# Verificar índices
curl http://localhost:7700/indexes

# Buscar (ejemplo)
curl -X POST 'http://localhost:7700/indexes/books/search' \
  -H 'Content-Type: application/json' \
  --data-binary '{"q": "python"}'
```

---

## 🛠️ Solución de Problemas

### Error: "Docker Compose V2 no está instalado"

```bash
# Instalar Docker Desktop
# https://www.docker.com/products/docker-desktop/

# Verificar instalación
docker compose version
```

### Error de apt_pkg en el backend

```bash
# Ya está integrado en el Dockerfile
# Pero si reaparece:
./docker_quick.sh fix-apt
```

### Contenedor no inicia / está en estado "unhealthy"

```bash
# Ver logs
docker compose logs backend

# Verificar healthcheck
docker inspect --format='{{json .State.Health}}' bvs_framework-backend-1

# Reiniciar
docker compose restart backend

# Si persiste, reconstruir
docker compose build --no-cache backend
docker compose up -d backend
```

### Puerto ya en uso

```bash
# Ver qué está usando el puerto
netstat -ano | findstr :8000  # Windows
lsof -i :8000                 # Linux/Mac

# Detener servicios existentes
./docker.sh stop
```

### Problemas de permisos en volúmenes

```bash
# En Linux, cambiar ownership
sudo chown -R $USER:$USER ./backend
sudo chown -R $USER:$USER ./frontend

# Reiniciar servicios
./docker.sh restart
```

### Frontend no conecta con backend

```bash
# Verificar variable de entorno
docker compose exec frontend env | grep NEXT_PUBLIC_API_URL

# Debería ser: http://localhost:8000/api

# Si no está, edita docker-compose.yml y reinicia
./docker.sh restart frontend
```

---

## 📚 Recursos Adicionales

- [Docker Compose V2 Documentation](https://docs.docker.com/compose/)
- [Django Documentation](https://docs.djangoproject.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Meilisearch Documentation](https://docs.meilisearch.com/)

---

## 🆘 Ayuda Rápida

```bash
# Ver ayuda del script maestro
./docker.sh help

# Ver ayuda de comandos rápidos
./docker_quick.sh help

# Ver ayuda de comandos de desarrollo
./docker_dev.sh help

# Menú interactivo
./docker.sh menu
```

---

**Última actualización:** 2026-01-08
**Docker Compose:** V2 (sin guión)
**Sintaxis:** `docker compose` (no `docker-compose`)
