# 🚀 Guía Rápida - Levantar Contenedores Después del Fix

## ⚡ Inicio Rápido (3 pasos)

```bash
# 1. Aplicar el fix al Dockerfile (ya está aplicado)
# El Dockerfile del backend ya tiene el fix de apt_pkg integrado

# 2. Levantar los contenedores
./start_containers.sh

# 3. Verificar que todo funcione
docker-compose ps
```

---

## 📋 Scripts Disponibles

### 1. **start_containers.sh** - Levantar servicios completos

```bash
# Uso básico (reconstruye backend y levanta todo)
./start_containers.sh

# Reconstruir todo desde cero (sin caché)
./start_containers.sh --rebuild

# Solo reconstruir y levantar backend
./start_containers.sh --backend

# Limpiar volúmenes y empezar desde cero
./start_containers.sh --clean
```

### 2. **docker_quick_commands.sh** - Comandos rápidos

```bash
# Levantar servicios
./docker_quick_commands.sh start

# Ver logs en tiempo real
./docker_quick_commands.sh logs backend
./docker_quick_commands.sh logs frontend

# Abrir shell en un contenedor
./docker_quick_commands.sh shell backend

# Reiniciar un servicio
./docker_quick_commands.sh restart backend

# Ejecutar migraciones
./docker_quick_commands.sh migrate

# Crear superusuario
./docker_quick_commands.sh superuser

# Ver estado de contenedores
./docker_quick_commands.sh status

# Aplicar fix de apt_pkg (si el error reaparece)
./docker_quick_commands.sh fix-apt

# Ver todos los comandos disponibles
./docker_quick_commands.sh
```

---

## 🐳 Comandos Docker Compose Directos

### Levantar servicios

```bash
# Levantar todos los servicios
docker-compose up -d

# Levantar solo backend y dependencias
docker-compose up -d db redis meilisearch backend

# Levantar con logs visibles
docker-compose up
```

### Reconstruir imágenes

```bash
# Reconstruir backend (con el fix de apt_pkg)
docker-compose build backend

# Reconstruir sin caché
docker-compose build --no-cache backend

# Reconstruir todo
docker-compose build --no-cache
```

### Ver logs

```bash
# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs del backend
docker-compose logs -f backend

# Ver últimas 50 líneas del backend
docker-compose logs --tail=50 backend
```

### Ejecutar comandos en contenedores

```bash
# Abrir shell en el backend
docker-compose exec backend bash

# Ejecutar migraciones
docker-compose exec backend python manage.py migrate

# Crear migraciones
docker-compose exec backend python manage.py makemigrations

# Crear superusuario
docker-compose exec backend python manage.py createsuperuser

# Ejecutar tests
docker-compose exec backend pytest

# Shell de Django
docker-compose exec backend python manage.py shell
```

### Reiniciar servicios

```bash
# Reiniciar backend
docker-compose restart backend

# Reiniciar frontend
docker-compose restart frontend

# Reiniciar todo
docker-compose restart
```

### Detener servicios

```bash
# Detener todos los servicios
docker-compose down

# Detener y eliminar volúmenes (⚠️ borra datos)
docker-compose down -v

# Detener un servicio específico
docker-compose stop backend
```

---

## 🔧 Solución de Problemas

### Error de apt_pkg persiste en el contenedor

Si después de reconstruir aún ves el error, aplica el fix dentro del contenedor:

```bash
# Opción 1: Usar el script de comandos rápidos
./docker_quick_commands.sh fix-apt

# Opción 2: Manualmente
docker-compose exec backend bash
bash fix_apt_error.sh
exit
```

### Backend no inicia o muestra errores

```bash
# Ver logs detallados
docker-compose logs backend

# Reconstruir sin caché
docker-compose build --no-cache backend
docker-compose up -d backend

# Verificar Django
docker-compose exec backend python manage.py check
```

### Frontend no conecta con backend

```bash
# Verificar que backend esté corriendo
docker-compose ps

# Verificar logs del frontend
docker-compose logs frontend

# Verificar variables de entorno
docker-compose exec frontend env | grep NEXT_PUBLIC_API_URL
```

### Base de datos no está lista

```bash
# Verificar estado de PostgreSQL
docker-compose logs db

# Ejecutar migraciones
docker-compose exec backend python manage.py migrate

# Reiniciar base de datos
docker-compose restart db
```

### Contenedores consumen mucha memoria

```bash
# Ver uso de recursos
docker stats

# Reiniciar contenedores
docker-compose restart

# Limpiar caché de Docker
docker system prune -f
```

---

## 📊 Verificación del Sistema

### Verificar que todo funcione correctamente

```bash
# 1. Ver estado de contenedores
docker-compose ps

# 2. Ver logs sin errores
docker-compose logs --tail=20 backend
docker-compose logs --tail=20 frontend

# 3. Verificar Django
docker-compose exec backend python manage.py check

# 4. Verificar conexión a base de datos
docker-compose exec backend python manage.py dbshell

# 5. Probar endpoints
curl http://localhost:8000/admin/
curl http://localhost:3000
```

---

## 🌐 URLs de Acceso

Una vez que los contenedores estén corriendo:

| Servicio | URL | Descripción |
|----------|-----|-------------|
| **Frontend** | http://localhost:3000 | Aplicación Next.js |
| **Backend** | http://localhost:8000 | API Django REST |
| **Admin Django** | http://localhost:8000/admin | Panel de administración |
| **PostgreSQL** | localhost:5432 | Base de datos |
| **Redis** | localhost:6379 | Caché y Celery |
| **Meilisearch** | http://localhost:7700 | Motor de búsqueda |

---

## 🎯 Flujo de Trabajo Típico

```bash
# 1. Levantar servicios por primera vez
./start_containers.sh

# 2. Ejecutar migraciones
./docker_quick_commands.sh migrate

# 3. Crear superusuario
./docker_quick_commands.sh superuser

# 4. Ver logs para verificar
./docker_quick_commands.sh logs backend

# 5. Acceder a la aplicación
# Frontend: http://localhost:3000
# Admin: http://localhost:8000/admin

# 6. Durante desarrollo, ver logs en tiempo real
./docker_quick_commands.sh logs backend

# 7. Al terminar, detener servicios
./docker_quick_commands.sh stop
```

---

## 📝 Notas Importantes

1. **El fix de apt_pkg ya está integrado** en el [backend/Dockerfile](backend/Dockerfile)
2. **Los volúmenes persisten los datos** - no se pierden al detener contenedores
3. **Usa `--clean` solo si quieres empezar desde cero** (borra la base de datos)
4. **Los logs son tu amigo** - siempre revisa `docker-compose logs` si algo falla
5. **Hot reload funciona** - los cambios en código se reflejan automáticamente

---

## 🆘 Ayuda Rápida

```bash
# Ver todos los comandos disponibles
./docker_quick_commands.sh

# Ver opciones de start_containers
./start_containers.sh --help

# Ver ayuda de docker-compose
docker-compose --help
```

---

**Última actualización:** 2026-01-08
