#!/bin/bash

# Script para verificar el estado de la importación de libros

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

clear

echo -e "${BLUE}================================================================================${NC}"
echo -e "${GREEN}   📊 VERIFICACIÓN DE BIBLIOTECA${NC}"
echo -e "${BLUE}================================================================================${NC}"
echo ""

# Verificar que los contenedores estén corriendo
echo -e "${YELLOW}🔍 Verificando contenedores...${NC}"
if ! docker compose ps | grep -q "backend.*running"; then
    echo -e "${RED}❌ El contenedor backend no está corriendo${NC}"
    echo "Inicia los contenedores con: docker compose up -d"
    exit 1
fi
echo -e "${GREEN}✅ Contenedores activos${NC}"
echo ""

# Estadísticas de la base de datos
echo -e "${BLUE}================================================================================${NC}"
echo -e "${CYAN}   📚 ESTADÍSTICAS DE LA BASE DE DATOS${NC}"
echo -e "${BLUE}================================================================================${NC}"
echo ""

docker compose exec backend python manage.py shell << 'EOF'
from apps.content.models import Book, Author, Category
from django.db.models import Count, Avg

# Estadísticas generales
total_books = Book.objects.count()
total_authors = Author.objects.count()
total_categories = Category.objects.count()

print(f"📖 Total de libros: {total_books}")
print(f"✍️  Total de autores: {total_authors}")
print(f"🏷️  Total de categorías: {total_categories}")
print()

# Libros por categoría
print("📊 Libros por categoría:")
print("-" * 50)
categories = Category.objects.annotate(
    book_count=Count('books')
).order_by('-book_count')[:10]

for cat in categories:
    bar = "█" * min(cat.book_count, 50)
    print(f"  {cat.name:20} {bar} ({cat.book_count})")
print()

# Autores más prolíficos
print("✍️  Autores más prolíficos:")
print("-" * 50)
authors = Author.objects.annotate(
    book_count=Count('books')
).filter(book_count__gt=0).order_by('-book_count')[:10]

for author in authors:
    print(f"  {author.name:30} ({author.book_count} libros)")
print()

# Libros con portada vs sin portada
with_cover = Book.objects.exclude(cover_image='').count()
without_cover = Book.objects.filter(cover_image='').count()

print(f"🖼️  Libros con portada: {with_cover}")
print(f"📄 Libros sin portada: {without_cover}")
print()

# Libros premium vs gratuitos
premium = Book.objects.filter(is_premium=True).count()
free = Book.objects.filter(is_premium=False).count()

print(f"💎 Libros premium: {premium}")
print(f"🆓 Libros gratuitos: {free}")
print()

# Últimos libros importados
print("🆕 Últimos 5 libros importados:")
print("-" * 50)
recent = Book.objects.select_related('author', 'category').order_by('-created_at')[:5]
for book in recent:
    category = book.category.name if book.category else "Sin categoría"
    print(f"  • {book.title[:40]:40} - {book.author.name:20} ({category})")

EOF

echo ""
echo -e "${BLUE}================================================================================${NC}"
echo -e "${CYAN}   🔍 VERIFICACIÓN DE ELASTICSEARCH${NC}"
echo -e "${BLUE}================================================================================${NC}"
echo ""

# Verificar índice de Elasticsearch
echo -e "${YELLOW}Verificando índice de Elasticsearch...${NC}"
docker compose exec backend python manage.py shell << 'EOF'
from apps.content.documents import BookDocument
from elasticsearch.exceptions import NotFoundError

try:
    # Obtener estadísticas del índice
    search = BookDocument.search()
    total = search.count()
    print(f"📇 Libros indexados en Elasticsearch: {total}")

    # Verificar consistencia
    from apps.content.models import Book
    db_count = Book.objects.count()

    if total == db_count:
        print(f"✅ Índice consistente con la base de datos")
    else:
        print(f"⚠️  Diferencia detectada:")
        print(f"   Base de datos: {db_count}")
        print(f"   Elasticsearch: {total}")
        print(f"   Diferencia: {abs(db_count - total)}")
        print()
        print("💡 Ejecuta para reindexar:")
        print("   docker compose exec backend python manage.py index_books")

except NotFoundError:
    print("❌ Índice no encontrado en Elasticsearch")
    print("💡 Ejecuta para crear el índice:")
    print("   docker compose exec backend python manage.py index_books")
except Exception as e:
    print(f"❌ Error al verificar Elasticsearch: {str(e)}")

EOF

echo ""
echo -e "${BLUE}================================================================================${NC}"
echo -e "${GREEN}   ✅ VERIFICACIÓN COMPLETADA${NC}"
echo -e "${BLUE}================================================================================${NC}"
echo ""
