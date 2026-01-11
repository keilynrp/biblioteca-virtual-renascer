#!/bin/bash
#
# Script para levantar los contenedores después del fix
# Compatible con Docker Compose V2 (docker compose sin guión)
#
# Uso: ./start_containers.sh [opciones]
#
# Opciones:
#   --rebuild    Reconstruir todas las imágenes desde cero (sin caché)
#   --backend    Solo reconstruir y levantar el backend
#   --clean      Limpiar volúmenes y empezar desde cero
#   --help       Mostrar ayuda
#

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

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
            echo "  --rebuild    Reconstruir todas las imágenes desde cero (sin caché)"
            echo "  --backend    Solo reconstruir y levantar el backend"
            echo "  --clean      Limpiar volúmenes y empezar desde cero (⚠️ elimina datos)"
            echo "  --help       Mostrar esta ayuda"
            echo ""
            echo "Ejemplos:"
            echo "  $0                    # Levantar normalmente"
            echo "  $0 --rebuild          # Reconstruir todo desde cero"
            echo "  $0 --backend          # Solo backend"
            echo "  $0 --clean --rebuild  # Empezar completamente desde cero"
            exit 0
            ;;
    esac
done

echo -e "${CYAN}==========================================${NC}"
echo -e "${CYAN}  Levantando contenedores con fix apt_pkg${NC}"
echo -e "${CYAN}==========================================${NC}"
echo ""

# Verificar que docker compose esté disponible
if ! docker compose version &> /dev/null; then
    echo -e "${RED}✗ Error: Docker Compose V2 no está instalado${NC}"
    echo ""
    echo "Instala Docker Desktop desde:"
    echo "https://www.docker.com/products/docker-desktop/"
    exit 1
fi

echo -e "${GREEN}✓ Docker Compose V2 detectado${NC}"
docker compose version
echo ""

# Detener contenedores existentes
echo -e "${BLUE}[1/6] Deteniendo contenedores existentes...${NC}"
docker compose down
echo -e "${GREEN}✓ Contenedores detenidos${NC}"

# Limpiar volúmenes si se solicitó
if [ "$CLEAN_VOLUMES" = true ]; then
    echo ""
    echo -e "${YELLOW}[2/6] Limpiando volúmenes (se perderán los datos)...${NC}"
    echo -e "${RED}⚠️  ADVERTENCIA: Esta operación eliminará TODOS los datos de la base de datos${NC}"
    echo -e "${YELLOW}¿Estás seguro? Escribe 'si' para confirmar:${NC}"
    read -r confirmation
    if [[ "$confirmation" == "si" ]]; then
        docker compose down -v
        echo -e "${GREEN}✓ Volúmenes eliminados${NC}"
    else
        echo -e "${YELLOW}Operación cancelada - manteniendo volúmenes${NC}"
    fi
else
    echo ""
    echo -e "${BLUE}[2/6] Manteniendo volúmenes existentes${NC}"
fi

# Reconstruir backend (siempre, porque tiene el fix)
echo ""
echo -e "${BLUE}[3/6] Reconstruyendo backend con el fix de apt_pkg...${NC}"
if [ "$REBUILD_ALL" = true ]; then
    echo -e "${YELLOW}Reconstruyendo sin caché (puede tomar varios minutos)...${NC}"
    docker compose build --no-cache backend
else
    docker compose build backend
fi
echo -e "${GREEN}✓ Backend reconstruido${NC}"

# Reconstruir frontend si se solicitó
if [ "$REBUILD_ALL" = true ] && [ "$BACKEND_ONLY" = false ]; then
    echo ""
    echo -e "${BLUE}[4/6] Reconstruyendo frontend...${NC}"
    docker compose build --no-cache frontend
    echo -e "${GREEN}✓ Frontend reconstruido${NC}"
else
    echo ""
    echo -e "${BLUE}[4/6] Frontend - usando caché existente${NC}"
fi

# Levantar servicios
echo ""
if [ "$BACKEND_ONLY" = true ]; then
    echo -e "${BLUE}[5/6] Levantando solo backend y dependencias...${NC}"
    docker compose up -d db redis meilisearch
    echo -e "${YELLOW}Esperando a que las dependencias estén listas (15 segundos)...${NC}"
    sleep 15
    docker compose up -d backend
else
    echo -e "${BLUE}[5/6] Levantando todos los servicios...${NC}"
    docker compose up -d
fi

echo -e "${GREEN}✓ Servicios iniciados${NC}"

# Esperar a que los servicios estén listos
echo ""
echo -e "${BLUE}[6/6] Esperando a que los servicios estén listos...${NC}"
echo -e "${YELLOW}Esto puede tomar 1-2 minutos mientras los healthchecks pasan...${NC}"
sleep 10

# Verificar estado de los contenedores
echo ""
echo -e "${CYAN}Estado de los contenedores:${NC}"
docker compose ps

# Verificar logs del backend
echo ""
echo -e "${CYAN}==========================================${NC}"
echo -e "${CYAN}Verificando logs del backend...${NC}"
echo -e "${CYAN}==========================================${NC}"
echo ""
docker compose logs --tail=30 backend

# Verificar que no haya el error de apt_pkg
echo ""
if docker compose logs backend | grep -q "ModuleNotFoundError: No module named 'apt_pkg'"; then
    echo -e "${RED}✗ ADVERTENCIA: El error de apt_pkg sigue presente${NC}"
    echo ""
    echo "Aplica el fix dentro del contenedor:"
    echo "  docker compose exec backend bash"
    echo "  bash /app/fix_apt_error.sh"
    echo "  exit"
else
    echo -e "${GREEN}✓ No se detectó el error de apt_pkg - Backend funcionando correctamente${NC}"
fi

# Mostrar URLs de acceso
echo ""
echo -e "${CYAN}==========================================${NC}"
echo -e "${GREEN}✓ SERVICIOS LISTOS${NC}"
echo -e "${CYAN}==========================================${NC}"
echo ""
echo -e "${CYAN}URLs de acceso:${NC}"
echo "  📱 Frontend:        http://localhost:3000"
echo "  🔧 Backend API:     http://localhost:8000"
echo "  👤 Admin Django:    http://localhost:8000/admin"
echo "  🐘 PostgreSQL:      localhost:5432"
echo "  🔴 Redis:           localhost:6379"
echo "  🔍 Meilisearch:     http://localhost:7700"
echo ""

# Comandos útiles
echo -e "${CYAN}Comandos útiles:${NC}"
echo ""
echo "  Ver logs en tiempo real:"
echo "    docker compose logs -f backend"
echo "    docker compose logs -f frontend"
echo ""
echo "  Ejecutar comandos en el backend:"
echo "    docker compose exec backend python manage.py migrate"
echo "    docker compose exec backend python manage.py createsuperuser"
echo "    docker compose exec backend python manage.py shell"
echo ""
echo "  Reiniciar un servicio:"
echo "    docker compose restart backend"
echo "    docker compose restart frontend"
echo ""
echo "  Detener todo:"
echo "    docker compose down"
echo ""
echo "  Usar script de comandos rápidos:"
echo "    ./docker_quick.sh help"
echo ""
echo -e "${CYAN}==========================================${NC}"
