#!/bin/bash

# Script de diagnóstico para verificar Docker Compose

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

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}→ $1${NC}"
}

print_header "DIAGNOSTICO DOCKER COMPOSE"

echo "Este script verificará qué versiones de Docker Compose tienes"
echo "y cuál debes usar para evitar errores."
echo ""

# Verificar docker-compose (v1)
print_header "1. VERIFICANDO DOCKER-COMPOSE V1"

if command -v docker-compose &> /dev/null; then
    print_info "Comando 'docker-compose' encontrado"
    echo ""

    print_info "Intentando obtener versión..."
    if docker-compose version 2>&1 | grep -q "version"; then
        print_success "docker-compose v1 funciona:"
        docker-compose version 2>&1 | head -5
        V1_WORKS=true
    else
        print_error "docker-compose v1 está instalado pero NO funciona"
        echo ""
        print_info "Error detectado:"
        docker-compose version 2>&1 | head -10
        echo ""
        print_warning "Probablemente tienes el error de Python 3.13"
        V1_WORKS=false
    fi
else
    print_warning "Comando 'docker-compose' no encontrado"
    V1_WORKS=false
fi

echo ""

# Verificar docker compose (v2)
print_header "2. VERIFICANDO DOCKER COMPOSE V2"

if docker compose version &> /dev/null 2>&1; then
    print_success "docker compose v2 funciona:"
    docker compose version
    V2_WORKS=true
else
    print_error "docker compose v2 NO está instalado o no funciona"
    V2_WORKS=false
fi

echo ""

# Verificar ubicación de docker-compose
print_header "3. UBICACION DE BINARIOS"

print_info "Buscando 'docker-compose'..."
if which docker-compose &> /dev/null; then
    print_success "Encontrado en: $(which docker-compose)"

    # Ver si es Python o binario
    file $(which docker-compose) 2>/dev/null || true
else
    print_warning "No encontrado en PATH"
fi

echo ""

print_info "Buscando plugin 'docker compose'..."
if [ -f "$HOME/.docker/cli-plugins/docker-compose" ]; then
    print_success "Plugin encontrado en: $HOME/.docker/cli-plugins/docker-compose"
    file "$HOME/.docker/cli-plugins/docker-compose" 2>/dev/null || true
elif [ -f "/usr/local/lib/docker/cli-plugins/docker-compose" ]; then
    print_success "Plugin encontrado en: /usr/local/lib/docker/cli-plugins/docker-compose"
else
    print_warning "Plugin no encontrado"
fi

echo ""

# Verificar Python (causa del error)
print_header "4. VERIFICANDO PYTHON"

print_info "Versión de Python:"
python3 --version

echo ""
print_info "Verificando módulo 'docker-compose'..."
if python3 -c "import docker" &> /dev/null; then
    print_success "Módulo 'docker' está disponible"
else
    print_warning "Módulo 'docker' no está disponible"
fi

echo ""

# Recomendaciones
print_header "5. RECOMENDACIONES"

if [ "$V2_WORKS" = true ]; then
    print_success "Docker Compose v2 está instalado y funciona"
    echo ""
    echo "  ${GREEN}✓ PUEDES USAR:${NC}"
    echo "    docker compose up -d"
    echo "    docker compose down"
    echo "    docker compose ps"
    echo "    docker compose logs"
    echo ""

    if [ "$V1_WORKS" = false ]; then
        print_warning "docker-compose v1 no funciona, pero no lo necesitas"
        echo ""
        echo "  ${YELLOW}⚠ NO USES:${NC}"
        echo "    docker-compose up -d    ${RED}← Esto dará error${NC}"
        echo ""
        echo "  ${GREEN}✓ USA EN SU LUGAR:${NC}"
        echo "    docker compose up -d    ${GREEN}← Sin guion${NC}"
    else
        print_info "Tienes ambas versiones funcionando"
        echo ""
        echo "  ${GREEN}✓ RECOMENDACIÓN:${NC} Usa Docker Compose v2 (sin guion)"
        echo "    docker compose up -d    ${GREEN}← v2 (recomendado)${NC}"
        echo "    docker-compose up -d    ${YELLOW}← v1 (deprecado)${NC}"
    fi

