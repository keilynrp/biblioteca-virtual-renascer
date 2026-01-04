#!/bin/bash

echo "=========================================="
echo "👤 CREAR SUPERUSUARIO EN DJANGO"
echo "=========================================="
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Opción 1: Crear superusuario de forma interactiva${NC}"
echo "------------------------------------------------"
echo "Se te pedirá username, email y password"
echo ""
echo "Comando:"
echo "  sudo docker-compose exec backend python manage.py createsuperuser"
echo ""
echo ""

echo -e "${BLUE}Opción 2: Crear superusuario automáticamente (para testing)${NC}"
echo "------------------------------------------------"
echo "Creará un usuario con credenciales predeterminadas:"
echo "  Username: admin"
echo "  Email: admin@biblioteca.com"
echo "  Password: admin123456"
echo ""

read -p "¿Qué opción prefieres? (1/2): " option

if [ "$option" == "1" ]; then
    echo ""
    echo -e "${YELLOW}Ejecutando createsuperuser interactivo...${NC}"
    echo ""
    sudo docker-compose exec backend python manage.py createsuperuser

elif [ "$option" == "2" ]; then
    echo ""
    echo -e "${YELLOW}Creando superusuario automáticamente...${NC}"
    echo ""

    # Crear superusuario usando un script Python
    sudo docker-compose exec -T backend python manage.py shell <<EOF
from django.contrib.auth import get_user_model
User = get_user_model()

# Verificar si el usuario ya existe
if User.objects.filter(username='admin').exists():
    print("⚠️  El usuario 'admin' ya existe")
    user = User.objects.get(username='admin')
    print(f"✅ Usuario existente: {user.username} - {user.email}")
else:
    # Crear el superusuario
    user = User.objects.create_superuser(
        username='admin',
        email='admin@biblioteca.com',
        password='admin123456'
    )
    print("✅ Superusuario creado exitosamente!")
    print(f"   Username: {user.username}")
    print(f"   Email: {user.email}")
    print(f"   Password: admin123456")
EOF

    echo ""
    echo -e "${GREEN}=========================================="
    echo "✅ CREDENCIALES DEL SUPERUSUARIO"
    echo "==========================================${NC}"
    echo "Username: admin"
    echo "Email: admin@biblioteca.com"
    echo "Password: admin123456"
    echo ""
    echo -e "${YELLOW}⚠️  IMPORTANTE: Cambia esta contraseña en producción!${NC}"

else
    echo ""
    echo "Opción no válida. Saliendo..."
    exit 1
fi

echo ""
echo "=========================================="
echo "📝 ACCESO AL ADMIN"
echo "=========================================="
echo ""
echo "Puedes acceder al Django Admin en:"
echo "  🌐 http://localhost:8000/admin/"
echo ""
echo "Para acceder al frontend:"
echo "  🌐 http://localhost:3000"
echo ""

# Verificar que el usuario se creó
echo "Verificando usuarios existentes..."
echo "-----------------------------------"
sudo docker-compose exec -T backend python manage.py shell <<EOF
from django.contrib.auth import get_user_model
User = get_user_model()
users = User.objects.filter(is_superuser=True)
print(f"\n📊 Total de superusuarios: {users.count()}")
for user in users:
    print(f"   • {user.username} ({user.email}) - Activo: {user.is_active}")
EOF

echo ""
echo -e "${GREEN}✅ Proceso completado${NC}"
echo ""
