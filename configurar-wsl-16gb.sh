#!/bin/bash

echo "========================================"
echo "  VERIFICANDO CONFIGURACION WSL 16GB"
echo "========================================"
echo ""

echo "[1] Memoria total disponible:"
free -h
echo ""

echo "[2] Memoria asignada a WSL:"
cat /proc/meminfo | grep MemTotal
echo ""

echo "[3] Verificando Docker..."
docker --version
echo ""

echo "[4] Recursos disponibles para Docker:"
docker info | grep -E "Total Memory|CPUs"
echo ""

echo "========================================"
echo "  CONFIGURACION VERIFICADA"
echo "========================================"
echo ""
echo "Si la memoria total es >= 8GB, estas listo"
echo "para aplicar las optimizaciones de Docker."
echo ""
