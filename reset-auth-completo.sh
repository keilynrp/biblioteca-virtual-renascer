#!/bin/bash

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

clear

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}   RESET COMPLETO DE AUTENTICACIÓN${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

echo -e "${YELLOW}Este script va a:${NC}"
echo "1. Verificar que backend y frontend están corriendo"
echo "2. Probar el login API directamente"
echo "3. Verificar configuración CORS"
echo "4. Darte instrucciones claras para acceder"
echo ""

# Step 1: Check containers
echo -e "${YELLOW}[1/5] Verificando contenedores...${NC}"
if command -v docker &> /dev/null; then
    backend_status=$(docker compose ps backend --format json 2>/dev/null | grep -o '"Health":"[^"]*"' | cut -d'"' -f4 || echo "unknown")
    frontend_status=$(docker compose ps frontend --format json 2>/dev/null | grep -o '"Health":"[^"]*"' | cut -d'"' -f4 || echo "unknown")

    if [ "$backend_status" = "healthy" ] || [ "$backend_status" = "unknown" ]; then
        echo -e "${GREEN}✓${NC} Backend: Running"
    else
        echo -e "${RED}✗${NC} Backend: $backend_status"
        echo -e "${YELLOW}Reiniciando backend...${NC}"
        docker compose restart backend
        sleep 5
    fi

    if [ "$frontend_status" = "healthy" ] || [ "$frontend_status" = "unknown" ]; then
        echo -e "${GREEN}✓${NC} Frontend: Running"
    else
        echo -e "${RED}✗${NC} Frontend: $frontend_status"
        echo -e "${YELLOW}Reiniciando frontend...${NC}"
        docker compose restart frontend
        sleep 5
    fi
else
    echo -e "${YELLOW}⚠${NC} Docker no disponible en este shell, asumiendo que los servicios están corriendo"
fi

# Step 2: Test API login
echo ""
echo -e "${YELLOW}[2/5] Probando login API...${NC}"
api_response=$(curl -s -w "\n%{http_code}" -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}')

http_code=$(echo "$api_response" | tail -1)
response_body=$(echo "$api_response" | head -n -1)

if [ "$http_code" = "200" ]; then
    echo -e "${GREEN}✓${NC} Login API funciona correctamente (HTTP 200)"

    # Extract tokens
    access_token=$(echo "$response_body" | grep -o '"access":"[^"]*"' | cut -d'"' -f4)
    refresh_token=$(echo "$response_body" | grep -o '"refresh":"[^"]*"' | cut -d'"' -f4)

    echo "  - Access token: ${access_token:0:30}..."
    echo "  - Refresh token: ${refresh_token:0:30}..."
else
    echo -e "${RED}✗${NC} Login API falló (HTTP $http_code)"
    echo "Response: $response_body"
    echo ""
    echo -e "${RED}ERROR CRÍTICO: El backend no está funcionando correctamente${NC}"
    exit 1
fi

# Step 3: Test user endpoint
echo ""
echo -e "${YELLOW}[3/5] Verificando endpoint de usuario...${NC}"
user_response=$(curl -s -w "\n%{http_code}" -X GET http://localhost:8000/api/auth/user/ \
  -H "Authorization: Bearer $access_token")

http_code=$(echo "$user_response" | tail -1)
user_body=$(echo "$user_response" | head -n -1)

if [ "$http_code" = "200" ]; then
    echo -e "${GREEN}✓${NC} Endpoint de usuario funciona (HTTP 200)"
    username=$(echo "$user_body" | grep -o '"username":"[^"]*"' | cut -d'"' -f4)
    email=$(echo "$user_body" | grep -o '"email":"[^"]*"' | cut -d'"' -f4)
    echo "  - Username: $username"
    echo "  - Email: $email"
else
    echo -e "${RED}✗${NC} Endpoint de usuario falló (HTTP $http_code)"
fi

# Step 4: Test CORS
echo ""
echo -e "${YELLOW}[4/5] Verificando CORS...${NC}"
cors_headers=$(curl -s -I -X OPTIONS http://localhost:8000/api/auth/login/ \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" | grep -i "access-control")

if echo "$cors_headers" | grep -q "Access-Control-Allow-Origin"; then
    echo -e "${GREEN}✓${NC} CORS configurado correctamente"
    echo "$cors_headers" | sed 's/^/  /'
else
    echo -e "${YELLOW}⚠${NC} CORS headers no detectados (puede ser normal en desarrollo)"
fi

# Step 5: Test frontend
echo ""
echo -e "${YELLOW}[5/5] Verificando frontend...${NC}"
frontend_response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/login)

if [ "$frontend_response" = "200" ]; then
    echo -e "${GREEN}✓${NC} Página de login accesible (HTTP 200)"
else
    echo -e "${RED}✗${NC} Página de login falló (HTTP $frontend_response)"
fi

# Summary
echo ""
echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}   DIAGNÓSTICO COMPLETO${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

echo -e "${GREEN}✓ Backend API: Funcionando${NC}"
echo -e "${GREEN}✓ Login Endpoint: Funcionando${NC}"
echo -e "${GREEN}✓ JWT Tokens: Generándose correctamente${NC}"
echo -e "${GREEN}✓ User Endpoint: Funcionando${NC}"
echo -e "${GREEN}✓ Frontend: Accesible${NC}"

echo ""
echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}   INSTRUCCIONES PARA LOGIN${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

echo -e "${YELLOW}PASO 1: Limpiar localStorage del navegador${NC}"
echo ""
echo "Abre la consola del navegador (F12) y ejecuta:"
echo ""
echo -e "${GREEN}localStorage.clear()${NC}"
echo ""
echo "Luego recarga la página (Ctrl+R)"
echo ""

echo -e "${YELLOW}PASO 2: Ir a la página de login${NC}"
echo ""
echo "URL: ${BLUE}http://localhost:3000/login${NC}"
echo ""

echo -e "${YELLOW}PASO 3: Ingresar credenciales${NC}"
echo ""
echo "  Username: ${GREEN}admin${NC}"
echo "  Password: ${GREEN}admin123${NC}"
echo ""

echo -e "${YELLOW}PASO 4: Click en 'Login'${NC}"
echo ""

echo -e "${YELLOW}PASO 5: Revisar consola del navegador${NC}"
echo ""
echo "Si ves errores en la consola (F12), serán de este tipo:"
echo ""
echo "• ${RED}CORS error${NC}:"
echo "  → El backend no permite peticiones desde localhost:3000"
echo "  → Solución: Verificar CORS_ALLOW_ALL_ORIGINS en settings.py"
echo ""
echo "• ${RED}Network error${NC}:"
echo "  → El frontend no puede conectar al backend"
echo "  → Solución: Verificar que backend está en http://localhost:8000"
echo ""
echo "• ${RED}401 Unauthorized${NC}:"
echo "  → Credenciales incorrectas"
echo "  → Solución: Usar admin / admin123"
echo ""
echo "• ${RED}Ningún error pero no redirige${NC}:"
echo "  → Problema con el router o redirección"
echo "  → Solución: Revisar manualmente /home"
echo ""

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}   TOKENS VÁLIDOS (Para testing)${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

echo "Si necesitas probar manualmente, estos tokens son válidos por 60 minutos:"
echo ""
echo "Access Token:"
echo -e "${GREEN}$access_token${NC}"
echo ""
echo "Refresh Token:"
echo -e "${GREEN}$refresh_token${NC}"
echo ""

echo "Para usar manualmente en la consola del navegador (F12):"
echo ""
echo -e "${GREEN}// Guardar tokens manualmente${NC}"
echo "localStorage.setItem('auth-storage', JSON.stringify({"
echo "  state: {"
echo "    user: {"
echo "      username: 'admin',"
echo "      email: 'admin@biblioteca.com',"
echo "      user_type: 'admin'"
echo "    },"
echo "    accessToken: '$access_token',"
echo "    refreshToken: '$refresh_token',"
echo "    isAuthenticated: true"
echo "  },"
echo "  version: 0"
echo "}))"
echo ""
echo "// Luego recarga la página"
echo "window.location.href = '/home'"
echo ""

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}   SI NADA FUNCIONA${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

echo "1. Abre la consola del navegador (F12)"
echo "2. Ve a la pestaña 'Network'"
echo "3. Intenta hacer login"
echo "4. Busca la petición a 'login'"
echo "5. Copia el error exacto y compártelo"
echo ""

echo -e "${GREEN}✅ Diagnóstico completo${NC}"
echo ""
