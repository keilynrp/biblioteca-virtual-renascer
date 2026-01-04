#!/bin/bash

# Script para actualizar Node.js 22.20.0, Python 3.13.2 y Django 6.0 en WSL para Docker
# Autor: Sistema BVS Framework
# Fecha: 2025-12-29

set -e  # Salir si hay algún error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # Sin color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Actualización de Stack BVS Framework${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Función para mostrar mensajes
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[OK]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar que estamos en WSL
if ! grep -qi microsoft /proc/version; then
    log_error "Este script debe ejecutarse en WSL (Windows Subsystem for Linux)"
    exit 1
fi

log_success "Ejecutando en WSL"

# Actualizar lista de paquetes
log_info "Actualizando lista de paquetes del sistema..."
sudo apt-get update -qq

# ============================================
# 1. ACTUALIZAR PYTHON A 3.13.2
# ============================================
echo ""
log_info "=== Actualizando Python a 3.13.2 ==="

# Verificar versión actual
PYTHON_CURRENT=$(python3 --version 2>/dev/null || echo "No instalado")
log_info "Python actual: $PYTHON_CURRENT"

# Instalar dependencias necesarias para compilar Python
log_info "Instalando dependencias para compilar Python..."
sudo apt-get install -y -qq \
    build-essential \
    zlib1g-dev \
    libncurses5-dev \
    libgdbm-dev \
    libnss3-dev \
    libssl-dev \
    libsqlite3-dev \
    libreadline-dev \
    libffi-dev \
    libbz2-dev \
    liblzma-dev \
    wget \
    curl

# Descargar y compilar Python 3.13.2
log_info "Descargando Python 3.13.2..."
cd /tmp
wget -q https://www.python.org/ftp/python/3.13.2/Python-3.13.2.tgz

log_info "Extrayendo Python 3.13.2..."
tar -xzf Python-3.13.2.tgz
cd Python-3.13.2

log_info "Configurando Python 3.13.2..."
./configure --enable-optimizations --with-ensurepip=install --quiet

log_info "Compilando Python 3.13.2 (esto puede tardar varios minutos)..."
make -j$(nproc) > /dev/null 2>&1

log_info "Instalando Python 3.13.2..."
sudo make altinstall > /dev/null 2>&1

# Crear enlaces simbólicos
log_info "Configurando Python 3.13 como predeterminado..."
sudo update-alternatives --install /usr/bin/python3 python3 /usr/local/bin/python3.13 1
sudo update-alternatives --set python3 /usr/local/bin/python3.13

# Actualizar pip
log_info "Actualizando pip..."
python3.13 -m pip install --upgrade pip -q

# Limpiar archivos temporales
cd /tmp
rm -rf Python-3.13.2 Python-3.13.2.tgz

PYTHON_NEW=$(python3 --version)
log_success "Python actualizado: $PYTHON_NEW"

# ============================================
# 2. ACTUALIZAR NODE.JS A 22.20.0
# ============================================
echo ""
log_info "=== Actualizando Node.js a 22.20.0 ==="

# Verificar versión actual
NODE_CURRENT=$(node --version 2>/dev/null || echo "No instalado")
log_info "Node.js actual: $NODE_CURRENT"

# Instalar/Actualizar nvm
log_info "Instalando/Actualizando nvm (Node Version Manager)..."
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash > /dev/null 2>&1

# Cargar nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Instalar Node.js 22.20.0
log_info "Instalando Node.js 22.20.0..."
nvm install 22.20.0 > /dev/null 2>&1

# Establecer como predeterminado
log_info "Configurando Node.js 22.20.0 como predeterminado..."
nvm alias default 22.20.0 > /dev/null 2>&1
nvm use 22.20.0 > /dev/null 2>&1

NODE_NEW=$(node --version)
NPM_NEW=$(npm --version)
log_success "Node.js actualizado: $NODE_NEW"
log_success "npm actualizado: v$NPM_NEW"

# ============================================
# 3. ACTUALIZAR DOCKERFILES
# ============================================
echo ""
log_info "=== Actualizando Dockerfiles ==="

# Actualizar Dockerfile del backend
BACKEND_DOCKERFILE="$HOME/../../mnt/d/bvs_framework/backend/Dockerfile"
if [ -f "$BACKEND_DOCKERFILE" ]; then
    log_info "Actualizando backend/Dockerfile a Python 3.13..."
    sed -i 's/FROM python:[0-9.]*-slim/FROM python:3.13-slim/' "$BACKEND_DOCKERFILE"
    log_success "backend/Dockerfile actualizado"
else
    log_warning "No se encontró backend/Dockerfile en la ruta esperada"
fi

# Actualizar Dockerfile del frontend
FRONTEND_DOCKERFILE="$HOME/../../mnt/d/bvs_framework/frontend/Dockerfile"
if [ -f "$FRONTEND_DOCKERFILE" ]; then
    log_info "Actualizando frontend/Dockerfile a Node 22..."
    sed -i 's/FROM node:[0-9]*-alpine/FROM node:22-alpine/' "$FRONTEND_DOCKERFILE"
    log_success "frontend/Dockerfile actualizado"
else
    log_warning "No se encontró frontend/Dockerfile en la ruta esperada"
fi

# ============================================
# 4. ACTUALIZAR DJANGO A 6.0
# ============================================
echo ""
log_info "=== Verificando Django 6.0 en requirements.txt ==="

REQUIREMENTS_FILE="$HOME/../../mnt/d/bvs_framework/backend/requirements.txt"
if [ -f "$REQUIREMENTS_FILE" ]; then
    if grep -q "Django>=6.0" "$REQUIREMENTS_FILE"; then
        log_success "Django 6.0 ya está configurado en requirements.txt"
    else
        log_warning "Actualizando requirements.txt para Django 6.0..."
        sed -i 's/Django>=[0-9.]*/Django>=6.0/' "$REQUIREMENTS_FILE"
        log_success "requirements.txt actualizado"
    fi
else
    log_warning "No se encontró requirements.txt en la ruta esperada"
fi

# ============================================
# 5. RECONSTRUIR CONTENEDORES DOCKER
# ============================================
echo ""
log_info "=== Reconstruyendo contenedores Docker ==="

PROJECT_DIR="$HOME/../../mnt/d/bvs_framework"
if [ -d "$PROJECT_DIR" ]; then
    cd "$PROJECT_DIR"

    log_info "Deteniendo contenedores existentes..."
    docker-compose down 2>/dev/null || true

    log_info "Reconstruyendo imágenes sin caché..."
    docker-compose build --no-cache

    log_success "Contenedores reconstruidos exitosamente"
else
    log_warning "No se encontró el directorio del proyecto"
    log_warning "Deberás reconstruir los contenedores manualmente con:"
    echo "  cd /mnt/d/bvs_framework"
    echo "  docker-compose down"
    echo "  docker-compose build --no-cache"
fi

# ============================================
# 6. RESUMEN FINAL
# ============================================
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Actualización Completada${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Versiones instaladas:"
echo "  - Python: $(python3 --version)"
echo "  - Node.js: $(node --version)"
echo "  - npm: v$(npm --version)"
echo "  - Django: 6.0 (configurado en requirements.txt)"
echo ""
log_info "Próximos pasos:"
echo "  1. Iniciar los contenedores: docker-compose up -d"
echo "  2. Verificar migraciones de Django: docker-compose exec backend python manage.py migrate"
echo "  3. Verificar dependencias de Node: docker-compose exec frontend npm install"
echo ""
log_success "¡Actualización completada con éxito!"
