#!/bin/bash
#
# Script para corregir el error apt_pkg en contenedores Docker
# Puede ejecutarse desde el host o dentro del contenedor
#
# Uso desde el host:
#   ./fix_apt_docker.sh <nombre_contenedor>
#
# Uso dentro del contenedor:
#   ./fix_apt_docker.sh
#

set -e

CONTAINER_NAME="${1:-}"

# Función para ejecutar comandos dentro del contenedor
run_in_container() {
    if [ -n "$CONTAINER_NAME" ]; then
        docker exec -i "$CONTAINER_NAME" bash -c "$1"
    else
        eval "$1"
    fi
}

echo "=========================================="
if [ -n "$CONTAINER_NAME" ]; then
    echo "Arreglando apt_pkg en contenedor: $CONTAINER_NAME"
else
    echo "Arreglando apt_pkg en el sistema local"
fi
echo "=========================================="
echo ""

# Verificar si el contenedor existe (si se proporcionó nombre)
if [ -n "$CONTAINER_NAME" ]; then
    if ! docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        echo "✗ Error: Contenedor '$CONTAINER_NAME' no encontrado"
        echo ""
        echo "Contenedores disponibles:"
        docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Image}}'
        exit 1
    fi

    # Verificar si el contenedor está corriendo
    if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        echo "⚠ Advertencia: Contenedor '$CONTAINER_NAME' no está corriendo"
        echo "Iniciando contenedor..."
        docker start "$CONTAINER_NAME"
        sleep 2
    fi
fi

echo "[1/5] Deshabilitando command-not-found..."
run_in_container "rm -f /etc/apt/apt.conf.d/50command-not-found 2>/dev/null || true"
run_in_container "echo 'APT::Update::Post-Invoke-Success \"\";' > /etc/apt/apt.conf.d/99no-command-not-found"
run_in_container "rm -f /var/lib/command-not-found/commands.db 2>/dev/null || true"
run_in_container "rm -f /usr/lib/cnf-update-db 2>/dev/null || true"
echo "✓ Deshabilitado"

echo ""
echo "[2/5] Limpiando caché de apt..."
run_in_container "apt-get clean"
run_in_container "rm -rf /var/lib/apt/lists/*"
echo "✓ Caché limpiado"

echo ""
echo "[3/5] Actualizando repositorios..."
run_in_container "DEBIAN_FRONTEND=noninteractive apt-get update"
echo "✓ Repositorios actualizados"

echo ""
echo "[4/5] Instalando python3-apt..."
run_in_container "DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends python3-apt"
echo "✓ python3-apt instalado"

echo ""
echo "[5/5] Verificación final..."
run_in_container "apt-get update >/dev/null 2>&1 && echo 'apt-get funciona correctamente'"

echo ""
echo "=========================================="
echo "✓ SOLUCION APLICADA"
echo "=========================================="

if [ -n "$CONTAINER_NAME" ]; then
    echo ""
    echo "El contenedor '$CONTAINER_NAME' está listo."
    echo ""
    echo "Para verificar, ejecuta:"
    echo "  docker exec -it $CONTAINER_NAME apt-get update"
else
    echo ""
    echo "El sistema está listo."
    echo "Puedes ejecutar: apt-get update"
fi
echo ""
