# 📚 Documentación BVS Framework

> **Sistema de Biblioteca Virtual de Saberes**
> Documentación técnica y estratégica del proyecto

---

## 🗂️ Índice de Documentación

### 📋 Planificación Estratégica

- **[BACKLOG_ESTRATEGICO.md](../BACKLOG_ESTRATEGICO.md)**
  - Backlog completo de funcionalidades
  - Organizado por fases (0-6)
  - Prioridades y estimaciones
  - KPIs y métricas de éxito
  - ADRs (Architecture Decision Records)

- **[ROADMAP_INFRAESTRUCTURA.md](../ROADMAP_INFRAESTRUCTURA.md)**
  - Evolución de infraestructura
  - Matriz de decisión "Cuándo escalar"
  - Arquitectura por fases
  - Costos estimados
  - Estrategias de migración

- **[QUICK_DECISION_GUIDE.md](./QUICK_DECISION_GUIDE.md)**
  - Guía rápida de decisiones técnicas
  - "¿Debo usar X?" respondido
  - Semáforo de prioridades
  - Matriz Impacto vs Esfuerzo

---

## 🎯 Guías de Inicio Rápido

### Para Desarrollo

```bash
# 1. Clonar el repositorio
git clone <repo-url>
cd bvs_framework

# 2. Copiar variables de entorno
cp .env.example .env

# 3. Iniciar servicios (optimizado)
bash start-optimized.sh

# 4. Acceder a la aplicación
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
# Admin: http://localhost:8000/admin
```

### Para Decisiones Técnicas

1. **¿Necesito implementar X?**
   → Lee [QUICK_DECISION_GUIDE.md](./QUICK_DECISION_GUIDE.md)

