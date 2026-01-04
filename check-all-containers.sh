#!/bin/bash

echo "============================================================"
echo "Estado Completo de Contenedores Docker"
echo "============================================================"
echo ""

# Verificar que Docker este corriendo
if ! docker ps &> /dev/null; then
    echo "ERROR: Docker no esta corriendo."
    echo ""
    echo "Ejecuta:"
    echo "  sudo service docker start"
    echo ""
    exit 1
fi

echo "[1] Contenedores en ejecucion:"
echo "============================================================"
docker compose ps

echo ""
echo "[2] Estado detallado de cada servicio:"
echo "============================================================"

services=("backend" "frontend" "db" "redis" "elasticsearch")

for service in "${services[@]}"; do
    echo ""
    echo "--- $service ---"
    status=$(docker compose ps $service --format json 2>/dev/null | grep -o '"State":"[^"]*' | cut -d'"' -f4)
    if [ -n "$status" ]; then
        echo "Estado: $status"
        if [ "$status" = "running" ]; then
            echo "✓ Corriendo"
        else
            echo "✗ No esta corriendo"
        fi
    else
        echo "✗ Contenedor no encontrado"
    fi
done

echo ""
echo "[3] Uso de recursos:"
echo "============================================================"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}" 2>/dev/null

echo ""
echo "[4] Puertos expuestos:"
echo "============================================================"
docker compose ps --format "table {{.Service}}\t{{.Ports}}"

echo ""
echo "[5] Verificando conectividad de servicios:"
echo "============================================================"

# Backend
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8000 2>/dev/null | grep -q "200\|301\|302"; then
    echo "✓ Backend (8000): Respondiendo"
else
    echo "✗ Backend (8000): No responde"
fi

# Frontend
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null | grep -q "200\|301\|302"; then
    echo "✓ Frontend (3000): Respondiendo"
else
    echo "✗ Frontend (3000): No responde"
fi

# PostgreSQL
if docker compose exec db pg_isready -U postgres &>/dev/null; then
    echo "✓ PostgreSQL (5432): Respondiendo"
else
    echo "✗ PostgreSQL (5432): No responde"
fi

# Redis
if docker compose exec redis redis-cli ping &>/dev/null | grep -q "PONG"; then
    echo "✓ Redis (6379): Respondiendo"
else
    echo "✗ Redis (6379): No responde"
fi

# Elasticsearch
if curl -s http://localhost:9200 &>/dev/null; then
    echo "✓ Elasticsearch (9200): Respondiendo"
else
    echo "✗ Elasticsearch (9200): No responde"
fi

echo ""
echo "[6] Ultimos errores en logs (si hay):"
echo "============================================================"

for service in "${services[@]}"; do
    errors=$(docker compose logs --tail=20 $service 2>/dev/null | grep -i "error\|exception\|failed" | head -3)
    if [ -n "$errors" ]; then
        echo ""
        echo "--- Errores en $service ---"
        echo "$errors"
    fi
done

echo ""
echo "============================================================"
echo "Resumen"
echo "============================================================"

running_count=$(docker compose ps --format json 2>/dev/null | grep -c '"State":"running"')
total_count=${#services[@]}

echo ""
echo "Contenedores corriendo: $running_count / $total_count"
echo ""

if [ "$running_count" -eq "$total_count" ]; then
    echo "✓ Todos los servicios estan corriendo"
    echo ""
    echo "Accede a:"
    echo "  - Frontend: http://localhost:3000"
    echo "  - Backend API: http://localhost:8000/api"
    echo "  - Admin Django: http://localhost:8000/admin"
else
    echo "✗ Algunos servicios no estan corriendo"
    echo ""
    echo "Para ver logs de un servicio especifico:"
    echo "  docker compose logs -f [servicio]"
    echo ""
    echo "Para reiniciar un servicio:"
    echo "  docker compose restart [servicio]"
fi

echo ""
