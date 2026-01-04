#!/bin/bash

# Script para reconstruir completamente el frontend

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}================================================================================${NC}"
echo -e "${GREEN}   🔨 RECONSTRUCCIÓN COMPLETA DEL FRONTEND${NC}"
echo -e "${BLUE}================================================================================${NC}"
echo ""

echo -e "${YELLOW}Este script va a:${NC}"
echo "  1. Detener el contenedor del frontend"
echo "  2. Eliminar la imagen anterior"
echo "  3. Reconstruir desde cero"
echo "  4. Iniciar con los nuevos cambios"
echo ""
read -p "¿Continuar? (s/n): " confirm

if [[ $confirm != "s" && $confirm != "S" ]]; then
    echo "Operación cancelada"
    exit 0
fi

echo ""
echo -e "${YELLOW}[1/4] Deteniendo frontend...${NC}"
docker compose stop frontend

echo ""
echo -e "${YELLOW}[2/4] Eliminando imagen anterior...${NC}"
docker compose rm -f frontend
docker rmi bvs_framework-frontend 2>/dev/null || true

echo ""
echo -e "${YELLOW}[3/4] Reconstruyendo desde cero...${NC}"
echo -e "${CYAN}Esto puede tardar 3-5 minutos...${NC}"
docker compose build --no-cache frontend

if [ $? -ne 0 ]; then
    echo ""
    echo -e "${RED}❌ Error al reconstruir el frontend${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}[4/4] Iniciando frontend...${NC}"
docker compose up -d frontend

echo ""
echo -e "${YELLOW}Esperando a que esté listo...${NC}"
sleep 15

echo ""
echo -e "${GREEN}✅ Frontend reconstruido completamente${NC}"
echo ""
echo "Ahora:"
echo "  1. Ve a http://localhost:3000"
echo "  2. Haz Ctrl+Shift+R (recarga fuerte)"
echo "  3. Cierra sesión e inicia sesión de nuevo"
echo "  4. Busca 'Panel Admin' en el menú"
echo ""
