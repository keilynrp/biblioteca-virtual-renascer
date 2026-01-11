#!/bin/bash

echo "=========================================="
echo "Solucion: Error al iniciar sesion de lectura"
echo "=========================================="
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para imprimir con color
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Verificar que Docker está corriendo
echo "[PASO 1/8] Verificando Docker..."
if ! docker info > /dev/null 2>&1; then
    print_error "Docker no está corriendo. Inicia Docker Desktop primero."
    exit 1
fi
print_success "Docker está corriendo"
echo ""

# Verificar contenedores
echo "[PASO 2/8] Verificando contenedores..."
if ! docker compose ps | grep -q "backend"; then
    print_error "Contenedor backend no está corriendo"
    echo "Iniciando contenedores..."
    docker compose up -d
    sleep 5
fi
print_success "Contenedores verificados"
echo ""

# Verificar estado de migraciones
echo "[PASO 3/8] Verificando estado de migraciones..."
docker compose exec -T backend python manage.py showmigrations content
echo ""

# Aplicar todas las migraciones
echo "[PASO 4/8] Aplicando migraciones..."
docker compose exec -T backend python manage.py migrate
if [ $? -eq 0 ]; then
    print_success "Migraciones aplicadas correctamente"
else
    print_error "Error al aplicar migraciones"
    exit 1
fi
echo ""

# Verificar que el modelo Reading existe
echo "[PASO 5/8] Verificando modelo Reading..."
docker compose exec -T backend python manage.py shell -c "
from apps.content.models import Reading
print('✓ Modelo Reading importado correctamente')
print(f'  Tabla: {Reading._meta.db_table}')
fields = [f.name for f in Reading._meta.get_fields()]
print(f'  Campos: {', '.join(fields)}')
"
echo ""

# Verificar tabla en base de datos
echo "[PASO 6/8] Verificando tabla 'readings' en base de datos..."
docker compose exec -T db psql -U postgres -d bvs_db -c "\d readings" 2>&1
if [ $? -eq 0 ]; then
    print_success "Tabla 'readings' existe en la base de datos"
else
    print_error "Tabla 'readings' NO existe en la base de datos"
    echo "Intentando crear la tabla..."
    docker compose exec -T backend python manage.py migrate content 0005_add_reading_model
fi
echo ""

# Verificar que hay libros en la base de datos
echo "[PASO 7/8] Verificando libros disponibles..."
BOOK_COUNT=$(docker compose exec -T db psql -U postgres -d bvs_db -t -c "SELECT COUNT(*) FROM books;" 2>/dev/null | tr -d ' ')
if [ -z "$BOOK_COUNT" ] || [ "$BOOK_COUNT" -eq 0 ]; then
    print_warning "No hay libros en la base de datos"
    echo "Considera importar libros con: ./importar-libros-openlibrary.sh"
else
    print_success "Hay $BOOK_COUNT libro(s) en la base de datos"
fi
echo ""

# Probar endpoint de lectura
echo "[PASO 8/8] Probando endpoint de inicio de lectura..."
echo "Creando usuario de prueba y token..."

# Crear usuario de prueba y obtener token
TOKEN_INFO=$(docker compose exec -T backend python manage.py shell << 'EOF'
from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token

User = get_user_model()

# Intentar obtener superusuario o crear uno de prueba
user = User.objects.filter(is_superuser=True).first()

if not user:
    # Crear usuario de prueba
    user, created = User.objects.get_or_create(
        username='testuser',
        defaults={
            'email': 'test@example.com',
            'is_active': True
        }
    )
    if created:
        user.set_password('testpass123')
        user.save()
        print(f"CREATED_USER:{user.username}")

# Crear o obtener token
token, _ = Token.objects.get_or_create(user=user)
print(f"TOKEN:{token.key}")
print(f"USER:{user.username}")
print(f"USER_ID:{user.id}")
EOF
)

if [ $? -ne 0 ]; then
    print_error "No se pudo crear token de prueba"
    print_warning "Puedes intentar crear un superusuario con: docker compose exec backend python manage.py createsuperuser"
else
    # Extraer token y usuario
    TOKEN=$(echo "$TOKEN_INFO" | grep "TOKEN:" | cut -d':' -f2)
    USERNAME=$(echo "$TOKEN_INFO" | grep "USER:" | head -1 | cut -d':' -f2)

    print_success "Token creado para usuario: $USERNAME"

    # Obtener un libro de prueba
    BOOK_ID=$(docker compose exec -T db psql -U postgres -d bvs_db -t -c "SELECT id FROM books LIMIT 1;" 2>/dev/null | tr -d ' ')

    if [ -n "$BOOK_ID" ] && [ -n "$TOKEN" ]; then
        echo ""
        echo "Probando endpoint: POST /api/user/readings/start/$BOOK_ID/"

        RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST \
            -H "Authorization: Bearer $TOKEN" \
            -H "Content-Type: application/json" \
            http://localhost:8000/api/user/readings/start/$BOOK_ID/)

        HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE:" | cut -d':' -f2)
        BODY=$(echo "$RESPONSE" | sed '/HTTP_CODE:/d')

        echo ""
        echo "Respuesta del servidor:"
        echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
        echo ""

        if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
            print_success "Endpoint funcionando correctamente (HTTP $HTTP_CODE)"
        else
            print_error "Endpoint devolvió error (HTTP $HTTP_CODE)"
            echo "Cuerpo de respuesta: $BODY"
        fi
    fi
fi

echo ""
echo "=========================================="
echo "Reiniciando servicios..."
echo "=========================================="

# Reiniciar frontend para aplicar cambios
docker compose restart frontend

echo ""
print_success "Frontend reiniciado"

# Esperar a que el frontend esté listo
echo ""
echo "Esperando a que el frontend esté listo..."
sleep 5

# Verificar que el frontend responde
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    print_success "Frontend está respondiendo en http://localhost:3000"
else
    print_warning "Frontend puede tardar unos segundos más en estar listo"
fi

echo ""
echo "=========================================="
echo "Diagnostico Completo"
echo "=========================================="
echo ""

# Resumen final
echo "Estado de los servicios:"
docker compose ps

echo ""
echo "=========================================="
echo "Proximos Pasos"
echo "=========================================="
echo ""
echo "1. Abre tu navegador en: http://localhost:3000"
echo "2. Inicia sesión con tus credenciales"
echo "3. Ve a la biblioteca y selecciona un libro"
echo "4. Haz clic en 'Leer' para abrir el visor PDF"
echo ""

if [ -n "$TOKEN" ] && [ -n "$BOOK_ID" ]; then
    echo "Para probar manualmente el endpoint:"
    echo ""
    echo "curl -X POST \\"
    echo "  -H 'Authorization: Bearer $TOKEN' \\"
    echo "  -H 'Content-Type: application/json' \\"
    echo "  http://localhost:8000/api/user/readings/start/$BOOK_ID/"
    echo ""
fi

echo "Si el error persiste, revisa los logs:"
echo "  docker compose logs backend --tail=50"
echo "  docker compose logs frontend --tail=50"
echo ""

print_success "Proceso completado"
echo ""
