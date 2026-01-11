#!/bin/bash
#
# Script para configurar el entorno Python después del downgrade
# Reinstala todas las dependencias y verifica la instalación
#
# Uso: ./setup_python_env.sh
#

set -e

PROJECT_DIR="backend"
PYTHON_CMD="python3"

echo "=========================================="
echo "Configuración del entorno Python"
echo "=========================================="
echo ""

# Verificar versión de Python
echo "[1/6] Verificando versión de Python..."
PYTHON_VERSION=$($PYTHON_CMD --version 2>&1)
echo "✓ $PYTHON_VERSION"

MAJOR_MINOR=$($PYTHON_CMD -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')")
echo "✓ Versión detectada: $MAJOR_MINOR"

if [[ "$MAJOR_MINOR" == "3.13" ]]; then
    echo "⚠ Advertencia: Estás usando Python 3.13"
    echo "  Se recomienda usar Python 3.12 para mejor estabilidad"
    echo ""
    echo "  Ejecuta primero:"
    echo "  ./downgrade_python_wsl.sh  (en WSL/Linux)"
    echo "  o descarga Python 3.12 desde python.org (Windows)"
    echo ""
    read -p "¿Continuar de todos modos? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo ""
echo "[2/6] Navegando al directorio del proyecto..."
if [ ! -d "$PROJECT_DIR" ]; then
    echo "✗ Error: Directorio '$PROJECT_DIR' no encontrado"
    echo "  Asegúrate de estar en el directorio raíz del proyecto"
    exit 1
fi
cd $PROJECT_DIR
echo "✓ En: $(pwd)"

echo ""
echo "[3/6] Limpiando caché de Python anterior..."
find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
find . -type f -name "*.pyc" -delete 2>/dev/null || true
find . -type d -name "*.egg-info" -exec rm -rf {} + 2>/dev/null || true
echo "✓ Caché limpiado"

echo ""
echo "[4/6] Actualizando pip, setuptools y wheel..."
$PYTHON_CMD -m pip install --upgrade pip setuptools wheel
echo "✓ Herramientas actualizadas"

echo ""
echo "[5/6] Instalando dependencias del proyecto..."
if [ ! -f "requirements.txt" ]; then
    echo "✗ Error: requirements.txt no encontrado"
    exit 1
fi

echo "Instalando desde requirements.txt..."
$PYTHON_CMD -m pip install -r requirements.txt

echo ""
echo "Verificando instalación de paquetes críticos..."
CRITICAL_PACKAGES=("Django" "djangorestframework" "psycopg2-binary" "celery" "redis" "gunicorn" "Pillow" "python-magic" "meilisearch")

for package in "${CRITICAL_PACKAGES[@]}"; do
    if $PYTHON_CMD -c "import importlib; importlib.import_module('${package,,}' if '${package}' != 'python-magic' else 'magic')" 2>/dev/null; then
        VERSION=$($PYTHON_CMD -m pip show "${package}" 2>/dev/null | grep "Version:" | cut -d " " -f 2)
        echo "  ✓ ${package} ${VERSION}"
    else
        echo "  ✗ ${package} - ERROR al importar"
    fi
done

echo ""
echo "[6/6] Verificando configuración de Django..."
$PYTHON_CMD manage.py check --deploy 2>&1 | head -20

echo ""
echo "=========================================="
echo "✓ ENTORNO CONFIGURADO CORRECTAMENTE"
echo "=========================================="
echo ""

# Mostrar resumen
echo "Resumen del entorno:"
echo "--------------------"
echo "Python: $PYTHON_VERSION"
echo "pip: $($PYTHON_CMD -m pip --version)"
echo "Directorio: $(pwd)"
echo ""

# Contar paquetes instalados
PACKAGE_COUNT=$($PYTHON_CMD -m pip list --format=freeze | wc -l)
echo "Paquetes instalados: $PACKAGE_COUNT"
echo ""

echo "Comandos útiles:"
echo "----------------"
echo "Iniciar servidor de desarrollo:"
echo "  python manage.py runserver"
echo ""
echo "Ejecutar migraciones:"
echo "  python manage.py migrate"
echo ""
echo "Crear superusuario:"
echo "  python manage.py createsuperuser"
echo ""
echo "Ejecutar tests:"
echo "  pytest"
echo ""
