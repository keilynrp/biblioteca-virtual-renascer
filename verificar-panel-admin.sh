#!/bin/bash

# Script de verificación completa

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

clear

echo -e "${BLUE}================================================================================${NC}"
echo -e "${CYAN}   🔍 VERIFICACIÓN DEL PANEL DE ADMINISTRACIÓN${NC}"
echo -e "${BLUE}================================================================================${NC}"
echo ""

# 1. Verificar archivos
echo -e "${YELLOW}[1/5] Verificando archivos del frontend...${NC}"
echo ""

FILES=(
    "frontend/src/app/(dashboard)/admin/page.tsx"
    "frontend/src/components/admin/book-import-panel.tsx"
    "frontend/src/components/admin/import-stats-panel.tsx"
    "frontend/src/components/ui/progress.tsx"
    "frontend/src/components/ui/badge.tsx"
)

ALL_FILES_OK=true
for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "  ${GREEN}✓${NC} $file"
    else
        echo -e "  ${RED}✗${NC} $file ${RED}(FALTA)${NC}"
        ALL_FILES_OK=false
    fi
done

# 2. Verificar backend
echo ""
echo -e "${YELLOW}[2/5] Verificando endpoints del backend...${NC}"
echo ""

docker compose exec backend python -c "
try:
    from apps.content.views import import_books_from_openlibrary, get_import_stats
    from apps.content.urls import urlpatterns
    print('  ✅ Endpoints importados correctamente')

    # Verificar rutas
    urls = [str(pattern.pattern) for pattern in urlpatterns]
    if 'admin/import-books/' in str(urls):
        print('  ✅ Ruta admin/import-books/ registrada')
    else:
        print('  ❌ Ruta admin/import-books/ NO registrada')

    if 'admin/import-stats/' in str(urls):
        print('  ✅ Ruta admin/import-stats/ registrada')
    else:
        print('  ❌ Ruta admin/import-stats/ NO registrada')
except Exception as e:
    print(f'  ❌ Error: {e}')
" 2>&1

# 3. Verificar layout
echo ""
echo -e "${YELLOW}[3/5] Verificando menú de navegación...${NC}"
echo ""

if grep -q "Shield" "frontend/src/app/(dashboard)/layout.tsx" 2>/dev/null; then
    echo -e "  ${GREEN}✓${NC} Icono Shield importado en layout"
else
    echo -e "  ${RED}✗${NC} Icono Shield NO importado"
fi

if grep -q '"/admin"' "frontend/src/app/(dashboard)/layout.tsx" 2>/dev/null; then
    echo -e "  ${GREEN}✓${NC} Ruta /admin agregada al menú"
else
    echo -e "  ${RED}✗${NC} Ruta /admin NO encontrada en el menú"
fi

# 4. Verificar usuarios admin
echo ""
echo -e "${YELLOW}[4/5] Verificando usuarios administradores...${NC}"
echo ""

docker compose exec backend python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
admins = User.objects.filter(is_staff=True)
if admins.exists():
    print('  ✅ Usuarios administradores encontrados:')
    for user in admins:
        print(f'     - {user.username} (staff: {user.is_staff}, superuser: {user.is_superuser})')
else:
    print('  ⚠️  No hay usuarios administradores')
    print('     Ejecuta: ./dar-permisos-admin.sh')
" 2>&1

# 5. Verificar contenedores
echo ""
echo -e "${YELLOW}[5/5] Estado de los contenedores...${NC}"
echo ""

docker compose ps | grep -E "(frontend|backend)" | while read line; do
    if echo "$line" | grep -q "running"; then
        echo -e "  ${GREEN}✓${NC} $line"
    else
        echo -e "  ${RED}✗${NC} $line"
    fi
done

# Resumen y recomendaciones
echo ""
echo -e "${BLUE}================================================================================${NC}"
echo -e "${CYAN}   📋 RESUMEN Y RECOMENDACIONES${NC}"
echo -e "${BLUE}================================================================================${NC}"
echo ""

if [ "$ALL_FILES_OK" = true ]; then
    echo -e "${GREEN}✅ Todos los archivos necesarios existen${NC}"
else
    echo -e "${RED}❌ Faltan algunos archivos${NC}"
    echo ""
    echo "Solución: Los archivos deberían haber sido creados. Verifica que:"
    echo "  - Claude Code haya ejecutado todos los comandos Write"
    echo "  - No haya errores en los logs"
fi

echo ""
echo -e "${YELLOW}Si no ves el Panel Admin en el navegador:${NC}"
echo ""
echo "1. ${CYAN}Reconstruir el frontend completamente:${NC}"
echo "   ${GREEN}./rebuild-frontend-completo.sh${NC}"
echo ""
echo "2. ${CYAN}Otorgar permisos de admin:${NC}"
echo "   ${GREEN}./dar-permisos-admin.sh${NC}"
echo ""
echo "3. ${CYAN}Activar todo de una vez:${NC}"
echo "   ${GREEN}./activar-panel-admin.sh${NC}"
echo ""
echo "4. ${CYAN}En el navegador:${NC}"
echo "   - Ctrl+Shift+R (recarga fuerte)"
echo "   - Cerrar sesión e iniciar sesión de nuevo"
echo "   - Abrir en modo incógnito"
echo "   - Revisar consola del navegador (F12)"
echo ""
echo -e "${BLUE}================================================================================${NC}"
echo ""
