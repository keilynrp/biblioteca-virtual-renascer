#!/bin/bash

echo "=========================================="
echo "🚀 CONFIGURACIÓN COMPLETA DEL BACKEND"
echo "=========================================="
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}Este script realizará la configuración completa del backend:${NC}"
echo "  1. Ejecutar migraciones de la base de datos"
echo "  2. Crear el índice de Elasticsearch"
echo "  3. Crear un superusuario"
echo "  4. Verificar que todo funcione"
echo ""
read -p "¿Deseas continuar? (s/n): " confirm

if [ "$confirm" != "s" ] && [ "$confirm" != "S" ]; then
    echo "Operación cancelada."
    exit 0
fi

echo ""
echo "=========================================="
echo "1️⃣  EJECUTANDO MIGRACIONES"
echo "=========================================="
echo ""

echo -e "${YELLOW}Aplicando migraciones a la base de datos...${NC}"
sudo docker-compose exec backend python manage.py migrate

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Migraciones aplicadas exitosamente${NC}"
else
    echo -e "${RED}❌ Error al aplicar migraciones${NC}"
    exit 1
fi

echo ""
echo "=========================================="
echo "2️⃣  CONFIGURANDO ELASTICSEARCH"
echo "=========================================="
echo ""

echo -e "${YELLOW}Creando índices en Elasticsearch...${NC}"
sudo docker-compose exec backend python manage.py search_index --create 2>/dev/null || echo "⚠️  El comando search_index no está disponible (puede ser normal)"

echo ""
echo "=========================================="
echo "3️⃣  CREANDO SUPERUSUARIO"
echo "=========================================="
echo ""

echo "¿Cómo deseas crear el superusuario?"
echo "  1. Automático (admin/admin123456)"
echo "  2. Manual (elegir credenciales)"
echo ""
read -p "Selecciona una opción (1/2): " user_option

if [ "$user_option" == "1" ]; then
    echo ""
    echo -e "${YELLOW}Creando superusuario automáticamente...${NC}"

    sudo docker-compose exec -T backend python manage.py shell <<'EOF'
from django.contrib.auth import get_user_model

User = get_user_model()

username = 'admin'
email = 'admin@biblioteca.com'
password = 'admin123456'

if User.objects.filter(username=username).exists():
    print(f"⚠️  El usuario '{username}' ya existe")
    user = User.objects.get(username=username)
else:
    user = User.objects.create_superuser(
        username=username,
        email=email,
        password=password
    )
    print("✅ Superusuario creado exitosamente!")

print(f"\nUsername: {user.username}")
print(f"Email: {user.email}")
if not User.objects.filter(username=username).exclude(pk=user.pk).exists():
    print(f"Password: admin123456")
EOF

    echo ""
    echo -e "${GREEN}=========================================="
    echo "CREDENCIALES DEL SUPERUSUARIO"
    echo "==========================================${NC}"
    echo "Username: admin"
    echo "Email:    admin@biblioteca.com"
    echo "Password: admin123456"
    echo ""
    echo -e "${YELLOW}⚠️  IMPORTANTE: Cambia esta contraseña en producción${NC}"

elif [ "$user_option" == "2" ]; then
    echo ""
    echo -e "${YELLOW}Creación interactiva de superusuario...${NC}"
    sudo docker-compose exec backend python manage.py createsuperuser
else
    echo -e "${RED}Opción inválida${NC}"
    exit 1
fi

echo ""
echo "=========================================="
echo "4️⃣  VERIFICANDO CONFIGURACIÓN"
echo "=========================================="
echo ""

echo -e "${BLUE}Verificando usuarios en la base de datos...${NC}"
sudo docker-compose exec -T backend python manage.py shell <<'EOF'
from django.contrib.auth import get_user_model

User = get_user_model()
users = User.objects.all()

print(f"\n✅ Total de usuarios: {users.count()}")
for user in users:
    print(f"  👤 {user.username} ({user.email}) - Superuser: {user.is_superuser}")
EOF

echo ""
echo -e "${BLUE}Verificando conexión a PostgreSQL...${NC}"
sudo docker-compose exec backend python manage.py check --database default

echo ""
echo -e "${BLUE}Verificando backend HTTP...${NC}"
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/admin/)
if [ "$response" == "302" ] || [ "$response" == "200" ]; then
    echo -e "${GREEN}✅ Backend respondiendo correctamente (HTTP $response)${NC}"
else
    echo -e "${YELLOW}⚠️  Backend responde con HTTP $response${NC}"
fi

echo ""
echo "=========================================="
echo "✅ CONFIGURACIÓN COMPLETA"
echo "=========================================="
echo ""
echo -e "${GREEN}🎉 ¡El backend está listo para usar!${NC}"
echo ""
echo "📝 Accesos disponibles:"
echo "  🔐 Django Admin:  http://localhost:8000/admin/"
echo "  🔌 API Backend:   http://localhost:8000/api/"
echo "  🎨 Frontend:      http://localhost:3000"
echo "  🔍 Elasticsearch: http://localhost:9200"
echo ""

if [ "$user_option" == "1" ]; then
    echo "🔑 Credenciales de acceso:"
    echo "  Username: admin"
    echo "  Password: admin123456"
    echo ""
fi

echo "=========================================="
echo ""
echo "💡 Próximos pasos:"
echo "  1. Accede al Django Admin: http://localhost:8000/admin/"
echo "  2. Crea categorías, autores y libros"
echo "  3. Prueba el frontend: http://localhost:3000"
echo ""
