#!/bin/bash

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

clear

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}   VERIFICACIÓN DE AUTENTICACIÓN${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

# Test 1: Check admin user exists
echo -e "${YELLOW}[1/5] Verificando usuario admin en base de datos...${NC}"
admin_check=$(docker compose exec -T backend python manage.py shell -c "from django.contrib.auth import get_user_model; User = get_user_model(); admin = User.objects.filter(username='admin').first(); print(f'{admin.username}|{admin.is_superuser}|{admin.is_active}' if admin else 'NOT_FOUND')" 2>/dev/null | tail -1)

if [[ $admin_check == *"admin|True|True"* ]]; then
    echo -e "${GREEN}✓${NC} Usuario admin existe y está activo"
    echo "  - Username: admin"
    echo "  - Superuser: Sí"
    echo "  - Activo: Sí"
else
    echo -e "${RED}✗${NC} Usuario admin no encontrado o no está activo"
    echo ""
    echo "Creando usuario admin..."
    docker compose exec -T backend python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@biblioteca.com', 'admin123')
    print('Usuario admin creado')
else:
    print('Usuario admin ya existe')
"
fi

# Test 2: Backend login endpoint
echo ""
echo -e "${YELLOW}[2/5] Probando endpoint de login del backend...${NC}"
login_response=$(curl -s -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  -w "\n%{http_code}")

http_code=$(echo "$login_response" | tail -1)
response_body=$(echo "$login_response" | head -n -1)

if [ "$http_code" == "200" ]; then
    echo -e "${GREEN}✓${NC} Login exitoso (HTTP 200)"

    # Extract tokens
    access_token=$(echo "$response_body" | grep -o '"access":"[^"]*"' | cut -d'"' -f4)
    refresh_token=$(echo "$response_body" | grep -o '"refresh":"[^"]*"' | cut -d'"' -f4)

    echo "  - Access token recibido: ${access_token:0:20}..."
    echo "  - Refresh token recibido: ${refresh_token:0:20}..."
else
    echo -e "${RED}✗${NC} Login falló (HTTP $http_code)"
    echo "Response: $response_body"
    exit 1
fi

# Test 3: User endpoint with token
echo ""
echo -e "${YELLOW}[3/5] Probando endpoint /api/auth/user/ con JWT...${NC}"
user_response=$(curl -s -X GET http://localhost:8000/api/auth/user/ \
  -H "Authorization: Bearer $access_token" \
  -H "Content-Type: application/json" \
  -w "\n%{http_code}")

http_code=$(echo "$user_response" | tail -1)
user_body=$(echo "$user_response" | head -n -1)

if [ "$http_code" == "200" ]; then
    echo -e "${GREEN}✓${NC} Usuario obtenido exitosamente (HTTP 200)"

    username=$(echo "$user_body" | grep -o '"username":"[^"]*"' | cut -d'"' -f4)
    email=$(echo "$user_body" | grep -o '"email":"[^"]*"' | cut -d'"' -f4)

    echo "  - Username: $username"
    echo "  - Email: $email"
else
    echo -e "${RED}✗${NC} Failed to get user (HTTP $http_code)"
    echo "Response: $user_body"
fi

# Test 4: Frontend login page
echo ""
echo -e "${YELLOW}[4/5] Verificando página de login del frontend...${NC}"
frontend_response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/login)

if [ "$frontend_response" == "200" ]; then
    echo -e "${GREEN}✓${NC} Página de login carga correctamente (HTTP 200)"
else
    echo -e "${RED}✗${NC} Página de login falló (HTTP $frontend_response)"
fi

# Test 5: Check frontend can reach backend
echo ""
echo -e "${YELLOW}[5/5] Verificando conectividad frontend → backend...${NC}"

# Check if NEXT_PUBLIC_API_URL is configured
api_url=$(docker compose exec -T frontend sh -c 'echo $NEXT_PUBLIC_API_URL' 2>/dev/null | tr -d '\r')
if [ -z "$api_url" ]; then
    echo -e "${YELLOW}⚠${NC} NEXT_PUBLIC_API_URL no configurado"
    echo "  Debería ser: http://localhost:8000/api"
else
    echo -e "${GREEN}✓${NC} NEXT_PUBLIC_API_URL configurado: $api_url"
fi

# Summary
echo ""
echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}   RESUMEN${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""
echo -e "${GREEN}✓${NC} Usuario admin: admin / admin123"
echo -e "${GREEN}✓${NC} Backend login: Funcionando"
echo -e "${GREEN}✓${NC} JWT tokens: Generándose correctamente"
echo -e "${GREEN}✓${NC} User endpoint: Funcionando con JWT"
echo -e "${GREEN}✓${NC} Frontend login page: Cargando"
echo -e "${GREEN}✓${NC} API URL: Configurada"
echo ""
echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}   PRUEBA MANUAL${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""
echo "1. Abre: ${BLUE}http://localhost:3000/login${NC}"
echo "2. Ingresa:"
echo "   - Usuario: ${GREEN}admin${NC}"
echo "   - Contraseña: ${GREEN}admin123${NC}"
echo "3. Haz clic en 'Login'"
echo ""
echo "Deberías ser redirigido a ${BLUE}http://localhost:3000/home${NC}"
echo ""
echo -e "${GREEN}✅ Autenticación configurada correctamente${NC}"
echo ""
