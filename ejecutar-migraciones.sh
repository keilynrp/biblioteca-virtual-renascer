#!/bin/bash

echo "=========================================="
echo "🔄 EJECUTANDO MIGRACIONES DE DJANGO"
echo "=========================================="
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Verificando estado de migraciones...${NC}"
echo ""

# Mostrar migraciones pendientes
echo "📋 Migraciones pendientes:"
echo "------------------------------------------"
sudo docker-compose exec backend python manage.py showmigrations

echo ""
echo "=========================================="
echo -e "${YELLOW}Aplicando todas las migraciones...${NC}"
echo "=========================================="
echo ""

# Ejecutar migraciones
sudo docker-compose exec backend python manage.py migrate

if [ $? -eq 0 ]; then
    echo ""
    echo "=========================================="
    echo -e "${GREEN}✅ MIGRACIONES COMPLETADAS EXITOSAMENTE${NC}"
    echo "=========================================="
    echo ""

    echo "📊 Estado final de migraciones:"
    echo "------------------------------------------"
    sudo docker-compose exec backend python manage.py showmigrations | grep "\[X\]" | wc -l | xargs echo "Migraciones aplicadas:"

    echo ""
    echo "🗄️  Verificando tablas en la base de datos..."
    echo "------------------------------------------"
    sudo docker-compose exec -T db psql -U postgres -d biblioteca -c "\dt" | head -n 20

    echo ""
    echo -e "${GREEN}✅ La base de datos está lista${NC}"
    echo ""
    echo "Ahora puedes crear un superusuario:"
    echo "  ./crear-usuario-automatico.sh"
    echo ""
    echo "O ejecutar el setup completo:"
    echo "  ./setup-completo.sh"

else
    echo ""
    echo "=========================================="
    echo -e "${RED}❌ ERROR AL EJECUTAR MIGRACIONES${NC}"
    echo "=========================================="
    echo ""
    echo "Posibles soluciones:"
    echo "  1. Verifica que PostgreSQL esté corriendo:"
    echo "     sudo docker-compose ps db"
    echo ""
    echo "  2. Verifica los logs del backend:"
    echo "     sudo docker-compose logs backend"
    echo ""
    echo "  3. Verifica la configuración de la base de datos en .env"
    echo ""
    echo "  4. Intenta resetear la base de datos (⚠️  BORRARÁ TODOS LOS DATOS):"
    echo "     sudo docker-compose down -v"
    echo "     sudo docker-compose up -d"
    echo "     ./ejecutar-migraciones.sh"
    exit 1
fi