2. **¿Qué feature priorizo?**
   → Revisa [BACKLOG_ESTRATEGICO.md - Fase 1](../BACKLOG_ESTRATEGICO.md#-fase-1-optimización-inmediata-1-2-semanas)

3. **¿Cuándo escalar infraestructura?**
   → Consulta [ROADMAP_INFRAESTRUCTURA.md - Matriz de Decisión](../ROADMAP_INFRAESTRUCTURA.md#-matriz-de-decisión-cuándo-escalar)

---

## 📊 Estado Actual del Sistema

### Métricas (Última actualización: 2025-12-30)

```yaml
Infraestructura:
  RAM total: 5.8GB
  RAM en uso: ~2.4GB
  Servicios: 5 contenedores Docker
  Optimización: ✅ Completada

Base de Datos:
  Libros indexados: 49
  Tamaño índice: 99.9KB
  Motor búsqueda: Elasticsearch (migrar a Meilisearch pendiente)

Performance:
  Backend: 113MB RAM (22% de límite)
  Frontend: 611MB RAM (60% de límite)
  PostgreSQL: 14MB RAM (5% de límite)
  Redis: 3.1MB RAM (2% de límite)
  Elasticsearch: 511MB RAM (99% de límite) ⚠️
```

### Próximos Pasos Prioritarios

1. **[P0] Migrar a Meilisearch** → Ahorrar 384MB RAM
2. **[P0] Implementar backups automáticos** → Prevenir pérdida de datos
3. **[P1] Implementar cache Redis** → Mejorar performance
4. **[P1] CloudFlare CDN** → Optimizar carga de assets

---

## 🏗️ Arquitectura Actual

```
┌─────────────────────────────────────────────────┐
│                   Docker Host                    │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐ │
│  │  Frontend  │  │  Backend   │  │   Nginx    │ │
│  │  Next.js   │  │  Django    │  │ (Futuro)   │ │
│  │   1GB      │  │   512MB    │  │            │ │
│  └────────────┘  └────────────┘  └────────────┘ │
│         │               │               │        │
│         └───────┬───────┴───────┬───────┘        │
│                 │               │                │
│  ┌────────────┐ │ ┌────────────┐│ ┌────────────┐│
│  │PostgreSQL  │ │ │   Redis    ││ │Elasticsearch│
│  │  256MB     │ │ │   128MB    ││ │   512MB    ││
│  └────────────┘ │ └────────────┘│ └────────────┘│
│                 │                │               │
│        ┌────────▼────────────────▼──────┐        │
│        │   Docker Network (bridge)      │        │
│        └────────────────────────────────┘        │
└─────────────────────────────────────────────────┘
```

---

## 📁 Estructura del Proyecto

```
bvs_framework/
├── backend/                    # Django REST API
│   ├── apps/
│   │   ├── authentication/    # Auth & Users
│   │   ├── content/           # Libros, Categorías
│   │   ├── institutions/      # Instituciones
│   │   ├── subscriptions/     # Suscripciones
│   │   └── payments/          # Pagos Stripe
│   ├── config/                # Settings Django
│   └── manage.py
│
├── frontend/                   # Next.js App
│   ├── src/
│   │   ├── app/              # App Router (Next.js 13+)
│   │   ├── components/       # React Components
│   │   ├── lib/              # Utilidades
│   │   └── store/            # State Management
│   └── package.json
│
├── docs/                      # 📄 Documentación
│   ├── README.md             # Este archivo
│   ├── QUICK_DECISION_GUIDE.md
│   └── ...
│
├── BACKLOG_ESTRATEGICO.md    # Planificación features
├── ROADMAP_INFRAESTRUCTURA.md # Planificación infra
├── docker-compose.yml         # Orquestación servicios
├── start-optimized.sh         # Script inicio optimizado
└── .env                       # Variables de entorno
```

---

## 🔧 Scripts Útiles

### Desarrollo

```bash
# Iniciar servicios optimizados
bash start-optimized.sh

# Ver logs en tiempo real
docker logs -f bvs_framework_backend_1
docker logs -f bvs_framework_frontend_1

# Ver uso de recursos
docker stats

# Reiniciar servicio específico
docker restart bvs_framework_backend_1

# Acceder a shell de contenedor
docker exec -it bvs_framework_backend_1 bash

# Ejecutar migraciones
docker exec bvs_framework_backend_1 python manage.py migrate

# Crear superusuario
docker exec -it bvs_framework_backend_1 python manage.py createsuperuser
```

### Mantenimiento

```bash
# Backup manual de PostgreSQL
docker exec bvs_framework_db_1 pg_dump -U postgres biblioteca > backup_$(date +%Y%m%d).sql

# Restore de backup
docker exec -i bvs_framework_db_1 psql -U postgres biblioteca < backup_20251230.sql

# Limpiar recursos Docker no usados
docker system prune -a

# Ver disco usado por Docker
docker system df
```

---

## 🎓 Recursos de Aprendizaje

### Stack Tecnológico

- **Django**: https://docs.djangoproject.com/
- **Next.js**: https://nextjs.org/docs
- **PostgreSQL**: https://www.postgresql.org/docs/
- **Elasticsearch**: https://www.elastic.co/guide/
- **Docker**: https://docs.docker.com/

### Optimización

- **Meilisearch**: https://docs.meilisearch.com/
- **Redis Caching**: https://redis.io/docs/manual/client-side-caching/
- **PostgreSQL Performance**: https://wiki.postgresql.org/wiki/Performance_Optimization
- **Django Optimization**: https://docs.djangoproject.com/en/stable/topics/performance/

### DevOps

- **Docker Compose**: https://docs.docker.com/compose/
- **Nginx**: https://nginx.org/en/docs/
- **Let's Encrypt**: https://letsencrypt.org/docs/
- **Prometheus**: https://prometheus.io/docs/

---

## 🐛 Troubleshooting

### Problema: "Out of Memory"

```bash
# 1. Verificar uso actual
docker stats

# 2. Si Elasticsearch está al límite:
# → Migrar a Meilisearch (ver BACKLOG)

# 3. Reiniciar servicios problemáticos
docker restart bvs_framework_elasticsearch_1
```

### Problema: "Frontend no carga"

```bash
# 1. Verificar logs
docker logs bvs_framework_frontend_1 --tail 100

# 2. Verificar que el build completó
docker exec bvs_framework_frontend_1 ls -la .next

# 3. Reiniciar frontend
docker restart bvs_framework_frontend_1
```

### Problema: "Database connection refused"

```bash
# 1. Verificar que PostgreSQL esté corriendo
docker ps | grep db

# 2. Verificar conexión desde backend
docker exec bvs_framework_backend_1 python manage.py dbshell

# 3. Verificar variables de entorno
docker exec bvs_framework_backend_1 env | grep POSTGRES
```

### Problema: "Search not working"

```bash
# 1. Verificar Elasticsearch health
curl http://localhost:9200/_cluster/health?pretty

# 2. Revisar índices
curl http://localhost:9200/_cat/indices?v

# 3. Reindexar si es necesario
docker exec bvs_framework_backend_1 python manage.py search_index --rebuild
```

---

## 📞 Contacto y Contribución

### Equipo

- **Tech Lead**: [Nombre]
- **Backend**: [Nombre]
- **Frontend**: [Nombre]
- **DevOps**: [Nombre]

### Proceso de Contribución

1. Crear issue describiendo el problema/feature
2. Fork del repositorio
3. Crear rama: `feature/nombre-feature` o `fix/nombre-bug`
4. Commits descriptivos
5. Tests (si aplica)
6. Pull request a `develop`
7. Code review
8. Merge a `main` cuando esté aprobado

---

## 📝 Changelog

### [1.0.0] - 2025-12-30

#### Added
- ✅ Optimización de límites de memoria Docker
- ✅ Configuración PostgreSQL para low RAM
- ✅ Configuración Redis con LRU eviction
- ✅ Elasticsearch optimizado (256MB heap)
- ✅ Script `start-optimized.sh`
- ✅ Documentación estratégica completa
- ✅ Migración `0005_add_reading_model` aplicada

#### Changed
- 🔄 Backend: 1GB → 512MB límite
- 🔄 Frontend: 2GB → 1GB límite
- 🔄 PostgreSQL: 512MB → 256MB límite
- 🔄 Redis: 256MB → 128MB límite
- 🔄 Elasticsearch: 768MB → 512MB límite

#### Optimization Results
- 💾 RAM total reducida: 4.5GB → 2.4GB (47% reducción)
- ⚡ Todos los servicios estables
- 🎯 Sistema optimizado para 5.8GB RAM

---

## 🔮 Próxima Versión (v1.1.0)

- [ ] Migración a Meilisearch
- [ ] Sistema de backups automáticos
- [ ] Cache Redis implementado
- [ ] CloudFlare CDN configurado
- [ ] Rate limiting básico
- [ ] Logging estructurado

**Target date**: 2025-01-15

---

**Última actualización**: 2025-12-30
**Versión documentación**: 1.0
**Mantenido por**: Equipo BVS Framework
