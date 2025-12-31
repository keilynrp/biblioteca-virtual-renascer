# 🏗️ Roadmap de Infraestructura - BVS Framework

> **Objetivo**: Plan estratégico de evolución de infraestructura basado en crecimiento real

---

## 📊 Matriz de Decisión: Cuándo Escalar

| Métrica | Actual | Acción en | Solución |
|---------|--------|-----------|----------|
| **Libros** | 49 | 1,000 | Optimizar índices DB |
| | | 10,000 | Meilisearch cluster 2 nodos |
| | | 100,000 | Elasticsearch cluster 3 nodos |
| **Usuarios activos/día** | <10 | 100 | Implementar cache Redis |
| | | 1,000 | PgBouncer + read replicas |
| | | 10,000 | Load balancer + horizontal scaling |
| **RAM disponible** | 5.8GB | 8GB+ | Upgrade hardware |
| | | 16GB+ | Considerar separar servicios |
| | | 32GB+ | Multi-server o cloud |
| **Requests/segundo** | <1 | 10 | Nginx cache + CDN |
| | | 100 | Auto-scaling |
| | | 1,000 | Kubernetes + service mesh |
| **Storage** | <1GB | 50GB | Optimizar imágenes |
| | | 500GB | Object storage (S3/Spaces) |
| | | 5TB | CDN + edge caching |

---

## 🎯 Estrategia por Fases

### 🔹 Fase 0: Actual (MVP Development)
**RAM**: 5.8GB | **Libros**: <100 | **Usuarios**: Dev team

```yaml
Arquitectura:
  - Single server (local/VPS)
  - Docker Compose
  - Services: Backend, Frontend, PostgreSQL, Meilisearch, Redis

Optimizaciones completadas:
  ✅ Límites de memoria por servicio
  ✅ PostgreSQL tuning para low RAM
  ✅ Redis cache policy

Próximos pasos:
  🎯 Migrar Elasticsearch → Meilisearch
  🎯 Implementar backups
  🎯 Logging estructurado
```

**Capacidad estimada**: 500 libros, 50 usuarios concurrentes

---

### 🔹 Fase 1: Early Adoption (Primeros usuarios reales)
**RAM**: 8-16GB | **Libros**: 100-1,000 | **Usuarios**: 10-100 activos/día

```yaml
Infraestructura:
  Server:
    - CPU: 4 cores
    - RAM: 16GB
    - Storage: 100GB SSD
    - Costo: ~$20-40/mes VPS

  Servicios:
    backend:
      replicas: 1
      memory: 1GB
    frontend:
      replicas: 1
      memory: 1.5GB
    postgresql:
      memory: 2GB
      config:
        - shared_buffers: 512MB
        - effective_cache_size: 1GB
        - max_connections: 100
    meilisearch:
      memory: 512MB
    redis:
      memory: 256MB
    nginx:
      memory: 128MB (nuevo)
      role: reverse proxy + SSL termination

Nuevos servicios:
  ✅ Nginx reverse proxy
  ✅ Let's Encrypt SSL
  ✅ Backups diarios automáticos
  ✅ Log rotation

Monitoreo básico:
  ✅ Docker stats + script alertas
  ✅ Disk usage monitoring
  ✅ Uptime monitoring (UptimeRobot gratis)
```

**Costos mensuales**: $20-40 (VPS) + $0 (domain si tienes) = ~$40/mes

**Capacidad estimada**: 1,000 libros, 100 usuarios concurrentes

---

### 🔹 Fase 2: Growth (Producto validado, crecimiento activo)
**RAM**: 16-32GB | **Libros**: 1,000-10,000 | **Usuarios**: 100-1,000 activos/día

