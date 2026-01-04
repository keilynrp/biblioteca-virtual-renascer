#!/bin/bash

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

clear

echo -e "${BLUE}================================================================================${NC}"
echo -e "${GREEN}   📚 IMPORTACIÓN PERSONALIZADA DE LIBROS DESDE OPENLIBRARY.ORG${NC}"
echo -e "${BLUE}================================================================================${NC}"
echo ""
echo "Opciones de importación disponibles:"
echo ""
echo -e "${GREEN}1.${NC} Libros de Programación (100 libros)"
echo -e "${GREEN}2.${NC} Libros de Ciencia (100 libros)"
echo -e "${GREEN}3.${NC} Libros de Ficción (100 libros)"
echo -e "${GREEN}4.${NC} Colección Variada (100 libros en 10 categorías)"
echo -e "${GREEN}5.${NC} Búsqueda personalizada (introducir término de búsqueda)"
echo -e "${GREEN}6.${NC} Importación masiva (200 libros)"
echo -e "${RED}7.${NC} Salir"
echo ""

read -p "Selecciona una opción (1-7): " opcion

case $opcion in
    1)
        echo ""
        echo -e "${YELLOW}📖 Importando libros de Programación...${NC}"
        echo ""
        docker compose exec backend python manage.py import_openlibrary \
            --subjects "programming,python,javascript,web_development,software_engineering,algorithms,data_structures,computer_science,machine_learning,artificial_intelligence" \
            --limit 100
        ;;

    2)
        echo ""
        echo -e "${YELLOW}🔬 Importando libros de Ciencia...${NC}"
        echo ""
        docker compose exec backend python manage.py import_openlibrary \
            --subjects "science,physics,chemistry,biology,astronomy,geology,mathematics,statistics,research,scientific_method" \
            --limit 100
        ;;

    3)
        echo ""
        echo -e "${YELLOW}📚 Importando libros de Ficción...${NC}"
        echo ""
        docker compose exec backend python manage.py import_openlibrary \
            --subjects "fiction,fantasy,science_fiction,mystery,thriller,romance,horror,adventure,classic_literature,contemporary_fiction" \
            --limit 100
        ;;

    4)
        echo ""
        echo -e "${YELLOW}🎨 Importando colección variada...${NC}"
        echo ""
        docker compose exec backend python manage.py import_openlibrary \
            --subjects "programming,science,fiction,history,philosophy,mathematics,art,psychology,business,health" \
            --limit 100
        ;;

    5)
        echo ""
        read -p "Introduce el término de búsqueda: " termino
        echo ""
        echo -e "${YELLOW}🔍 Buscando: ${termino}${NC}"
        echo ""
        docker compose exec backend python manage.py import_openlibrary \
            --query "$termino" \
            --limit 100
        ;;

    6)
        echo ""
        echo -e "${YELLOW}🚀 Importando colección masiva (200 libros)...${NC}"
        echo -e "${RED}⚠️  Esto puede tardar 10-15 minutos${NC}"
        echo ""
        read -p "¿Continuar? (s/n): " confirmar

        if [[ $confirmar == "s" || $confirmar == "S" ]]; then
            docker compose exec backend python manage.py import_openlibrary \
                --subjects "programming,science,fiction,history,philosophy,mathematics,art,psychology,business,health,literature,politics,economics,sociology,education,technology,engineering,medicine,law,religion" \
                --limit 200
        else
            echo "Operación cancelada."
            exit 0
        fi
        ;;

    7)
        echo ""
        echo -e "${GREEN}👋 Saliendo...${NC}"
        exit 0
        ;;

    *)
        echo ""
        echo -e "${RED}❌ Opción inválida${NC}"
        exit 1
        ;;
esac

# Verificar si la importación fue exitosa
if [ $? -eq 0 ]; then
    echo ""
    echo -e "${BLUE}================================================================================${NC}"
    echo -e "${GREEN}   🔍 INDEXANDO LIBROS EN ELASTICSEARCH${NC}"
    echo -e "${BLUE}================================================================================${NC}"
    echo ""

    docker compose exec backend python manage.py index_books

    if [ $? -eq 0 ]; then
        echo ""
        echo -e "${BLUE}================================================================================${NC}"
        echo -e "${GREEN}   ✅ IMPORTACIÓN COMPLETADA${NC}"
        echo -e "${BLUE}================================================================================${NC}"
        echo ""
        echo -e "${GREEN}Los libros han sido importados y indexados correctamente.${NC}"
        echo ""

        # Mostrar estadísticas
        echo -e "${YELLOW}📊 Estadísticas actuales:${NC}"
        docker compose exec backend python manage.py shell -c "
from apps.content.models import Book, Author, Category
print(f'Total de libros: {Book.objects.count()}')
print(f'Total de autores: {Author.objects.count()}')
print(f'Total de categorías: {Category.objects.count()}')
" 2>/dev/null

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
    echo -e "${RED}❌ Hubo un error durante la importación.${NC}"
    echo "Verifica los logs con: docker compose logs backend"
    echo ""
    exit 1
fi
