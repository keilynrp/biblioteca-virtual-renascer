#!/bin/bash

echo "=========================================="
echo "🔨 RECONSTRUCCIÓN FORZADA DEL BACKEND"
echo "=========================================="
echo ""
echo "⚠️  Este script forzará la reconstrucción completa del backend"
echo "    sin usar caché de Docker para asegurar que los cambios"
echo "    se apliquen correctamente."
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "1️⃣  Deteniendo el contenedor backend..."
echo "----------------------------------------"
sudo docker-compose stop backend
echo ""

echo "2️⃣  Eliminando el contenedor backend..."
echo "----------------------------------------"
sudo docker-compose rm -f backend
echo ""

echo "3️⃣  Reconstruyendo backend SIN CACHÉ..."
echo "----------------------------------------"
echo -e "${YELLOW}Esto puede tomar varios minutos...${NC}"
sudo docker-compose build --no-cache backend
echo ""

echo "4️⃣  Iniciando el backend..."
echo "----------------------------------------"
sudo docker-compose up -d backend
echo ""

echo "5️⃣  Esperando 10 segundos para que el backend inicie..."
for i in {10..1}; do
    echo -n "$i... "
    sleep 1
done
echo ""
echo ""

echo "6️⃣  Verificando logs del backend (últimas 40 líneas)..."
echo "----------------------------------------"
sudo docker-compose logs --tail=40 backend
echo ""

echo "7️⃣  Estado del contenedor backend..."
echo "----------------------------------------"
sudo docker-compose ps backend
echo ""

echo "8️⃣  Probando conectividad HTTP..."
echo "----------------------------------------"

# Función para verificar endpoint
check_endpoint() {
    local endpoint=$1
    local url="http://localhost:8000$endpoint"
    local status=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)

    if [ "$status" != "000" ] && [ "$status" != "404" ]; then
        echo -e "  $endpoint -> ${GREEN}✅ HTTP $status${NC}"
        return 0
    elif [ "$status" == "404" ]; then
        echo "  $endpoint -> ⚠️  HTTP 404 (endpoint no existe)"
        return 1
    else
        echo "  $endpoint -> ❌ Sin respuesta"
        return 1
    fi
}

# Intentar varios endpoints
check_endpoint "/" && backend_ok=1 || backend_ok=0
check_endpoint "/api/" && backend_ok=1 || backend_ok=0
check_endpoint "/admin/" && backend_ok=1 || backend_ok=0

echo ""

if [ $backend_ok -eq 1 ]; then
    echo "=========================================="
    echo -e "${GREEN}✅ BACKEND FUNCIONANDO CORRECTAMENTE${NC}"
    echo "=========================================="
    echo ""
    echo "URLs disponibles:"
    echo "  - Backend API: http://localhost:8000/api/"
    echo "  - Django Admin: http://localhost:8000/admin/"
    echo "  - Frontend: http://localhost:3000"
else
    echo "=========================================="
    echo "⚠️  EL BACKEND AÚN TIENE PROBLEMAS"
    echo "=========================================="
    echo ""
    echo "Por favor revisa los logs arriba para más detalles."
    echo ""
    echo "Para ver logs en tiempo real:"
    echo "  sudo docker-compose logs -f backend"
    echo ""
    echo "Para ver el contenido del archivo dentro del contenedor:"
    echo "  sudo docker-compose exec backend cat /app/apps/content/documents.py | head -n 15"
fi

echo ""
