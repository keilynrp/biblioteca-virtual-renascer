#!/bin/bash
#
# Script para solucionar problemas de red en Docker
# Corrige timeouts de TLS handshake y problemas de conectividad
#
# Uso: ./fix_docker_network.sh
#

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}==========================================${NC}"
echo -e "${CYAN}  Solucionando Problemas de Red Docker${NC}"
echo -e "${CYAN}==========================================${NC}"
echo ""

# Verificar Docker
if ! docker info &> /dev/null; then
    echo -e "${RED}✗ Docker no está corriendo${NC}"
    echo "Inicia Docker Desktop primero"
    exit 1
fi

# Paso 1: Limpiar caché de Docker
echo -e "${BLUE}[1/8] Limpiando caché de Docker...${NC}"
docker system prune -f
echo -e "${GREEN}✓ Caché limpiado${NC}"

# Paso 2: Reiniciar Docker daemon
echo ""
echo -e "${BLUE}[2/8] Configurando DNS de Docker...${NC}"

# Crear directorio de configuración si no existe
DOCKER_CONFIG_DIR="$HOME/.docker"
mkdir -p "$DOCKER_CONFIG_DIR"

# Crear o actualizar daemon.json
DAEMON_JSON="$DOCKER_CONFIG_DIR/daemon.json"

# Backup del archivo existente
if [ -f "$DAEMON_JSON" ]; then
    cp "$DAEMON_JSON" "$DAEMON_JSON.backup.$(date +%Y%m%d_%H%M%S)"
    echo -e "${YELLOW}⚠ Backup creado del daemon.json existente${NC}"
fi

# Crear nueva configuración
cat > "$DAEMON_JSON" << 'EOF'
{
  "dns": ["8.8.8.8", "8.8.4.4", "1.1.1.1"],
  "registry-mirrors": [],
  "max-concurrent-downloads": 3,
  "max-concurrent-uploads": 3,
  "experimental": false,
  "features": {
    "buildkit": true
  },
  "builder": {
    "gc": {
      "enabled": true,
      "defaultKeepStorage": "20GB"
    }
  }
}
EOF

echo -e "${GREEN}✓ daemon.json configurado${NC}"

# Paso 3: Mostrar instrucciones para reiniciar Docker
echo ""
echo -e "${YELLOW}[3/8] Es necesario reiniciar Docker Desktop${NC}"
echo ""
echo -e "${CYAN}Por favor:${NC}"
echo "  1. Abre Docker Desktop"
echo "  2. Ve a Settings → General"
echo "  3. Click en 'Quit Docker Desktop'"
echo "  4. Espera 10 segundos"
echo "  5. Inicia Docker Desktop de nuevo"
echo ""
read -p "Presiona ENTER cuando hayas reiniciado Docker Desktop..."

# Verificar que Docker esté corriendo
echo ""
echo -e "${BLUE}[4/8] Verificando que Docker esté corriendo...${NC}"
RETRIES=0
MAX_RETRIES=30
while ! docker info &> /dev/null; do
    RETRIES=$((RETRIES + 1))
    if [ $RETRIES -ge $MAX_RETRIES ]; then
        echo -e "${RED}✗ Docker no responde después de $MAX_RETRIES intentos${NC}"
        exit 1
    fi
    echo "Esperando Docker... ($RETRIES/$MAX_RETRIES)"
    sleep 2
done
echo -e "${GREEN}✓ Docker está corriendo${NC}"

# Paso 5: Test de conectividad
echo ""
echo -e "${BLUE}[5/8] Probando conectividad con Docker Hub...${NC}"
if curl -sSf https://registry.hub.docker.com/v2/ > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Conectividad con Docker Hub OK${NC}"
else
    echo -e "${YELLOW}⚠ Problemas de conectividad con Docker Hub${NC}"
    echo "Puede ser un problema temporal o de firewall"
fi

# Paso 6: Configurar timeouts más largos para docker compose
echo ""
echo -e "${BLUE}[6/8] Configurando timeouts...${NC}"

# Variables de entorno para build
export DOCKER_CLIENT_TIMEOUT=600
export COMPOSE_HTTP_TIMEOUT=600

echo "export DOCKER_CLIENT_TIMEOUT=600" >> ~/.bashrc 2>/dev/null || true
echo "export COMPOSE_HTTP_TIMEOUT=600" >> ~/.bashrc 2>/dev/null || true

