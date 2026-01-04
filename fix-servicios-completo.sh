#!/bin/bash

# Script de solución definitiva para servicios que no responden
# Arregla frontend y backend automáticamente

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo "================================================================"
echo -e "${CYAN}     SOLUCIÓN DEFINITIVA - Frontend y Backend${NC}"
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

# Función para esperar que un puerto esté disponible
wait_for_port() {
    local port=$1
    local service=$2
    local max_attempts=30
    local attempt=1

    echo -e "${YELLOW}Esperando que $service responda en puerto $port...${NC}"

    while [ $attempt -le $max_attempts ]; do
        if test_port $port; then
            echo -e "${GREEN}✓ $service respondiendo en puerto $port${NC}"
            return 0
        fi
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done

    echo ""
    echo -e "${RED}✗ Timeout esperando $service en puerto $port${NC}"
    return 1
}

# Paso 1: Verificar estado actual
echo -e "${BLUE}[Paso 1/6] Verificando estado actual...${NC}"
echo "================================================================"
docker ps --format "table {{.Names}}\t{{.Status}}" --filter "name=bvs_framework"
echo ""

# Paso 2: Detener servicios problemáticos
echo -e "${BLUE}[Paso 2/6] Deteniendo servicios...${NC}"
echo "================================================================"
docker-compose stop frontend backend
echo -e "${GREEN}✓ Servicios detenidos${NC}"
echo ""

# Paso 3: Verificar dependencias
echo -e "${BLUE}[Paso 3/6] Verificando dependencias (DB, Redis, Elasticsearch)...${NC}"
echo "================================================================"

# Asegurar que las dependencias estén corriendo
docker-compose up -d db redis elasticsearch

echo "Esperando 10 segundos para que las dependencias estén listas..."
sleep 10

# Verificar estado de dependencias
echo ""
echo "Estado de dependencias:"
docker ps --format "{{.Names}}: {{.Status}}" --filter "name=db"
docker ps --format "{{.Names}}: {{.Status}}" --filter "name=redis"
docker ps --format "{{.Names}}: {{.Status}}" --filter "name=elasticsearch"
echo ""

# Paso 4: Iniciar Backend
echo -e "${BLUE}[Paso 4/6] Iniciando Backend...${NC}"
echo "================================================================"
docker-compose up -d backend

if wait_for_port 8000 "Backend"; then
    echo ""
    echo "Logs recientes del Backend:"
    docker logs --tail 15 bvs_framework-backend-1
    echo ""
else
    echo ""
    echo -e "${RED}[ERROR] Backend no respondió a tiempo${NC}"
    echo ""
    echo "Logs del Backend:"
    docker logs --tail 30 bvs_framework-backend-1
    echo ""
    echo -e "${YELLOW}Intentando recrear el contenedor...${NC}"
    docker-compose up -d --force-recreate backend
    wait_for_port 8000 "Backend" || true
fi
echo ""

# Paso 5: Iniciar Frontend
echo -e "${BLUE}[Paso 5/6] Iniciando Frontend...${NC}"
echo "================================================================"
docker-compose up -d frontend

if wait_for_port 3000 "Frontend"; then
    echo ""
    echo "Logs recientes del Frontend:"
    docker logs --tail 15 bvs_framework-frontend-1
    echo ""
else
    echo ""
    echo -e "${RED}[ERROR] Frontend no respondió a tiempo${NC}"
    echo ""
    echo "Logs del Frontend:"
    docker logs --tail 30 bvs_framework-frontend-1
    echo ""
    echo -e "${YELLOW}Intentando recrear el contenedor...${NC}"
    docker-compose up -d --force-recreate frontend
    wait_for_port 3000 "Frontend" || true
fi
echo ""

# Paso 6: Verificación final
echo -e "${BLUE}[Paso 6/6] Verificación final...${NC}"
echo "================================================================"

FRONTEND_OK=0
BACKEND_OK=0

echo -n "Test Frontend (puerto 3000): "
if test_port 3000; then
    echo -e "${GREEN}✓ FUNCIONANDO${NC}"
    FRONTEND_OK=1
else
    echo -e "${RED}✗ NO RESPONDE${NC}"
fi

echo -n "Test Backend (puerto 8000): "
if test_port 8000; then
    echo -e "${GREEN}✓ FUNCIONANDO${NC}"
    BACKEND_OK=1
else
    echo -e "${RED}✗ NO RESPONDE${NC}"
fi

echo ""
echo "================================================================"
echo -e "${CYAN}RESUMEN FINAL${NC}"
echo "================================================================"
echo ""

if [ $FRONTEND_OK -eq 1 ] && [ $BACKEND_OK -eq 1 ]; then
    echo -e "${GREEN}✓✓✓ ÉXITO - Ambos servicios funcionando correctamente ✓✓✓${NC}"
    echo ""
    echo "Puedes acceder a:"
    echo -e "  ${GREEN}→${NC} Frontend:      http://localhost:3000"
    echo -e "  ${GREEN}→${NC} Backend Admin: http://localhost:8000/admin/"
    echo -e "  ${GREEN}→${NC} API Docs:      http://localhost:8000/api/docs/"
    echo ""
    echo "Estado de todos los contenedores:"
    docker-compose ps
elif [ $FRONTEND_OK -eq 1 ]; then
    echo -e "${YELLOW}⚠ PARCIAL - Solo Frontend funciona${NC}"
    echo ""
    echo -e "Frontend: ${GREEN}✓ OK${NC}"
    echo -e "Backend:  ${RED}✗ PROBLEMA${NC}"
    echo ""
    echo "Para diagnosticar el Backend ejecuta:"
    echo "  bash diagnostico-backend.sh"
elif [ $BACKEND_OK -eq 1 ]; then
    echo -e "${YELLOW}⚠ PARCIAL - Solo Backend funciona${NC}"
    echo ""
    echo -e "Frontend: ${RED}✗ PROBLEMA${NC}"
    echo -e "Backend:  ${GREEN}✓ OK${NC}"
    echo ""
    echo "Para diagnosticar el Frontend ejecuta:"
    echo "  bash diagnostico-puertos.sh"
else
    echo -e "${RED}✗✗✗ ERROR - Ningún servicio responde ✗✗✗${NC}"
    echo ""
    echo "Ejecuta el diagnóstico completo:"
    echo "  bash diagnostico-puertos.sh"
    echo ""
    echo "O intenta un reset completo:"
    echo "  bash reset-completo.sh"
fi

echo "================================================================"