```yaml
Infraestructura:
  Opción A - Single Server Mejorado:
    - CPU: 8 cores
    - RAM: 32GB
    - Storage: 500GB NVMe
    - Costo: ~$60-100/mes

  Opción B - Multi-Server (recomendado):
    App Server:
      - CPU: 4 cores
      - RAM: 16GB
      - Services: Backend, Frontend

    Database Server:
      - CPU: 4 cores
      - RAM: 16GB
      - Services: PostgreSQL, Redis

    Search Server:
      - CPU: 2 cores
      - RAM: 8GB
      - Services: Meilisearch/Elasticsearch

    Total: ~$100-150/mes

Arquitectura:
  Load Balancer (Nginx):
    - SSL termination
    - Rate limiting
    - Static file caching
    - Gzip compression

  Backend (Django):
    - Gunicorn workers: 4-8
    - Async tasks: Celery + Redis
    - Cache: Redis (TTL 5-15min)

  Frontend (Next.js):
    - SSR optimizado
    - Image optimization
    - Static generation donde aplique

  Database:
    - PostgreSQL master
    - Read replica (opcional)
    - PgBouncer connection pooling
    - Índices optimizados

  Search:
    - Meilisearch 2-node setup (HA)
    - O Elasticsearch single node 2GB RAM

  Storage:
    - Object storage para PDF/imágenes
    - DigitalOcean Spaces o S3
    - CDN (CloudFlare gratis)

Monitoreo y Observabilidad:
  ✅ Prometheus + Grafana
  ✅ Loki para logs
  ✅ Alertas (email/Slack)
  ✅ Uptime monitoring
  ✅ Error tracking (Sentry free tier)

CI/CD:
  ✅ GitHub Actions
  ✅ Automated tests
  ✅ Staging environment
  ✅ Blue-green deployments

Backups:
  ✅ PostgreSQL: Daily + 30 días retention
  ✅ Search index: Weekly
  ✅ Code: Git
  ✅ Disaster recovery plan
```

**Costos mensuales**:
- Servers: $100-150
- Object storage: $5-20
- CDN: $0 (CloudFlare)
- Monitoring: $0-10
- **Total**: ~$120-180/mes

**Capacidad estimada**: 10,000 libros, 1,000 usuarios concurrentes

---

### 🔹 Fase 3: Scale (Producto establecido)
**RAM**: 64GB+ | **Libros**: 10,000-100,000 | **Usuarios**: 1,000-10,000 activos/día

```yaml
Arquitectura: Multi-region (opcional) o Single-region HA

Cloud Provider (recomendado migrar a cloud):

  Opción A - AWS:
    Compute:
      - ECS Fargate (backend): $50-100/mes
      - CloudFront + S3 (frontend): $20-40/mes

    Database:
      - RDS PostgreSQL Multi-AZ: $100-200/mes
      - ElastiCache Redis: $40-80/mes

    Search:
      - Self-managed ES en EC2: $80-150/mes
      - O OpenSearch Service: $100-200/mes

    Storage:
      - S3: $20-50/mes
      - CloudFront CDN: $20-50/mes

    Total AWS: ~$400-800/mes

  Opción B - DigitalOcean (más simple):
    - App Platform (backend+frontend): $24/mes
    - Managed PostgreSQL (4GB): $60/mes
    - Managed Redis: $15/mes
    - Kubernetes cluster (3 nodes): $120/mes
    - Spaces + CDN: $10/mes
    - Load Balancer: $12/mes

    Total DO: ~$240/mes

  Opción C - Self-hosted (costo-efectivo):
    Servers:
      - 3x App servers (16GB): $180/mes
      - 2x DB servers (32GB): $200/mes
      - 3x Search nodes (8GB): $120/mes
      - Load balancers (2x): $40/mes

    Total: ~$540/mes
    Ventaja: Más control
    Desventaja: Más trabajo operacional

Servicios adicionales:
  ✅ Elasticsearch cluster 3 nodos
  ✅ PostgreSQL master + 2 read replicas
  ✅ Redis cluster (sentinel/cluster mode)
  ✅ Message queue (RabbitMQ/SQS)
  ✅ Background workers (Celery)
  ✅ Full-text search (dual: ES + PG)

Performance:
  ✅ API response time: p95 < 200ms
  ✅ Page load time: p95 < 2s
  ✅ Search latency: p95 < 100ms
  ✅ Uptime: 99.9% (8.76h downtime/año)

Monitoreo avanzado:
  ✅ Distributed tracing (Jaeger)
  ✅ APM (Application Performance Monitoring)
  ✅ Business metrics dashboard
  ✅ Cost monitoring
  ✅ Security scanning

DevOps:
  ✅ Infrastructure as Code (Terraform)
  ✅ GitOps (ArgoCD/Flux)
  ✅ Automated rollbacks
  ✅ Canary deployments
  ✅ Feature flags
```

