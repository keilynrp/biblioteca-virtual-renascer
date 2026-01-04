#!/bin/bash

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}================================================================================${NC}"
echo -e "${GREEN}   🔑 OTORGAR PERMISOS DE ADMINISTRADOR${NC}"
echo -e "${BLUE}================================================================================${NC}"
echo ""
echo "Este script te dará permisos de administrador para acceder al Panel Admin"
echo ""

read -p "Introduce tu nombre de usuario: " username

echo ""
echo -e "${YELLOW}Otorgando permisos de administrador a: $username${NC}"
echo ""

docker compose exec backend python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
try:
    user = User.objects.get(username='$username')
    user.is_staff = True
    user.is_superuser = True
    user.save()
    print(f'✅ Usuario {user.username} ahora es administrador')
    print(f'   - is_staff: {user.is_staff}')
    print(f'   - is_superuser: {user.is_superuser}')
except User.DoesNotExist:
    print(f'❌ Error: Usuario \"$username\" no existe')
    print('   Usuarios disponibles:')
    for u in User.objects.all():
        print(f'   - {u.username}')
"

echo ""
echo -e "${BLUE}================================================================================${NC}"
echo -e "${GREEN}   ✅ PROCESO COMPLETADO${NC}"
echo -e "${BLUE}================================================================================${NC}"
echo ""
echo "Ahora puedes:"
echo "1. Recargar la página web (F5)"
echo "2. Ir al menú lateral y buscar 'Panel Admin' (ícono de escudo)"
echo "3. Comenzar a importar libros"
echo ""
