#!/bin/bash
#
# Script para hacer downgrade de Python 3.13 a Python 3.12
# Compatible con Ubuntu/Debian y sistemas basados en apt
#
# Uso: ./downgrade_python.sh
#

set -e  # Salir si cualquier comando falla

PYTHON_VERSION="3.12"
PYTHON_FULL_VERSION="3.12.8"  # Última versión estable de Python 3.12

echo "=========================================="
echo "Downgrade de Python 3.13 a Python 3.12"
echo "=========================================="
echo ""

# Detectar sistema operativo
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "✓ Sistema Linux detectado"

    # Verificar si es Ubuntu/Debian
    if command -v apt-get &> /dev/null; then
        echo "✓ Sistema basado en Debian/Ubuntu"

        echo ""
        echo "[1/6] Actualizando repositorios..."
        sudo apt-get update

        echo ""
        echo "[2/6] Instalando dependencias necesarias..."
        sudo apt-get install -y software-properties-common build-essential \
            libssl-dev libffi-dev libsqlite3-dev libbz2-dev libreadline-dev \
            zlib1g-dev libncurses5-dev libgdbm-dev liblzma-dev tk-dev \
            libdb-dev libexpat1-dev wget curl

        echo ""
        echo "[3/6] Agregando repositorio deadsnakes (para Python 3.12)..."
        sudo add-apt-repository -y ppa:deadsnakes/ppa
        sudo apt-get update

        echo ""
        echo "[4/6] Removiendo Python 3.13 (si está instalado desde apt)..."
        sudo apt-get remove -y python3.13 python3.13-dev python3.13-venv || true

        echo ""
        echo "[5/6] Instalando Python 3.12..."
        sudo apt-get install -y python${PYTHON_VERSION} \
            python${PYTHON_VERSION}-dev \
            python${PYTHON_VERSION}-venv \
            python${PYTHON_VERSION}-distutils

        echo ""
        echo "[6/6] Configurando Python 3.12 como predeterminado..."
        sudo update-alternatives --install /usr/bin/python3 python3 /usr/bin/python${PYTHON_VERSION} 1
        sudo update-alternatives --set python3 /usr/bin/python${PYTHON_VERSION}

        # Instalar/actualizar pip
        echo ""
        echo "Instalando pip para Python 3.12..."
        curl -sS https://bootstrap.pypa.io/get-pip.py | sudo python${PYTHON_VERSION}

    elif command -v yum &> /dev/null; then
        echo "✓ Sistema basado en RedHat/CentOS"

        echo ""
        echo "[1/5] Instalando dependencias de compilación..."
        sudo yum groupinstall -y "Development Tools"
        sudo yum install -y openssl-devel bzip2-devel libffi-devel \
            zlib-devel readline-devel sqlite-devel wget

        echo ""
        echo "[2/5] Descargando Python ${PYTHON_FULL_VERSION}..."
        cd /tmp
        wget https://www.python.org/ftp/python/${PYTHON_FULL_VERSION}/Python-${PYTHON_FULL_VERSION}.tgz

        echo ""
        echo "[3/5] Extrayendo y compilando Python ${PYTHON_FULL_VERSION}..."
        tar -xzf Python-${PYTHON_FULL_VERSION}.tgz
        cd Python-${PYTHON_FULL_VERSION}
        ./configure --enable-optimizations --with-ensurepip=install
        make -j $(nproc)

        echo ""
        echo "[4/5] Instalando Python ${PYTHON_FULL_VERSION}..."
        sudo make altinstall

        echo ""
        echo "[5/5] Configurando enlaces simbólicos..."
        sudo ln -sf /usr/local/bin/python${PYTHON_VERSION} /usr/bin/python3
        sudo ln -sf /usr/local/bin/pip${PYTHON_VERSION} /usr/bin/pip3

        # Limpiar archivos temporales
        cd /tmp
        rm -rf Python-${PYTHON_FULL_VERSION} Python-${PYTHON_FULL_VERSION}.tgz

    else
        echo "⚠ Sistema Linux no soportado automáticamente"
        echo "Por favor instala Python 3.12 manualmente desde python.org"
        exit 1
    fi

elif [[ "$OSTYPE" == "darwin"* ]]; then
    echo "✓ macOS detectado"

    if command -v brew &> /dev/null; then
        echo ""
        echo "[1/4] Homebrew detectado"

        echo ""
        echo "[2/4] Desinstalando Python 3.13..."
        brew uninstall python@3.13 || true

        echo ""
        echo "[3/4] Instalando Python 3.12..."
        brew install python@3.12

        echo ""
        echo "[4/4] Configurando enlaces..."
        brew link --overwrite python@3.12

    else
        echo "⚠ Homebrew no está instalado"
        echo "Instala Homebrew desde: https://brew.sh"
        echo "Luego ejecuta: brew install python@3.12"
        exit 1
    fi

else
    echo "⚠ Sistema operativo no soportado: $OSTYPE"
    echo ""
    echo "Para Windows, descarga el instalador desde:"
    echo "https://www.python.org/downloads/release/python-31212/"
    exit 1
fi

# Verificar instalación
echo ""
echo "=========================================="
echo "Verificando instalación..."
echo "=========================================="
echo ""

python3 --version
echo ""

pip3 --version
echo ""

# Verificar que sea Python 3.12.x
INSTALLED_VERSION=$(python3 --version 2>&1 | grep -oP '3\.\d+')
if [[ "$INSTALLED_VERSION" == "3.12" ]]; then
    echo "✓ Python 3.12 instalado correctamente"
else
    echo "⚠ Advertencia: La versión instalada es $INSTALLED_VERSION (se esperaba 3.12)"
fi

echo ""
echo "=========================================="
echo "✓ DOWNGRADE COMPLETADO"
echo "=========================================="
echo ""
echo "Próximos pasos:"
echo "1. Reinstala las dependencias de tu proyecto:"
echo "   cd backend && pip3 install -r requirements.txt"
echo ""
echo "2. Verifica que todo funcione:"
echo "   python3 manage.py check"
echo ""
echo "3. Ejecuta migraciones si es necesario:"
echo "   python3 manage.py migrate"
echo ""
