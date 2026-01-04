#!/bin/bash

# Script para limpieza completa y reconstrucción del frontend
# Este script limpia toda la caché y reconstruye el frontend desde cero

echo "=========================================="
echo "  LIMPIEZA COMPLETA DEL FRONTEND"
echo "=========================================="
echo ""

# Detener cualquier proceso de Node.js en ejecución
echo "► Deteniendo procesos de Node.js..."
pkill -f "next dev" 2>/dev/null || true
pkill -f "node" 2>/dev/null || true
sleep 2

# Limpiar directorios de caché
echo ""
echo "► Limpiando directorios de caché..."

if [ -d ".next" ]; then
    echo "  • Eliminando .next/"
    rm -rf .next
fi

if [ -d "node_modules/.cache" ]; then
    echo "  • Eliminando node_modules/.cache/"
    rm -rf node_modules/.cache
fi

if [ -d ".turbo" ]; then
    echo "  • Eliminando .turbo/"
    rm -rf .turbo
fi

if [ -d "out" ]; then
    echo "  • Eliminando out/"
    rm -rf out
fi

# Limpiar archivos temporales de Next.js
echo ""
echo "► Limpiando archivos temporales..."
find . -name ".next" -type d -prune -exec rm -rf {} + 2>/dev/null || true
find . -name "*.tsbuildinfo" -delete 2>/dev/null || true

# Limpiar caché de npm
echo ""
echo "► Limpiando caché de npm..."
npm cache clean --force 2>/dev/null || true

# Reinstalar dependencias (opcional, descomenta si es necesario)
# echo ""
# echo "► Reinstalando dependencias..."
# rm -rf node_modules
# npm install

echo ""
echo "=========================================="
echo "  ✓ LIMPIEZA COMPLETADA"
echo "=========================================="
echo ""
echo "► Iniciando servidor de desarrollo..."
echo ""

# Iniciar el servidor de desarrollo
npm run dev
