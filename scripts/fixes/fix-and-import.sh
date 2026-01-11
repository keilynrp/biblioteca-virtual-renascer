#!/bin/bash

echo "=========================================="
echo "🔧 CORRIGIENDO Y EJECUTANDO IMPORTACIÓN"
echo "=========================================="
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Este script corregirá el error de longitud de campo y ejecutará la importación${NC}"
echo ""

# 1. Crear migraciones para los cambios en slug
echo "1️⃣  Creando migraciones para los campos actualizados..."
echo ""
sudo docker-compose exec backend python manage.py makemigrations

if [ $? -ne 0 ]; then
    echo ""
    echo -e "${RED}❌ Error al crear migraciones${NC}"
    exit 1
fi

echo ""
echo "2️⃣  Aplicando migraciones..."
echo ""
sudo docker-compose exec backend python manage.py migrate

if [ $? -ne 0 ]; then
    echo ""
    echo -e "${RED}❌ Error al aplicar migraciones${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Migraciones aplicadas correctamente${NC}"
echo ""

# 2. Ejecutar importación
echo "3️⃣  Importando libros desde OpenLibrary..."
echo ""

sudo docker-compose exec backend python manage.py import_openlibrary \
    --subjects "programming,science,fiction,history,philosophy" \
    --limit 30

if [ $? -ne 0 ]; then
    echo ""
    echo -e "${RED}❌ Error durante la importación${NC}"
    echo ""
    echo "Verifica los logs con:"
    echo "  sudo docker-compose logs backend"
    exit 1
fi

echo ""
echo "4️⃣  Indexando en Elasticsearch..."
echo ""

sudo docker-compose exec backend python manage.py search_index --rebuild -f

echo ""
echo "=========================================="
echo -e "${GREEN}✅ ¡PROCESO COMPLETADO EXITOSAMENTE!${NC}"
echo "=========================================="
echo ""

# Mostrar estadísticas
echo "📊 Estadísticas de la base de datos:"
echo ""
sudo docker-compose exec -T backend python manage.py shell <<'EOF'
from apps.content.models import Book, Author, Category
print(f"  📚 Libros:     {Book.objects.count()}")
print(f"  ✍️  Autores:    {Author.objects.count()}")
print(f"  📁 Categorías: {Category.objects.count()}")
EOF

echo ""
echo "🌐 Accesos disponibles:"
echo "  Django Admin: http://localhost:8000/admin/content/book/"
echo "  API Libros:   http://localhost:8000/api/content/books/"
echo "  API Búsqueda: http://localhost:8000/api/content/search/?q=python"
echo "  Frontend:     http://localhost:3000"
echo ""
