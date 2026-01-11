#!/bin/bash

echo "===================================="
echo "Instalando Year Picker Component"
echo "===================================="

echo ""
echo "Instalando @radix-ui/react-popover..."
docker exec -it bvs_framework-frontend-1 npm install @radix-ui/react-popover

echo ""
echo "===================================="
echo "Instalacion completada!"
echo "===================================="
echo ""
echo "Reiniciando frontend para aplicar cambios..."
docker compose restart frontend

echo ""
echo "===================================="
echo "Listo!"
echo "===================================="
echo ""
echo "IMPORTANTE: Haz hard reload en el navegador (Ctrl+Shift+R)"
echo "para ver el nuevo selector de año."
echo ""
