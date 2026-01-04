#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

clear

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}   TEST DE VELOCIDAD - FRONTEND${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

# Check if frontend is running
if ! docker compose ps frontend | grep -q "Up"; then
    echo -e "${RED}✗ Frontend no está corriendo${NC}"
    echo ""
    echo "Inicia el frontend primero:"
    echo "  docker compose up -d frontend"
    exit 1
fi

echo "Probando velocidad del frontend..."
echo ""

# Test home page
echo -e "${YELLOW}[1/4] Página principal (/)${NC}"
time1=$(curl -s -o /dev/null -w "%{time_total}" http://localhost:3000 2>&1)
echo "  Tiempo: ${time1}s"

sleep 1

# Test login page
echo ""
echo -e "${YELLOW}[2/4] Página de login${NC}"
time2=$(curl -s -o /dev/null -w "%{time_total}" http://localhost:3000/login 2>&1)
echo "  Tiempo: ${time2}s"

sleep 1

# Test home again (cached)
echo ""
echo -e "${YELLOW}[3/4] Página principal (cached)${NC}"
time3=$(curl -s -o /dev/null -w "%{time_total}" http://localhost:3000 2>&1)
echo "  Tiempo: ${time3}s"

sleep 1

# Average of 3 requests
echo ""
echo -e "${YELLOW}[4/4] Promedio de 3 requests${NC}"
total=0
for i in 1 2 3; do
    t=$(curl -s -o /dev/null -w "%{time_total}" http://localhost:3000 2>&1)
    echo "  Request $i: ${t}s"
    total=$(echo "$total + $t" | bc)
    sleep 0.5
done
avg=$(echo "scale=3; $total / 3" | bc)
echo "  Promedio: ${avg}s"

# Analyze results
echo ""
echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}   ANÁLISIS${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

# Determine mode
if (( $(echo "$avg < 2" | bc -l) )); then
    echo -e "${GREEN}✓ MODO PRODUCCIÓN${NC}"
    echo "  - Velocidad: EXCELENTE (${avg}s)"
    echo "  - Build pre-compilado detectado"
    echo "  - Sin tiempos de compilación"
elif (( $(echo "$avg < 5" | bc -l) )); then
    echo -e "${YELLOW}⚠ MODO DESARROLLO (Compilado)${NC}"
    echo "  - Velocidad: BUENA (${avg}s)"
    echo "  - Páginas ya compiladas"
    echo "  - Hot-reload disponible"
else
    echo -e "${RED}⚠ MODO DESARROLLO (Compilando)${NC}"
    echo "  - Velocidad: LENTA (${avg}s)"
    echo "  - Primera compilación en progreso"
    echo "  - Espera a que termine la compilación"
fi

echo ""
echo -e "${BLUE}Modo actual del contenedor:${NC}"
docker compose ps frontend --format "table {{.Service}}\t{{.Status}}\t{{.Command}}" | grep -E "Service|frontend"

echo ""
echo -e "${BLUE}Memoria en uso:${NC}"
docker stats --no-stream --format "table {{.Name}}\t{{.MemUsage}}\t{{.CPUPerc}}" bvs_framework-frontend-1

echo ""
echo -e "${YELLOW}Recomendaciones:${NC}"
if (( $(echo "$avg > 3" | bc -l) )); then
    echo "  - Para velocidad máxima: ./fix-frontend-lento.sh"
    echo "  - Para desarrollo: espera a que compile, luego será rápido"
else
    echo "  - Rendimiento óptimo actual"
    echo "  - No se necesitan cambios"
fi

echo ""
