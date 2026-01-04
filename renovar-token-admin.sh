#!/bin/bash

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

clear

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}   RENOVAR TOKEN DE USUARIO ADMIN${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

# Test 1: Get fresh tokens
echo -e "${YELLOW}[1/3] Obteniendo nuevos tokens para admin...${NC}"
login_response=$(curl -s -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}')

# Check if login was successful
if echo "$login_response" | grep -q "access"; then
    echo -e "${GREEN}✓${NC} Login exitoso"

    # Extract tokens using grep and cut
    access_token=$(echo "$login_response" | grep -o '"access":"[^"]*"' | cut -d'"' -f4)
    refresh_token=$(echo "$login_response" | grep -o '"refresh":"[^"]*"' | cut -d'"' -f4)

    echo ""
    echo -e "${GREEN}Access Token:${NC}"
    echo "$access_token"
    echo ""
    echo -e "${GREEN}Refresh Token:${NC}"
    echo "$refresh_token"
    echo ""
else
    echo -e "${RED}✗${NC} Login falló"
    echo "Response: $login_response"
    exit 1
fi

# Test 2: Verify access token works
echo -e "${YELLOW}[2/3] Verificando que el access token funciona...${NC}"
user_response=$(curl -s -X GET http://localhost:8000/api/auth/user/ \
  -H "Authorization: Bearer $access_token" \
  -H "Content-Type: application/json")

if echo "$user_response" | grep -q "username"; then
    echo -e "${GREEN}✓${NC} Access token válido"

    username=$(echo "$user_response" | grep -o '"username":"[^"]*"' | cut -d'"' -f4)
    email=$(echo "$user_response" | grep -o '"email":"[^"]*"' | cut -d'"' -f4)

    echo "  - Username: $username"
    echo "  - Email: $email"
else
    echo -e "${RED}✗${NC} Access token inválido"
    echo "Response: $user_response"
fi

# Test 3: Test refresh token
echo ""
echo -e "${YELLOW}[3/3] Probando refresh token...${NC}"
refresh_response=$(curl -s -X POST http://localhost:8000/api/auth/refresh/ \
  -H "Content-Type: application/json" \
  -d "{\"refresh\":\"$refresh_token\"}")

if echo "$refresh_response" | grep -q "access"; then
    echo -e "${GREEN}✓${NC} Refresh token funciona"

    new_access=$(echo "$refresh_response" | grep -o '"access":"[^"]*"' | cut -d'"' -f4)
    echo "  - Nuevo access token generado: ${new_access:0:20}..."
else
    echo -e "${RED}✗${NC} Refresh token falló"
    echo "Response: $refresh_response"
fi

# Summary
echo ""
echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}   INSTRUCCIONES PARA EL FRONTEND${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""
echo "Tu token expiró. Tienes 2 opciones:"
echo ""
echo -e "${YELLOW}OPCIÓN 1: Login desde el Frontend (Recomendado)${NC}"
echo "1. Ve a: ${BLUE}http://localhost:3000/login${NC}"
echo "2. Ingresa:"
echo "   - Usuario: ${GREEN}admin${NC}"
echo "   - Contraseña: ${GREEN}admin123${NC}"
echo "3. Click 'Login'"
echo ""
echo "El frontend automáticamente:"
echo "  • Guardará el access token"
echo "  • Guardará el refresh token"
echo "  • Renovará el token automáticamente cuando expire"
echo ""
echo -e "${YELLOW}OPCIÓN 2: Copiar tokens manualmente (Desarrollo)${NC}"
echo "Si estás desarrollando, puedes usar estos tokens recién generados:"
echo ""
echo "Access Token (válido por 60 minutos):"
echo -e "${GREEN}$access_token${NC}"
echo ""
echo "Refresh Token (válido por 1 día):"
echo -e "${GREEN}$refresh_token${NC}"
echo ""

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}   CONFIGURACIÓN JWT ACTUAL${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""
echo "• Access Token Lifetime: ${GREEN}60 minutos${NC}"
echo "• Refresh Token Lifetime: ${GREEN}1 día${NC}"
echo ""
echo "El frontend renovará automáticamente el token cuando:"
echo "  1. Recibe un error 401 (Unauthorized)"
echo "  2. Detecta que el access token expiró"
echo "  3. Usa el refresh token para obtener uno nuevo"
echo ""
echo "Si el refresh token también expiró (después de 1 día):"
echo "  → Te redirigirá automáticamente a /login"
echo ""

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}   EXTENDER TIEMPO DE EXPIRACIÓN${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""
echo "Si quieres que los tokens duren más, edita:"
echo ""
echo "${BLUE}backend/config/settings.py${NC}"
echo ""
echo "Cambia estas líneas (69-72):"
echo ""
echo "SIMPLE_JWT = {"
echo "    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),    # <-- Cambiar aquí"
echo "    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),       # <-- Cambiar aquí"
echo "}"
echo ""
echo "Ejemplo para tokens más largos:"
echo ""
echo "SIMPLE_JWT = {"
echo "    'ACCESS_TOKEN_LIFETIME': timedelta(hours=24),      # 24 horas"
echo "    'REFRESH_TOKEN_LIFETIME': timedelta(days=30),      # 30 días"
echo "}"
echo ""
echo "Luego reinicia el backend:"
echo "  ${BLUE}docker compose restart backend${NC}"
echo ""

echo -e "${GREEN}✅ Tokens renovados exitosamente${NC}"
echo ""
