#!/usr/bin/env python
# -*- coding: utf-8 -*-
import os
import sys
import django

# Configurar codificación UTF-8 para la salida
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.content.models import Book, Author, Category
from datetime import date

# Limpiar datos existentes
Book.objects.all().delete()
Author.objects.all().delete()
Category.objects.all().delete()

# Crear categorías
categories_data = [
    {"name": "Ficción", "description": "Obras de ficción literaria"},
    {"name": "No Ficción", "description": "Obras basadas en hechos reales"},
    {"name": "Ciencia", "description": "Libros científicos y técnicos"},
    {"name": "Historia", "description": "Libros de historia y biografías"},
    {"name": "Literatura Clásica", "description": "Obras literarias clásicas"},
]

categories = {}
for cat_data in categories_data:
    cat = Category.objects.create(**cat_data)
    categories[cat.name] = cat
    print(f"✓ Categoría creada: {cat.name}")

# Crear autores
authors_data = [
    {"name": "Gabriel García Márquez", "bio": "Escritor colombiano, premio Nobel de Literatura"},
    {"name": "Miguel de Cervantes", "bio": "Escritor español, autor de Don Quijote"},
    {"name": "Julio Cortázar", "bio": "Escritor argentino, maestro del cuento latinoamericano"},
    {"name": "Jorge Luis Borges", "bio": "Escritor argentino, uno de los autores más importantes del siglo XX"},
    {"name": "Isabel Allende", "bio": "Escritora chilena, autora de La casa de los espíritus"},
]

authors = {}
for author_data in authors_data:
    author = Author.objects.create(**author_data)
    authors[author.name] = author
    print(f"✓ Autor creado: {author.name}")

# Crear libros
books_data = [
    {
        "title": "Cien años de soledad",
        "author": authors["Gabriel García Márquez"],
        "category": categories["Literatura Clásica"],
        "description": "La obra maestra de García Márquez que narra la historia de la familia Buendía.",
        "publication_date": date(1967, 5, 30),
        "isbn": "9788497592208",
        "is_premium": False,
    },
    {
        "title": "Don Quijote de la Mancha",
        "author": authors["Miguel de Cervantes"],
        "category": categories["Literatura Clásica"],
        "description": "La novela más influyente de la literatura española.",
        "publication_date": date(1605, 1, 16),
        "isbn": "9788424199999",
        "is_premium": False,
    },
    {
        "title": "Rayuela",
        "author": authors["Julio Cortázar"],
        "category": categories["Ficción"],
        "description": "Una novela experimental que revolucionó la literatura latinoamericana.",
        "publication_date": date(1963, 6, 28),
        "isbn": "9788466332484",
        "is_premium": True,
    },
    {
        "title": "El Aleph",
        "author": authors["Jorge Luis Borges"],
        "category": categories["Ficción"],
        "description": "Colección de cuentos que exploran temas metafísicos y filosóficos.",
        "publication_date": date(1949, 9, 5),
        "isbn": "9788499089515",
        "is_premium": True,
    },
    {
        "title": "La casa de los espíritus",
        "author": authors["Isabel Allende"],
        "category": categories["Ficción"],
        "description": "La primera novela de Isabel Allende, una saga familiar épica.",
        "publication_date": date(1982, 10, 15),
        "isbn": "9788497592727",
        "is_premium": False,
    },
]

for book_data in books_data:
    book = Book.objects.create(**book_data)
    print(f"✓ Libro creado: {book.title}")

print("\n✅ Todos los datos fueron creados exitosamente con codificación UTF-8")
print(f"Total: {Category.objects.count()} categorías, {Author.objects.count()} autores, {Book.objects.count()} libros")
