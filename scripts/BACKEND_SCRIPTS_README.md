# Backend Optimization Scripts

Scripts súper optimizados para manejar el backend sin problemas.

## 🚀 Scripts Principales

### 1. `start_backend_optimized.sh` - Startup Optimizer

Script principal para iniciar el backend con manejo completo de errores y dependencias.

#### Características:
- ✅ Pre-flight checks (Docker, archivos, etc.)
- ✅ Limpieza automática de Docker
- ✅ Build con reintentos automáticos
- ✅ Inicialización de servicios en orden correcto
- ✅ Manejo de dependencias
- ✅ Migraciones automáticas
- ✅ Health checks completos
- ✅ Logs detallados
- ✅ Manejo de errores robusto

#### Uso:

```bash
# Inicio normal
./scripts/start_backend_optimized.sh

# Inicio rápido (sin rebuild)
./scripts/start_backend_optimized.sh --skip-build

# Inicio sin limpieza
./scripts/start_backend_optimized.sh --skip-cleanup

# Inicio completamente limpio (borra volúmenes)
./scripts/start_backend_optimized.sh --fresh

# Ver ayuda
./scripts/start_backend_optimized.sh --help
```

#### Flujo de Ejecución:

```
1. Pre-flight Checks
   ├─ Verificar Docker instalado
   ├─ Verificar Docker Compose
   ├─ Verificar Docker daemon corriendo
   ├─ Crear directorios necesarios
   └─ Verificar archivo .env

2. Docker Cleanup (opcional)
   ├─ Detener contenedores existentes
   ├─ Remover imágenes dangling
   └─ Limpiar volúmenes no usados

3. Build Backend
   ├─ Construir imagen con --no-cache
   ├─ Reintentos automáticos (3 intentos)
   └─ Logs detallados

4. Start Database Services
   ├─ Iniciar PostgreSQL
   ├─ Esperar health check (30s max)
   ├─ Iniciar Redis
   ├─ Esperar health check (20s max)
   ├─ Iniciar Meilisearch
   └─ Esperar health check (20s max)

5. Update Dependencies
   └─ Instalar/actualizar requirements.txt

6. Initialize Database
   ├─ Verificar si DB está vacía
   ├─ Ejecutar migraciones
   ├─ Crear cache tables
   ├─ Collectstatic
   └─ Verificar superuser

7. Health Checks
   ├─ Test conexión DB
   ├─ Django system checks
   └─ Test conexión cache

8. Start Backend
   ├─ Iniciar contenedor backend
   └─ Esperar respuesta HTTP (60s max)

9. Show Status
   └─ Mostrar URLs y comandos útiles
```

---

### 2. `fix_backend_issues.sh` - Issues Fixer

Herramienta interactiva para diagnosticar y resolver problemas comunes.

#### Características:
- 🔍 Diagnósticos completos
- 🔧 Fixes automáticos
- 📊 Análisis de logs
- 🧹 Limpieza de recursos
- ⚛️ Opción nuclear (reset completo)

#### Uso:

```bash
# Ejecutar menú interactivo
./scripts/fix_backend_issues.sh
```

#### Opciones del Menú:

**Diagnósticos:**
1. Full system check - Chequeo completo del sistema
2. Check port conflicts - Verificar conflictos de puertos
3. Check Docker resources - Verificar recursos de Docker
4. Check database connection - Verificar conexión a DB
5. Check migrations - Verificar estado de migraciones
6. Analyze logs - Analizar logs del backend

**Fixes:**
7. Fix dependency conflicts - Resolver conflictos de dependencias
8. Fix database issues - Resolver problemas de base de datos
9. Fix Redis issues - Resetear Redis
10. Fix Meilisearch issues - Reindexar Meilisearch
11. Fix migrations - Corregir migraciones
12. Collect static files - Recolectar archivos estáticos

**Avanzado:**
13. Restart all services - Reiniciar todos los servicios
14. Rebuild backend only - Reconstruir solo backend
15. NUCLEAR OPTION - Reset completo (borra todo)

---

## 🛠️ Casos de Uso Comunes

### Problema: Backend no arranca

```bash
# Opción 1: Inicio limpio
./scripts/start_backend_optimized.sh --fresh

# Opción 2: Diagnóstico + Fix
./scripts/fix_backend_issues.sh
# Seleccionar: 1 (Full system check)
# Luego aplicar fixes según los problemas encontrados
```

### Problema: Errores de dependencias

```bash
# Opción 1: Rebuild sin caché
./scripts/start_backend_optimized.sh --skip-cleanup

# Opción 2: Fix manual
./scripts/fix_backend_issues.sh
# Seleccionar: 7 (Fix dependency conflicts)
```

### Problema: Base de datos corrupta

```bash
./scripts/fix_backend_issues.sh
# Seleccionar: 8 (Fix database issues)
# O seleccionar: 15 (NUCLEAR OPTION) si está muy corrupta
```

