#!/bin/bash

echo "=========================================="
echo "🔐 PRUEBA DE AUTENTICACIÓN"
echo "=========================================="
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Solicitar credenciales o usar las por defecto
echo "Ingresa las credenciales (o presiona Enter para usar las predeterminadas):"
echo ""
read -p "Username [admin]: " username
username=${username:-admin}

read -sp "Password [admin123456]: " password
echo ""
password=${password:-admin123456}

echo ""
echo -e "${BLUE}Probando autenticación...${NC}"
echo ""

# Probar login en la API
echo "1️⃣  Probando endpoint de login API..."
echo "------------------------------------------"

response=$(curl -s -X POST http://localhost:8000/api/auth/login/ \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"$username\",\"password\":\"$password\"}" \
    -w "\n%{http_code}")

http_code=$(echo "$response" | tail -n 1)
body=$(echo "$response" | head -n -1)

if [ "$http_code" == "200" ] || [ "$http_code" == "201" ]; then
    echo -e "${GREEN}✅ Autenticación exitosa!${NC}"
    echo ""
    echo "Respuesta del servidor:"
    echo "$body" | python3 -m json.tool 2>/dev/null || echo "$body"

    # Extraer tokens si existen
    access_token=$(echo "$body" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('access', ''))" 2>/dev/null)
    refresh_token=$(echo "$body" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('refresh', ''))" 2>/dev/null)

    if [ ! -z "$access_token" ]; then
        echo ""
        echo -e "${GREEN}🎟️  Access Token obtenido${NC}"
        echo "Token (primeros 50 caracteres): ${access_token:0:50}..."
    fi

    if [ ! -z "$refresh_token" ]; then
        echo -e "${GREEN}🔄 Refresh Token obtenido${NC}"
        echo "Token (primeros 50 caracteres): ${refresh_token:0:50}..."
    fi
else
    echo -e "${RED}❌ Error en la autenticación${NC}"
    echo "HTTP Code: $http_code"
    echo ""
    echo "Respuesta del servidor:"
    echo "$body"
fi

echo ""
echo ""

# Probar acceso al Django Admin
echo "2️⃣  Probando acceso al Django Admin..."
echo "------------------------------------------"

# Hacer una petición al admin con las credenciales
admin_response=$(curl -s -i http://localhost:8000/admin/login/ \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "username=$username&password=$password&next=/admin/" \
    --cookie-jar /tmp/cookies.txt \
    --cookie /tmp/cookies.txt)

if echo "$admin_response" | grep -q "csrftoken"; then
    echo -e "${GREEN}✅ El Django Admin está accesible${NC}"
    echo ""
    echo "Puedes acceder manualmente en:"
    echo "  🔗 http://localhost:8000/admin/"
else
    echo -e "${YELLOW}⚠️  El Django Admin está disponible pero requiere login manual${NC}"
    echo ""
    echo "Accede a:"
    echo "  🔗 http://localhost:8000/admin/"
    echo ""
    echo "Credenciales:"
    echo "  Username: $username"
    echo "  Password: ********"
fi

echo ""
echo ""

echo "3️⃣  Verificando usuario en la base de datos..."
echo "------------------------------------------"

sudo docker-compose exec -T backend python manage.py shell <<EOF
from django.contrib.auth import get_user_model

User = get_user_model()

try:
    user = User.objects.get(username='$username')
    print("✅ Usuario encontrado en la base de datos")
    print("")
    print(f"  👤 Username:     {user.username}")
    print(f"  📧 Email:        {user.email}")
    print(f"  🔐 Superusuario: {'Sí' if user.is_superuser else 'No'}")
    print(f"  👔 Staff:        {'Sí' if user.is_staff else 'No'}")
    print(f"  ✔️  Activo:       {'Sí' if user.is_active else 'No'}")

    # Verificar si la contraseña es válida
    if user.check_password('$password'):
        print(f"  🔑 Contraseña:   ✅ Válida")
    else:
        print(f"  🔑 Contraseña:   ❌ Inválida")

except User.DoesNotExist:
    print("❌ Usuario NO encontrado en la base de datos")
    print("")
    print("Para crear el usuario, ejecuta:")
    print("  ./crear-usuario-automatico.sh")
EOF

echo ""
echo "=========================================="
echo "✅ VERIFICACIÓN COMPLETA"
echo "=========================================="
echo ""

# Limpiar cookies temporales
rm -f /tmp/cookies.txt

echo "📝 Resumen:"
echo "  - Endpoint API: http://localhost:8000/api/auth/login/"
echo "  - Django Admin: http://localhost:8000/admin/"
echo "  - Frontend:     http://localhost:3000"
echo ""
