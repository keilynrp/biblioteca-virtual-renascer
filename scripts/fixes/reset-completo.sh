#!/bin/bash

# Reset completo del sistema
# Usa esto solo si nada más funciona

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo "================================================================"
echo -e "${RED}     RESET COMPLETO DEL SISTEMA${NC}"
echo "================================================================"
echo ""
echo -e "${YELLOW}⚠ ADVERTENCIA ⚠${NC}"
echo "Este script va a:"
echo "  1. Detener todos los contenedores"
echo "  2. Eliminar contenedores"
echo "  3. Limpiar volúmenes de desarrollo (NO datos de DB)"
echo "  4. Reconstruir e iniciar todo desde cero"
echo ""
echo -e "${YELLOW}Los datos de la base de datos NO se perderán.${NC}"
echo ""
read -p "¿Estás seguro? (escribe 'si' para continuar): " confirm

if [ "$confirm" != "si" ]; then
    echo "Operación cancelada."
    exit 0
fi

echo ""
echo -e "${BLUE}[Paso 1/8] Deteniendo todos los contenedores...${NC}"
echo "================================================================"
docker-compose down
echo -e "${GREEN}✓ Contenedores detenidos${NC}"
echo ""

echo -e "${BLUE}[Paso 2/8] Limpiando contenedores, redes y volúmenes temporales...${NC}"
echo "================================================================"
docker-compose down -v --remove-orphans
echo -e "${GREEN}✓ Limpieza completada${NC}"
echo ""

echo -e "${BLUE}[Paso 3/8] Reconstruyendo imágenes (esto puede tomar varios minutos)...${NC}"
echo "================================================================"
docker-compose build --no-cache backend frontend
echo -e "${GREEN}✓ Imágenes reconstruidas${NC}"
echo ""

echo -e "${BLUE}[Paso 4/8] Iniciando servicios de base (DB, Redis, Elasticsearch)...${NC}"
echo "================================================================"
docker-compose up -d db redis elasticsearch
echo "Esperando 15 segundos para que estén listos..."
sleep 15
echo -e "${GREEN}✓ Servicios de base iniciados${NC}"
echo ""

echo -e "${BLUE}[Paso 5/8] Iniciando Backend...${NC}"
echo "================================================================"
docker-compose up -d backend
echo "Esperando 20 segundos para que Backend esté listo..."
sleep 20
echo ""
echo "Logs del Backend:"
docker logs --tail 20 bvs_framework-backend-1
echo ""

echo -e "${BLUE}[Paso 6/8] Aplicando migraciones de Django...${NC}"
echo "================================================================"
docker-compose exec -T backend python manage.py migrate
echo -e "${GREEN}✓ Migraciones aplicadas${NC}"
echo ""

echo -e "${BLUE}[Paso 7/8] Iniciando Frontend...${NC}"
echo "================================================================"
docker-compose up -d frontend
echo "Esperando 15 segundos para que Frontend esté listo..."
sleep 15
echo ""
echo "Logs del Frontend:"
docker logs --tail 20 bvs_framework-frontend-1
echo ""

echo -e "${BLUE}[Paso 8/8] Verificación final...${NC}"
echo "================================================================"

# Esperar un poco más
echo "Esperando 10 segundos adicionales..."
sleep 10

# Test de puertos
echo ""
echo "Probando puertos..."
FRONTEND_OK=0
BACKEND_OK=0

if timeout 2 bash -c "echo >/dev/tcp/localhost/3000" 2>/dev/null; then
    echo -e "${GREEN}✓ Frontend respondiendo en puerto 3000${NC}"
    FRONTEND_OK=1
else
    echo -e "${RED}✗ Frontend NO responde en puerto 3000${NC}"
fi

if timeout 2 bash -c "echo >/dev/tcp/localhost/8000" 2>/dev/null; then
    echo -e "${GREEN}✓ Backend respondiendo en puerto 8000${NC}"
    BACKEND_OK=1
else
    echo -e "${RED}✗ Backend NO responde en puerto 8000${NC}"
fi

echo ""
echo "Estado de contenedores:"
docker-compose ps
echo ""

echo "================================================================"
echo -e "${CYAN}RESULTADO DEL RESET${NC}"
echo "================================================================"
echo ""

if [ $FRONTEND_OK -eq 1 ] && [ $BACKEND_OK -eq 1 ]; then
    echo -e "${GREEN}✓✓✓ ÉXITO - Sistema completamente funcional ✓✓✓${NC}"
    echo ""
    echo "Puedes acceder a:"
    echo -e "  ${GREEN}→${NC} Frontend:      http://localhost:3000"
    echo -e "  ${GREEN}→${NC} Backend Admin: http://localhost:8000/admin/"
    echo -e "  ${GREEN}→${NC} API Docs:      http://localhost:8000/api/docs/"
    echo ""
    echo "Puede que necesites crear un superusuario:"
    echo "  docker-compose exec backend python manage.py createsuperuser"
else
    echo -e "${RED}⚠ El reset completó pero hay problemas${NC}"
    echo ""
    if [ $FRONTEND_OK -eq 0 ]; then
        echo -e "Frontend: ${RED}✗ NO RESPONDE${NC}"
        echo "Ver logs: docker-compose logs frontend"
    fi
    if [ $BACKEND_OK -eq 0 ]; then
        echo -e "Backend: ${RED}✗ NO RESPONDE${NC}"
        echo "Ver logs: docker-compose logs backend"
    fi
    echo ""
    echo "Ejecuta diagnóstico:"
    echo "  bash diagnostico-puertos.sh"
fi

echo "================================================================"
