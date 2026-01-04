#!/bin/bash

# Script TODO-EN-UNO para instalar Docker Compose v2 y aplicar optimizaciones

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

print_header() {
    echo ""
    echo -e "${CYAN}========================================${NC}"
    echo -e "${CYAN}  $1${NC}"
    echo -e "${CYAN}========================================${NC}"
    echo ""
}

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

print_header "INSTALACION Y OPTIMIZACION COMPLETA"

echo "Este script hará TODO automáticamente:"
echo "1. Verificar/Instalar Docker Compose v2"
echo "2. Aplicar optimizaciones para 16GB RAM"
echo "3. Reconstruir y reiniciar contenedores"
echo "4. Verificar el estado final"
echo ""
echo -n "Presiona Enter para continuar..."
read

# PASO 1: VERIFICAR/INSTALAR DOCKER COMPOSE V2
print_header "PASO 1: DOCKER COMPOSE V2"

# Verificar si docker compose v2 ya funciona
if docker compose version &> /dev/null 2>&1; then
    print_success "Docker Compose v2 ya está instalado y funciona"
    docker compose version
    DOCKER_COMPOSE="docker compose"
else
    print_warning "Docker Compose v2 no está instalado o no funciona"
    echo ""
    print_info "Instalando Docker Compose v2..."
    echo ""

    # Método 1: Intentar con apt (silenciando errores de apt_pkg)
    print_info "Intentando instalación via apt..."

    if sudo apt-get update 2>&1 | grep -v "apt_pkg\|cnf-update-db" > /dev/null; then
        print_success "Repositorios actualizados"
    fi

    if sudo apt-get install -y docker-compose-plugin 2>&1 | grep -v "apt_pkg\|cnf-update-db"; then
        if docker compose version &> /dev/null; then
            print_success "Docker Compose v2 instalado via apt"
            docker compose version
            DOCKER_COMPOSE="docker compose"
        fi
    fi

    # Método 2: Si apt falló, instalación manual
    if ! docker compose version &> /dev/null 2>&1; then
        echo ""
        print_warning "Instalación apt falló, usando método manual..."
        echo ""

        ARCH=$(uname -m)
        DOCKER_CONFIG=${DOCKER_CONFIG:-$HOME/.docker}
        mkdir -p $DOCKER_CONFIG/cli-plugins

        print_info "Descargando Docker Compose v2..."
        VERSION="v2.24.0"  # Versión estable conocida

        if curl -SL "https://github.com/docker/compose/releases/download/${VERSION}/docker-compose-linux-${ARCH}" \
            -o $DOCKER_CONFIG/cli-plugins/docker-compose 2>/dev/null; then

            chmod +x $DOCKER_CONFIG/cli-plugins/docker-compose

            if docker compose version &> /dev/null; then
                print_success "Docker Compose v2 instalado manualmente"
                docker compose version
                DOCKER_COMPOSE="docker compose"
            else
                print_error "Error: No se pudo instalar Docker Compose v2"
                echo ""
                echo "Por favor, instálalo manualmente:"
                echo "  https://docs.docker.com/compose/install/"
                exit 1
            fi
        else
            print_error "Error al descargar Docker Compose"
            exit 1
        fi
    fi
fi

echo ""
print_success "Docker Compose v2 listo para usar"
echo ""

# Dar permisos a scripts
print_info "Preparando scripts..."
chmod +x aplicar-optimizacion-16gb.sh 2>/dev/null
chmod +x INICIAR_OPTIMIZACION.sh 2>/dev/null
print_success "Scripts preparados"
echo ""

# PASO 2: APLICAR OPTIMIZACIONES
print_header "PASO 2: APLICANDO OPTIMIZACIONES"

echo "Ahora se ejecutará el script de optimización..."
echo ""
sleep 2

# Ejecutar script de optimización
if [ -f "aplicar-optimizacion-16gb.sh" ]; then
    ./aplicar-optimizacion-16gb.sh
else
    print_error "No se encontró aplicar-optimizacion-16gb.sh"
    exit 1
fi
