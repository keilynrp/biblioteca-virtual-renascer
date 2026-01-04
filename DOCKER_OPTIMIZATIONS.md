# Optimizaciones de Docker Aplicadas

## Resumen de Cambios

Se han aplicado optimizaciones significativas a los contenedores para mejorar el rendimiento, la estabilidad y la seguridad del sistema.

## 📊 Asignación de Recursos Optimizada

### Backend (Django)
- **Memoria**: 512M → 1G (límite) / 256M → 512M (reserva)
- **Servidor**: Cambiado de `runserver` a **Gunicorn** con configuración optimizada
  - 2 workers + 4 threads = Manejo de 8 peticiones concurrentes
  - Max requests: 1000 con jitter de 50 (previene memory leaks)
  - Timeout: 60 segundos
- **Healthcheck**: Agregado monitoreo de salud cada 30s
- **Dependencias mejoradas**: Espera a que DB, Redis y Elasticsearch estén saludables

### Frontend (Next.js)
- **Memoria**: 2.5G → 3G (límite) / 1G → 1.5G (reserva)
- **NODE_OPTIONS**: 2048MB → 3072MB (max-old-space-size)
- **Polling deshabilitado**: WATCHPACK_POLLING=false y CHOKIDAR_USEPOLLING=false
  - Reduce significativamente el uso de CPU
  - Mejor rendimiento en sistemas de archivos rápidos
- **Cache persistente**: Volumen dedicado para `.next/cache`
- **Dependencias optimizadas**: npm ci con flags de optimización

### PostgreSQL
- **Memoria**: 256M → 512M (límite) / 128M → 256M (reserva)
- **Configuración optimizada**:
  ```
  shared_buffers=128MB (duplicado)
  effective_cache_size=384MB (triplicado)
  max_connections=100 (duplicado)
  work_mem=4MB
  maintenance_work_mem=64MB
  random_page_cost=1.1 (optimizado para SSD)
  effective_io_concurrency=200
  wal_buffers=16MB
  checkpoint_completion_target=0.9
  max_wal_size=1GB
  ```
- **Shared memory**: 128MB para operaciones de memoria compartida
- **Healthcheck**: Verificación cada 10s

### Redis
- **Memoria**: 128M → 256M (límite) / 64M → 128M (reserva)
- **MaxMemory**: 96MB → 192MB (duplicado)
- **Persistencia configurada**:
  - AOF (Append Only File) habilitado
  - Snapshot cada 60s si hay 1000+ cambios
  - appendfsync everysec (balance rendimiento/durabilidad)
- **Configuración de red**:
  - tcp-backlog: 511
  - timeout: 300s
  - tcp-keepalive: 60s
  - maxclients: 10000
- **Volumen persistente**: Datos preservados en `redis_data`

### Elasticsearch
- **Memoria**: 1G → 1.5G (límite) / 512M → 768M (reserva)
- **JVM Heap**: 512m → 768m (Xms y Xmx iguales previene resize)
- **Configuración de caché optimizada**:
  ```
  indices.memory.index_buffer_size=15%
  indices.queries.cache.size=10%
  indices.fielddata.cache.size=20%
  ```
- **Thread pools aumentados**:
  - write queue: 1000
  - search queue: 1000
- **Content size**: 50MB → 100MB
- **Recovery**: 100MB/s para reindexación más rápida
- **Healthcheck mejorado**: Espera a estado yellow antes de considerarse saludable

## 🔒 Mejoras de Seguridad

### Backend Dockerfile
- Usuario no-root `django` creado y utilizado
- Permisos apropiados en archivos de aplicación
- Variables de entorno consolidadas
- Instalación de dependencias optimizada

### Frontend Dockerfile
- Cache de npm limpiado después de instalación
- Variables de entorno para optimización
- Healthcheck integrado en el Dockerfile
- Permisos apropiados en directorio .next

## 🚀 Mejoras de Rendimiento

### 1. Healthchecks Completos
Todos los servicios tienen healthchecks que:
- Verifican disponibilidad cada 10-30s
- Previenen tráfico a servicios no saludables
- Permiten dependencias condicionales

### 2. Dependencias Inteligentes
- Backend espera a DB, Redis y ES saludables
- Frontend espera a Backend saludable
- Previene errores de conexión al inicio

### 3. Volúmenes Persistentes
- `postgres_data`: Base de datos persistente
- `elasticsearch_data`: Índices persistentes
- `redis_data`: Cache persistente
- `frontend_cache`: Build cache de Next.js

### 4. Red Optimizada
- Subnet dedicada: 172.25.0.0/16
- Bridge network para comunicación eficiente
- DNS interno de Docker para resolución de nombres

### 5. Política de Reinicio
- `restart: unless-stopped` en todos los servicios
- Recuperación automática de fallos
- No reinicia si se detiene manualmente

## 📈 Uso Total de Memoria

