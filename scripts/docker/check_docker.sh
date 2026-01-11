#!/bin/bash
#
# Script para verificar la instalación de Docker Compose V2
# y la configuración del proyecto
#

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}==========================================${NC}"
echo -e "${CYAN}  Verificación de Docker Compose V2${NC}"
echo -e "${CYAN}==========================================${NC}"
echo ""

ERRORS=0
WARNINGS=0

# Verificar Docker
echo -e "${BLUE}[1/10] Verificando Docker...${NC}"
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    echo -e "${GREEN}✓ Docker instalado: $DOCKER_VERSION${NC}"
else
    echo -e "${RED}✗ Docker NO está instalado${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Verificar Docker Compose V2
echo ""
echo -e "${BLUE}[2/10] Verificando Docker Compose V2...${NC}"
if docker compose version &> /dev/null; then
    COMPOSE_VERSION=$(docker compose version)
    echo -e "${GREEN}✓ Docker Compose V2 instalado: $COMPOSE_VERSION${NC}"
else
    echo -e "${RED}✗ Docker Compose V2 NO está instalado${NC}"
    echo "   Instala Docker Desktop desde: https://www.docker.com/products/docker-desktop/"
    ERRORS=$((ERRORS + 1))
fi

# Verificar docker-compose.yml
echo ""
echo -e "${BLUE}[3/10] Verificando docker-compose.yml...${NC}"
if [ -f "docker-compose.yml" ]; then
    echo -e "${GREEN}✓ docker-compose.yml encontrado${NC}"

    # Validar sintaxis
    if docker compose config &> /dev/null; then
        echo -e "${GREEN}✓ docker-compose.yml sintaxis válida${NC}"
    else
        echo -e "${RED}✗ docker-compose.yml tiene errores de sintaxis${NC}"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo -e "${RED}✗ docker-compose.yml NO encontrado${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Verificar Dockerfiles
echo ""
echo -e "${BLUE}[4/10] Verificando Dockerfiles...${NC}"
if [ -f "backend/Dockerfile" ]; then
    echo -e "${GREEN}✓ backend/Dockerfile encontrado${NC}"

    # Verificar fix de apt_pkg
    if grep -q "99no-command-not-found" backend/Dockerfile; then
        echo -e "${GREEN}✓ Fix de apt_pkg aplicado en Dockerfile${NC}"
    else
        echo -e "${YELLOW}⚠ Fix de apt_pkg no encontrado en Dockerfile${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo -e "${RED}✗ backend/Dockerfile NO encontrado${NC}"
    ERRORS=$((ERRORS + 1))
fi

if [ -f "frontend/Dockerfile" ]; then
    echo -e "${GREEN}✓ frontend/Dockerfile encontrado${NC}"
else
    echo -e "${YELLOW}⚠ frontend/Dockerfile NO encontrado${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

# Verificar archivo .env
echo ""
echo -e "${BLUE}[5/10] Verificando archivo .env...${NC}"
if [ -f ".env" ]; then
    echo -e "${GREEN}✓ .env encontrado${NC}"
else
    echo -e "${YELLOW}⚠ .env NO encontrado${NC}"
    echo "   Crea un archivo .env con las variables necesarias"
    WARNINGS=$((WARNINGS + 1))
fi

# Verificar scripts
echo ""
echo -e "${BLUE}[6/10] Verificando scripts del proyecto...${NC}"
SCRIPTS=("docker.sh" "docker_quick.sh" "docker_dev.sh" "start_containers.sh")
for script in "${SCRIPTS[@]}"; do
    if [ -f "$script" ] && [ -x "$script" ]; then
        echo -e "${GREEN}✓ $script encontrado y ejecutable${NC}"
    elif [ -f "$script" ]; then
        echo -e "${YELLOW}⚠ $script encontrado pero no ejecutable${NC}"
        echo "   Ejecuta: chmod +x $script"
        WARNINGS=$((WARNINGS + 1))
    else
        echo -e "${RED}✗ $script NO encontrado${NC}"
        ERRORS=$((ERRORS + 1))
    fi
done

# Verificar Docker daemon
echo ""
echo -e "${BLUE}[7/10] Verificando Docker daemon...${NC}"
if docker info &> /dev/null; then
    echo -e "${GREEN}✓ Docker daemon está corriendo${NC}"
else
    echo -e "${RED}✗ Docker daemon NO está corriendo${NC}"
    echo "   Inicia Docker Desktop o el servicio de Docker"
    ERRORS=$((ERRORS + 1))
fi

