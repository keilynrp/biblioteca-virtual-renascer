#!/bin/bash

echo "=========================================="
echo "🚀 IMPORTACIÓN RÁPIDA DE LIBROS"
echo "=========================================="
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Importando 30 libros variados desde OpenLibrary...${NC}"
echo ""

# 1. Aplicar migración del modelo Book actualizado
echo "1️⃣  Aplicando cambios en el modelo Book..."
sudo docker-compose exec backend python manage.py makemigrations
sudo docker-compose exec backend python manage.py migrate

echo ""
echo "2️⃣  Importando libros..."
echo ""

# 2. Importar libros
sudo docker-compose exec backend python manage.py import_openlibrary \
    --subjects "programming,science,fiction,history,philosophy" \
    --limit 30

echo ""
echo "3️⃣  Indexando en Elasticsearch..."
echo ""

# 3. Indexar en Elasticsearch
sudo docker-compose exec backend python manage.py search_index --rebuild -f

echo ""
echo "=========================================="
echo -e "${GREEN}✅ ¡LISTO! Libros importados e indexados${NC}"
echo "=========================================="
echo ""
echo "📊 Estadísticas:"
sudo docker-compose exec -T backend python manage.py shell <<'EOF'
from apps.content.models import Book, Author, Category
print(f"  📚 Libros: {Book.objects.count()}")
print(f"  ✍️  Autores: {Author.objects.count()}")
print(f"  📁 Categorías: {Category.objects.count()}")
EOF

echo ""
echo "🌐 Accesos:"
echo "  Django Admin: http://localhost:8000/admin/content/book/"
echo "  API Libros:   http://localhost:8000/api/content/books/"
echo "  Frontend:     http://localhost:3000"
echo ""
echo "🔍 Prueba la búsqueda:"
echo "  http://localhost:8000/api/content/search/?q=python"
echo ""
