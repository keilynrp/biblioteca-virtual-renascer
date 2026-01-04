#!/bin/bash

echo "========================================"
echo "  SOLUCION: Error docker-compose Python"
echo "========================================"
echo ""

echo "Detectando el problema..."
echo ""

# Verificar si docker-compose v1 existe y falla
if command -v docker-compose &> /dev/null; then
    echo "✓ docker-compose v1 encontrado en: $(which docker-compose)"

    # Intentar ejecutar
    if docker-compose version &> /dev/null; then
        echo "✓ docker-compose v1 funciona correctamente"
        echo "  Version: $(docker-compose version --short)"
        exit 0
    else
        echo "✗ docker-compose v1 esta roto (error de Python)"
        echo ""
        echo "Soluciones disponibles:"
        echo ""
    fi
else
    echo "⚠ docker-compose v1 no encontrado"
fi

# Verificar si docker compose v2 esta disponible
if docker compose version &> /dev/null; then
    echo "✓ Docker Compose v2 esta disponible"
    echo "  Version: $(docker compose version --short)"
    echo ""
    echo "SOLUCION RECOMENDADA:"
    echo "-------------------"
    echo "Usar Docker Compose v2 (ya instalado)"
    echo ""
    echo "El script aplicar-optimizacion-16gb.sh ya esta configurado"
    echo "para usar Docker Compose v2 automaticamente."
    echo ""
    echo "Simplemente ejecuta:"
    echo "  ./aplicar-optimizacion-16gb.sh"
    echo ""
    exit 0
fi

# Si llegamos aqui, ninguna version funciona
echo ""
echo "✗ Ni docker-compose v1 ni docker compose v2 funcionan"
echo ""
echo "SOLUCION:"
echo "---------"
echo ""
echo "1. Instalar Docker Compose v2 (recomendado):"
echo ""
echo "   # Para sistemas con apt"
echo "   sudo apt-get update"
echo "   sudo apt-get install docker-compose-plugin"
echo ""
echo "   # Para otros sistemas, ver:"
echo "   https://docs.docker.com/compose/install/"
echo ""
echo "2. O desinstalar docker-compose v1 roto:"
echo ""
echo "   sudo apt-get remove docker-compose"
echo "   sudo rm /usr/bin/docker-compose"
echo ""
exit 1
