#!/bin/bash

# Script wrapper que maneja el problema de docker-compose automaticamente

echo "========================================"
echo "  INICIANDO OPTIMIZACION 16GB"
echo "========================================"
echo ""

# Detectar cual version de Docker Compose usar
DOCKER_COMPOSE=""

# Primero intentar docker compose v2
if docker compose version &> /dev/null 2>&1; then
    DOCKER_COMPOSE="docker compose"
    echo "✓ Usando Docker Compose v2"
    docker compose version
    echo ""
# Luego intentar docker-compose v1
elif command -v docker-compose &> /dev/null && docker-compose version &> /dev/null 2>&1; then
    DOCKER_COMPOSE="docker-compose"
    echo "✓ Usando docker-compose v1"
    docker-compose version
    echo ""
else
    echo "✗ ERROR: No se encontro una version funcional de Docker Compose"
    echo ""
    echo "Problema detectado:"
    echo "  docker-compose v1 esta instalado pero no funciona"
    echo "  (probablemente error de compatibilidad con Python 3.13)"
    echo ""
    echo "SOLUCION:"
    echo "==========="
    echo ""
    echo "Opcion 1 - Usar Docker Compose v2 (Recomendado):"
    echo "  sudo apt-get update"
    echo "  sudo apt-get install docker-compose-plugin"
    echo ""
    echo "Opcion 2 - Remover docker-compose v1 roto:"
    echo "  sudo apt-get remove docker-compose"
    echo "  sudo rm /usr/bin/docker-compose"
    echo ""
    echo "Despues vuelve a ejecutar este script."
    echo ""
    exit 1
fi

# Exportar la variable para que el script la use
export DOCKER_COMPOSE

echo "Verificando permisos del script..."
if [ ! -x "aplicar-optimizacion-16gb.sh" ]; then
    echo "⚠ Dando permisos de ejecucion al script..."
    chmod +x aplicar-optimizacion-16gb.sh
    echo "✓ Permisos aplicados"
fi
echo ""

echo "Iniciando script de optimizacion..."
echo "========================================"
echo ""
sleep 2

# Ejecutar el script de optimizacion
./aplicar-optimizacion-16gb.sh
