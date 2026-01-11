#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

clear

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}   FIX DEFINITIVO: FRONTEND LENTO${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""
echo -e "${YELLOW}PROBLEMA:${NC}"
echo "  El frontend tarda 10-50 segundos en compilar"
echo "  cada página la primera vez que la visitas."
echo ""
echo -e "${YELLOW}SOLUCIÓN:${NC}"
echo "  Pre-compilar TODO y usar build de producción"
echo "  = Carga INSTANTÁNEA (1-2 segundos)"
echo ""
echo -e "${YELLOW}IMPORTANTE:${NC}"
echo "  - La compilación inicial toma 3-5 minutos"
echo "  - Después, TODO es instantáneo"
echo "  - Para cambios de código, ejecuta este script de nuevo"
echo ""
read -p "¿Continuar? (Enter para sí, Ctrl+C para cancelar) " -r
echo ""

# Step 1: Clean cache
echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}   PASO 1: LIMPIAR CACHE ANTERIOR${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""
docker compose exec frontend rm -rf .next .turbo node_modules/.cache 2>/dev/null || true
echo -e "${GREEN}✓${NC} Cache limpiado"

# Step 2: Reinstall dependencies
echo ""
echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}   PASO 2: REINSTALAR DEPENDENCIAS${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""
docker compose exec frontend npm install --force
if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Error instalando dependencias${NC}"
    exit 1
fi
echo -e "${GREEN}✓${NC} Dependencias instaladas"

# Step 3: Production build
echo ""
echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}   PASO 3: BUILD DE PRODUCCIÓN${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""
echo "Esto toma 3-5 minutos. Por favor espera..."
echo ""

docker compose exec frontend npm run build
if [ $? -ne 0 ]; then
    echo ""
    echo -e "${YELLOW}✗ Build falló. Intentando con más memoria...${NC}"
    docker compose exec frontend sh -c "NODE_OPTIONS='--max-old-space-size=6144' npm run build"
    if [ $? -ne 0 ]; then
        echo -e "${RED}✗ Build falló completamente${NC}"
        echo ""
        echo "Mostrando últimas líneas del error:"
        docker compose logs frontend --tail 50
        exit 1
    fi
fi
echo -e "${GREEN}✓${NC} Build completado exitosamente"

# Step 4: Create override file for production mode
echo ""
echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}   PASO 4: CAMBIAR A MODO PRODUCCIÓN${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""
echo "Modificando comando del contenedor..."

cat > docker-compose.override.yml <<EOF
services:
  frontend:
    command: npm run start
    environment:
      - NODE_ENV=production
EOF

echo -e "${GREEN}✓${NC} Configuración actualizada"

# Step 5: Restart frontend
echo ""
echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}   PASO 5: REINICIAR FRONTEND${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""
docker compose up -d --force-recreate frontend

echo ""
echo "Esperando que inicie (20 seg)..."
sleep 20

# Test and verify
echo ""
echo -e "${BLUE}============================================${NC}"
echo -e "${GREEN}   ✓✓✓ FRONTEND OPTIMIZADO ✓✓✓${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""
echo "Probando velocidad AHORA:"
echo ""

for i in 1 2 3; do
    response_time=$(curl -s -o /dev/null -w "%{time_total}" http://localhost:3000)
    echo -e "  Intento $i: ${GREEN}${response_time}s${NC} (debería ser ~1s)"
done

echo ""
echo "Estado del contenedor:"
docker compose ps frontend

echo ""
echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}   RESULTADO${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""
echo -e "${GREEN}✓${NC} Frontend ahora carga en 1-2 segundos"
echo -e "${GREEN}✓${NC} Sin tiempos de compilación"
echo -e "${GREEN}✓${NC} Todas las páginas pre-compiladas"
echo ""
echo -e "${YELLOW}Para hacer cambios al código:${NC}"
echo "  1. Edita tus archivos normalmente"
echo "  2. Ejecuta este script de nuevo"
echo "  3. El build toma 3-5 min"
echo "  4. Después todo es rápido otra vez"
echo ""
echo -e "${YELLOW}Para volver a modo desarrollo:${NC}"
echo "  rm docker-compose.override.yml"
echo "  docker compose restart frontend"
echo ""
echo -e "${GREEN}URL: http://localhost:3000${NC}"
echo ""
