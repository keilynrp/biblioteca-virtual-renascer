#!/bin/bash

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================================================================${NC}"
echo -e "${GREEN}   📚 IMPORTANDO 100 LIBROS DESDE OPENLIBRARY.ORG${NC}"
echo -e "${BLUE}================================================================================${NC}"
echo ""
echo "Este script importará 100 libros con sus portadas desde OpenLibrary.org"
echo "Los libros se distribuirán en diferentes categorías."
echo ""
read -p "Presiona ENTER para continuar..."

echo ""
echo -e "${YELLOW}Ejecutando importación de libros...${NC}"
echo ""

# Importar libros
docker compose exec backend python manage.py import_openlibrary \
    --subjects "programming,science,fiction,history,philosophy,mathematics,art,psychology,business,health" \
    --limit 100

# Verificar si la importación fue exitosa
if [ $? -eq 0 ]; then
    echo ""
    echo -e "${BLUE}================================================================================${NC}"
    echo -e "${GREEN}   🔍 INDEXANDO LIBROS EN ELASTICSEARCH${NC}"
    echo -e "${BLUE}================================================================================${NC}"
    echo ""

    # Indexar en Elasticsearch
    docker compose exec backend python manage.py index_books

    if [ $? -eq 0 ]; then
        echo ""
        echo -e "${BLUE}================================================================================${NC}"
        echo -e "${GREEN}   ✅ IMPORTACIÓN COMPLETADA${NC}"
        echo -e "${BLUE}================================================================================${NC}"
        echo ""
        echo -e "${GREEN}Los libros han sido importados y indexados correctamente.${NC}"
        echo "Ahora puedes verlos en tu biblioteca virtual."
        echo ""
    else
        echo ""
        echo -e "${YELLOW}⚠️  Importación completada pero hubo problemas con la indexación.${NC}"
        echo "Puedes intentar indexar manualmente con:"
        echo "  docker compose exec backend python manage.py index_books"
        echo ""
    fi
else
    echo ""
    echo -e "${YELLOW}❌ Hubo un error durante la importación.${NC}"
    echo "Verifica los logs con: docker compose logs backend"
    echo ""
    exit 1
fi
