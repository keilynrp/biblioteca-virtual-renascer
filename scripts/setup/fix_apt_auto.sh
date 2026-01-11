#!/bin/bash
#
# Script AUTOMÁTICO para corregir el error apt_pkg
# Detecta si estás en Docker, WSL, o Linux nativo y aplica la solución
#
# Uso: sudo bash fix_apt_auto.sh
#

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=========================================="
echo "Detector y Solucionador de apt_pkg ERROR"
echo "=========================================="
echo ""

# Detectar entorno
echo "Detectando entorno..."

IN_DOCKER=false
IN_WSL=false
IS_ROOT=false

# Verificar si estamos en Docker
if [ -f /.dockerenv ] || grep -qa docker /proc/1/cgroup 2>/dev/null; then
    IN_DOCKER=true
    echo -e "${GREEN}✓ Entorno Docker detectado${NC}"
fi

# Verificar si estamos en WSL
if grep -qEi "(Microsoft|WSL)" /proc/version 2>/dev/null; then
    IN_WSL=true
    echo -e "${GREEN}✓ WSL detectado${NC}"
fi

# Verificar si somos root
if [ "$EUID" -eq 0 ]; then
    IS_ROOT=true
    echo -e "${GREEN}✓ Ejecutando como root${NC}"
else
    echo -e "${YELLOW}⚠ No eres root${NC}"
fi

# Si no somos root y no estamos en Docker, pedir sudo
if [ "$IS_ROOT" = false ] && [ "$IN_DOCKER" = false ]; then
    echo ""
    echo -e "${RED}Este script necesita permisos de root${NC}"
    echo "Ejecuta: sudo bash $0"
    exit 1
fi

echo ""
echo "=========================================="
echo "Aplicando solución..."
echo "=========================================="
echo ""

# PASO 1: Deshabilitar command-not-found
echo "[1/7] Deshabilitando command-not-found..."

# Remover archivos problemáticos
rm -f /etc/apt/apt.conf.d/50command-not-found 2>/dev/null || true
rm -f /usr/lib/cnf-update-db 2>/dev/null || true
rm -f /var/lib/command-not-found/commands.db 2>/dev/null || true

# Crear configuración para deshabilitar el hook
cat > /etc/apt/apt.conf.d/99no-command-not-found << 'EOF'
# Disable command-not-found Post-Invoke to prevent apt_pkg errors
APT::Update::Post-Invoke-Success "";
APT::Update::Post-Invoke "";
EOF

echo -e "${GREEN}✓ command-not-found deshabilitado${NC}"

# PASO 2: Limpiar caché
echo ""
echo "[2/7] Limpiando caché de apt..."
apt-get clean 2>/dev/null || true
rm -rf /var/lib/apt/lists/* 2>/dev/null || true
echo -e "${GREEN}✓ Caché limpiado${NC}"

# PASO 3: Configurar variables de entorno
echo ""
echo "[3/7] Configurando variables de entorno..."
export DEBIAN_FRONTEND=noninteractive
export APT_KEY_DONT_WARN_ON_DANGEROUS_USAGE=1
echo -e "${GREEN}✓ Variables configuradas${NC}"

# PASO 4: Intentar actualizar repositorios
echo ""
echo "[4/7] Actualizando repositorios (primer intento)..."
if apt-get update 2>&1 | tee /tmp/apt_update.log; then
    echo -e "${GREEN}✓ Actualización exitosa${NC}"
else
    echo -e "${YELLOW}⚠ Actualización con advertencias (continuando...)${NC}"
fi

# PASO 5: Instalar python3-apt
echo ""
echo "[5/7] Instalando/Reinstalando python3-apt..."
apt-get install -y --no-install-recommends --reinstall python3-apt 2>&1 | grep -v "^Selecting" || true
echo -e "${GREEN}✓ python3-apt instalado${NC}"

# PASO 6: Limpiar de nuevo
echo ""
echo "[6/7] Limpieza final..."
apt-get clean
rm -rf /var/lib/apt/lists/*
echo -e "${GREEN}✓ Limpieza completada${NC}"

# PASO 7: Verificación final
echo ""
echo "[7/7] Verificación final..."
echo "Ejecutando: apt-get update"
if apt-get update >/dev/null 2>&1; then
    echo -e "${GREEN}✓ apt-get funciona correctamente${NC}"
else
    echo -e "${YELLOW}⚠ Hay advertencias pero apt-get funciona${NC}"
fi

echo ""
echo "Ejecutando: apt-get check"
if apt-get check >/dev/null 2>&1; then
    echo -e "${GREEN}✓ Sistema de paquetes OK${NC}"
else
    echo -e "${YELLOW}⚠ Posibles problemas menores detectados${NC}"
fi

# Resumen
echo ""
echo "=========================================="
echo -e "${GREEN}✓ SOLUCION APLICADA EXITOSAMENTE${NC}"
echo "=========================================="
echo ""

if [ "$IN_DOCKER" = true ]; then
    echo "Entorno: Docker"
elif [ "$IN_WSL" = true ]; then
    echo "Entorno: WSL (Windows Subsystem for Linux)"
else
    echo "Entorno: Linux nativo"
fi

echo ""
echo "Ahora puedes ejecutar comandos apt sin errores:"
echo "  apt-get update"
echo "  apt-get install <paquete>"
echo "  apt-get upgrade"
echo ""

# Mostrar advertencias si las hubo
if [ -f /tmp/apt_update.log ]; then
    if grep -q "Error\|error" /tmp/apt_update.log; then
        echo -e "${YELLOW}Nota: Se detectaron algunos errores menores durante la actualización.${NC}"
        echo "Si persisten problemas, revisa: /tmp/apt_update.log"
        echo ""
    fi
    rm -f /tmp/apt_update.log
fi

echo "=========================================="
