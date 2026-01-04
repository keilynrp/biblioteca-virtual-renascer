#!/bin/bash

# Script de verificación rápida de acceso
# Verifica si frontend y backend son accesibles

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo "================================================================"
echo -e "${CYAN}     VERIFICACIÓN DE ACCESO - Frontend y Backend${NC}"
echo "================================================================"
echo ""

# Función para test de puerto
test_port() {
    local port=$1
    if timeout 2 bash -c "echo >/dev/tcp/localhost/$port" 2>/dev/null; then
        return 0
    else
        return 1
    fi
}

# Test HTTP
test_http() {
    local url=$1
    if curl -s -f -m 5 "$url" -o /dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

echo -e "${BLUE}[1] Estado de contenedores:${NC}"
echo "================================================================"
docker ps --format "table {{.Names}}\t{{.Status}}" --filter "name=bvs_framework" 2>&1
echo ""

echo -e "${BLUE}[2] Test de puertos TCP:${NC}"
echo "================================================================"
echo -n "Puerto 3000 (Frontend): "
if test_port 3000; then
    echo -e "${GREEN}✓ ABIERTO${NC}"
    FRONTEND_PORT_OK=1
else
    echo -e "${RED}✗ CERRADO${NC}"
    FRONTEND_PORT_OK=0
fi

echo -n "Puerto 8000 (Backend):  "
if test_port 8000; then
    echo -e "${GREEN}✓ ABIERTO${NC}"
    BACKEND_PORT_OK=1
else
    echo -e "${RED}✗ CERRADO${NC}"
    BACKEND_PORT_OK=0
fi
echo ""

echo -e "${BLUE}[3] Test de respuesta HTTP:${NC}"
echo "================================================================"
echo -n "Frontend (http://localhost:3000): "
if test_http "http://localhost:3000"; then
    echo -e "${GREEN}✓ RESPONDE${NC}"
    FRONTEND_HTTP_OK=1
else
    echo -e "${RED}✗ NO RESPONDE${NC}"
    FRONTEND_HTTP_OK=0
fi

echo -n "Backend (http://localhost:8000/admin/): "
if test_http "http://localhost:8000/admin/"; then
    echo -e "${GREEN}✓ RESPONDE${NC}"
    BACKEND_HTTP_OK=1
else
    echo -e "${RED}✗ NO RESPONDE${NC}"
    BACKEND_HTTP_OK=0
fi
echo ""

echo -e "${BLUE}[4] Health Status:${NC}"
echo "================================================================"
echo -n "Frontend: "
FRONTEND_HEALTH=$(docker inspect bvs_framework-frontend-1 -f "{{.State.Health.Status}}" 2>/dev/null || echo "no-healthcheck")
if [ "$FRONTEND_HEALTH" == "healthy" ]; then
    echo -e "${GREEN}$FRONTEND_HEALTH${NC}"
elif [ "$FRONTEND_HEALTH" == "unhealthy" ]; then
    echo -e "${RED}$FRONTEND_HEALTH${NC}"
else
    echo -e "${YELLOW}$FRONTEND_HEALTH${NC}"
fi

echo -n "Backend:  "
BACKEND_HEALTH=$(docker inspect bvs_framework-backend-1 -f "{{.State.Health.Status}}" 2>/dev/null || echo "no-healthcheck")
if [ "$BACKEND_HEALTH" == "healthy" ]; then
    echo -e "${GREEN}$BACKEND_HEALTH${NC}"
elif [ "$BACKEND_HEALTH" == "unhealthy" ]; then
    echo -e "${RED}$BACKEND_HEALTH${NC}"
else
    echo -e "${YELLOW}$BACKEND_HEALTH${NC}"
fi
echo ""

echo -e "${BLUE}[5] Últimos logs (5 líneas cada uno):${NC}"
echo "================================================================"
echo "Frontend:"
docker logs --tail 5 bvs_framework-frontend-1 2>&1
echo ""
echo "Backend:"
docker logs --tail 5 bvs_framework-backend-1 2>&1
echo ""

echo "================================================================"
echo -e "${CYAN}RESUMEN${NC}"
echo "================================================================"
echo ""

if [ $FRONTEND_HTTP_OK -eq 1 ] && [ $BACKEND_HTTP_OK -eq 1 ]; then
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}✓✓✓ TODO FUNCIONA CORRECTAMENTE ✓✓✓${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "Puedes acceder a:"
    echo ""
    echo -e "  ${GREEN}→${NC} Frontend:      ${CYAN}http://localhost:3000${NC}"
    echo -e "  ${GREEN}→${NC} Backend Admin: ${CYAN}http://localhost:8000/admin/${NC}"
    echo -e "  ${GREEN}→${NC} API Docs:      ${CYAN}http://localhost:8000/api/docs/${NC}"
    echo -e "  ${GREEN}→${NC} API Root:      ${CYAN}http://localhost:8000/api/${NC}"
    echo ""
elif [ $FRONTEND_HTTP_OK -eq 1 ]; then
    echo -e "${YELLOW}⚠ FUNCIONAMIENTO PARCIAL${NC}"
    echo ""
    echo -e "Frontend: ${GREEN}✓ FUNCIONA${NC}"
    echo -e "Backend:  ${RED}✗ PROBLEMA${NC}"
    echo ""
    echo "Acciones recomendadas:"
    echo "  1. Diagnosticar backend: bash diagnostico-backend.sh"
    echo "  2. Reiniciar backend:    docker-compose restart backend"
    echo "  3. Fix automático:       bash fix-servicios-completo.sh"
elif [ $BACKEND_HTTP_OK -eq 1 ]; then
    echo -e "${YELLOW}⚠ FUNCIONAMIENTO PARCIAL${NC}"
    echo ""
    echo -e "Frontend: ${RED}✗ PROBLEMA${NC}"
    echo -e "Backend:  ${GREEN}✓ FUNCIONA${NC}"
    echo ""
    echo "Acciones recomendadas:"
    echo "  1. Reiniciar frontend: docker-compose restart frontend"
    echo "  2. Ver logs:           docker-compose logs frontend"
    echo "  3. Fix automático:     bash fix-servicios-completo.sh"
else
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}✗✗✗ AMBOS SERVICIOS CON PROBLEMAS ✗✗✗${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "Acciones recomendadas (en orden):"
    echo ""
    echo -e "  ${YELLOW}1.${NC} Fix automático (recomendado):"
    echo "     bash fix-servicios-completo.sh"
    echo ""
    echo -e "  ${YELLOW}2.${NC} Diagnóstico completo:"
    echo "     bash diagnostico-puertos.sh"
    echo ""
    echo -e "  ${YELLOW}3.${NC} Reset completo (último recurso):"
    echo "     bash reset-completo.sh"
fi

echo ""
echo "================================================================"
