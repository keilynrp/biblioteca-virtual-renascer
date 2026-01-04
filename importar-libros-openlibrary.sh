#!/bin/bash

echo "=========================================="
echo "📚 IMPORTAR LIBROS DESDE OPENLIBRARY"
echo "=========================================="
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Este script importará libros desde OpenLibrary.org${NC}"
echo ""
echo "Opciones disponibles:"
echo "  1. Importar por temas (recomendado)"
echo "  2. Importar por búsqueda libre"
echo "  3. Importar colección predefinida (30 libros variados)"
echo ""

read -p "Selecciona una opción (1/2/3): " option

if [ "$option" == "1" ]; then
    echo ""
    echo "Temas populares:"
    echo "  - programming, python, javascript, java, web_development"
    echo "  - science, physics, mathematics, biology, chemistry"
    echo "  - fiction, fantasy, science_fiction, mystery, romance"
    echo "  - history, philosophy, psychology, economics"
    echo "  - art, music, cooking, health, sports"
    echo ""
    read -p "Ingresa los temas separados por comas: " subjects
    read -p "Cantidad de libros a importar [30]: " limit
    limit=${limit:-30}

    echo ""
    echo -e "${YELLOW}Importando $limit libros sobre: $subjects${NC}"
    echo ""

    sudo docker-compose exec backend python manage.py import_openlibrary \
        --subjects "$subjects" \
        --limit $limit

elif [ "$option" == "2" ]; then
    echo ""
    read -p "Ingresa tu búsqueda: " query
    read -p "Cantidad de libros a importar [20]: " limit
    limit=${limit:-20}

    echo ""
    echo -e "${YELLOW}Buscando: $query (límite: $limit)${NC}"
    echo ""

    sudo docker-compose exec backend python manage.py import_openlibrary \
        --query "$query" \
        --limit $limit

elif [ "$option" == "3" ]; then
    echo ""
    echo -e "${YELLOW}Importando colección predefinida de 30 libros...${NC}"
    echo ""

    sudo docker-compose exec backend python manage.py import_openlibrary \
        --subjects "programming,science,fiction,history,philosophy" \
        --limit 30

else
    echo ""
    echo "Opción no válida. Saliendo..."
    exit 1
fi

echo ""
echo "=========================================="
echo -e "${GREEN}✅ PROCESO COMPLETADO${NC}"
echo "=========================================="
echo ""
echo "Próximos pasos:"
echo "  1. Indexar en Elasticsearch:"
echo "     sudo docker-compose exec backend python manage.py search_index --rebuild"
echo ""
echo "  2. Verificar en el admin:"
echo "     http://localhost:8000/admin/content/book/"
echo ""
echo "  3. Ver en la API:"
echo "     http://localhost:8000/api/content/books/"
echo ""
echo "  4. Probar búsqueda:"
echo "     http://localhost:8000/api/content/search/?q=python"
echo ""