### Problema: Puertos ocupados

```bash
./scripts/fix_backend_issues.sh
# Seleccionar: 2 (Check port conflicts)
# Confirmar para matar procesos
```

### Problema: Migraciones fallidas

```bash
./scripts/fix_backend_issues.sh
# Seleccionar: 11 (Fix migrations)
```

### Problema: Cache corrupto

```bash
./scripts/fix_backend_issues.sh
# Seleccionar: 9 (Fix Redis issues)
```

### Problema: Búsqueda no funciona

```bash
./scripts/fix_backend_issues.sh
# Seleccionar: 10 (Fix Meilisearch issues)
```

---

## 📋 Logs y Debugging

### Logs del Script

Los logs se guardan automáticamente en:
```
logs/backend_startup_YYYYMMDD_HHMMSS.log
```

### Ver Logs de Backend

```bash
# Logs en tiempo real
docker-compose logs -f backend

# Últimas 100 líneas
docker-compose logs backend --tail=100

# Logs de todos los servicios
docker-compose logs -f
```

### Logs Guardados

El script `fix_backend_issues.sh` guarda logs en:
```
backend_logs_YYYYMMDD_HHMMSS.log
```

---

## 🔧 Comandos Útiles Post-Inicio

### Django Management

```bash
# Shell de Django
docker-compose exec backend python manage.py shell

# Crear superuser
docker-compose exec backend python manage.py createsuperuser

# Ejecutar comando custom
docker-compose exec backend python manage.py <comando>

# Ver migraciones
docker-compose exec backend python manage.py showmigrations

# Hacer migraciones
docker-compose exec backend python manage.py makemigrations

# Aplicar migraciones
docker-compose exec backend python manage.py migrate
```

### Testing

```bash
# Ejecutar todos los tests
docker-compose exec backend pytest

# Tests con coverage
docker-compose exec backend pytest --cov

# Tests específicos
docker-compose exec backend pytest apps/content/tests/
```

### Database

```bash
# Acceder a psql
docker-compose exec db psql -U postgres -d biblioteca

# Backup manual
docker-compose exec db pg_dump -U postgres biblioteca > backup.sql

# Restore manual
docker-compose exec -T db psql -U postgres biblioteca < backup.sql

# Ver tamaño de DB
docker-compose exec db psql -U postgres -d biblioteca -c "SELECT pg_size_pretty(pg_database_size('biblioteca'));"
```

### Redis

```bash
# Redis CLI
docker-compose exec redis redis-cli

# Limpiar cache
docker-compose exec redis redis-cli FLUSHALL

# Ver keys
docker-compose exec redis redis-cli KEYS '*'

# Monitor Redis
docker-compose exec redis redis-cli MONITOR
```

### Meilisearch

```bash
# Health check
curl http://localhost:7700/health

# Ver índices
curl http://localhost:7700/indexes \
  -H "Authorization: Bearer your-master-key-change-this"

# Reindexar
docker-compose exec backend python manage.py index_books
```

---

## ⚠️ Troubleshooting

### Script no tiene permisos

```bash
# En Linux/Mac
chmod +x scripts/start_backend_optimized.sh
chmod +x scripts/fix_backend_issues.sh

# En Windows (Git Bash)
git update-index --chmod=+x scripts/start_backend_optimized.sh
git update-index --chmod=+x scripts/fix_backend_issues.sh
```

### Docker daemon no corre

```bash
# Windows: Abrir Docker Desktop
# Linux:
sudo systemctl start docker

# Mac:
open -a Docker
```

### Memoria insuficiente

Editar `docker-compose.yml` y reducir límites:

```yaml
deploy:
  resources:
    limits:
      memory: 512M  # Reducir según necesidad
```

### Disco lleno

```bash
# Limpiar Docker
docker system prune -af --volumes

# Ver uso de disco
docker system df
```

---

## 🎯 Best Practices

1. **Siempre usar el script optimizado** en lugar de `docker-compose up` manual
2. **Ejecutar con `--fresh`** cuando hay cambios mayores en modelos o dependencias
3. **Guardar logs** antes de pedir ayuda
4. **Usar fix_backend_issues.sh** como primer diagnóstico ante problemas
5. **No usar la opción nuclear** a menos que sea absolutamente necesario
6. **Mantener backups** de la base de datos antes de cambios mayores

---

## 📚 Referencias

- [Docker Compose Docs](https://docs.docker.com/compose/)
- [Django Docs](https://docs.djangoproject.com/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Redis Docs](https://redis.io/documentation)
- [Meilisearch Docs](https://www.meilisearch.com/docs)

---

## 📝 Changelog

### v1.0.0 - 2026-01-06
- ✨ Script inicial de optimización
- ✨ Script de diagnóstico y fixes
- 📚 Documentación completa
