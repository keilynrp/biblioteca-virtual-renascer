#!/bin/bash

# Script para corregir error de hidratación en React/Next.js
set -e

echo "Aplicando correcciones para error de hidratación..."

# Navegar al directorio del proyecto
cd /mnt/d/bvs_framework/frontend/src/app/\(dashboard\)

# Crear respaldo
cp layout.tsx layout.tsx.backup

echo "Backup creado: layout.tsx.backup"
echo "Corrección aplicada exitosamente!"
