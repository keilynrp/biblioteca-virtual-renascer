#!/bin/bash

# Script de importación rápida sin confirmación
# Útil para automatización o cuando ya sabes lo que quieres importar

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Parámetros por defecto
LIMIT=100
SUBJECTS="programming,science,fiction,history,philosophy,mathematics,art,psychology,business,health"
QUERY=""
SKIP_INDEX=false

# Procesar argumentos
while [[ $# -gt 0 ]]; do
    case $1 in
        -l|--limit)
            LIMIT="$2"
            shift 2
            ;;
        -s|--subjects)
            SUBJECTS="$2"
            shift 2
            ;;
        -q|--query)
            QUERY="$2"
            shift 2
            ;;
        --skip-index)
            SKIP_INDEX=true
            shift
            ;;
        -h|--help)
            echo "Uso: $0 [opciones]"
            echo ""
            echo "Opciones:"
            echo "  -l, --limit N          Número de libros a importar (default: 100)"
            echo "  -s, --subjects TEMAS   Temas separados por comas"
            echo "  -q, --query TEXTO      Búsqueda por query"
            echo "  --skip-index           No indexar en Elasticsearch"
            echo "  -h, --help             Mostrar esta ayuda"
            echo ""
            echo "Ejemplos:"
            echo "  $0 --limit 50"
            echo "  $0 --subjects \"python,javascript,rust\""
            echo "  $0 --query \"machine learning\" --limit 30"
            exit 0
            ;;
        *)
            echo -e "${RED}Argumento desconocido: $1${NC}"
            exit 1
            ;;
    esac
done

echo -e "${BLUE}================================================================================${NC}"
echo -e "${GREEN}   🚀 IMPORTACIÓN RÁPIDA DE LIBROS${NC}"
echo -e "${BLUE}================================================================================${NC}"
echo ""

# Construir comando
CMD="docker compose exec backend python manage.py import_openlibrary"

if [ -n "$QUERY" ]; then
    echo -e "${YELLOW}🔍 Búsqueda:${NC} $QUERY"
    echo -e "${YELLOW}📊 Límite:${NC} $LIMIT libros"
    CMD="$CMD --query \"$QUERY\" --limit $LIMIT"
else
    echo -e "${YELLOW}📚 Temas:${NC} $SUBJECTS"
    echo -e "${YELLOW}📊 Límite:${NC} $LIMIT libros"
    CMD="$CMD --subjects \"$SUBJECTS\" --limit $LIMIT"
fi

echo ""
echo -e "${YELLOW}Iniciando importación...${NC}"
echo ""

# Ejecutar importación
eval $CMD

if [ $? -eq 0 ]; then
    if [ "$SKIP_INDEX" = false ]; then
        echo ""
        echo -e "${YELLOW}🔍 Indexando en Elasticsearch...${NC}"
        docker compose exec backend python manage.py index_books
    fi

    echo ""
    echo -e "${GREEN}✅ Importación completada exitosamente${NC}"
    echo ""
else
    echo ""
    echo -e "${RED}❌ Error durante la importación${NC}"
    exit 1
fi
