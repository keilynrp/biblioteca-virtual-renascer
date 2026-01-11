#!/bin/bash

echo "=================================================="
echo "Reiniciando Frontend - Aplicando Cambios"
echo "=================================================="
echo ""

echo "1. Reiniciando contenedor frontend..."
sudo docker-compose restart frontend

echo ""
echo "2. Esperando a que el frontend esté listo..."
sleep 8

echo ""
echo "3. Mostrando logs del frontend..."
sudo docker-compose logs --tail=20 frontend

echo ""
echo "=================================================="
echo "✓ Frontend reiniciado"
echo "=================================================="
echo ""
echo "Abre http://localhost:3000 en tu navegador"
echo "Si no ves cambios, presiona Ctrl+Shift+R para limpiar cache"
