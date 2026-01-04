#!/bin/bash

echo "=========================================="
echo "🔍 Verificación de Servicios Docker"
echo "=========================================="
echo ""

# Verificar estado de contenedores
echo "📦 Estado de Contenedores:"
echo "------------------------------------------"
sudo docker-compose ps
echo ""

# Verificar logs recientes de cada servicio
echo "📋 Logs Recientes de Backend:"
echo "------------------------------------------"
sudo docker-compose logs --tail=20 backend
echo ""

echo "📋 Logs Recientes de Frontend:"
echo "------------------------------------------"
sudo docker-compose logs --tail=20 frontend
echo ""

echo "📋 Logs Recientes de PostgreSQL:"
echo "------------------------------------------"
sudo docker-compose logs --tail=10 db
echo ""

echo "📋 Logs Recientes de Redis:"
echo "------------------------------------------"
sudo docker-compose logs --tail=10 redis
echo ""

echo "📋 Logs Recientes de Elasticsearch:"
echo "------------------------------------------"
sudo docker-compose logs --tail=10 elasticsearch
echo ""

# Verificar conectividad de servicios
echo "🔌 Verificando Conectividad:"
echo "------------------------------------------"

echo "✓ PostgreSQL (puerto 5432):"
sudo docker-compose exec -T db pg_isready -U postgres
echo ""

echo "✓ Redis (puerto 6379):"
sudo docker-compose exec -T redis redis-cli ping
echo ""

echo "✓ Elasticsearch (puerto 9200):"
curl -s http://localhost:9200/_cluster/health?pretty | grep -E "status|cluster_name"
echo ""

echo "✓ Backend Django (puerto 8000):"
curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost:8000/api/ || echo "No accesible"
echo ""

echo "✓ Frontend Next.js (puerto 3000):"
curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost:3000/ || echo "No accesible"
echo ""

# Verificar uso de recursos
echo "💻 Uso de Recursos:"
echo "------------------------------------------"
sudo docker stats --no-stream
echo ""

echo "=========================================="
echo "✅ Verificación Completa"
echo "=========================================="
