"""
Elasticsearch documents for content app.
"""
from elasticsearch_dsl import Document, Date, Integer, Keyword, Text, Boolean
from elasticsearch_dsl import analyzer, tokenizer
from elasticsearch_dsl.connections import connections

# Configurar conexión a Elasticsearch
connections.create_connection(
    hosts=['http://elasticsearch:9200'],
    timeout=20
)

# Analizador personalizado para búsqueda en español
spanish_analyzer = analyzer(
    'spanish_analyzer',
    tokenizer='standard',
    filter=['lowercase', 'spanish_stop', 'spanish_stemmer']
)

# Analizador para autocomplete
autocomplete_analyzer = analyzer(
    'autocomplete',
    tokenizer=tokenizer('autocomplete_tokenizer', 'edge_ngram', min_gram=2, max_gram=20),
    filter=['lowercase']
)


class BookDocument(Document):
    """
    Documento de Elasticsearch para libros.
    Permite búsqueda full-text, autocomplete y filtros facetados.
    """
    # Campos de texto con búsqueda full-text
    title = Text(
        analyzer=spanish_analyzer,
        fields={
            'raw': Keyword(),  # Para ordenamiento exacto
            'autocomplete': Text(analyzer=autocomplete_analyzer)  # Para autocomplete
        }
    )

    description = Text(
        analyzer=spanish_analyzer
    )

    # Campos de autor
    author_id = Integer()
    author_name = Text(
        analyzer=spanish_analyzer,
        fields={
            'raw': Keyword()  # Para filtrado exacto
        }
    )

    # Campos de categoría
    category_id = Integer()
    category_name = Text(
        analyzer=spanish_analyzer,
        fields={
            'raw': Keyword()  # Para filtrado exacto
        }
    )

    # Metadatos
    isbn = Keyword()
    publication_date = Date()
    is_premium = Boolean()

    # Campos para ordenamiento y filtrado
    created_at = Date()
    slug = Keyword()

    # Campo para URL de cover image (opcional)
    cover_image_url = Keyword()

    class Index:
        """
        Configuración del índice de Elasticsearch
        """
        name = 'books'
        settings = {
            'number_of_shards': 1,
            'number_of_replicas': 0,
            'analysis': {
                'filter': {
                    'spanish_stop': {
                        'type': 'stop',
                        'stopwords': '_spanish_'
                    },
                    'spanish_stemmer': {
                        'type': 'stemmer',
                        'language': 'spanish'
                    }
                }
            }
        }

    def save(self, **kwargs):
        """
        Override save para auto-generar ID
        """
        return super().save(**kwargs)

    @classmethod
    def from_django_model(cls, book):
        """
        Crea un documento de Elasticsearch desde un modelo de Django Book.

        Args:
            book: Instancia del modelo Book

        Returns:
            BookDocument: Documento de Elasticsearch
        """
        doc = cls(
            meta={'id': book.id},
            title=book.title,
            description=book.description,
            author_id=book.author.id if book.author else None,
            author_name=book.author.name if book.author else '',
            category_id=book.category.id if book.category else None,
            category_name=book.category.name if book.category else '',
            isbn=book.isbn,
            publication_date=book.publication_date,
            is_premium=book.is_premium,
            created_at=book.created_at,
            slug=book.slug,
            cover_image_url=book.cover_image.url if book.cover_image else ''
        )
        return doc

    @classmethod
    def search_books(cls, query='', category=None, author=None, is_premium=None,
                     from_=0, size=12, sort_by='_score'):
        """
        Búsqueda avanzada de libros con filtros.

        Args:
            query: Texto de búsqueda
            category: ID o nombre de categoría para filtrar
            author: ID o nombre de autor para filtrar
            is_premium: Filtrar por libros premium (True/False)
            from_: Offset para paginación
            size: Número de resultados por página
            sort_by: Campo para ordenar (_score, created_at, title)

        Returns:
            SearchResult: Resultados de la búsqueda
        """
        s = cls.search()

        # Búsqueda full-text si hay query
        if query:
            s = s.query(
                'multi_match',
                query=query,
                fields=[
                    'title^3',  # Mayor peso al título
                    'title.autocomplete^2',
                    'description',
                    'author_name^2',  # Mayor peso al autor
                    'category_name'
                ],
                fuzziness='AUTO',  # Tolerancia a errores tipográficos
                operator='and'
            )
        else:
            # Sin query, devolver todos ordenados
            s = s.query('match_all')

        # Filtros
        if category:
            if isinstance(category, int):
                s = s.filter('term', category_id=category)
            else:
                s = s.filter('term', **{'category_name.raw': category})

        if author:
            if isinstance(author, int):
                s = s.filter('term', author_id=author)
            else:
                s = s.filter('term', **{'author_name.raw': author})

        if is_premium is not None:
            s = s.filter('term', is_premium=is_premium)

        # Ordenamiento
        if sort_by == 'created_at':
            s = s.sort('-created_at')
        elif sort_by == 'title':
            s = s.sort('title.raw')
        elif sort_by == 'publication_date':
            s = s.sort('-publication_date')
        # Si sort_by == '_score', se ordena por relevancia (default)

        # Paginación
        s = s[from_:from_ + size]

        return s.execute()

    @classmethod
    def autocomplete(cls, query, size=5):
        """
        Autocomplete para búsqueda de libros.

        Args:
            query: Texto para autocomplete
            size: Número de sugerencias

        Returns:
            list: Lista de sugerencias
        """
        if not query or len(query) < 2:
            return []

        s = cls.search()
        s = s.query(
            'multi_match',
            query=query,
            fields=[
                'title.autocomplete^3',
                'author_name.autocomplete^2'
            ],
            type='bool_prefix'
        )
        s = s[:size]

        results = s.execute()

        suggestions = []
        for hit in results:
            suggestions.append({
                'id': hit.meta.id,
                'title': hit.title,
                'author': hit.author_name,
                'slug': hit.slug
            })

        return suggestions

    @classmethod
    def get_aggregations(cls):
        """
        Obtiene agregaciones para filtros facetados.

        Returns:
            dict: Agregaciones de categorías y autores
        """
        s = cls.search()

        # Agregación por categorías
        s.aggs.bucket('categories', 'terms', field='category_name.raw', size=20)

        # Agregación por autores
        s.aggs.bucket('authors', 'terms', field='author_name.raw', size=20)

        # Agregación por tipo (premium/free)
        s.aggs.bucket('is_premium', 'terms', field='is_premium')

        s = s[:0]  # No necesitamos los documentos, solo agregaciones

        response = s.execute()

        return {
            'categories': [
                {'name': bucket.key, 'count': bucket.doc_count}
                for bucket in response.aggregations.categories.buckets
            ],
            'authors': [
                {'name': bucket.key, 'count': bucket.doc_count}
                for bucket in response.aggregations.authors.buckets
            ],
            'is_premium': [
                {'is_premium': bucket.key, 'count': bucket.doc_count}
                for bucket in response.aggregations.is_premium.buckets
            ]
        }