| Servicio | Mínimo | Máximo | Diferencia |
|----------|--------|--------|------------|
| Backend | 512M | 1G | +512M |
| Frontend | 1.5G | 3G | +1G |
| PostgreSQL | 256M | 512M | +256M |
| Redis | 128M | 256M | +128M |
| Elasticsearch | 768M | 1.5G | +512M |
| **TOTAL** | **3.16GB** | **6.27GB** | **+2.4GB** |

## 🛠️ Archivos Optimizados

1. **docker-compose.yml**: Configuración principal actualizada
2. **backend/Dockerfile**: Build optimizado con gunicorn y usuario no-root
3. **frontend/Dockerfile**: Build optimizado con cache y healthcheck
4. **backend/.dockerignore**: Excluye archivos innecesarios del build

## 📝 Comandos Útiles

### ⚠️ Nota sobre Docker Compose
Los comandos a continuación usan `docker compose` (V2). Si tienes Docker Compose V1, usa `docker-compose` en su lugar.
Los scripts automatizados detectan la versión correcta automáticamente.

Si tienes problemas, consulta [FIX_DOCKER_COMPOSE.md](FIX_DOCKER_COMPOSE.md).

### Iniciar servicios optimizados
```bash
# Docker Compose V2 (recomendado)
docker compose down
docker compose up --build -d

# O con Docker Compose V1
docker-compose down
docker-compose up --build -d
```

### Ver uso de recursos en tiempo real
```bash
docker stats
```

### Ver logs de un servicio específico
```bash
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f elasticsearch
```

### Verificar salud de servicios
```bash
docker compose ps
```

### Reiniciar un servicio específico
```bash
docker compose restart backend
docker compose restart frontend
```

### Limpiar caché de build
```bash
docker builder prune -a
```

## ⚙️ Configuraciones Adicionales Recomendadas

### 1. Para desarrollo local
Si trabajas en desarrollo, puedes cambiar el comando del backend en docker-compose.yml:
```yaml
command: python manage.py runserver 0.0.0.0:8000
```

### 2. Para producción
Considera agregar un servidor web como Nginx:
```yaml
nginx:
  image: nginx:alpine
  ports:
    - "80:80"
    - "443:443"
  volumes:
    - ./nginx.conf:/etc/nginx/nginx.conf
    - ./backend/staticfiles:/staticfiles
  depends_on:
    - backend
    - frontend
```

### 3. Para monitoreo
Considera agregar Prometheus + Grafana para métricas:
```yaml
prometheus:
  image: prom/prometheus
  volumes:
    - ./prometheus.yml:/etc/prometheus/prometheus.yml
  ports:
    - "9090:9090"

grafana:
  image: grafana/grafana
  ports:
    - "3001:3000"
  environment:
    - GF_SECURITY_ADMIN_PASSWORD=admin
```

## 🔧 Troubleshooting

### Si el sistema usa demasiada memoria
Usa la configuración `docker-compose.optimized.yml` que tiene límites más bajos.

### Si Elasticsearch no inicia
- Verifica vm.max_map_count en WSL2: `sysctl -w vm.max_map_count=262144`
- Reduce ES_JAVA_OPTS a `-Xms512m -Xmx512m`

### Si el frontend es lento
- Verifica que WATCHPACK_POLLING esté en false
- Asegúrate de que el volumen frontend_cache esté montado
- Aumenta NODE_OPTIONS si tienes memoria disponible

### Si PostgreSQL es lento
- Ejecuta VACUUM y ANALYZE periódicamente
- Considera aumentar shared_buffers si tienes más RAM
- Revisa slow query logs

## 📊 Benchmarks Esperados

Con estas optimizaciones deberías ver:
- **Tiempo de inicio**: 60-90 segundos (con healthchecks)
- **Respuesta API**: < 100ms para endpoints simples
- **Búsqueda Elasticsearch**: < 500ms para queries complejas
- **Renderizado Frontend**: < 2s para páginas complejas
- **Uso CPU en reposo**: < 10% total
- **Uso memoria en reposo**: ~4-5GB

## 🎯 Próximos Pasos

1. **Monitorear rendimiento** con `docker stats` durante una semana
2. **Ajustar recursos** según patrones de uso reales
3. **Implementar caching** en Django (Redis cache backend)
4. **Optimizar queries** de base de datos con Django Debug Toolbar
5. **Configurar CDN** para assets estáticos en producción
6. **Implementar rate limiting** en API endpoints
7. **Configurar backup automático** de volúmenes

## 📚 Referencias

- [Gunicorn Deployment](https://docs.gunicorn.org/en/stable/deploy.html)
- [PostgreSQL Tuning](https://wiki.postgresql.org/wiki/Tuning_Your_PostgreSQL_Server)
- [Elasticsearch Production Settings](https://www.elastic.co/guide/en/elasticsearch/reference/current/system-config.html)
- [Redis Persistence](https://redis.io/topics/persistence)
- [Next.js Performance](https://nextjs.org/docs/advanced-features/measuring-performance)
