#!/bin/bash
#
# Script para resolver definitivamente el error:
# "ModuleNotFoundError: No module named 'apt_pkg'"
# y "Problem executing scripts APT::Update::Post-Invoke-Success"
#
# Uso: ./fix_apt_error.sh
# Nota: Ejecutar como root o con sudo dentro del contenedor Docker
#

set -e  # Salir si cualquier comando falla

echo "=========================================="
echo "Solucionando error de apt_pkg..."
echo "=========================================="

# Paso 1: Deshabilitar el script command-not-found que causa el error
echo ""
echo "[1/5] Deshabilitando command-not-found..."
if [ -f /etc/apt/apt.conf.d/50command-not-found ]; then
    rm -f /etc/apt/apt.conf.d/50command-not-found
    echo "✓ Archivo removido: /etc/apt/apt.conf.d/50command-not-found"
fi

# Paso 2: Crear configuración para evitar el Post-Invoke
echo ""
echo "[2/5] Configurando APT para evitar Post-Invoke..."
cat > /etc/apt/apt.conf.d/99no-command-not-found << 'EOF'
APT::Update::Post-Invoke-Success "";
EOF
echo "✓ Configuración creada: /etc/apt/apt.conf.d/99no-command-not-found"

# Paso 3: Limpiar base de datos de command-not-found
echo ""
echo "[3/5] Limpiando base de datos de command-not-found..."
if [ -f /var/lib/command-not-found/commands.db ]; then
    rm -f /var/lib/command-not-found/commands.db
    echo "✓ Base de datos removida"
fi

# Paso 4: Limpiar caché de APT
echo ""
echo "[4/5] Limpiando caché de APT..."
apt-get clean
rm -rf /var/lib/apt/lists/*
echo "✓ Caché limpiado"

# Paso 5: Actualizar e instalar python3-apt
echo ""
echo "[5/5] Actualizando repositorios e instalando python3-apt..."
apt-get update
DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends python3-apt
apt-get clean
rm -rf /var/lib/apt/lists/*
echo "✓ python3-apt instalado correctamente"

echo ""
echo "=========================================="
echo "✓ SOLUCION APLICADA EXITOSAMENTE"
echo "=========================================="
echo ""
echo "El error de apt_pkg ha sido resuelto."
echo "Ahora puedes ejecutar 'apt-get update' sin problemas."
echo ""
