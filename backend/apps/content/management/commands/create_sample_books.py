from django.core.management.base import BaseCommand
from apps.content.models import Book, Author, Category
from django.utils.text import slugify


class Command(BaseCommand):
    help = 'Crea libros de muestra sin necesidad de internet'

    def handle(self, *args, **kwargs):
        self.stdout.write('Creando datos de muestra...')

        # Crear categorías
        categories_data = [
            {'name': 'Filosofía', 'slug': 'filosofia'},
            {'name': 'Ciencia', 'slug': 'ciencia'},
            {'name': 'Historia', 'slug': 'historia'},
            {'name': 'Literatura', 'slug': 'literatura'},
            {'name': 'Tecnología', 'slug': 'tecnologia'},
            {'name': 'Arte', 'slug': 'arte'},
        ]

        categories = {}
        for cat_data in categories_data:
            cat, created = Category.objects.get_or_create(
                slug=cat_data['slug'],
                defaults={'name': cat_data['name']}
            )
            categories[cat_data['slug']] = cat
            if created:
                self.stdout.write(f'  ✓ Categoría creada: {cat.name}')

        # Crear autores
        authors_data = [
            {'name': 'Platón', 'bio': 'Filósofo griego clásico, discípulo de Sócrates'},
            {'name': 'Aristóteles', 'bio': 'Filósofo y científico griego'},
            {'name': 'Albert Einstein', 'bio': 'Físico teórico alemán'},
            {'name': 'Isaac Newton', 'bio': 'Matemático y físico inglés'},
            {'name': 'Charles Darwin', 'bio': 'Naturalista inglés'},
            {'name': 'William Shakespeare', 'bio': 'Dramaturgo y poeta inglés'},
            {'name': 'Miguel de Cervantes', 'bio': 'Escritor español'},
            {'name': 'Leonardo da Vinci', 'bio': 'Artista e inventor italiano'},
            {'name': 'Confucio', 'bio': 'Filósofo chino'},
            {'name': 'Galileo Galilei', 'bio': 'Astrónomo y físico italiano'},
        ]

        authors = {}
        for author_data in authors_data:
            author, created = Author.objects.get_or_create(
                name=author_data['name'],
                defaults={'bio': author_data['bio']}
            )
            authors[author_data['name']] = author
            if created:
                self.stdout.write(f'  ✓ Autor creado: {author.name}')

        # Crear libros
        books_data = [
            {
                'title': 'La República',
                'author': 'Platón',
                'category': 'filosofia',
                'description': 'Diálogo socrático sobre la justicia y el orden político ideal.',
                'is_premium': False,
            },
            {
                'title': 'Ética a Nicómaco',
                'author': 'Aristóteles',
                'category': 'filosofia',
                'description': 'Tratado sobre ética y virtudes morales.',
                'is_premium': False,
            },
            {
                'title': 'Sobre la Teoría de la Relatividad',
                'author': 'Albert Einstein',
                'category': 'ciencia',
                'description': 'Explicación accesible de la teoría de la relatividad.',
                'is_premium': True,
            },
            {
                'title': 'Principios Matemáticos de Filosofía Natural',
                'author': 'Isaac Newton',
                'category': 'ciencia',
                'description': 'Obra fundamental que establece las leyes del movimiento.',
                'is_premium': True,
            },
            {
                'title': 'El Origen de las Especies',
                'author': 'Charles Darwin',
                'category': 'ciencia',
                'description': 'Fundamento de la teoría de la evolución por selección natural.',
                'is_premium': False,
            },
            {
                'title': 'Romeo y Julieta',
                'author': 'William Shakespeare',
                'category': 'literatura',
                'description': 'Tragedia sobre dos jóvenes enamorados de familias rivales.',
                'is_premium': False,
            },
            {
                'title': 'Hamlet',
                'author': 'William Shakespeare',
                'category': 'literatura',
                'description': 'Tragedia sobre venganza, locura y traición.',
                'is_premium': False,
            },
            {
                'title': 'Don Quijote de la Mancha',
                'author': 'Miguel de Cervantes',
                'category': 'literatura',
                'description': 'Novela sobre un hidalgo que pierde la razón y se cree caballero andante.',
                'is_premium': False,
            },
            {
                'title': 'Diálogos sobre los Dos Máximos Sistemas del Mundo',
                'author': 'Galileo Galilei',
                'category': 'ciencia',
                'description': 'Comparación entre el sistema ptolemaico y el copernicano.',
                'is_premium': True,
            },
            {
                'title': 'Analectas',
                'author': 'Confucio',
                'category': 'filosofia',
                'description': 'Colección de ideas y dichos del filósofo chino.',
                'is_premium': False,
            },
            {
                'title': 'Tratado de la Pintura',
                'author': 'Leonardo da Vinci',
                'category': 'arte',
                'description': 'Reflexiones sobre técnicas artísticas y perspectiva.',
                'is_premium': True,
            },
            {
                'title': 'Historia de la Guerra del Peloponeso',
                'author': 'Platón',
                'category': 'historia',
                'description': 'Relato histórico de la guerra entre Atenas y Esparta.',
                'is_premium': False,
            },
        ]

        created_count = 0
        for book_data in books_data:
            author = authors.get(book_data['author'])
            category = categories.get(book_data['category'])

            if not author or not category:
                self.stdout.write(
                    self.style.WARNING(f'  ⚠ Saltando libro: {book_data["title"]} (autor o categoría no encontrados)')
                )
                continue

            slug = slugify(book_data['title'])
            book, created = Book.objects.get_or_create(
                slug=slug,
                defaults={
                    'title': book_data['title'],
                    'author': author,
                    'category': category,
                    'description': book_data['description'],
                    'is_premium': book_data['is_premium'],
                }
            )

            if created:
                created_count += 1
                premium_badge = '💎' if book.is_premium else '📖'
                self.stdout.write(f'  ✓ Libro creado: {premium_badge} {book.title}')

        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS(f'✅ Completado!'))
        self.stdout.write(f'   - Categorías: {len(categories_data)}')
        self.stdout.write(f'   - Autores: {len(authors_data)}')
        self.stdout.write(f'   - Libros creados: {created_count}')
        self.stdout.write(f'   - Total de libros: {Book.objects.count()}')
