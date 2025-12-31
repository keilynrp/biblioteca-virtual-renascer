# 📋 Backlog Estratégico - BVS Framework

> **Última actualización**: 2025-12-30
> **Sistema**: Biblioteca Virtual de Saberes
> **Stack**: Django + Next.js + PostgreSQL + Elasticsearch + Redis

---

## 🎯 Objetivos Estratégicos

1. **Performance**: Optimizar uso de recursos (RAM, CPU, almacenamiento)
2. **Escalabilidad**: Preparar el sistema para crecimiento de usuarios y contenido
3. **UX/UI**: Mejorar experiencia de usuario y diseño
4. **DevOps**: Automatizar despliegues y monitoreo
5. **Features**: Agregar funcionalidades que aporten valor

---

## 📊 Estado Actual del Sistema

### Métricas Base
- **Documentos indexados**: 49 libros
- **Tamaño índice**: 99.9KB
- **RAM disponible**: 5.8GB
- **RAM en uso**: ~2.4GB (optimizado)
- **Usuarios**: Desarrollo
- **Stack versions**: Django 6.0, Next.js 15, PostgreSQL 15, Elasticsearch 8.11

### Infraestructura
```
✅ Docker Compose (desarrollo)
✅ Límites de memoria optimizados
✅ Auto-restart configurado
❌ Monitoreo/alertas
❌ Backups automatizados
❌ CI/CD pipeline
```

---

## 🔥 Fase 1: Optimización Inmediata (1-2 semanas)

### P0 - Crítico (Hacer Ya)

- [ ] **INFRA-001**: Implementar backups automáticos de PostgreSQL
  - **Impacto**: Alto | **Esfuerzo**: Bajo
  - **Descripción**: Script diario de backup + rotación de 7 días
  - **Beneficio**: Prevenir pérdida de datos

- [ ] **PERF-001**: Migrar de Elasticsearch a Meilisearch
  - **Impacto**: Alto | **Esfuerzo**: Medio
  - **Descripción**: Reducir consumo de RAM de 512MB → 128MB
  - **Beneficio**: Liberar 384MB RAM + mejor performance de búsqueda
  - **Archivos afectados**:
    - `docker-compose.yml`
    - `backend/apps/content/search.py`
    - `frontend/src/lib/search.ts`
  - **Rollback**: Mantener Elasticsearch data hasta validar migración

- [ ] **MON-001**: Implementar logging centralizado
  - **Impacto**: Medio | **Esfuerzo**: Bajo
  - **Descripción**: Configurar logs estructurados en JSON
  - **Stack sugerido**: Loki + Promtail (ligero) o archivos + rotación

### P1 - Alta Prioridad (1-2 semanas)

- [ ] **PERF-002**: Optimizar queries de PostgreSQL
  - **Impacto**: Medio | **Esfuerzo**: Bajo
  - **Descripción**: Agregar índices faltantes, analizar slow queries
  - **Query a revisar**:
    - Book listings con filtros
    - Search queries
    - User favorites/history

- [ ] **SEC-001**: Implementar rate limiting
  - **Impacto**: Alto | **Esfuerzo**: Bajo
  - **Descripción**: Proteger APIs contra abuse
  - **Stack**: Django Ratelimit + Redis

- [ ] **CACHE-001**: Implementar cache de queries frecuentes
  - **Impacto**: Alto | **Esfuerzo**: Medio
  - **Descripción**: Cachear listados de libros, categorías, stats
  - **TTL sugerido**: 5-15 minutos
  - **Invalidación**: Por eventos (create/update/delete)

---

## 🚀 Fase 2: Mejoras de Producto (2-4 semanas)

### P1 - Features Core

- [ ] **FEAT-001**: Sistema de recomendaciones básico
  - **Impacto**: Alto | **Esfuerzo**: Alto
  - **Descripción**:
    - Basado en historial de lectura
    - Libros similares (por categoría/autor)
    - "Los usuarios que leyeron X también leyeron Y"
  - **Stack**: PostgreSQL queries + Redis cache

- [ ] **FEAT-002**: Lector de libros mejorado
  - **Impacto**: Alto | **Esfuerzo**: Medio
  - **Descripción**:
    - Marcadores y anotaciones
    - Sincronización de posición de lectura
    - Modo nocturno
    - Control de fuente/tamaño
  - **Archivo**: `frontend/src/components/pdf-viewer.tsx`

- [ ] **FEAT-003**: Sistema de colecciones/listas de lectura
  - **Impacto**: Medio | **Esfuerzo**: Medio
  - **Descripción**: Permitir crear listas personalizadas de libros
  - **BD**: Nueva tabla `reading_list` + `reading_list_items`

