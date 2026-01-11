#!/bin/bash

echo "=========================================="
echo "🔧 Reiniciando Backend Django"
echo "=========================================="
echo ""

echo "1️⃣  Deteniendo el contenedor backend..."
sudo docker-compose stop backend
echo ""

echo "2️⃣  Reconstruyendo la imagen del backend..."
sudo docker-compose build backend
echo ""

echo "3️⃣  Iniciando el backend..."
sudo docker-compose up -d backend
echo ""

echo "4️⃣  Esperando 5 segundos para que el backend inicie..."
sleep 5
echo ""

echo "5️⃣  Verificando logs del backend..."
echo "----------------------------------------"
sudo docker-compose logs --tail=30 backend
echo ""

echo "6️⃣  Verificando estado del contenedor..."
sudo docker-compose ps backend
echo ""

echo "7️⃣  Probando conectividad HTTP..."
echo "----------------------------------------"

# Intentar varios endpoints
for endpoint in "/" "/api/" "/admin/"; do
    echo -n "Probando http://localhost:8000$endpoint ... "
    status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000$endpoint 2>/dev/null)
    if [ "$status" != "000" ]; then
        echo "✅ HTTP $status"
    else
        echo "❌ Sin respuesta"
    fi
done

echo ""
echo "=========================================="
echo "✅ Proceso Completo"
echo "=========================================="
echo ""
echo "Si el backend sigue sin funcionar, revisa los logs completos con:"
echo "  sudo docker-compose logs backend"