elif [ "$V1_WORKS" = true ]; then
    print_warning "Solo tienes docker-compose v1 funcionando"
    echo ""
    echo "  ${YELLOW}⚠ PUEDES USAR:${NC}"
    echo "    docker-compose up -d"
    echo ""
    echo "  ${BLUE}→ RECOMENDACIÓN:${NC} Instala Docker Compose v2"
    echo ""
    echo "  ${GREEN}Ejecuta:${NC}"
    echo "    chmod +x instalar-docker-compose-v2.sh"
    echo "    ./instalar-docker-compose-v2.sh"

else
    print_error "NINGUNA versión de Docker Compose funciona"
    echo ""
    echo "  ${RED}✗ PROBLEMA:${NC} No puedes usar docker-compose ni docker compose"
    echo ""
    echo "  ${GREEN}✓ SOLUCIÓN:${NC} Instala Docker Compose v2"
    echo ""
    echo "  ${GREEN}Ejecuta:${NC}"
    echo "    chmod +x INSTALAR_Y_OPTIMIZAR.sh"
    echo "    ./INSTALAR_Y_OPTIMIZAR.sh"
    echo ""
    echo "  O ejecuta desde Windows:"
    echo "    CONFIGURAR_TODO_16GB.bat"
fi

echo ""

# Verificar archivo docker-compose.yml
print_header "6. VERIFICANDO docker-compose.yml"

if [ -f "docker-compose.yml" ]; then
    print_success "Archivo docker-compose.yml encontrado"

    # Verificar sintaxis si hay docker compose disponible
    if [ "$V2_WORKS" = true ]; then
        echo ""
        print_info "Validando sintaxis del archivo..."
        if docker compose config > /dev/null 2>&1; then
            print_success "Archivo tiene sintaxis válida"
        else
            print_error "Archivo tiene errores de sintaxis"
            echo ""
            print_info "Errores encontrados:"
            docker compose config 2>&1 | head -20
        fi
    fi
else
    print_error "Archivo docker-compose.yml no encontrado"
    echo ""
    print_info "Asegúrate de estar en el directorio correcto:"
    echo "  cd /mnt/d/bvs_framework"
fi

echo ""

# Resumen final
print_header "RESUMEN"

echo "Estado de Docker Compose:"
echo ""

if [ "$V2_WORKS" = true ]; then
    echo "  ${GREEN}✓ Docker Compose v2: FUNCIONANDO${NC}"
else
    echo "  ${RED}✗ Docker Compose v2: NO DISPONIBLE${NC}"
fi

if [ "$V1_WORKS" = true ]; then
    echo "  ${GREEN}✓ docker-compose v1: FUNCIONANDO${NC}"
else
    echo "  ${RED}✗ docker-compose v1: NO FUNCIONA${NC}"
fi

echo ""
echo "Comando recomendado a usar:"
echo ""

if [ "$V2_WORKS" = true ]; then
    echo "  ${GREEN}docker compose${NC} (v2 - sin guion)"
elif [ "$V1_WORKS" = true ]; then
    echo "  ${YELLOW}docker-compose${NC} (v1 - con guion)"
else
    echo "  ${RED}NINGUNO - Necesitas instalar Docker Compose v2${NC}"
fi

echo ""
print_header "FIN DEL DIAGNOSTICO"

# Siguiente paso
if [ "$V2_WORKS" = false ]; then
    echo ""
    echo "Para instalar Docker Compose v2, ejecuta:"
    echo ""
    echo "  ${GREEN}chmod +x instalar-docker-compose-v2.sh${NC}"
    echo "  ${GREEN}./instalar-docker-compose-v2.sh${NC}"
    echo ""
    echo "O ejecuta el script completo:"
    echo ""
    echo "  ${GREEN}chmod +x INSTALAR_Y_OPTIMIZAR.sh${NC}"
    echo "  ${GREEN}./INSTALAR_Y_OPTIMIZAR.sh${NC}"
    echo ""
fi
