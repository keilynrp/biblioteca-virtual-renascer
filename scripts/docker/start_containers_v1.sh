#!/bin/bash
#
# Script para levantar los contenedores después del fix
# Compatible con docker-compose v1 (con guión)
#
# Uso: ./start_containers_v1.sh [opciones]
#
# Opciones:
#   --rebuild    Reconstruir todas las imágenes desde cero (sin caché)
#   --backend    Solo reconstruir y levantar el backend
#   --clean      Limpiar volúmenes y empezar desde cero
#

set -e

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Detectar comando de Docker Compose
DOCKER_COMPOSE="docker-compose"
if ! command -v docker-compose &> /dev/null; then
    if docker compose version &> /dev/null; then
        DOCKER_COMPOSE="docker compose"
    else
        echo "Error: docker-compose no está instalado"
        exit 1
    fi
fi

echo "Usando comando: $DOCKER_COMPOSE"

# Opciones
REBUILD_ALL=false
REBUILD_BACKEND=true
CLEAN_VOLUMES=false
BACKEND_ONLY=false

# Procesar argumentos
for arg in "$@"; do
    case $arg in
        --rebuild)
            REBUILD_ALL=true
            shift
            ;;
        --backend)
            BACKEND_ONLY=true
            shift
            ;;
        --clean)
            CLEAN_VOLUMES=true
            shift
            ;;
        --help|-h)
            echo "Uso: $0 [opciones]"
            echo ""
            echo "Opciones:"
            echo "  --rebuild    Reconstruir todas las imágenes desde cero"
            echo "  --backend    Solo reconstruir y levantar el backend"
            echo "  --clean      Limpiar volúmenes y empezar desde cero"
            echo "  --help       Mostrar esta ayuda"
            exit 0
            ;;
    esac
done

echo "=========================================="
echo "Levantando contenedores con el fix aplicado"
echo "=========================================="
echo ""

# Detener contenedores existentes
echo -e "${BLUE}[1/6] Deteniendo contenedores existentes...${NC}"
$DOCKER_COMPOSE down
echo -e "${GREEN}✓ Contenedores detenidos${NC}"

# Limpiar volúmenes si se solicitó
if [ "$CLEAN_VOLUMES" = true ]; then
    echo ""
    echo -e "${YELLOW}[2/6] Limpiando volúmenes (se perderán los datos)...${NC}"
    echo "⚠ Esta operación eliminará todos los datos de la base de datos"
    read -p "¿Estás seguro? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        $DOCKER_COMPOSE down -v
        echo -e "${GREEN}✓ Volúmenes eliminados${NC}"
    else
        echo "Operación cancelada"
    fi
else
    echo ""
    echo -e "${BLUE}[2/6] Manteniendo volúmenes existentes${NC}"
fi

# Reconstruir backend (siempre, porque tiene el fix)
echo ""
echo -e "${BLUE}[3/6] Reconstruyendo backend con el fix de apt_pkg...${NC}"
if [ "$REBUILD_ALL" = true ]; then
    echo "Reconstruyendo sin caché..."
    $DOCKER_COMPOSE build --no-cache backend
else
    $DOCKER_COMPOSE build backend
fi
echo -e "${GREEN}✓ Backend reconstruido${NC}"

# Reconstruir frontend si se solicitó
if [ "$REBUILD_ALL" = true ] && [ "$BACKEND_ONLY" = false ]; then
    echo ""
    echo -e "${BLUE}[4/6] Reconstruyendo frontend...${NC}"
    $DOCKER_COMPOSE build --no-cache frontend
    echo -e "${GREEN}✓ Frontend reconstruido${NC}"
else
    echo ""
    echo -e "${BLUE}[4/6] Frontend - usando caché existente${NC}"
fi

# Levantar servicios
echo ""
if [ "$BACKEND_ONLY" = true ]; then
    echo -e "${BLUE}[5/6] Levantando solo backend y dependencias...${NC}"
    $DOCKER_COMPOSE up -d db redis meilisearch
    echo "Esperando a que las dependencias estén listas..."
    sleep 10
    $DOCKER_COMPOSE up -d backend
else
    echo -e "${BLUE}[5/6] Levantando todos los servicios...${NC}"
    $DOCKER_COMPOSE up -d
fi

echo -e "${GREEN}✓ Servicios iniciados${NC}"

# Esperar a que los servicios estén listos
echo ""
echo -e "${BLUE}[6/6] Esperando a que los servicios estén listos...${NC}"
echo "Esto puede tomar 1-2 minutos..."
sleep 5

# Verificar estado de los contenedores
echo ""
echo "Estado de los contenedores:"
$DOCKER_COMPOSE ps

# Verificar logs del backend
echo ""
echo "=========================================="
echo "Verificando logs del backend..."
echo "=========================================="
echo ""
$DOCKER_COMPOSE logs --tail=20 backend

# Verificar que no haya el error de apt_pkg
if $DOCKER_COMPOSE logs backend | grep -q "ModuleNotFoundError: No module named 'apt_pkg'"; then
    echo ""
    echo -e "${YELLOW}⚠ ADVERTENCIA: El error de apt_pkg sigue presente${NC}"
    echo ""
    echo "Aplica el fix dentro del contenedor:"
    echo "  $DOCKER_COMPOSE exec backend bash fix_apt_error.sh"
else
    echo ""
    echo -e "${GREEN}✓ No se detectó el error de apt_pkg${NC}"
fi

# Mostrar URLs de acceso
echo ""
echo "=========================================="
echo -e "${GREEN}✓ SERVICIOS LISTOS${NC}"
echo "=========================================="
echo ""
echo "URLs de acceso:"
echo "  Frontend:     http://localhost:3000"
echo "  Backend:      http://localhost:8000"
echo "  Admin Django: http://localhost:8000/admin"
echo "  PostgreSQL:   localhost:5432"
echo "  Redis:        localhost:6379"
echo "  Meilisearch:  http://localhost:7700"
echo ""

# Comandos útiles
echo "Comandos útiles:"
echo "  Ver logs en tiempo real:"
echo "    $DOCKER_COMPOSE logs -f backend"
echo "    $DOCKER_COMPOSE logs -f frontend"
echo ""
echo "  Ejecutar comandos en el backend:"
echo "    $DOCKER_COMPOSE exec backend python manage.py migrate"
echo "    $DOCKER_COMPOSE exec backend python manage.py createsuperuser"
echo ""
echo "  Reiniciar un servicio:"
echo "    $DOCKER_COMPOSE restart backend"
echo "    $DOCKER_COMPOSE restart frontend"
echo ""
echo "  Detener todo:"
echo "    $DOCKER_COMPOSE down"
echo ""
echo "=========================================="