**Costos mensuales**: $240-800/mes (depende de cloud provider)

**Capacidad estimada**: 100,000 libros, 10,000+ usuarios concurrentes

---

### 🔹 Fase 4: Enterprise (Producto maduro, múltiples mercados)
**RAM**: 128GB+ distribuido | **Libros**: 100,000+ | **Usuarios**: 10,000+ activos/día

```yaml
Arquitectura: Kubernetes multi-cluster, multi-region

Solo considerar si:
  ✅ Revenue > $10k/mes
  ✅ SLA 99.95%+ requerido
  ✅ Equipo DevOps dedicado (2+ personas)
  ✅ Multi-región necesario
  ✅ Compliance requirements (GDPR, SOC2)

Infraestructura:
  Kubernetes:
    - 3+ clusters (production, staging, dev)
    - Multi-region (latencia global)
    - Auto-scaling (HPA + VPA)
    - Service mesh (Istio/Linkerd)

  Database:
    - PostgreSQL sharded
    - Multi-master replication
    - Automated failover
    - Point-in-time recovery

  Search:
    - Elasticsearch cluster 9+ nodos
    - 3 master, 6 data nodes
    - Index lifecycle management
    - Snapshot/restore automático

  Caching:
    - Multi-layer cache
    - CDN edge caching
    - Redis Cluster
    - Application-level cache

  Storage:
    - Multi-region S3/Spaces
    - Image processing pipeline
    - Video transcoding (si aplica)

Seguridad:
  ✅ WAF (Web Application Firewall)
  ✅ DDoS protection
  ✅ Secrets management (Vault)
  ✅ Certificate management (cert-manager)
  ✅ Network policies
  ✅ Pod security policies
  ✅ Regular penetration testing

Observabilidad:
  ✅ OpenTelemetry
  ✅ Distributed tracing
  ✅ Log aggregation multi-cluster
  ✅ Custom business metrics
  ✅ AI-powered anomaly detection
  ✅ Predictive scaling

Costos:
  - Cloud infrastructure: $2,000-5,000/mes
  - Monitoring/observability: $200-500/mes
  - Security tools: $200-500/mes
  - CDN + bandwidth: $500-2,000/mes
  - DevOps team: $15,000+/mes

  Total: ~$18,000-23,000/mes
```

**ROI necesario**: Este nivel requiere revenue significativo para justificar

---

## 🎮 Estrategia de Migración entre Fases

### De Fase 0 → Fase 1
```bash
✅ Sin downtime necesario
✅ Migración gradual

Pasos:
1. Backup completo
2. Provisionar nuevo VPS
3. Setup docker-compose en nuevo servidor
4. Sync de datos (rsync o pg_dump/restore)
5. DNS cutover (TTL bajo previo)
6. Monitoring por 48h
7. Decomisionar servidor viejo

Tiempo estimado: 4-8 horas
Riesgo: Bajo
```

### De Fase 1 → Fase 2
```bash
⚠️ Downtime: <30 minutos

Pasos:
1. Anunciar mantenimiento (24h antes)
2. Setup multi-server
3. Database migration (pg_dump/restore o streaming replication)
4. Sync application code
5. Load balancer setup
6. DNS cutover
7. Validación completa

Tiempo estimado: 1-2 días
Riesgo: Medio
Rollback: Posible vía DNS
```

### De Fase 2 → Fase 3 (Cloud)
```bash
⚠️ Downtime: <1 hora (con plan)

Estrategia recomendada: Blue-Green

Pasos:
1. Setup infraestructura cloud (parallel)
2. Database replication cloud ← on-prem
3. Sync search index
4. Soft launch (% usuarios a cloud)
5. Monitor metrics
6. Gradual migration (10% → 50% → 100%)
7. Decomisionar on-prem

Tiempo estimado: 2-4 semanas
Riesgo: Medio-Alto
Costo: Duplicado durante migración
```

---

## 🔍 Señales para Escalar (Cuando actuar)

### 🚨 Señales de Alerta Temprana

