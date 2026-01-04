#!/bin/bash

echo "========================================"
echo "  INSTALANDO DOCKER COMPOSE V2"
echo "========================================"
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${BLUE}→ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Verificar si ya está instalado
if docker compose version &> /dev/null; then
    print_success "Docker Compose v2 ya está instalado"
    docker compose version
    echo ""
    echo "¿Deseas reinstalar de todos modos? (s/n): "
    read -r response
    if [[ ! "$response" =~ ^[Ss]$ ]]; then
        echo "Instalación cancelada."
        exit 0
    fi
fi

echo ""
print_info "Método 1: Intentando instalar via apt..."
echo ""

# Intentar con apt primero
if sudo apt-get update 2>&1 | grep -v "apt_pkg\|cnf-update-db"; then
    print_success "Repositorios actualizados (ignorando errores menores)"
else
    print_warning "Hubo advertencias al actualizar repositorios, pero continuamos..."
fi

echo ""
print_info "Instalando docker-compose-plugin..."
echo ""

if sudo apt-get install -y docker-compose-plugin 2>&1 | grep -v "apt_pkg\|cnf-update-db"; then
    print_success "Plugin instalado via apt"

    # Verificar instalación
    if docker compose version &> /dev/null; then
        print_success "Docker Compose v2 instalado correctamente!"
        docker compose version
        echo ""
        print_success "Instalación completada con éxito"
        exit 0
    fi
fi

echo ""
print_warning "Método 1 falló, intentando Método 2..."
echo ""

# Método 2: Instalación manual
print_info "Método 2: Instalación manual desde GitHub..."
echo ""

# Detectar arquitectura
ARCH=$(uname -m)
case $ARCH in
    x86_64)
        ARCH="x86_64"
        ;;
    aarch64)
        ARCH="aarch64"
        ;;
    armv7l)
        ARCH="armv7"
        ;;
    *)
        print_error "Arquitectura no soportada: $ARCH"
        exit 1
        ;;
esac

# Obtener última versión
print_info "Descargando última versión para $ARCH..."
VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep '"tag_name"' | cut -d'"' -f4)

if [ -z "$VERSION" ]; then
    print_warning "No se pudo obtener la última versión, usando v2.24.0"
    VERSION="v2.24.0"
fi

print_info "Versión a instalar: $VERSION"

# Crear directorio para plugins
DOCKER_CONFIG=${DOCKER_CONFIG:-$HOME/.docker}
mkdir -p $DOCKER_CONFIG/cli-plugins

# Descargar
DOWNLOAD_URL="https://github.com/docker/compose/releases/download/${VERSION}/docker-compose-linux-${ARCH}"

print_info "Descargando desde: $DOWNLOAD_URL"
echo ""

if curl -SL "$DOWNLOAD_URL" -o $DOCKER_CONFIG/cli-plugins/docker-compose; then
    print_success "Descarga completada"
else
    print_error "Error al descargar Docker Compose"
    exit 1
fi

# Dar permisos de ejecución
chmod +x $DOCKER_CONFIG/cli-plugins/docker-compose

# Verificar instalación
if docker compose version &> /dev/null; then
    echo ""
    print_success "Docker Compose v2 instalado correctamente!"
    docker compose version
    echo ""

    # Crear symlink para sistema (opcional)
    print_info "¿Deseas crear un symlink para todo el sistema? (s/n): "
    read -r system_response
    if [[ "$system_response" =~ ^[Ss]$ ]]; then
        sudo ln -sf $DOCKER_CONFIG/cli-plugins/docker-compose /usr/local/bin/docker-compose
        print_success "Symlink creado en /usr/local/bin/docker-compose"
    fi

    echo ""
    print_success "Instalación completada con éxito"
    echo ""
    echo "Ahora puedes usar:"
    echo "  docker compose version"
    echo "  docker compose up"
    echo "  docker compose down"
    echo ""

else
    print_error "La instalación falló"
    exit 1
fi
