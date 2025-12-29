
from rest_framework import generics, permissions, filters, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count, Avg
from .models import Book, Category, Author
from .serializers import BookListSerializer, BookDetailSerializer, CategorySerializer, AuthorSerializer
from .documents import BookDocument
import logging

logger = logging.getLogger(__name__)

class BookListView(generics.ListCreateAPIView):
    queryset = Book.objects.select_related('author', 'category').all()
    serializer_class = BookListSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['category__slug', 'author__id', 'is_premium']
    search_fields = ['title', 'author__name', 'description']

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return BookDetailSerializer
        return BookListSerializer

class BookDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Book.objects.select_related('author', 'category').all()
    serializer_class = BookDetailSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)
    lookup_field = 'slug'

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

class CategoryListView(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    lookup_field = 'id'

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

class AuthorListView(generics.ListCreateAPIView):
    queryset = Author.objects.all()
    serializer_class = AuthorSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

class AuthorDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Author.objects.all()
    serializer_class = AuthorSerializer
    lookup_field = 'id'

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]


@api_view(['GET'])
@permission_classes([permissions.AllowAny])  # Changed to AllowAny for dashboard accessibility
def dashboard_stats(request):
    """
    Obtener estadísticas para el dashboard
    """
    try:
        from django.contrib.auth import get_user_model
        User = get_user_model()

        # Total de libros
        total_books = Book.objects.count()

        # Total de usuarios
        total_users = User.objects.count()

        # Calificación promedio (placeholder)
        avg_rating = 4.5

        # Libros recientes (con manejo de errores)
        try:
            recent_books = Book.objects.select_related('author', 'category').order_by('-created_at')[:5]
            recent_books_data = BookListSerializer(recent_books, many=True).data
        except Exception as e:
            logger.error(f"Error fetching recent books: {str(e)}")
            recent_books_data = []

        # Estadísticas por categoría (con manejo de errores)
        try:
            books_by_category = Category.objects.annotate(
                book_count=Count('book')
            ).values('name', 'book_count').order_by('-book_count')[:5]
            top_categories = list(books_by_category)
        except Exception as e:
            logger.error(f"Error fetching categories: {str(e)}")
            top_categories = []

        return Response({
            'total_books': total_books,
            'total_users': total_users,
            'average_rating': round(avg_rating, 1),
            'books_borrowed': 0,
            'recent_books': recent_books_data,
            'top_categories': top_categories,
        })

    except Exception as e:
        logger.error(f"Error in dashboard_stats: {str(e)}", exc_info=True)
        return Response(
            {'error': {'code': 'internal_server_error', 'message': str(e), 'status_code': 500}},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def search_books(request):
    """
    Búsqueda avanzada de libros usando Elasticsearch.

    Query params:
        - q: Texto de búsqueda
        - category: ID o nombre de categoría
        - author: ID o nombre de autor
        - is_premium: true/false
        - page: Número de página (default: 1)
        - page_size: Tamaño de página (default: 12)
        - sort_by: Campo para ordenar (_score, created_at, title, publication_date)
    """
    try:
        # Parámetros de búsqueda
        query = request.GET.get('q', '')
        category = request.GET.get('category', None)
        author = request.GET.get('author', None)
        is_premium_param = request.GET.get('is_premium', None)
        page = int(request.GET.get('page', 1))
        page_size = int(request.GET.get('page_size', 12))
        sort_by = request.GET.get('sort_by', '_score')

        # Convertir is_premium a booleano si está presente
        is_premium = None
        if is_premium_param:
            is_premium = is_premium_param.lower() == 'true'

        # Convertir category y author a int si son números
        if category and category.isdigit():
            category = int(category)
        if author and author.isdigit():
            author = int(author)

        # Calcular offset para paginación
        from_ = (page - 1) * page_size

        # Ejecutar búsqueda
        search_result = BookDocument.search_books(
            query=query,
            category=category,
            author=author,
            is_premium=is_premium,
            from_=from_,
            size=page_size,
            sort_by=sort_by
        )

        # Formatear resultados
        results = []
        for hit in search_result:
            results.append({
                'id': hit.meta.id,
                'title': hit.title,
                'slug': hit.slug,
                'description': hit.description,
                'author': {
                    'id': hit.author_id,
                    'name': hit.author_name
                },
                'category': {
                    'id': hit.category_id,
                    'name': hit.category_name
                } if hit.category_id else None,
                'is_premium': hit.is_premium,
                'created_at': hit.created_at,
                'cover_image_url': hit.cover_image_url,
                'score': hit.meta.score  # Relevancia de la búsqueda
            })

        # Total de resultados
        total = search_result.hits.total.value

        return Response({
            'count': total,
            'page': page,
            'page_size': page_size,
            'total_pages': (total + page_size - 1) // page_size,
            'results': results
        })

    except Exception as e:
        logger.error(f"Error in search_books: {str(e)}")
        return Response(
            {'error': 'Error al buscar libros', 'detail': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def autocomplete_books(request):
    """
    Autocomplete para búsqueda de libros.

    Query params:
        - q: Texto para autocomplete (mínimo 2 caracteres)
        - size: Número de sugerencias (default: 5)
    """
    try:
        query = request.GET.get('q', '')
        size = int(request.GET.get('size', 5))

        if not query or len(query) < 2:
            return Response({'suggestions': []})

        # Obtener sugerencias
        suggestions = BookDocument.autocomplete(query, size=size)

        return Response({'suggestions': suggestions})

    except Exception as e:
        logger.error(f"Error in autocomplete_books: {str(e)}")
        return Response(
            {'error': 'Error al obtener sugerencias'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def search_facets(request):
    """
    Obtiene agregaciones para filtros facetados.

    Returns:
        Categorías, autores y tipos disponibles con conteo de documentos
    """
    try:
        aggregations = BookDocument.get_aggregations()
        return Response(aggregations)

    except Exception as e:
        logger.error(f"Error in search_facets: {str(e)}")
        return Response(
            {'error': 'Error al obtener facetas'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([permissions.IsAdminUser])
def rebuild_search_index(request):
    """
    Re-indexa todos los libros en Elasticsearch.
    Solo para administradores.
    """
    try:
        # Recrear índice
        BookDocument._index.delete(ignore=404)
        BookDocument.init()

        # Indexar todos los libros
        books = Book.objects.select_related('author', 'category').all()
        count = 0

        for book in books:
            doc = BookDocument.from_django_model(book)
            doc.save()
            count += 1

        logger.info(f"Re-indexed {count} books in Elasticsearch")

        return Response({
            'message': f'Successfully re-indexed {count} books',
            'count': count
        })

    except Exception as e:
        logger.error(f"Error rebuilding search index: {str(e)}")
        return Response(
            {'error': 'Error al reconstruir índice', 'detail': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