echo -e "${GREEN}✓ Timeouts configurados (600 segundos)${NC}"

# Paso 7: Pull imágenes manualmente con retry
echo ""
echo -e "${BLUE}[7/8] Descargando imágenes base (puede tomar varios minutos)...${NC}"

# Lista de imágenes necesarias
IMAGES=(
    "python:3.13-slim"
    "node:22-alpine"
    "postgres:15-alpine"
    "redis:7-alpine"
    "getmeili/meilisearch:v1.6"
)

pull_image_with_retry() {
    local IMAGE=$1
    local MAX_ATTEMPTS=3
    local ATTEMPT=1

    while [ $ATTEMPT -le $MAX_ATTEMPTS ]; do
        echo ""
        echo -e "${CYAN}Descargando $IMAGE (intento $ATTEMPT/$MAX_ATTEMPTS)...${NC}"

        if docker pull "$IMAGE"; then
            echo -e "${GREEN}✓ $IMAGE descargado${NC}"
            return 0
        else
            echo -e "${YELLOW}⚠ Fallo en intento $ATTEMPT${NC}"
            ATTEMPT=$((ATTEMPT + 1))
            if [ $ATTEMPT -le $MAX_ATTEMPTS ]; then
                echo "Esperando 10 segundos antes de reintentar..."
                sleep 10
            fi
        fi
    done

    echo -e "${RED}✗ No se pudo descargar $IMAGE después de $MAX_ATTEMPTS intentos${NC}"
    return 1
}

FAILED_IMAGES=()

for IMAGE in "${IMAGES[@]}"; do
    if ! pull_image_with_retry "$IMAGE"; then
        FAILED_IMAGES+=("$IMAGE")
    fi
done

# Paso 8: Resumen
echo ""
echo -e "${CYAN}==========================================${NC}"
echo -e "${CYAN}  Resumen${NC}"
echo -e "${CYAN}==========================================${NC}"
echo ""

if [ ${#FAILED_IMAGES[@]} -eq 0 ]; then
    echo -e "${GREEN}✓ TODAS LAS IMÁGENES DESCARGADAS EXITOSAMENTE${NC}"
    echo ""
    echo "Ahora puedes construir tu proyecto:"
    echo "  ./docker.sh start"
    echo ""
    echo "O con docker compose:"
    echo "  docker compose build"
    echo "  docker compose up -d"
else
    echo -e "${YELLOW}⚠ ALGUNAS IMÁGENES NO SE PUDIERON DESCARGAR${NC}"
    echo ""
    echo "Imágenes que fallaron:"
    for IMG in "${FAILED_IMAGES[@]}"; do
        echo "  - $IMG"
    done
    echo ""
    echo -e "${CYAN}Soluciones alternativas:${NC}"
    echo ""
    echo "1. Verificar tu conexión a internet:"
    echo "   ping google.com"
    echo ""
    echo "2. Verificar que no haya firewall bloqueando Docker:"
    echo "   - Desactiva temporalmente el antivirus/firewall"
    echo "   - Agrega Docker a las excepciones del firewall"
    echo ""
    echo "3. Usar VPN si tu red bloquea Docker Hub:"
    echo "   - Conecta a una VPN"
    echo "   - Ejecuta este script de nuevo"
    echo ""
    echo "4. Cambiar a mirror de Docker (en China):"
    echo "   - Edita ~/.docker/daemon.json"
    echo "   - Agrega mirrors locales"
    echo ""
    echo "5. Intentar más tarde:"
    echo "   - Puede ser un problema temporal de Docker Hub"
    echo ""
fi

echo -e "${CYAN}==========================================${NC}"
echo ""

# Información adicional
echo -e "${BLUE}Configuración aplicada:${NC}"
echo "  DNS: 8.8.8.8, 8.8.4.4, 1.1.1.1"
echo "  Max concurrent downloads: 3"
echo "  Client timeout: 600s"
echo "  Compose timeout: 600s"
echo ""

echo -e "${BLUE}Archivos de configuración:${NC}"
echo "  $DAEMON_JSON"
if [ -f "$DAEMON_JSON.backup."* ]; then
    echo "  Backup: $DAEMON_JSON.backup.*"
fi
echo ""