- [ ] **FEAT-004**: Estadísticas de lectura para usuarios
  - **Impacto**: Medio | **Esfuerzo**: Bajo
  - **Descripción**: Dashboard con:
    - Libros leídos este mes/año
    - Tiempo de lectura estimado
    - Géneros favoritos
    - Racha de lectura

### P2 - UX/UI

- [ ] **UI-001**: Redesign de cards de libros
  - **Impacto**: Bajo | **Esfuerzo**: Bajo
  - **Descripción**: Mejorar diseño visual de book cards
  - **Referencia**: Ver `frontend/src/components/book-card.tsx`

- [ ] **UI-002**: Búsqueda avanzada con filtros
  - **Impacto**: Medio | **Esfuerzo**: Medio
  - **Descripción**: Filtros por:
    - Autor, categoría, año
    - Calificación mínima
    - Idioma
    - Páginas (rango)

- [ ] **UI-003**: Dark mode persistente
  - **Impacto**: Bajo | **Esfuerzo**: Bajo
  - **Descripción**: Guardar preferencia en localStorage/DB

- [ ] **MOBILE-001**: PWA (Progressive Web App)
  - **Impacto**: Alto | **Esfuerzo**: Medio
  - **Descripción**:
    - Service worker para offline
    - Instalable en móviles
    - Push notifications (opcional)

---

## 🏗️ Fase 3: Escalabilidad (1-2 meses)

### Preparación para 16GB RAM

- [ ] **SCALE-001**: Implementar PostgreSQL Full-Text Search como fallback
  - **Impacto**: Medio | **Esfuerzo**: Medio
  - **Descripción**: Dual search: Meilisearch (primary) + PG FTS (fallback)
  - **Beneficio**: Resiliencia + reducción de dependencias

- [ ] **SCALE-002**: CDN para assets estáticos
  - **Impacto**: Alto | **Esfuerzo**: Bajo
  - **Descripción**: CloudFlare/Bunny CDN para portadas de libros
  - **Beneficio**: Reducir carga del servidor + mejor UX global

- [ ] **SCALE-003**: Image optimization pipeline
  - **Impacto**: Medio | **Esfuerzo**: Medio
  - **Descripción**:
    - WebP conversion automático
    - Thumbnails múltiples tamaños
    - Lazy loading
  - **Stack**: Pillow/Sharp + storage optimizado

- [ ] **SCALE-004**: Database connection pooling
  - **Impacto**: Alto | **Esfuerzo**: Bajo
  - **Descripción**: PgBouncer para optimizar conexiones
  - **Beneficio**: Reducir overhead de PostgreSQL

### Monitoreo y Observabilidad

- [ ] **MON-002**: Implementar métricas con Prometheus
  - **Impacto**: Alto | **Esfuerzo**: Medio
  - **Métricas clave**:
    - Request rate, latency, errors (RED metrics)
    - Memory/CPU usage
    - DB query performance
    - Cache hit rate

- [ ] **MON-003**: Dashboard con Grafana
  - **Impacto**: Medio | **Esfuerzo**: Bajo
  - **Dashboards**:
    - Sistema (RAM, CPU, disco)
    - Aplicación (requests, errors)
    - Base de datos (connections, slow queries)
    - Negocio (libros, usuarios, lecturas)

- [ ] **MON-004**: Alertas automáticas
  - **Impacto**: Alto | **Esfuerzo**: Bajo
  - **Triggers**:
    - RAM > 80%
    - Error rate > 1%
    - DB connections > 80%
    - Disco > 85%

---

## 🔐 Fase 4: Seguridad y Calidad (Continuo)

### Seguridad

- [ ] **SEC-002**: Implementar HTTPS en desarrollo
  - **Impacto**: Medio | **Esfuerzo**: Bajo
  - **Stack**: mkcert para certificados locales

- [ ] **SEC-003**: Secrets management
  - **Impacto**: Alto | **Esfuerzo**: Bajo
  - **Descripción**:
    - Migrar de `.env` a secrets manager
    - Opciones: HashiCorp Vault (self-hosted) o dotenv-vault

- [ ] **SEC-004**: Security headers
  - **Impacto**: Medio | **Esfuerzo**: Bajo
  - **Headers**: CSP, HSTS, X-Frame-Options, etc.

- [ ] **SEC-005**: Dependency scanning
  - **Impacto**: Alto | **Esfuerzo**: Bajo
  - **Stack**: Dependabot + Snyk

### Testing

- [ ] **TEST-001**: Unit tests backend (cobertura > 70%)
  - **Impacto**: Alto | **Esfuerzo**: Alto
  - **Framework**: pytest + coverage

- [ ] **TEST-002**: Integration tests
  - **Impacto**: Alto | **Esfuerzo**: Medio
  - **Scope**: API endpoints críticos

