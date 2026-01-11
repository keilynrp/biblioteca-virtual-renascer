#!/bin/bash

echo "=========================================="
echo "🔍 DIAGNÓSTICO COMPLETO DE SERVICIOS"
echo "=========================================="
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "1️⃣  ESTADO DE CONTENEDORES"
echo "=========================================="
sudo docker-compose ps
echo ""

echo "2️⃣  VERIFICACIÓN DE PUERTOS"
echo "=========================================="
services=(
    "PostgreSQL:5432"
    "Redis:6379"
    "Elasticsearch:9200"
    "Backend:8000"
    "Frontend:3000"
)

for service in "${services[@]}"; do
    name="${service%%:*}"
    port="${service##*:}"
    if nc -zv localhost "$port" 2>&1 | grep -q succeeded || timeout 1 bash -c "echo >/dev/tcp/localhost/$port" 2>/dev/null; then
        echo -e "${GREEN}✅ $name (puerto $port) - Accesible${NC}"
    else
        echo -e "${RED}❌ $name (puerto $port) - No accesible${NC}"
    fi
done
echo ""

echo "3️⃣  VERIFICACIÓN DE SERVICIOS HTTP"
echo "=========================================="

# Elasticsearch
echo "📍 Elasticsearch (http://localhost:9200):"
curl -s http://localhost:9200 | jq -r '"\(.name) - Cluster: \(.cluster_name) - Version: \(.version.number)"' 2>/dev/null || echo "No responde o error en formato"
echo ""

# Backend Django
echo "📍 Backend Django (http://localhost:8000):"
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000 2>/dev/null)
if [ "$response" != "000" ]; then
    echo -e "${GREEN}HTTP Status: $response${NC}"
else
    echo -e "${RED}No hay respuesta HTTP${NC}"
fi

# Intentar diferentes endpoints
echo "  Probando endpoints:"
for endpoint in "/" "/api/" "/admin/" "/api/health/" "/health/"; do
    status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000$endpoint 2>/dev/null)
    if [ "$status" != "000" ] && [ "$status" != "404" ]; then
        echo -e "    $endpoint -> ${GREEN}$status${NC}"
    elif [ "$status" == "404" ]; then
        echo "    $endpoint -> 404"
    else
        echo -e "    $endpoint -> ${RED}Sin respuesta${NC}"
    fi
done
echo ""

# Frontend Next.js
echo "📍 Frontend Next.js (http://localhost:3000):"
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null)
if [ "$response" == "200" ]; then
    echo -e "${GREEN}HTTP Status: $response - OK${NC}"
else
    echo -e "${YELLOW}HTTP Status: $response${NC}"
fi
echo ""

echo "4️⃣  LOGS RECIENTES (últimas 30 líneas)"
echo "=========================================="

echo "🔴 BACKEND:"
echo "----------------------------------------"
sudo docker-compose logs --tail=30 backend
echo ""

echo "🔵 FRONTEND:"
echo "----------------------------------------"
sudo docker-compose logs --tail=30 frontend
echo ""

echo "🟢 POSTGRESQL:"
echo "----------------------------------------"
sudo docker-compose logs --tail=15 db
echo ""

echo "🟡 REDIS:"
echo "----------------------------------------"
sudo docker-compose logs --tail=15 redis
echo ""

echo "🟣 ELASTICSEARCH:"
echo "----------------------------------------"
sudo docker-compose logs --tail=15 elasticsearch
echo ""

echo "5️⃣  INFORMACIÓN DE CONTENEDORES"
echo "=========================================="
sudo docker stats --no-stream
echo ""

echo "6️⃣  VERIFICACIÓN DE CONECTIVIDAD INTERNA"
echo "=========================================="

# PostgreSQL
echo "🐘 PostgreSQL:"
sudo docker-compose exec -T db pg_isready -U postgres || echo "PostgreSQL no está listo"
echo ""

# Redis
echo "📦 Redis:"
sudo docker-compose exec -T redis redis-cli ping || echo "Redis no responde"
echo ""

# Verificar que el backend puede conectarse a la DB
echo "🔗 Backend -> PostgreSQL:"
sudo docker-compose exec -T backend python manage.py check --database default 2>&1 | tail -5
echo ""

echo "=========================================="
echo "✅ DIAGNÓSTICO COMPLETO"
echo "=========================================="
