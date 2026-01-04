#!/bin/bash

# Script para reiniciar el backend y aplicar configuración de paginación

echo "=================================================="
echo "Reiniciando Backend - Aplicando Optimizaciones"
echo "=================================================="
echo ""

# Reiniciar contenedor backend
echo "1. Reiniciando contenedor backend..."
docker-compose restart backend

echo ""
echo "2. Esperando a que el backend esté listo..."
sleep 5

echo ""
echo "3. Verificando que el backend responde..."
curl -s http://localhost:8000/api/content/books/ | head -c 200
echo ""

echo ""
echo "=================================================="
echo "✓ Backend reiniciado exitosamente"
echo "=================================================="
echo ""
echo "NOTA: El frontend debería cargar más rápido ahora."
echo "La paginación está configurada con PAGE_SIZE=1000"
echo "(retorna todos los registros en una sola página)"