- [ ] **TEST-003**: E2E tests frontend
  - **Impacto**: Medio | **Esfuerzo**: Alto
  - **Stack**: Playwright o Cypress
  - **Scenarios**: Login, búsqueda, lectura de libro

- [ ] **TEST-004**: Load testing
  - **Impacto**: Medio | **Esfuerzo**: Medio
  - **Stack**: k6 o Locust
  - **Objetivo**: Identificar bottlenecks antes de producción

---

## 🎓 Fase 5: Features Avanzadas (3-6 meses)

### Colaboración Social

- [ ] **SOCIAL-001**: Sistema de grupos de lectura
  - **Impacto**: Alto | **Esfuerzo**: Alto
  - **Features**:
    - Crear grupos temáticos
    - Discusiones por libro
    - Retos de lectura grupales

- [ ] **SOCIAL-002**: Gamificación
  - **Impacto**: Medio | **Esfuerzo**: Medio
  - **Features**:
    - Badges/logros
    - Puntos por actividades
    - Leaderboards
    - Racha de días leyendo

- [ ] **SOCIAL-003**: Sistema de citas/highlights compartidos
  - **Impacto**: Medio | **Esfuerzo**: Medio
  - **Descripción**: Compartir fragmentos favoritos en redes sociales

### IA y Machine Learning

- [ ] **AI-001**: Recomendaciones con ML
  - **Impacto**: Alto | **Esfuerzo**: Alto
  - **Algoritmos**:
    - Collaborative filtering
    - Content-based filtering
    - Hybrid approach
  - **Stack**: scikit-learn o TensorFlow Lite

- [ ] **AI-002**: Resúmenes automáticos con IA
  - **Impacto**: Medio | **Esfuerzo**: Alto
  - **Stack**: OpenAI API o modelo local (Llama)

- [ ] **AI-003**: Búsqueda semántica
  - **Impacto**: Alto | **Esfuerzo**: Alto
  - **Stack**: Embeddings + vector database (pgvector o Qdrant)

### Contenido

- [ ] **CONTENT-001**: Sistema de importación masiva
  - **Impacto**: Alto | **Esfuerzo**: Medio
  - **Fuentes**:
    - OpenLibrary API (ya existe base)
    - Google Books API
    - Project Gutenberg
  - **Features**: Deduplicación, validación, preview

- [ ] **CONTENT-002**: Soporte para audiolibros
  - **Impacto**: Alto | **Esfuerzo**: Alto
  - **Stack**: Audio player, streaming, marcadores temporales

- [ ] **CONTENT-003**: Soporte para ePub
  - **Impacto**: Alto | **Esfuerzo**: Medio
  - **Stack**: epub.js para rendering

---

## 🌐 Fase 6: Producción y DevOps (Cuando escales)

### Solo cuando tengas >1000 usuarios activos

- [ ] **DEVOPS-001**: CI/CD Pipeline
  - **Impacto**: Alto | **Esfuerzo**: Medio
  - **Stack**: GitHub Actions
  - **Stages**: Lint → Test → Build → Deploy
  - **Environments**: staging + production

- [ ] **DEVOPS-002**: Infrastructure as Code
  - **Impacto**: Alto | **Esfuerzo**: Alto
  - **Stack**: Terraform o Ansible
  - **Beneficio**: Reproducibilidad + documentación

- [ ] **DEVOPS-003**: Blue-Green deployments
  - **Impacto**: Medio | **Esfuerzo**: Alto
  - **Beneficio**: Zero-downtime deployments

- [ ] **CLOUD-001**: Migración a cloud (opcional)
  - **Impacto**: Alto | **Esfuerzo**: Alto
  - **Opciones**:
    - AWS: ECS/Fargate + RDS + ElastiCache
    - GCP: Cloud Run + Cloud SQL + Memorystore
    - DigitalOcean: App Platform (más simple)
  - **Decisión**: Solo si >5000 usuarios o revenue justifica costo

### Kubernetes (Solo si >10,000 usuarios)

- [ ] **K8S-001**: Cluster de Kubernetes local (minikube/k3s)
  - **Impacto**: Medio | **Esfuerzo**: Alto
  - **Prerequisito**: 16GB+ RAM, experiencia DevOps

- [ ] **K8S-002**: Helm charts para aplicación
  - **Impacto**: Medio | **Esfuerzo**: Medio

- [ ] **K8S-003**: Elasticsearch Operator
  - **Impacto**: Alto | **Esfuerzo**: Alto
  - **Beneficio**: Auto-scaling, self-healing

- [ ] **K8S-004**: Service Mesh (Istio/Linkerd)
  - **Impacto**: Bajo | **Esfuerzo**: Alto
  - **Solo si**: Microservicios + multi-equipo