**RAM**
- ⚠️ Warning: >70% uso sostenido
- 🚨 Critical: >85% uso
- ❌ Emergency: OOM kills

**CPU**
- ⚠️ Warning: >60% uso promedio 1h
- 🚨 Critical: >80% uso sostenido
- ❌ Emergency: Request timeouts

**Database**
- ⚠️ Warning: >100 conexiones activas
- 🚨 Critical: Queries >1s frecuentes
- ❌ Emergency: Connection pool exhausted

**Latencia**
- ⚠️ Warning: p95 > 500ms
- 🚨 Critical: p95 > 1s
- ❌ Emergency: p50 > 1s

**Storage**
- ⚠️ Warning: >70% disco
- 🚨 Critical: >85% disco
- ❌ Emergency: >95% disco

### ✅ Plan de Respuesta

1. **Immediate (0-24h)**:
   - Restart services con memory leaks
   - Clear logs/temp files
   - Enable aggressive caching
   - Rate limit abuse

2. **Short-term (1-7 días)**:
   - Vertical scaling (más RAM/CPU)
   - Database query optimization
   - Add read replicas
   - CDN para static assets

3. **Long-term (1-4 semanas)**:
   - Horizontal scaling
   - Architecture refactor
   - Migration a fase superior

---

## 📊 Benchmarks por Fase

| Fase | Libros | Usuarios/día | RAM total | Requests/s | Latencia p95 | Costo/mes |
|------|--------|--------------|-----------|------------|--------------|-----------|
| 0 | <100 | <10 | 6GB | <1 | <1s | $0 |
| 1 | 100-1k | 10-100 | 16GB | 1-10 | <500ms | $40 |
| 2 | 1k-10k | 100-1k | 32GB | 10-100 | <200ms | $150 |
| 3 | 10k-100k | 1k-10k | 64GB+ | 100-1k | <100ms | $500 |
| 4 | 100k+ | 10k+ | 128GB+ | 1k+ | <50ms | $3k+ |

---

## 🎯 Checklist por Fase

### Fase 0 → Fase 1
- [ ] Migrar Elasticsearch → Meilisearch
- [ ] Implementar backups automáticos
- [ ] Setup monitoring básico
- [ ] Nginx reverse proxy + SSL
- [ ] Documentar runbooks
- [ ] Load testing (>100 usuarios)

### Fase 1 → Fase 2
- [ ] Multi-server setup
- [ ] PgBouncer connection pooling
- [ ] Redis cache strategy
- [ ] CDN para assets
- [ ] Prometheus + Grafana
- [ ] CI/CD pipeline
- [ ] Staging environment
- [ ] Load testing (>1,000 usuarios)

### Fase 2 → Fase 3
- [ ] Cloud migration plan
- [ ] IaC (Terraform/Pulumi)
- [ ] Kubernetes evaluation
- [ ] Read replicas
- [ ] Message queue
- [ ] Distributed tracing
- [ ] Disaster recovery testing
- [ ] Load testing (>10,000 usuarios)

### Fase 3 → Fase 4
- [ ] Multi-region strategy
- [ ] Database sharding
- [ ] Service mesh
- [ ] Advanced security (WAF, DDoS)
- [ ] SLO/SLI definition
- [ ] Cost optimization
- [ ] DevOps team hire
- [ ] Load testing (>100,000 usuarios)

---

## 💡 Recomendaciones Finales

1. **No optimices prematuramente**: Solo escala cuando las métricas lo demanden

2. **Monitorea primero**: No puedes mejorar lo que no mides

3. **Simplicidad > Complejidad**: Docker Compose > Kubernetes hasta que sea absolutamente necesario

4. **Cloud vs Self-hosted**:
   - <1,000 usuarios: Self-hosted más barato
   - >10,000 usuarios: Cloud más confiable

5. **Crecimiento gradual**: Cada fase debe durar meses, no semanas

6. **Backup siempre**: Antes de cualquier cambio mayor

7. **Test de carga**: Antes de cada fase nueva

8. **Rollback plan**: Siempre tener plan B

---

**Última actualización**: 2025-12-30
**Próxima revisión**: 2025-01-30
**Owner**: Equipo Infraestructura BVS
