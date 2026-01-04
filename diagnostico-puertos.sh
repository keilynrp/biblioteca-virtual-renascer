#!/bin/bash

# Script de diagnóstico completo de puertos
# Detecta por qué frontend y backend no responden

set -e

echo "================================================================"
echo "     DIAGNÓSTICO COMPLETO DE PUERTOS"
echo "================================================================"
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para verificar si docker está disponible
check_docker() {
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}[ERROR]${NC} Docker no está instalado o no está en el PATH"
        echo "Intenta ejecutar desde Windows: docker ps"
        exit 1
    fi
}

# Función para test de puerto
test_port() {
    local port=$1
    local name=$2

    if timeout 2 bash -c "echo >/dev/tcp/localhost/$port" 2>/dev/null; then
        echo -e "${GREEN}[✓]${NC} Puerto $port ($name): ABIERTO"
        return 0
    else
        echo -e "${RED}[✗]${NC} Puerto $port ($name): CERRADO"
        return 1
    fi
}

# Verificar Docker
check_docker

echo -e "${BLUE}[1] Estado de contenedores Docker:${NC}"
echo "================================================================"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>&1 || echo "Error al obtener estado de contenedores"
echo ""

echo -e "${BLUE}[2] Test de puertos:${NC}"
echo "================================================================"
test_port 3000 "Frontend"
FRONTEND_OK=$?
test_port 8000 "Backend"
BACKEND_OK=$?
echo ""

echo -e "${BLUE}[3] Health Status:${NC}"
echo "================================================================"
echo -n "Frontend: "
docker inspect bvs_framework-frontend-1 -f "{{.State.Health.Status}}" 2>/dev/null || echo "No disponible"
echo -n "Backend: "
docker inspect bvs_framework-backend-1 -f "{{.State.Health.Status}}" 2>/dev/null || echo "No disponible"
echo ""

echo -e "${BLUE}[4] Logs del Frontend (últimas 30 líneas):${NC}"
echo "================================================================"
docker logs --tail 30 bvs_framework-frontend-1 2>&1
echo ""

echo -e "${BLUE}[5] Logs del Backend (últimas 30 líneas):${NC}"
echo "================================================================"
docker logs --tail 30 bvs_framework-backend-1 2>&1
echo ""

echo -e "${BLUE}[6] Verificando procesos DENTRO de los contenedores:${NC}"
echo "================================================================"
echo "Backend (Python/Django):"
docker exec bvs_framework-backend-1 ps aux 2>&1 | grep -E "python|gunicorn" || echo "No se encontraron procesos Python"
echo ""
echo "Frontend (Node/npm):"
docker exec bvs_framework-frontend-1 ps aux 2>&1 | grep -E "node|npm" || echo "No se encontraron procesos Node"
echo ""

echo -e "${BLUE}[7] Verificando puertos DENTRO de los contenedores:${NC}"
echo "================================================================"
echo "Backend puerto 8000:"
docker exec bvs_framework-backend-1 sh -c "netstat -tln 2>/dev/null | grep ':8000' || ss -tln 2>/dev/null | grep ':8000' || echo 'Puerto 8000 NO está escuchando dentro del contenedor'"
echo ""
echo "Frontend puerto 3000:"
docker exec bvs_framework-frontend-1 sh -c "netstat -tln 2>/dev/null | grep ':3000' || ss -tln 2>/dev/null | grep ':3000' || echo 'Puerto 3000 NO está escuchando dentro del contenedor'"
echo ""

echo -e "${BLUE}[8] Estado de servicios dependientes:${NC}"
echo "================================================================"
docker ps --format "table {{.Names}}\t{{.Status}}" --filter "name=bvs_framework" 2>&1
echo ""

echo "================================================================"
echo -e "${YELLOW}RESUMEN DEL DIAGNÓSTICO${NC}"
echo "================================================================"

if [ $FRONTEND_OK -eq 0 ] && [ $BACKEND_OK -eq 0 ]; then
    echo -e "${GREEN}✓ Ambos servicios están respondiendo correctamente${NC}"
    echo ""
    echo "Puedes acceder a:"
    echo "  - Frontend: http://localhost:3000"
    echo "  - Backend:  http://localhost:8000/admin/"
elif [ $FRONTEND_OK -eq 0 ]; then
    echo -e "${YELLOW}⚠ Frontend responde pero Backend NO${NC}"
    echo ""
    echo "El problema está en el Backend. Revisa los logs arriba."
    echo "Causas comunes:"
    echo "  - Django no arrancó correctamente"
    echo "  - Error en el código Python"
    echo "  - Base de datos no accesible"
    echo "  - Healthcheck fallando"
elif [ $BACKEND_OK -eq 0 ]; then
    echo -e "${YELLOW}⚠ Backend responde pero Frontend NO${NC}"
    echo ""
    echo "El problema está en el Frontend. Revisa los logs arriba."
    echo "Causas comunes:"
    echo "  - Next.js no arrancó correctamente"
    echo "  - Error en el código JavaScript"
    echo "  - Dependencias faltantes"
else
    echo -e "${RED}✗ AMBOS servicios NO están respondiendo${NC}"
    echo ""
    echo "Revisa los logs arriba para identificar los errores."
    echo ""
    echo "Ejecuta la solución automática:"
    echo "  bash fix-servicios-completo.sh"
fi

echo "================================================================"