---

## 📈 Roadmap Visual

```
Ahora (5.8GB RAM, 49 libros)
│
├─ Fase 1 (1-2 semanas) ✅ Quick Wins
│  ├─ Migrar a Meilisearch (-384MB RAM)
│  ├─ Backups automáticos
│  ├─ Cache básico
│  └─ Rate limiting
│
├─ Fase 2 (2-4 semanas) 📱 Features
│  ├─ Recomendaciones básicas
│  ├─ Lector mejorado
│  ├─ Colecciones
│  └─ PWA
│
├─ Fase 3 (1-2 meses) 📊 Monitoreo
│  ├─ Prometheus + Grafana
│  ├─ CDN para imágenes
│  ├─ PgBouncer
│  └─ Alertas
│
├─ Fase 4 (Continuo) 🔒 Calidad
│  ├─ Tests (unit + e2e)
│  ├─ Security headers
│  └─ Dependency scanning
│
├─ Fase 5 (3-6 meses) 🎯 Avanzado
│  ├─ ML Recommendations
│  ├─ Gamificación
│  ├─ Grupos de lectura
│  └─ ePub support
│
└─ Fase 6 (Solo si escala) ☁️ Producción
   ├─ CI/CD
   ├─ Cloud migration (opcional)
   └─ Kubernetes (solo si >10k usuarios)
```

---

## 🎯 KPIs y Métricas de Éxito

### Performance
- [ ] Page load time < 2s (p95)
- [ ] API response time < 200ms (p95)
- [ ] Search latency < 100ms
- [ ] Uptime > 99.5%

### Escalabilidad
- [ ] Soportar 1,000 libros sin degradación
- [ ] 100 usuarios concurrentes
- [ ] RAM usage < 4GB (con 1000 libros)

### Negocio
- [ ] 500+ usuarios registrados
- [ ] 50+ usuarios activos mensuales
- [ ] 1000+ búsquedas/mes
- [ ] Retention rate > 40%

---

## 💰 Estimación de Costos (Futuro)

### Desarrollo Actual
- **Costo**: $0 (self-hosted)
- **RAM**: 5.8GB (suficiente)

### Con 16GB RAM upgrade (~$100-200)
- **Capacidad**: 5,000-10,000 libros
- **Usuarios**: 500+ concurrentes
- **Costo mensual**: $0 (aún self-hosted)

### Cloud Production (si migras)
**DigitalOcean (recomendado para MVP)**
- App Platform: $12/mes
- Managed PostgreSQL: $15/mes
- Spaces (S3): $5/mes
- **Total**: ~$32/mes

**AWS (para escala)**
- ECS Fargate: $30-50/mes
- RDS PostgreSQL: $20-40/mes
- ElastiCache: $15-30/mes
- S3 + CloudFront: $10/mes
- **Total**: ~$75-130/mes

---

## 📝 Decisiones Arquitectónicas

### ADR-001: Migración a Meilisearch
**Contexto**: Elasticsearch consume 512MB para 49 documentos
**Decisión**: Migrar a Meilisearch
**Consecuencias**:
- ✅ Ahorro de 384MB RAM
- ✅ Búsqueda más rápida
- ❌ Menos features avanzadas (acceptable para MVP)

### ADR-002: NO usar Kubernetes ahora
**Contexto**: Sistema con 49 documentos, 1 servidor
**Decisión**: Docker Compose hasta >10,000 usuarios
**Consecuencias**:
- ✅ Simplicidad operacional
- ✅ Menor curva de aprendizaje
- ❌ Manual scaling (acceptable para fase actual)

### ADR-003: PostgreSQL como source of truth
**Contexto**: Search engine puede cambiar
**Decisión**: PostgreSQL guarda todo, search engine es cache
**Consecuencias**:
- ✅ Fácil migración entre search engines
- ✅ Backup simple
- ✅ ACID guarantees

---

## 🔄 Proceso de Revisión

- **Frecuencia**: Cada 2 semanas
- **Métricas a revisar**:
  - Items completados vs planeados
  - Bloqueadores y dependencias
  - Ajuste de prioridades
- **Siguiente revisión**: 2025-01-13

---

## 📚 Referencias y Recursos

- [Meilisearch Docs](https://docs.meilisearch.com/)
- [PostgreSQL Performance](https://wiki.postgresql.org/wiki/Performance_Optimization)
- [Django Optimization](https://docs.djangoproject.com/en/stable/topics/performance/)
- [Next.js Performance](https://nextjs.org/docs/pages/building-your-application/optimizing)
- [12 Factor App](https://12factor.net/)

---

**Mantenido por**: Equipo BVS
**Versión**: 1.0
**Licencia**: Interno
