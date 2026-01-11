#!/bin/bash
#
# Solución INMEDIATA para el error de apt_pkg
# Ejecutar este script AHORA para resolver el problema
#
# Uso: sudo bash fix_apt_now.sh
#

set -e

echo "=========================================="
echo "Solucionando error de apt_pkg AHORA"
echo "=========================================="
echo ""

# Verificar si somos root
if [ "$EUID" -ne 0 ]; then
    echo "⚠ Este script necesita permisos de root"
    echo "Ejecuta: sudo bash fix_apt_now.sh"
    exit 1
fi

echo "[1/6] Deshabilitando el hook problemático..."
# Deshabilitar completamente el Post-Invoke que causa el error
cat > /etc/apt/apt.conf.d/99-disable-command-not-found << 'EOF'
# Disable command-not-found to prevent apt_pkg errors
APT::Update::Post-Invoke-Success "";
APT::Update::Post-Invoke "";
EOF

echo "✓ Hook deshabilitado"

echo ""
echo "[2/6] Removiendo archivos problemáticos..."
# Remover el script que causa el error
rm -f /usr/lib/cnf-update-db
rm -f /etc/apt/apt.conf.d/50command-not-found
rm -f /var/lib/command-not-found/commands.db

echo "✓ Archivos removidos"

echo ""
echo "[3/6] Limpiando caché de apt..."
apt-get clean
rm -rf /var/lib/apt/lists/*

echo "✓ Caché limpiado"

echo ""
echo "[4/6] Probando apt-get update..."
# Esto debería funcionar ahora sin el error
export DEBIAN_FRONTEND=noninteractive
apt-get update

echo "✓ apt-get update funciona correctamente"

echo ""
echo "[5/6] Instalando python3-apt (si falta)..."
apt-get install -y --no-install-recommends python3-apt

echo "✓ python3-apt instalado"

echo ""
echo "[6/6] Verificación final..."
apt-get update
apt-get check

echo ""
echo "=========================================="
echo "✓ PROBLEMA RESUELTO"
echo "=========================================="
echo ""
echo "Ahora puedes ejecutar apt-get sin errores:"
echo "  sudo apt-get update"
echo "  sudo apt-get install <paquete>"
echo ""
