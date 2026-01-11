#!/bin/bash

# Diagnóstico específico del Backend
# Para cuando el backend no responde

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "================================================================"
echo -e "${BLUE}     DIAGNÓSTICO ESPECÍFICO DEL BACKEND${NC}"
echo "================================================================"
echo ""

echo -e "${BLUE}[1] Estado del contenedor Backend:${NC}"
echo "================================================================"
docker ps --filter "name=backend" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""

echo -e "${BLUE}[2] Health Status:${NC}"
echo "================================================================"
HEALTH=$(docker inspect bvs_framework-backend-1 -f "{{.State.Health.Status}}" 2>/dev/null || echo "unknown")
echo -n "Backend Health: "
if [ "$HEALTH" == "healthy" ]; then
    echo -e "${GREEN}$HEALTH${NC}"
elif [ "$HEALTH" == "unhealthy" ]; then
    echo -e "${RED}$HEALTH${NC}"
else
    echo -e "${YELLOW}$HEALTH${NC}"
fi
echo ""

echo -e "${BLUE}[3] Logs del Backend (últimas 50 líneas):${NC}"
echo "================================================================"
docker logs --tail 50 bvs_framework-backend-1 2>&1
echo ""

echo -e "${BLUE}[4] Procesos Python corriendo DENTRO del contenedor:${NC}"
echo "================================================================"
docker exec bvs_framework-backend-1 ps aux 2>&1 | grep -E "python|gunicorn|PID" || echo "No se encontraron procesos Python"
echo ""

echo -e "${BLUE}[5] Puertos escuchando DENTRO del contenedor:${NC}"
echo "================================================================"
echo "Buscando puerto 8000..."
docker exec bvs_framework-backend-1 sh -c "netstat -tln 2>/dev/null | grep ':8000' || ss -tln 2>/dev/null | grep ':8000' || echo 'Puerto 8000 NO está escuchando'"
echo ""

echo -e "${BLUE}[6] Test de conexión a Django:${NC}"
echo "================================================================"
echo "Intentando curl al admin desde dentro del contenedor..."
docker exec bvs_framework-backend-1 sh -c "curl -f http://localhost:8000/admin/ -I 2>&1 | head -5" || echo "Django no responde"
echo ""

echo -e "${BLUE}[7] Variables de entorno:${NC}"
echo "================================================================"
docker exec bvs_framework-backend-1 env | grep -E "DJANGO|DATABASE|POSTGRES" || echo "No se encontraron variables relevantes"
echo ""

echo -e "${BLUE}[8] Estado de servicios dependientes:${NC}"
echo "================================================================"
echo -n "PostgreSQL: "
docker ps --filter "name=db" --format "{{.Status}}" || echo "No corriendo"
echo -n "Redis: "
docker ps --filter "name=redis" --format "{{.Status}}" || echo "No corriendo"
echo -n "Elasticsearch: "
docker ps --filter "name=elasticsearch" --format "{{.Status}}" || echo "No corriendo"
echo ""

echo -e "${BLUE}[9] Test de conexión a PostgreSQL:${NC}"
echo "================================================================"
docker exec bvs_framework-backend-1 sh -c "python -c 'import psycopg2; conn = psycopg2.connect(host=\"db\", database=\"biblioteca\", user=\"postgres\", password=\"postgres\"); print(\"✓ Conexión a PostgreSQL exitosa\")' 2>&1" || echo "✗ No se puede conectar a PostgreSQL"
echo ""

echo -e "${BLUE}[10] Verificar migraciones de Django:${NC}"
echo "================================================================"
docker exec bvs_framework-backend-1 python manage.py showmigrations 2>&1 | head -20
echo ""

echo "================================================================"
echo -e "${YELLOW}ACCIONES RECOMENDADAS${NC}"
echo "================================================================"
echo ""

# Análisis automático
if timeout 2 bash -c "echo >/dev/tcp/localhost/8000" 2>/dev/null; then
    echo -e "${GREEN}✓ Backend está respondiendo en puerto 8000${NC}"
    echo ""
    echo "El servicio está funcionando correctamente."
else
    echo -e "${RED}✗ Backend NO responde en puerto 8000${NC}"
    echo ""
    echo "Posibles soluciones:"
    echo ""
    echo "1. Reintentar inicio del backend:"
    echo "   docker-compose restart backend"
    echo ""
    echo "2. Recrear el contenedor:"
    echo "   docker-compose up -d --force-recreate backend"
    echo ""
    echo "3. Verificar migraciones:"
    echo "   docker-compose exec backend python manage.py migrate"
    echo ""
    echo "4. Ver logs en tiempo real:"
    echo "   docker-compose logs -f backend"
    echo ""
    echo "5. Ejecutar fix automático:"
    echo "   bash fix-servicios-completo.sh"
fi

echo "================================================================"
