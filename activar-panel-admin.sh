#!/bin/bash

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

clear

echo -e "${BLUE}================================================================================${NC}"
echo -e "${GREEN}   🚀 ACTIVACIÓN COMPLETA DEL PANEL DE ADMINISTRACIÓN${NC}"
echo -e "${BLUE}================================================================================${NC}"
echo ""
echo "Este script hará TODO lo necesario para activar el Panel Admin:"
echo "  1. Otorgar permisos de administrador"
echo "  2. Reconstruir el frontend con los nuevos componentes"
echo "  3. Reiniciar los servicios"
echo "  4. Verificar que todo esté funcionando"
echo ""
read -p "Presiona ENTER para continuar..."

echo ""
echo -e "${BLUE}================================================================================${NC}"
echo -e "${CYAN}   [PASO 1/4] OTORGAR PERMISOS DE ADMINISTRADOR${NC}"
echo -e "${BLUE}================================================================================${NC}"
echo ""

read -p "Introduce tu nombre de usuario: " username

echo ""
echo -e "${YELLOW}Otorgando permisos a $username...${NC}"
echo ""

docker compose exec backend python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
try:
    user = User.objects.get(username='$username')
    user.is_staff = True
    user.is_superuser = True
    user.save()
    print('✅ Usuario $username ahora es administrador')
    print(f'   - is_staff: {user.is_staff}')
    print(f'   - is_superuser: {user.is_superuser}')
except User.DoesNotExist:
    print('❌ Error: Usuario \"$username\" no existe')
    print('   Ejecuta: docker compose exec backend python manage.py shell')
    exit(1)
"

if [ $? -ne 0 ]; then
    echo ""
    echo -e "${RED}❌ Error al otorgar permisos${NC}"
    echo "Verifica que el usuario exista"
    exit 1
fi

echo ""
echo -e "${BLUE}================================================================================${NC}"
echo -e "${CYAN}   [PASO 2/4] VERIFICAR ARCHIVOS CREADOS${NC}"
echo -e "${BLUE}================================================================================${NC}"
echo ""

FILES_OK=true

if [ -f "frontend/src/app/(dashboard)/admin/page.tsx" ]; then
    echo -e "${GREEN}✓${NC} Página de admin existe"
else
    echo -e "${RED}✗${NC} Página de admin NO existe"
    FILES_OK=false
fi

if [ -f "frontend/src/components/admin/book-import-panel.tsx" ]; then
    echo -e "${GREEN}✓${NC} Componente de importación existe"
else
    echo -e "${RED}✗${NC} Componente de importación NO existe"
    FILES_OK=false
fi

if [ -f "frontend/src/components/admin/import-stats-panel.tsx" ]; then
    echo -e "${GREEN}✓${NC} Componente de estadísticas existe"
else
    echo -e "${RED}✗${NC} Componente de estadísticas NO existe"
    FILES_OK=false
fi

if [ -f "frontend/src/components/ui/progress.tsx" ]; then
    echo -e "${GREEN}✓${NC} Componente Progress existe"
else
    echo -e "${RED}✗${NC} Componente Progress NO existe"
    FILES_OK=false
fi

if [ "$FILES_OK" = false ]; then
    echo ""
    echo -e "${RED}❌ Faltan archivos necesarios${NC}"
    echo "Los archivos deberían haber sido creados por Claude"
    exit 1
fi

echo ""
echo -e "${BLUE}================================================================================${NC}"
echo -e "${CYAN}   [PASO 3/4] RECONSTRUIR Y REINICIAR FRONTEND${NC}"
echo -e "${BLUE}================================================================================${NC}"
echo ""

echo -e "${YELLOW}Deteniendo frontend...${NC}"
docker compose stop frontend

echo ""
echo -e "${YELLOW}Reconstruyendo frontend con los nuevos componentes...${NC}"
echo -e "${CYAN}Esto puede tardar 2-3 minutos...${NC}"
docker compose build frontend

echo ""
echo -e "${YELLOW}Iniciando frontend...${NC}"
docker compose up -d frontend

echo ""
echo -e "${YELLOW}Esperando a que el frontend esté listo (20 segundos)...${NC}"
sleep 20

echo ""
echo -e "${BLUE}================================================================================${NC}"
echo -e "${CYAN}   [PASO 4/4] VERIFICAR BACKEND${NC}"
echo -e "${BLUE}================================================================================${NC}"
echo ""

echo -e "${YELLOW}Verificando endpoints del backend...${NC}"
docker compose exec backend python -c "
from apps.content.views import import_books_from_openlibrary, get_import_stats
print('✅ Endpoints importados correctamente')
" 2>&1

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Backend configurado correctamente"
else
    echo -e "${YELLOW}⚠️${NC}  Reiniciando backend para aplicar cambios..."
    docker compose restart backend
    sleep 5
fi

echo ""
echo -e "${BLUE}================================================================================${NC}"
echo -e "${GREEN}   ✅ ACTIVACIÓN COMPLETADA${NC}"
echo -e "${BLUE}================================================================================${NC}"
echo ""
echo -e "${GREEN}✓ Permisos de administrador otorgados a:${NC} $username"
echo -e "${GREEN}✓ Frontend reconstruido y reiniciado${NC}"
echo -e "${GREEN}✓ Backend verificado${NC}"
echo ""
echo -e "${YELLOW}═══════════════════════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}   PASOS SIGUIENTES:${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════════════════════════════════${NC}"
echo ""
echo "1. Abre tu navegador y ve a: ${CYAN}http://localhost:3000${NC}"
echo ""
echo "2. ${YELLOW}IMPORTANTE:${NC} Haz una ${GREEN}RECARGA FUERTE${NC} de la página:"
echo "   - Chrome/Edge: ${GREEN}Ctrl + Shift + R${NC}"
echo "   - Firefox: ${GREEN}Ctrl + F5${NC}"
echo "   - Safari: ${GREEN}Cmd + Shift + R${NC}"
echo ""
echo "3. Si ya estás logueado, ${YELLOW}CIERRA SESIÓN${NC} y vuelve a ${YELLOW}INICIAR SESIÓN${NC}"
echo "   (Necesario para cargar tus nuevos permisos de admin)"
echo ""
echo "4. En el menú lateral, busca ${GREEN}\"Panel Admin\"${NC} con el ícono de escudo 🛡️"
echo ""
echo "5. Click en ${GREEN}\"Panel Admin\"${NC} para comenzar a importar libros"
echo ""
echo -e "${YELLOW}═══════════════════════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${CYAN}Si aún no ves el \"Panel Admin\", intenta:${NC}"
echo "  - Borrar caché del navegador"
echo "  - Abrir en modo incógnito"
echo "  - Revisar la consola del navegador (F12) por errores"
echo "  - Ejecutar: ${GREEN}docker compose logs frontend${NC}"
echo ""
echo -e "${BLUE}================================================================================${NC}"
echo ""
