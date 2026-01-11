#!/bin/bash

# Quick start script - optimized frontend in production mode
# This is a simplified version for quick execution

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🚀 Quick Start - Frontend Producción${NC}"
echo ""

# Check if build exists
if [ ! -d "frontend/.next" ]; then
    echo -e "${YELLOW}⚠ Build no existe. Ejecutando build completo...${NC}"
    echo "Esto tomará 3-5 minutos..."
    echo ""
    docker compose exec frontend npm run build || {
        echo "Build con más memoria..."
        docker compose exec frontend sh -c "NODE_OPTIONS='--max-old-space-size=6144' npm run build"
    }
fi

# Create override
cat > docker-compose.override.yml <<EOF
services:
  frontend:
    command: npm run start
    environment:
      - NODE_ENV=production
EOF

echo -e "${GREEN}✓${NC} Override creado"

# Restart
docker compose up -d --force-recreate frontend

echo ""
echo -e "${GREEN}✓ Frontend en modo producción${NC}"
echo ""
echo "Esperando 15 segundos..."
sleep 15

# Test
response=$(curl -s -o /dev/null -w "%{time_total}" http://localhost:3000)
echo -e "Velocidad: ${GREEN}${response}s${NC}"
echo ""
echo -e "${BLUE}URL: http://localhost:3000${NC}"
