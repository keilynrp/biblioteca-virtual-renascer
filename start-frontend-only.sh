#!/bin/bash

echo "============================================================"
echo "Iniciando Solo el Frontend"
echo "============================================================"
echo ""

# Verificar que Docker este corriendo
if ! docker ps &> /dev/null; then
    echo "ERROR: Docker no esta corriendo."
    echo ""
    echo "Ejecuta primero:"
    echo "  sudo service docker start"
    echo ""
    exit 1
fi

echo "[1] Deteniendo frontend si esta corriendo..."
docker compose stop frontend 2>/dev/null

echo ""
echo "[2] Eliminando contenedor anterior..."
docker compose rm -f frontend 2>/dev/null

echo ""
echo "[3] Iniciando frontend con configuracion optimizada..."
echo "    (Memoria: 2.5GB, Node: 2048MB)"
docker compose up -d frontend

echo ""
echo "[4] Mostrando logs en tiempo real..."
echo "============================================================"
echo ""
echo "ESPERA A VER: 'Ready in X ms' o 'compiled successfully'"
echo "Luego presiona Ctrl+C para salir"
echo ""
echo "Accede a: http://localhost:3000"
echo ""
echo "============================================================"
echo ""

docker compose logs -f frontend
