#!/bin/bash
#
# Script para hacer downgrade de Python 3.13 a Python 3.12 en WSL/Ubuntu
# Optimizado para Windows Subsystem for Linux
#
# Uso:
#   1. Abre WSL/Ubuntu
#   2. chmod +x downgrade_python_wsl.sh
#   3. ./downgrade_python_wsl.sh
#

set -e

PYTHON_VERSION="3.12"

echo "=========================================="
echo "Python 3.13 → 3.12 Downgrade (WSL/Ubuntu)"
echo "=========================================="
echo ""

# Verificar que estamos en WSL
if ! grep -qEi "(Microsoft|WSL)" /proc/version &> /dev/null ; then
    echo "⚠ Este script está optimizado para WSL"
    echo "¿Continuar de todos modos? (y/n)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        exit 0
    fi
fi

echo "[1/7] Actualizando sistema..."
sudo apt-get update

echo ""
echo "[2/7] Instalando dependencias de compilación..."
sudo apt-get install -y \
    build-essential \
    libssl-dev \
    libffi-dev \
    libsqlite3-dev \
    libbz2-dev \
    libreadline-dev \
    zlib1g-dev \
    libncurses5-dev \
    libgdbm-dev \
    liblzma-dev \
    tk-dev \
    uuid-dev \
    software-properties-common \
    wget \
    curl

echo ""
echo "[3/7] Agregando repositorio deadsnakes..."
sudo add-apt-repository -y ppa:deadsnakes/ppa
sudo apt-get update

echo ""
echo "[4/7] Removiendo Python 3.13..."
sudo apt-get remove -y python3.13 python3.13-dev python3.13-venv 2>/dev/null || true
sudo apt-get autoremove -y

echo ""
echo "[5/7] Instalando Python 3.12..."
sudo apt-get install -y \
    python${PYTHON_VERSION} \
    python${PYTHON_VERSION}-dev \
    python${PYTHON_VERSION}-venv \
    python${PYTHON_VERSION}-distutils \
    python3-pip

echo ""
echo "[6/7] Configurando alternativas de Python..."
# Remover alternativa existente si existe
sudo update-alternatives --remove-all python3 2>/dev/null || true

# Configurar Python 3.12 como predeterminado
sudo update-alternatives --install /usr/bin/python3 python3 /usr/bin/python${PYTHON_VERSION} 1
sudo update-alternatives --set python3 /usr/bin/python${PYTHON_VERSION}

# Crear enlace simbólico para python (sin el 3)
sudo ln -sf /usr/bin/python3 /usr/bin/python 2>/dev/null || true

echo ""
echo "[7/7] Actualizando pip..."
curl -sS https://bootstrap.pypa.io/get-pip.py | sudo python3

# Upgrade pip a la última versión
python3 -m pip install --upgrade pip setuptools wheel

echo ""
echo "=========================================="
echo "Verificando instalación..."
echo "=========================================="
echo ""

echo "Versión de Python:"
python3 --version
python --version 2>/dev/null || echo "python command not available (OK)"

echo ""
echo "Versión de pip:"
pip3 --version

echo ""
echo "Ubicación de Python:"
which python3

echo ""
echo "Módulos instalados:"
python3 -m pip list | head -10

# Verificar version específica
INSTALLED_VERSION=$(python3 -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')")

echo ""
if [[ "$INSTALLED_VERSION" == "3.12" ]]; then
    echo "=========================================="
    echo "✓ DOWNGRADE EXITOSO"
    echo "=========================================="
    echo ""
    echo "Python ${INSTALLED_VERSION} está configurado correctamente"
else
    echo "=========================================="
    echo "⚠ ADVERTENCIA"
    echo "=========================================="
    echo ""
    echo "Versión instalada: ${INSTALLED_VERSION}"
    echo "Versión esperada: 3.12"
    echo ""
    echo "Intenta ejecutar manualmente:"
    echo "  sudo update-alternatives --config python3"
fi

echo ""
echo "Próximos pasos:"
echo "----------------"
echo "1. Navega a tu proyecto:"
echo "   cd /mnt/d/bvs_framework/backend"
echo ""
echo "2. Crea un entorno virtual:"
echo "   python3 -m venv venv"
echo "   source venv/bin/activate"
echo ""
echo "3. Instala dependencias:"
echo "   pip install -r requirements.txt"
echo ""
echo "4. Verifica Django:"
echo "   python manage.py check"
echo ""
