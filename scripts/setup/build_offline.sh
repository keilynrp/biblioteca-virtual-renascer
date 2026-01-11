#!/bin/bash
#
# Script para construir el proyecto con mejor manejo de errores de red
# Incluye reintentos automáticos y manejo de timeouts
#
# Uso: ./build_offline.sh [servicio]
#

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}==========================================${NC}"
echo -e "${CYAN}  Build con Manejo de Errores de Red${NC}"
echo -e "${CYAN}==========================================${NC}"
echo ""

# Configurar timeouts largos
export DOCKER_CLIENT_TIMEOUT=900
export COMPOSE_HTTP_TIMEOUT=900
export DOCKER_BUILDKIT=1
export BUILDKIT_PROGRESS=plain

echo -e "${BLUE}Configuración de timeouts:${NC}"
echo "  DOCKER_CLIENT_TIMEOUT=900s (15 minutos)"
echo "  COMPOSE_HTTP_TIMEOUT=900s (15 minutos)"
echo "  BUILDKIT activado"
echo ""

# Servicio a construir (backend por defecto)
SERVICE="${1:-backend}"

# Función para construir con reintentos
build_with_retry() {
    local SERVICE=$1
    local MAX_ATTEMPTS=3
    local ATTEMPT=1

    while [ $ATTEMPT -le $MAX_ATTEMPTS ]; do
        echo ""
        echo -e "${CYAN}═══════════════════════════════════════${NC}"
        echo -e "${CYAN}  Intento $ATTEMPT/$MAX_ATTEMPTS - Construyendo $SERVICE${NC}"
        echo -e "${CYAN}═══════════════════════════════════════${NC}"
        echo ""

        # Construir sin caché para asegurar descarga fresca
        if [ $ATTEMPT -eq 1 ]; then
            # Primer intento con caché
            docker compose build "$SERVICE" 2>&1 | tee "/tmp/docker_build_${SERVICE}_${ATTEMPT}.log"
        else
            # Siguientes intentos sin caché
            docker compose build --no-cache "$SERVICE" 2>&1 | tee "/tmp/docker_build_${SERVICE}_${ATTEMPT}.log"
        fi

        BUILD_EXIT_CODE=${PIPESTATUS[0]}

        if [ $BUILD_EXIT_CODE -eq 0 ]; then
            echo ""
            echo -e "${GREEN}✓ $SERVICE construido exitosamente${NC}"
            return 0
        else
            echo ""
            echo -e "${RED}✗ Fallo en intento $ATTEMPT${NC}"

            # Analizar el error
            if grep -q "TLS handshake timeout" "/tmp/docker_build_${SERVICE}_${ATTEMPT}.log"; then
                echo -e "${YELLOW}Error detectado: TLS handshake timeout${NC}"
                echo "Esto suele ser un problema temporal de red"
            elif grep -q "connection refused\|network" "/tmp/docker_build_${SERVICE}_${ATTEMPT}.log"; then
                echo -e "${YELLOW}Error detectado: Problema de conectividad${NC}"
                echo "Verifica tu conexión a internet"
            fi

            ATTEMPT=$((ATTEMPT + 1))

            if [ $ATTEMPT -le $MAX_ATTEMPTS ]; then
                echo ""
                echo -e "${YELLOW}Esperando 15 segundos antes de reintentar...${NC}"
                sleep 15

                # Limpiar caché de Docker
                echo -e "${BLUE}Limpiando caché de Docker...${NC}"
                docker builder prune -f
            fi
        fi
    done

    echo ""
    echo -e "${RED}✗ No se pudo construir $SERVICE después de $MAX_ATTEMPTS intentos${NC}"
    echo ""
    echo -e "${CYAN}Logs guardados en:${NC}"
    for i in $(seq 1 $MAX_ATTEMPTS); do
        if [ -f "/tmp/docker_build_${SERVICE}_${i}.log" ]; then
            echo "  /tmp/docker_build_${SERVICE}_${i}.log"
        fi
    done

    return 1
}

# Paso 1: Verificar Docker
echo -e "${BLUE}[1/3] Verificando Docker...${NC}"
if ! docker info &> /dev/null; then
    echo -e "${RED}✗ Docker no está corriendo${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker OK${NC}"

# Paso 2: Limpiar
echo ""
echo -e "${BLUE}[2/3] Limpiando recursos no utilizados...${NC}"
docker system prune -f
echo -e "${GREEN}✓ Limpieza completada${NC}"

# Paso 3: Construir
echo ""
echo -e "${BLUE}[3/3] Construyendo servicio(s)...${NC}"

if [ "$SERVICE" = "all" ]; then
    # Construir todos los servicios
    SERVICES=("backend" "frontend")
    FAILED_SERVICES=()

    for SRV in "${SERVICES[@]}"; do
        if ! build_with_retry "$SRV"; then
            FAILED_SERVICES+=("$SRV")
        fi
    done

    echo ""
    echo -e "${CYAN}==========================================${NC}"
    echo -e "${CYAN}  Resumen de Build${NC}"
    echo -e "${CYAN}==========================================${NC}"
    echo ""

    if [ ${#FAILED_SERVICES[@]} -eq 0 ]; then
        echo -e "${GREEN}✓ TODOS LOS SERVICIOS CONSTRUIDOS${NC}"
        echo ""
        echo "Siguiente paso:"
        echo "  ./docker.sh start"
    else
        echo -e "${RED}✗ SERVICIOS QUE FALLARON:${NC}"
        for SRV in "${FAILED_SERVICES[@]}"; do
            echo "  - $SRV"
        done
        exit 1
    fi
else
    # Construir servicio específico
    if build_with_retry "$SERVICE"; then
        echo ""
        echo -e "${GREEN}✓ Build completado exitosamente${NC}"
        echo ""
        echo "Siguiente paso:"
        echo "  docker compose up -d $SERVICE"
        echo "  ./docker.sh start"
    else
        exit 1
    fi
fi

echo ""
echo -e "${CYAN}==========================================${NC}"
