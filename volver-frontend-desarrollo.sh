#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

clear

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}   VOLVER A MODO DESARROLLO${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""
echo "Este script restaura el frontend a modo desarrollo"
echo "con hot-reload habilitado."
echo ""
echo -e "${YELLOW}ADVERTENCIA:${NC}"
echo "  - Primera carga será lenta de nuevo (10-30s)"
echo "  - Pero tendrás hot-reload para desarrollo"
echo ""
read -p "¿Continuar? (Enter para sí, Ctrl+C para cancelar) " -r
echo ""

# Remove override file
echo "[1/3] Eliminando configuración de producción..."
if [ -f "docker-compose.override.yml" ]; then
    rm docker-compose.override.yml
    echo -e "${GREEN}✓${NC} Override eliminado"
else
    echo -e "${YELLOW}⚠${NC} No se encontró override (ya estás en modo desarrollo)"
fi

# Restart frontend
echo ""
echo "[2/3] Reiniciando frontend en modo desarrollo..."
docker compose up -d --force-recreate frontend

# Wait for startup
echo ""
echo "[3/3] Esperando que inicie (15 seg)..."
sleep 15

# Verify
echo ""
echo -e "${BLUE}============================================${NC}"
echo -e "${GREEN}   ✓ FRONTEND EN MODO DESARROLLO${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""
echo "Estado:"
docker compose ps frontend

echo ""
echo "Logs recientes:"
docker compose logs frontend --tail 20

echo ""
echo -e "${GREEN}✓${NC} Frontend ahora está en modo desarrollo"
echo -e "${GREEN}✓${NC} Hot-reload habilitado"
echo -e "${YELLOW}⚠${NC} Primera carga será lenta (normal)"
echo ""
echo -e "${GREEN}URL: http://localhost:3000${NC}"
echo ""