# Verificar puertos
echo ""
echo -e "${BLUE}[8/10] Verificando puertos disponibles...${NC}"
PORTS=(3000 8000 5432 6379 7700)
PORT_NAMES=("Frontend" "Backend" "PostgreSQL" "Redis" "Meilisearch")

for i in "${!PORTS[@]}"; do
    PORT="${PORTS[$i]}"
    NAME="${PORT_NAMES[$i]}"

    if command -v netstat &> /dev/null; then
        if netstat -an | grep -q ":$PORT.*LISTENING\|:$PORT.*LISTEN"; then
            echo -e "${YELLOW}⚠ Puerto $PORT ($NAME) ya está en uso${NC}"
            WARNINGS=$((WARNINGS + 1))
        else
            echo -e "${GREEN}✓ Puerto $PORT ($NAME) disponible${NC}"
        fi
    elif command -v lsof &> /dev/null; then
        if lsof -i :$PORT &> /dev/null; then
            echo -e "${YELLOW}⚠ Puerto $PORT ($NAME) ya está en uso${NC}"
            WARNINGS=$((WARNINGS + 1))
        else
            echo -e "${GREEN}✓ Puerto $PORT ($NAME) disponible${NC}"
        fi
    else
        echo -e "${YELLOW}⚠ No se puede verificar puerto $PORT (falta netstat/lsof)${NC}"
    fi
done

# Verificar imágenes existentes
echo ""
echo -e "${BLUE}[9/10] Verificando imágenes Docker existentes...${NC}"
if docker images | grep -q "bvs_framework"; then
    echo -e "${GREEN}✓ Imágenes del proyecto encontradas${NC}"
    docker images | grep "bvs_framework" | awk '{print "   " $1":"$2 " (" $7 " " $8 ")"}'
else
    echo -e "${YELLOW}⚠ No hay imágenes construidas (primera vez)${NC}"
    echo "   Ejecuta: ./docker.sh start"
fi

# Verificar contenedores
echo ""
echo -e "${BLUE}[10/10] Verificando contenedores existentes...${NC}"
if docker ps -a | grep -q "bvs_framework"; then
    RUNNING=$(docker ps | grep -c "bvs_framework" || true)
    STOPPED=$(docker ps -a | grep "bvs_framework" | grep -c "Exited\|Created" || true)

    if [ "$RUNNING" -gt 0 ]; then
        echo -e "${GREEN}✓ $RUNNING contenedor(es) corriendo${NC}"
    fi
    if [ "$STOPPED" -gt 0 ]; then
        echo -e "${YELLOW}⚠ $STOPPED contenedor(es) detenido(s)${NC}"
    fi
else
    echo -e "${YELLOW}⚠ No hay contenedores (primera vez)${NC}"
    echo "   Ejecuta: ./docker.sh start"
fi

# Resumen final
echo ""
echo -e "${CYAN}==========================================${NC}"
echo -e "${CYAN}  Resumen de la Verificación${NC}"
echo -e "${CYAN}==========================================${NC}"
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✓ ¡TODO ESTÁ PERFECTO!${NC}"
    echo ""
    echo "El proyecto está listo para usar."
    echo ""
    echo "Siguiente paso:"
    echo "  ./docker.sh start"

elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠ $WARNINGS advertencia(s) encontrada(s)${NC}"
    echo -e "${GREEN}✓ 0 errores críticos${NC}"
    echo ""
    echo "El proyecto puede funcionar, pero revisa las advertencias."
    echo ""
    echo "Puedes continuar con:"
    echo "  ./docker.sh start"

else
    echo -e "${RED}✗ $ERRORS error(es) crítico(s)${NC}"
    echo -e "${YELLOW}⚠ $WARNINGS advertencia(s)${NC}"
    echo ""
    echo "Debes resolver los errores antes de continuar."
    echo ""

    if ! command -v docker &> /dev/null || ! docker compose version &> /dev/null; then
        echo "Instala Docker Desktop:"
        echo "  https://www.docker.com/products/docker-desktop/"
        echo ""
    fi
fi

echo -e "${CYAN}==========================================${NC}"
echo ""

# Información adicional
echo -e "${BLUE}Información del sistema:${NC}"
echo "  Sistema operativo: $(uname -s)"
echo "  Arquitectura: $(uname -m)"

if command -v docker &> /dev/null; then
    echo "  Docker: $(docker --version | cut -d ' ' -f 3 | tr -d ',')"
fi

if docker compose version &> /dev/null; then
    echo "  Docker Compose: $(docker compose version --short)"
fi

echo ""
echo "Para más información:"
echo "  ./docker.sh help        # Ver todos los comandos"
echo "  cat DOCKER_V2_GUIDE.md  # Leer la guía completa"
echo ""

exit $ERRORS
