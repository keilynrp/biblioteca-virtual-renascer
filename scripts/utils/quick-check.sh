#!/bin/bash

echo "🔍 Verificación Rápida de Servicios"
echo "======================================"
echo ""

# Estado de contenedores
echo "📦 Contenedores Activos:"
sudo docker ps --filter "name=bvs" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""

# Verificación rápida de puertos
echo "🔌 Servicios Accesibles:"
echo ""

check_service() {
    local name=$1
    local port=$2
    if nc -zv localhost $port 2>&1 | grep -q succeeded; then
        echo "✅ $name (puerto $port) - Activo"
    else
        echo "❌ $name (puerto $port) - No accesible"
    fi
}

check_service "PostgreSQL" 5432
check_service "Redis" 6379
check_service "Elasticsearch" 9200
check_service "Backend Django" 8000
check_service "Frontend Next.js" 3000

echo ""
echo "======================================"
