# Instrucciones de Migración Docker

## Cambios Aplicados

Se ha actualizado el archivo `docker-compose.yml` con las siguientes mejoras:

### 1. Límites de Recursos
- **Backend**: 1GB límite, 512MB reservado
- **Frontend**: 2GB límite, 1GB reservado
- **PostgreSQL**: 512MB límite, 256MB reservado
- **Redis**: 256MB límite, 128MB reservado
- **Elasticsearch**: 768MB límite, 512MB reservado (reducido de 1GB para mejor estabilidad)

### 2. Configuraciones Adicionales
- `restart: unless-stopped` - Los servicios se reinician automáticamente
- `extra_hosts` en frontend - Mejor conectividad con host
- Variables de entorno adicionales:
  - `NEXT_PUBLIC_API_URL=http://localhost:8000/api`
  - `NEXT_TELEMETRY_DISABLED=1`
- `bootstrap.memory_lock=false` en Elasticsearch para evitar problemas de memoria

### 3. Migraciones de Base de Datos Pendientes

Hay una migración nueva (0004) que incluye:
- Modelo `Review` - Sistema de reseñas
- Modelo `ReviewHelpful` - Votos útiles en reseñas
- Modelo `Favorite` - Sistema de favoritos
- Modelo `ReadingHistory` - Historial de lectura

## Cómo Ejecutar la Migración

### Opción 1: Script Automático (Recomendado)

Ejecuta el script desde PowerShell o CMD:

```cmd
MIGRAR_DOCKER.bat
```

Este script:
1. Detiene todos los servicios Docker
2. Reconstruye las imágenes sin caché
3. Inicia los servicios con la nueva configuración
4. Espera que los servicios estén listos
5. Aplica las migraciones de base de datos
6. Verifica el estado final

### Opción 2: Pasos Manuales

Si prefieres hacerlo manualmente:

```cmd
# 1. Detener servicios
docker compose down

# 2. Reconstruir imágenes
docker compose build --no-cache

# 3. Iniciar servicios
docker compose up -d

# 4. Esperar unos segundos y aplicar migraciones
timeout /t 30
docker compose exec backend python manage.py migrate

# 5. Verificar estado
docker compose ps
```

## Verificación Post-Migración

Después de la migración, verifica que todo funcione:

### 1. Estado de Servicios
```cmd
docker compose ps
```
Todos los servicios deben estar "Up" y "healthy"

### 2. Logs del Backend
```cmd
docker compose logs backend
```
No debe haber errores de "ModuleNotFoundError"

### 3. Migraciones Aplicadas
```cmd
docker compose exec backend python manage.py showmigrations content
```
Todas las migraciones deben tener [X]

### 4. Acceso a Servicios
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api/
- Admin Django: http://localhost:8000/admin/
- Elasticsearch: http://localhost:9200/

## Solución de Problemas

### Si Elasticsearch falla por memoria
```cmd
# Reducir aún más la memoria de ES
docker compose down
# Editar docker-compose.yml y cambiar ES_JAVA_OPTS a -Xms128m -Xmx256m
docker compose up -d
```

### Si el backend no puede conectarse a la DB
```cmd
# Verificar que PostgreSQL esté corriendo
docker compose ps db

# Ver logs de PostgreSQL
docker compose logs db

# Reiniciar solo la DB
docker compose restart db
```

### Si las migraciones fallan
```cmd
# Ver el error completo
docker compose exec backend python manage.py migrate --verbosity 3

# Si hay problemas, hacer rollback y reintentar
docker compose exec backend python manage.py migrate content zero
docker compose exec backend python manage.py migrate
```

### Ver logs en tiempo real
```cmd
# Todos los servicios
docker compose logs -f

# Solo un servicio específico
docker compose logs -f backend
docker compose logs -f frontend
```

## Comandos Útiles Post-Migración

```cmd
# Crear superusuario Django
docker compose exec backend python manage.py createsuperuser

# Reindexar Elasticsearch
docker compose exec backend python manage.py search_index --rebuild

# Ejecutar tests
docker compose exec backend pytest

# Acceder a la consola Django
docker compose exec backend python manage.py shell

# Acceder a PostgreSQL
docker compose exec db psql -U postgres -d biblioteca
```

## Notas Importantes

1. **Primera vez**: La reconstrucción puede tomar 5-10 minutos
2. **Datos preservados**: Los volúmenes de PostgreSQL y Elasticsearch se mantienen
3. **Desarrollo activo**: Los cambios en código se reflejan automáticamente (hot-reload)
4. **Memoria**: Asegúrate de tener al menos 4GB RAM disponibles para Docker

## Siguientes Pasos

Una vez completada la migración:

1. Crear un superusuario si no existe
2. Importar datos de prueba de OpenLibrary
3. Verificar que el frontend cargue correctamente
4. Probar las nuevas funcionalidades (reviews, favorites, reading history)
