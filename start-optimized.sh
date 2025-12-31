#!/bin/bash

echo "==================================================="
echo "Iniciando servicios con configuración optimizada"
echo "==================================================="

cd /mnt/d/bvs_framework

# Función para esperar que un servicio esté listo
wait_for_service() {
    local container=$1
    local max_wait=30
    local count=0

    echo "Esperando que $container esté listo..."
    while [ $count -lt $max_wait ]; do
        if docker inspect $container &>/dev/null && [ "$(docker inspect -f '{{.State.Running}}' $container)" == "true" ]; then
            echo "$container está listo!"
            return 0
        fi
        sleep 1
        count=$((count + 1))
    done
    echo "Timeout esperando a $container"
    return 1
}

# 1. PostgreSQL con alias
echo ""
echo "1. Iniciando PostgreSQL..."
docker run -d \
  --name bvs_framework_db_1 \
  --network bvs_framework_default \
  --network-alias db \
  -p 5432:5432 \
  -e POSTGRES_DB=biblioteca \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -v bvs_framework_postgres_data:/var/lib/postgresql/data \
  --memory=256m \
  --memory-reservation=128m \
  --restart unless-stopped \
  postgres:15-alpine \
  postgres -c shared_buffers=64MB -c effective_cache_size=128MB -c max_connections=50

wait_for_service bvs_framework_db_1

# 2. Redis con alias
echo ""
echo "2. Iniciando Redis..."
docker run -d \
  --name bvs_framework_redis_1 \
  --network bvs_framework_default \
  --network-alias redis \
  -p 6379:6379 \
  --memory=128m \
  --memory-reservation=64m \
  --restart unless-stopped \
  redis:7-alpine \
  redis-server --maxmemory 96mb --maxmemory-policy allkeys-lru

wait_for_service bvs_framework_redis_1

# 3. Elasticsearch con alias
echo ""
echo "3. Iniciando Elasticsearch..."
docker run -d \
  --name bvs_framework_elasticsearch_1 \
  --network bvs_framework_default \
  --network-alias elasticsearch \
  -p 9200:9200 \
  -p 9300:9300 \
  -e discovery.type=single-node \
  -e xpack.security.enabled=false \
  -e "ES_JAVA_OPTS=-Xms256m -Xmx256m" \
  -e bootstrap.memory_lock=false \
  -e cluster.routing.allocation.disk.threshold_enabled=true \
  -e cluster.routing.allocation.disk.watermark.low=85% \
  -e cluster.routing.allocation.disk.watermark.high=90% \
  -e indices.memory.index_buffer_size=10% \
  -v bvs_framework_elasticsearch_data:/usr/share/elasticsearch/data \
  --memory=512m \
  --memory-reservation=256m \
  --restart unless-stopped \
  docker.elastic.co/elasticsearch/elasticsearch:8.11.0

wait_for_service bvs_framework_elasticsearch_1
echo "Esperando 10 segundos adicionales para que Elasticsearch esté completamente listo..."
sleep 10

# 4. Backend con alias
echo ""
echo "4. Iniciando Backend..."
docker run -d \
  --name bvs_framework_backend_1 \
  --network bvs_framework_default \
  --network-alias backend \
  -p 8000:8000 \
  -v /mnt/d/bvs_framework/backend:/app \
  -e POSTGRES_DB=biblioteca \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_HOST=db \
  -e POSTGRES_PORT=5432 \
  -e SECRET_KEY=unsafe-development-key-change-in-production \
  -e DEBUG=True \
  -e ALLOWED_HOSTS=localhost,127.0.0.1,backend \
  -e REDIS_URL=redis://redis:6379/0 \
  --memory=512m \
  --memory-reservation=256m \
  --restart unless-stopped \
  bvs_framework_backend \
  python manage.py runserver 0.0.0.0:8000

wait_for_service bvs_framework_backend_1
echo "Esperando 5 segundos para que el backend esté listo..."
sleep 5

# 5. Frontend con alias
echo ""
echo "5. Iniciando Frontend..."
docker run -d \
  --name bvs_framework_frontend_1 \
  --network bvs_framework_default \
  --network-alias frontend \
  -p 3000:3000 \
  -v /mnt/d/bvs_framework/frontend:/app \
  -v /app/node_modules \
  -v /app/.next \
  -e WATCHPACK_POLLING=true \
  -e NEXT_PUBLIC_API_URL=http://localhost:8000/api \
  -e NEXT_TELEMETRY_DISABLED=1 \
  -e NODE_OPTIONS=--max-old-space-size=768 \
  --add-host host.docker.internal:host-gateway \
  --memory=1g \
  --memory-reservation=512m \
  --restart unless-stopped \
  bvs_framework_frontend \
  npm run dev

wait_for_service bvs_framework_frontend_1

echo ""
echo "==================================================="
echo "Todos los servicios han sido iniciados"
echo "==================================================="
echo ""
echo "Verificando estado..."
docker ps --filter "name=bvs_framework"
echo ""
echo "Uso de recursos:"
docker stats --no-stream
echo ""
echo "Servicios disponibles en:"
echo "  - Frontend:      http://localhost:3000"
echo "  - Backend API:   http://localhost:8000/api"
echo "  - Admin Django:  http://localhost:8000/admin"
echo "  - Elasticsearch: http://localhost:9200"
echo ""
