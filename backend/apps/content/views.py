
# =============================================================================
# Content Views - BVS Backend
# =============================================================================
from rest_framework import generics, permissions, filters, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count, Avg
from django.shortcuts import get_object_or_404
from django.http import HttpResponse
from django.utils.decorators import method_decorator
from django.views.decorators.clickjacking import xframe_options_exempt, xframe_options_sameorigin
from django.core.cache import cache
from django.conf import settings
from .models import (
    Book, Category, Author, Review, ReviewHelpful, Favorite, ReadingHistory, Reading,
    Bookmark, Highlight, Annotation
)
from .serializers import (
    BookListSerializer, BookDetailSerializer, CategorySerializer, AuthorSerializer,
    ReviewSerializer, FavoriteSerializer, ReadingHistorySerializer, ReadingSerializer,
    ReadingProgressUpdateSerializer, BookmarkSerializer, HighlightSerializer, AnnotationSerializer
)
# Elasticsearch disabled - using Meilisearch instead
# from .documents import BookDocument
from .search_meilisearch import (
    search_books as meili_search,
    autocomplete as meili_autocomplete,
    get_facets as meili_get_facets,
    index_books_bulk,
    clear_index
)
from .permissions import IsOwnerOrReadOnly
from apps.core.decorators import (
    rate_limit_api_read,
    rate_limit_api_write,
    rate_limit_api_delete,
    rate_limit_search,
    rate_limit_upload
)
from apps.core.cache_utils import (
    make_cache_key,
    make_hash_key,
    get_or_set_cache,
)
from .recommendations import get_similar_books, get_recommended_for_user
from .utils import get_pdf_page_count
import logging

logger = logging.getLogger(__name__)


# =============================================================================
# BOOK VIEWS
# =============================================================================

@method_decorator(rate_limit_api_read, name='get')
@method_decorator(rate_limit_api_write, name='post')
class BookListView(generics.ListCreateAPIView):
    """
    List and create books.

    Rate limits:
    - GET: 100 requests/min
    - POST: 30 requests/min (upload with rate_limit_upload for file uploads)

    Optimizations:
    - Uses annotate() for average_rating, review_count, favorite_count
    - Eliminates N+1 queries from @property methods
    """
    serializer_class = BookListSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['category__slug', 'author__id', 'is_premium']
    search_fields = ['title', 'author__name', 'description']

    def get_queryset(self):
        """
        Optimized queryset with annotations to prevent N+1 queries
        """
        queryset = Book.objects.select_related('author', 'category').annotate(
            average_rating_annotated=Avg('reviews__rating'),
            review_count_annotated=Count('reviews', distinct=True),
            favorite_count_annotated=Count('favorited_by', distinct=True)
        )
        return queryset

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return BookDetailSerializer
        return BookListSerializer


@method_decorator(rate_limit_api_read, name='get')
@method_decorator(rate_limit_api_write, name='put')
@method_decorator(rate_limit_api_write, name='patch')
@method_decorator(rate_limit_api_delete, name='delete')
class BookDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update, or delete a book.

    Rate limits:
    - GET: 100 requests/min
    - PUT/PATCH: 30 requests/min
    - DELETE: 10 requests/min

    Optimizations:
    - Uses annotate() for average_rating, review_count, favorite_count
    - Uses prefetch_related() with Prefetch objects for user-specific data
    - Eliminates N+1 queries from serializer methods
    """
    serializer_class = BookDetailSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)
    lookup_field = 'slug'

    def get_queryset(self):
        """
        Optimized queryset with annotations and prefetching
        """
        from django.db.models import Prefetch

        queryset = Book.objects.select_related('author', 'category').annotate(
            average_rating_annotated=Avg('reviews__rating'),
            review_count_annotated=Count('reviews', distinct=True),
            favorite_count_annotated=Count('favorited_by', distinct=True)
        )

        # Add user-specific prefetching for authenticated users
        user = self.request.user
        if user.is_authenticated:
            queryset = queryset.prefetch_related(
                Prefetch(
                    'favorited_by',
                    queryset=Favorite.objects.filter(user=user),
                    to_attr='user_favorites_cached'
                ),
                Prefetch(
                    'reviews',
                    queryset=Review.objects.filter(user=user).select_related('user'),
                    to_attr='user_reviews_cached'
                ),
                Prefetch(
                    'readers',
                    queryset=ReadingHistory.objects.filter(user=user),
                    to_attr='user_reading_cached'
                )
            )

        return queryset

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]



@method_decorator(rate_limit_api_read, name='get')
class BookSimilarView(generics.ListAPIView):
    """
    Get books similar to a specific book.
    Strategy: Same author OR Same category.
    """
    serializer_class = BookListSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None  # We want a simple list

    def get_queryset(self):
        slug = self.kwargs.get('slug')
        book = get_object_or_404(Book, slug=slug)
        return get_similar_books(book, limit=6)

    def list(self, request, *args, **kwargs):
        # Cache for 1 hour
        slug = self.kwargs.get('slug')
        cache_key = make_cache_key('book', 'similar', slug=slug)
        
        def get_data():
            queryset = self.get_queryset()
            serializer = self.get_serializer(queryset, many=True)
            return serializer.data

        data = get_or_set_cache(
            cache_key,
            get_data,
            timeout=3600 # 1 hour
        )
        return Response(data)

@method_decorator(rate_limit_api_read, name='get')
class BookRecommendationsView(generics.ListAPIView):
    """
    Get personalized recommendations for the authenticated user.
    """
    serializer_class = BookListSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        return get_recommended_for_user(self.request.user, limit=12)

    def list(self, request, *args, **kwargs):
        # Cache for 5 minutes per user
        cache_key = make_cache_key('user', 'recommendations', user_id=request.user.id)
        
        def get_data():
            queryset = self.get_queryset()
            serializer = self.get_serializer(queryset, many=True)
            return serializer.data

        data = get_or_set_cache(
            cache_key,
            get_data,
            timeout=300 # 5 minutes
        )
        return Response(data)

# =============================================================================
# CATEGORY VIEWS
# =============================================================================

@method_decorator(rate_limit_api_read, name='get')
@method_decorator(rate_limit_api_write, name='post')
class CategoryListView(generics.ListCreateAPIView):
    """
    List and create categories.

    Rate limits:
    - GET: 100 requests/min
    - POST: 30 requests/min

    Caching:
    - GET: Cached for 1 hour (rarely changes)
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def list(self, request, *args, **kwargs):
        """Override list to add caching"""
        if request.method == 'GET':
            cache_key = make_cache_key('categories', 'list')

            def get_categories():
                queryset = self.filter_queryset(self.get_queryset())
                serializer = self.get_serializer(queryset, many=True)
                return serializer.data

            data = get_or_set_cache(
                cache_key,
                get_categories,
                timeout=settings.CACHE_TTL['categories']
            )

            return Response(data)

        return super().list(request, *args, **kwargs)


@method_decorator(rate_limit_api_read, name='get')
@method_decorator(rate_limit_api_write, name='put')
@method_decorator(rate_limit_api_write, name='patch')
@method_decorator(rate_limit_api_delete, name='delete')
class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update, or delete a category.

    Rate limits:
    - GET: 100 requests/min
    - PUT/PATCH: 30 requests/min
    - DELETE: 10 requests/min
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    lookup_field = 'id'

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]


# =============================================================================
# AUTHOR VIEWS
# =============================================================================

@method_decorator(rate_limit_api_read, name='get')
@method_decorator(rate_limit_api_write, name='post')
class AuthorListView(generics.ListCreateAPIView):
    """
    List and create authors.

    Rate limits:
    - GET: 100 requests/min
    - POST: 30 requests/min

    Caching:
    - GET: Cached for 1 hour (rarely changes)
    """
    queryset = Author.objects.all()
    serializer_class = AuthorSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def list(self, request, *args, **kwargs):
        """Override list to add caching"""
        if request.method == 'GET':
            cache_key = make_cache_key('authors', 'list')

            def get_authors():
                queryset = self.filter_queryset(self.get_queryset())
                serializer = self.get_serializer(queryset, many=True)
                return serializer.data

            data = get_or_set_cache(
                cache_key,
                get_authors,
                timeout=settings.CACHE_TTL['authors']
            )

            return Response(data)

        return super().list(request, *args, **kwargs)


@method_decorator(rate_limit_api_read, name='get')
@method_decorator(rate_limit_api_write, name='put')
@method_decorator(rate_limit_api_write, name='patch')
@method_decorator(rate_limit_api_delete, name='delete')
class AuthorDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update, or delete an author.

    Rate limits:
    - GET: 100 requests/min
    - PUT/PATCH: 30 requests/min
    - DELETE: 10 requests/min
    """
    queryset = Author.objects.all()
    serializer_class = AuthorSerializer
    lookup_field = 'id'

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]


# =============================================================================
# DASHBOARD & STATS VIEWS
# =============================================================================


@api_view(['GET'])
@permission_classes([permissions.AllowAny])  # Changed to AllowAny for dashboard accessibility
@rate_limit_api_read
def dashboard_stats(request):
    """
    Obtener estadísticas para el dashboard

    Caching:
    - Cached for 15 minutes (aggregated data)
    """
    cache_key = make_cache_key('dashboard', 'stats')

    def compute_dashboard_stats():
        """Compute dashboard statistics (heavy operation)"""
        try:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            from django.db.models import Avg, Sum, Count

            # Total de libros
            total_books = Book.objects.count()

            # Total de usuarios
            total_users = User.objects.count()
            avg_rating = Review.objects.aggregate(Avg('rating'))['rating__avg'] or 0.0

            # Total de libros leídos (sesiones únicas)
            books_borrowed = Reading.objects.count()

            # Tiempo total de lectura (segundos a horas)
            total_time_seconds = Reading.objects.aggregate(Sum('total_reading_time'))['total_reading_time__sum'] or 0
            total_reading_hours = round(total_time_seconds / 3600, 1)

            # Libros recientes (con manejo de errores)
            try:
                recent_books = Book.objects.select_related('author', 'category').order_by('-created_at')[:5]
                recent_books_data = BookListSerializer(recent_books, many=True, context={'request': request}).data
            except Exception as e:
                logger.error(f"Error fetching recent books: {str(e)}", exc_info=True)
                recent_books_data = []

            # Estadísticas por categoría (con manejo de errores)
            try:
                books_by_category = Category.objects.annotate(
                    book_count=Count('books')
                ).values('name', 'book_count').order_by('-book_count')[:5]
                top_categories = list(books_by_category)
            except Exception as e:
                logger.error(f"Error fetching categories: {str(e)}")
                top_categories = []

            return {
                'total_books': total_books,
                'total_users': total_users,
                'average_rating': round(avg_rating, 1),
                'books_borrowed': books_borrowed,
                'total_reading_hours': total_reading_hours,
                'recent_books': recent_books_data,
                'top_categories': top_categories,
            }

        except Exception as e:
            logger.error(f"Error in dashboard_stats computation: {str(e)}", exc_info=True)
            raise

    try:
        data = get_or_set_cache(
            cache_key,
            compute_dashboard_stats,
            timeout=settings.CACHE_TTL['dashboard_stats']
        )
        return Response(data)

    except Exception as e:
        logger.error(f"Error in dashboard_stats: {str(e)}", exc_info=True)
        return Response(
            {'error': {'code': 'internal_server_error', 'message': str(e), 'status_code': 500}},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
@rate_limit_search
def search_books(request):
    """
    Búsqueda avanzada de libros usando Meilisearch.

    Rate limit: 60 requests/min

    Query params:
        - q: Texto de búsqueda
        - category: ID o nombre de categoría
        - author: ID o nombre de autor
        - is_premium: true/false
        - page: Número de página (default: 1)
        - page_size: Tamaño de página (default: 12)
        - sort_by: Campo para ordenar (created_at, title, publication_date)
    """
    try:
        # Parámetros de búsqueda
        query = request.GET.get('q', '')
        category = request.GET.get('category', None)
        author = request.GET.get('author', None)
        is_premium_param = request.GET.get('is_premium', None)
        page = int(request.GET.get('page', 1))
        page_size = int(request.GET.get('page_size', 12))
        sort_by = request.GET.get('sort_by', None)

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
        offset = (page - 1) * page_size

        # Ejecutar búsqueda en Meilisearch
        search_result = meili_search(
            query=query,
            category=category,
            author=author,
            is_premium=is_premium,
            offset=offset,
            limit=page_size,
            sort_by=sort_by
        )

        if 'error' in search_result:
            return Response(
                {'error': 'Error en el servicio de búsqueda', 'detail': search_result['error']},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        total = search_result['total']

        return Response({
            'count': total,
            'page': page,
            'page_size': page_size,
            'total_pages': (total + page_size - 1) // page_size if page_size > 0 else 1,
            'processing_time_ms': search_result['processing_time_ms'],
            'results': search_result['hits']
        })

    except Exception as e:
        logger.error(f"Error in search_books: {str(e)}")
        return Response(
            {'error': 'Error al buscar libros', 'detail': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
@rate_limit_search
def autocomplete_books(request):
    """
    Autocomplete para búsqueda de libros usando Meilisearch.

    Rate limit: 60 requests/min

    Query params:
        - q: Texto para autocomplete (mínimo 2 caracteres)
        - size: Número de sugerencias (default: 5)
    """
    try:
        query = request.GET.get('q', '')
        size = int(request.GET.get('size', 5))

        if not query or len(query) < 2:
            return Response({'suggestions': []})

        suggestions = meili_autocomplete(query, limit=size)
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
    Obtiene agregaciones para filtros facetados usando Meilisearch.

    Returns:
        Categorías, autores y tipos disponibles con conteo de documentos
    """
    try:
        facets = meili_get_facets()
        return Response(facets)

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
    Re-indexa todos los libros en Meilisearch.
    Solo para administradores.
    """
    try:
        # Limpiar índice
        clear_index()
        
        # Obtener todos los libros con relaciones optimizadas
        books = Book.objects.select_related('author', 'category').all()
        
        # Indexar en bloques
        count = books.count()
        if count > 0:
            index_books_bulk(books)
            logger.info(f"Manual index rebuild completed for {count} books")
            
        return Response({
            'message': f'Re-indexación completada para {count} libros',
            'count': count,
            'status': 'success'
        })

    except Exception as e:
        logger.error(f"Error rebuilding search index: {str(e)}")
        return Response(
            {'error': f'Error al reconstruir el índice: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([permissions.IsAdminUser])
def import_books_from_openlibrary(request):
    """
    Importa libros desde OpenLibrary API.
    Solo para administradores.

    Body params:
        - subjects: Lista de temas (opcional)
        - query: Búsqueda por query (opcional)
        - limit: Número máximo de libros (default: 30, max: 500)
        - auto_index: Auto-indexar en Meilisearch (default: true, siempre activo)

    Note: Los libros se indexan automáticamente en Meilisearch via signals,
    independientemente del valor de auto_index.
    """
    try:
        import requests
        import time
        from datetime import datetime
        from django.utils.text import slugify
        from django.core.files.base import ContentFile

        # Obtener parámetros
        subjects = request.data.get('subjects', [])
        query = request.data.get('query', None)
        limit = min(int(request.data.get('limit', 30)), 500)  # Max 500 para evitar sobrecarga
        auto_index = request.data.get('auto_index', True)

        if not subjects and not query:
            return Response(
                {'error': 'Debes proporcionar subjects o query'},
                status=status.HTTP_400_BAD_REQUEST
            )

        imported_books = []
        skipped_books = []
        errors = []

        # Función auxiliar para importar un libro
        def import_book(work_data, category):
            title = work_data.get('title', '').strip()
            if not title:
                return {'status': 'error', 'reason': 'No title'}

            slug = slugify(title)
            if Book.objects.filter(slug=slug).exists():
                return {'status': 'skipped', 'reason': 'Already exists', 'title': title}

            # Obtener autor
            authors_data = work_data.get('authors', [])
            author_name = authors_data[0].get('name', 'Autor Desconocido') if authors_data else 'Autor Desconocido'
            author, _ = Author.objects.get_or_create(
                name=author_name,
                defaults={'bio': f'Información sobre {author_name}'}
            )

            # Descripción
            description = 'Sin descripción disponible.'
            if 'description' in work_data:
                desc = work_data['description']
                description = desc.get('value', desc) if isinstance(desc, dict) else str(desc)
            elif 'subject' in work_data:
                subjects_str = ', '.join(work_data['subject'][:5])
                description = f'Libro sobre: {subjects_str}'

            # Fecha de publicación
            publication_date = None
            first_publish_year = work_data.get('first_publish_year')
            if first_publish_year:
                try:
                    publication_date = datetime(year=int(first_publish_year), month=1, day=1).date()
                except (ValueError, TypeError):
                    pass

            # ISBN
            isbn = ''
            if 'isbn' in work_data and work_data['isbn']:
                isbn = work_data['isbn'][0] if isinstance(work_data['isbn'], list) else str(work_data['isbn'])

            # Crear libro
            book = Book.objects.create(
                title=title,
                slug=slug,
                author=author,
                category=category,
                description=description,
                publication_date=publication_date,
                isbn=isbn[:13],
                is_premium=False
            )

            # Descargar portada
            cover_id = work_data.get('cover_id')
            if cover_id:
                try:
                    cover_url = f'https://covers.openlibrary.org/b/id/{cover_id}-M.jpg'
                    response = requests.get(cover_url, timeout=5)
                    if response.status_code == 200:
                        filename = f'{book.slug}.jpg'
                        book.cover_image.save(filename, ContentFile(response.content), save=True)
                except Exception:
                    pass

            return {'status': 'imported', 'book': book, 'title': title}

        # Importar por query
        if query:
            url = 'https://openlibrary.org/search.json'
            params = {
                'q': query,
                'limit': limit * 2,
                'fields': 'key,title,author_name,first_publish_year,isbn,subject,cover_i'
            }

            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()

            category, _ = Category.objects.get_or_create(
                name=query.title(),
                defaults={'description': f'Libros sobre {query}'}
            )

            for doc in data.get('docs', [])[:limit]:
                work = {
                    'title': doc.get('title', ''),
                    'authors': [{'name': name} for name in doc.get('author_name', [])[:1]],
                    'first_publish_year': doc.get('first_publish_year'),
                    'cover_id': doc.get('cover_i'),
                    'subject': doc.get('subject', [])[:3]
                }

                result = import_book(work, category)
                if result['status'] == 'imported':
                    imported_books.append(result)
                elif result['status'] == 'skipped':
                    skipped_books.append(result)
                else:
                    errors.append(result)

                time.sleep(0.2)  # Rate limiting

        # Importar por subjects
        else:
            books_per_subject = limit // len(subjects)

            for subject in subjects:
                subject = subject.strip()
                url = f'https://openlibrary.org/subjects/{subject}.json'
                params = {'limit': books_per_subject * 2}

                try:
                    response = requests.get(url, params=params, timeout=10)
                    response.raise_for_status()
                    data = response.json()

                    category, _ = Category.objects.get_or_create(
                        name=subject.title(),
                        defaults={'description': f'Libros sobre {subject}'}
                    )

                    for work in data.get('works', [])[:books_per_subject]:
                        result = import_book(work, category)
                        if result['status'] == 'imported':
                            imported_books.append(result)
                        elif result['status'] == 'skipped':
                            skipped_books.append(result)
                        else:
                            errors.append(result)

                        time.sleep(0.2)  # Rate limiting

                except Exception as e:
                    logger.error(f"Error importing subject {subject}: {str(e)}")
                    errors.append({'status': 'error', 'reason': str(e), 'subject': subject})

        # Auto-indexar si está habilitado
        indexed_count = 0
        # TODO: Migrate to Meilisearch
        # if auto_index and imported_books:
        #     try:
        #         for book_data in imported_books:
        #             book = book_data['book']
        #             doc = BookDocument.from_django_model(book)
        #             doc.save()
        #             indexed_count += 1
        #     except Exception as e:
        #         logger.error(f"Error indexing books: {str(e)}")

        return Response({
            'success': True,
            'imported': len(imported_books),
            'skipped': len(skipped_books),
            'errors': len(errors),
            'indexed': indexed_count,
            'total_books_in_db': Book.objects.count(),
            'imported_titles': [b['title'] for b in imported_books[:10]],  # Primeros 10
            'error_details': errors[:5] if errors else []  # Primeros 5 errores
        })

    except Exception as e:
        logger.error(f"Error in import_books_from_openlibrary: {str(e)}", exc_info=True)
        return Response(
            {'error': 'Error al importar libros', 'detail': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([permissions.IsAdminUser])
def get_import_stats(request):
    """
    Obtiene estadísticas para la interfaz de importación.
    Solo para administradores.
    """
    try:
        from django.db.models import Count
        from django.contrib.auth import get_user_model

        User = get_user_model()

        # Estadísticas generales
        total_books = Book.objects.count()
        total_authors = Author.objects.count()
        total_categories = Category.objects.count()

        # Libros por categoría
        categories_stats = Category.objects.annotate(
            book_count=Count('books')
        ).values('id', 'name', 'book_count').order_by('-book_count')[:10]

        # Libros con/sin portada
        books_with_cover = Book.objects.exclude(cover_image='').count()
        books_without_cover = Book.objects.filter(cover_image='').count()

        # Libros premium vs gratuitos
        premium_books = Book.objects.filter(is_premium=True).count()
        free_books = Book.objects.filter(is_premium=False).count()

        # Últimos libros importados
        recent_books = Book.objects.select_related('author', 'category').order_by('-created_at')[:5]
        recent_books_data = BookListSerializer(recent_books, many=True, context={'request': request}).data

        return Response({
            'total_books': total_books,
            'total_authors': total_authors,
            'total_categories': total_categories,
            'categories_stats': list(categories_stats),
            'books_with_cover': books_with_cover,
            'books_without_cover': books_without_cover,
            'premium_books': premium_books,
            'free_books': free_books,
            'recent_books': recent_books_data
        })

    except Exception as e:
        logger.error(f"Error in get_import_stats: {str(e)}", exc_info=True)
        return Response(
            {'error': 'Error al obtener estadísticas', 'detail': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# ============================================================================
# REVIEW VIEWS
# ============================================================================

class ReviewListCreateView(generics.ListCreateAPIView):
    """List and create reviews for a specific book"""
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        slug = self.kwargs.get('slug')
        book = get_object_or_404(Book, slug=slug)
        return Review.objects.filter(book=book).select_related('user')

    def perform_create(self, serializer):
        slug = self.kwargs.get('slug')
        book = get_object_or_404(Book, slug=slug)

        # Check if user already reviewed this book
        if Review.objects.filter(user=self.request.user, book=book).exists():
            from rest_framework.exceptions import ValidationError
            raise ValidationError({"detail": "Ya has dejado una reseña para este libro."})

        serializer.save(user=self.request.user, book=book)


class ReviewDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Get, update or delete a specific review"""
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [permissions.IsAuthenticated(), IsOwnerOrReadOnly()]
        return [permissions.AllowAny()]


class UserReviewListView(generics.ListAPIView):
    """List all reviews by the authenticated user"""
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Review.objects.filter(user=self.request.user).select_related('book', 'user')


class MarkReviewHelpfulView(APIView):
    """Mark/unmark a review as helpful (toggle)"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        review = get_object_or_404(Review, pk=pk)

        # Toggle helpful vote
        vote, created = ReviewHelpful.objects.get_or_create(
            review=review,
            user=request.user
        )

        if not created:
            # Already voted, remove vote
            vote.delete()
            review.helpful_count = max(0, review.helpful_count - 1)
            review.save()
            return Response({
                'status': 'removed',
                'helpful_count': review.helpful_count
            })
        else:
            # New vote
            review.helpful_count += 1
            review.save()
            return Response({
                'status': 'added',
                'helpful_count': review.helpful_count
            })


# ============================================================================
# FAVORITE VIEWS
# ============================================================================

class FavoriteListView(generics.ListAPIView):
    """List all favorites for the authenticated user"""
    serializer_class = FavoriteSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None  # Disable pagination for favorites

    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user).select_related(
            'book', 'book__author', 'book__category'
        )


class ToggleFavoriteView(APIView):
    """Add or remove a book from favorites (toggle)"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, book_id):
        book = get_object_or_404(Book, id=book_id)
        favorite, created = Favorite.objects.get_or_create(
            user=request.user,
            book=book
        )

        if not created:
            # Already favorited, remove it
            favorite.delete()
            return Response({
                'status': 'removed',
                'is_favorited': False
            })
        else:
            # New favorite
            return Response({
                'status': 'added',
                'is_favorited': True,
                'favorite': FavoriteSerializer(favorite).data
            }, status=status.HTTP_201_CREATED)


# ============================================================================
# READING HISTORY VIEWS
# ============================================================================

class ReadingHistoryListView(generics.ListAPIView):
    """List reading history for the authenticated user"""
    serializer_class = ReadingHistorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        status_filter = self.request.query_params.get('status', None)
        queryset = ReadingHistory.objects.filter(user=self.request.user).select_related(
            'book', 'book__author', 'book__category'
        )
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        return queryset


class UpdateReadingHistoryView(APIView):
    """Update reading status for a book"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, book_id):
        book = get_object_or_404(Book, id=book_id)
        serializer = ReadingHistorySerializer(data=request.data, context={'request': request})

        if serializer.is_valid():
            history, created = ReadingHistory.objects.update_or_create(
                user=request.user,
                book=book,
                defaults=serializer.validated_data
            )

            return Response(
                ReadingHistorySerializer(history, context={'request': request}).data,
                status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ============================================================================
# READING (PDF VIEWER) VIEWS
# ============================================================================

class ReadingListView(generics.ListAPIView):
    """List all reading sessions for the authenticated user (Continue Reading)"""
    serializer_class = ReadingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Return readings ordered by most recent
        return Reading.objects.filter(user=self.request.user).select_related(
            'book', 'book__author', 'book__category'
        ).order_by('-last_read_at')[:10]  # Last 10 books read


class StartReadingView(APIView):
    """Start or resume reading a book"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, book_id):
        book = get_object_or_404(Book, id=book_id)

        # Check if user has access (premium books require subscription)
        if book.is_premium:
            from apps.subscriptions.models import UserSubscription
            from django.utils import timezone
            has_active_subscription = UserSubscription.objects.filter(
                user=request.user,
                is_active=True,
                end_date__gte=timezone.now()
            ).exists()
            if not has_active_subscription and not request.user.is_staff:
                return Response({
                    'error_code': 'SUBSCRIPTION_REQUIRED',
                    'error': 'Este contenido es exclusivo para suscriptores.',
                }, status=403)

        # Get or create reading session
        reading, created = Reading.objects.get_or_create(
            user=request.user,
            book=book,
            defaults={
                'current_page': 1,
                'zoom_level': 1.0,
            }
        )

        # Extract total_pages from PDF if not already set
        if not reading.total_pages and book.file:
            try:
                total_pages = get_pdf_page_count(book.file.path)
                if total_pages:
                    reading.total_pages = total_pages
                    reading.save(update_fields=['total_pages'])
                    logger.info(f"Set total_pages={total_pages} for reading session {reading.id}")
            except Exception as e:
                logger.error(f"Failed to extract page count for book {book_id}: {str(e)}")

        serializer = ReadingSerializer(reading, context={'request': request})

        return Response({
            'status': 'started' if created else 'resumed',
            'reading': serializer.data
        }, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


class ReadingDetailView(generics.RetrieveAPIView):
    """Get reading progress for a specific book"""
    serializer_class = ReadingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        book_id = self.kwargs.get('book_id')
        return get_object_or_404(
            Reading,
            user=self.request.user,
            book_id=book_id
        )


class UpdateReadingProgressView(APIView):
    """Update reading progress (for auto-save)"""
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, book_id):
        reading = get_object_or_404(
            Reading,
            user=request.user,
            book_id=book_id
        )

        serializer = ReadingProgressUpdateSerializer(
            reading,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():
            serializer.save()

            # Return full reading data
            full_serializer = ReadingSerializer(reading, context={'request': request})
            return Response(full_serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@method_decorator(xframe_options_exempt, name='dispatch')
class ServeBookFileView(APIView):
    """Serve book PDF file with authentication and permission check"""
    permission_classes = [permissions.AllowAny]  # We'll handle auth manually

    def get(self, request, book_id):
        from django.http import FileResponse, Http404
        from rest_framework_simplejwt.tokens import AccessToken
        from rest_framework.exceptions import AuthenticationFailed
        import os

        # Try to get token from query params (for iframe/object embedding)
        token = request.GET.get('token')

        if not token:
            # Try to get from Authorization header as fallback
            auth_header = request.META.get('HTTP_AUTHORIZATION', '')
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]

        if not token:
            from django.http import JsonResponse
            return JsonResponse({'error': 'Authentication required'}, status=401)

        # Validate token and get user
        try:
            access_token = AccessToken(token)
            user_id = access_token['user_id']
            from django.contrib.auth import get_user_model
            User = get_user_model()
            user = User.objects.get(id=user_id)
        except Exception as e:
            logger.error(f"Authentication error: {str(e)}")
            from django.http import JsonResponse
            return JsonResponse({'error': 'Invalid or expired token'}, status=401)

        book = get_object_or_404(Book, id=book_id)

        # Check if user has access
        if book.is_premium:
            # Verify user has active subscription
            from apps.subscriptions.models import UserSubscription
            from django.utils import timezone

            has_active_subscription = UserSubscription.objects.filter(
                user=user,
                is_active=True,
                end_date__gte=timezone.now()
            ).exists()

            if not has_active_subscription and not user.is_staff:
                from django.http import JsonResponse
                return JsonResponse({
                    'error_code': 'SUBSCRIPTION_REQUIRED',
                    'error': 'Este contenido es exclusivo para suscriptores.',
                }, status=403)

        # Check if file exists
        if not book.file:
            raise Http404("Book file not found")

        # Get file path
        file_path = book.file.path

        if not os.path.exists(file_path):
            raise Http404("Book file not found on server")

        # Log the access
        logger.info(f"User {user.username} accessed book {book.title}")

        # Check for concurrent reading sessions (limit: 3 devices)
        from django.utils import timezone
        from datetime import timedelta

        recent_threshold = timezone.now() - timedelta(minutes=5)
        active_sessions = Reading.objects.filter(
            user=user,
            last_read_at__gte=recent_threshold
        ).exclude(book=book).count()

        MAX_CONCURRENT_SESSIONS = 3
        if active_sessions >= MAX_CONCURRENT_SESSIONS:
            from django.http import JsonResponse
            return JsonResponse({
                'error': f'Has alcanzado el límite de {MAX_CONCURRENT_SESSIONS} sesiones de lectura simultáneas'
            }, status=429)

        # Update or create reading session
        reading, created = Reading.objects.get_or_create(
            user=user,
            book=book,
            defaults={'current_page': 1}
        )

        # Update last_read_at to track active session
        reading.last_read_at = timezone.now()
        reading.save(update_fields=['last_read_at'])

        # Serve the file with range support for streaming
        import mimetypes
        from django.http import StreamingHttpResponse

        file_size = os.path.getsize(file_path)
        content_type = mimetypes.guess_type(file_path)[0] or 'application/pdf'

        # Check for range request
        range_header = request.META.get('HTTP_RANGE', '').strip()
        range_match = None

        if range_header:
            import re
            range_match = re.search(r'bytes=(\d+)-(\d*)', range_header)

        if range_match:
            # Handle range request for streaming
            start = int(range_match.group(1))
            end = int(range_match.group(2)) if range_match.group(2) else file_size - 1
            length = end - start + 1

            with open(file_path, 'rb') as f:
                f.seek(start)
                data = f.read(length)

            response = HttpResponse(
                data,
                status=206,  # Partial Content
                content_type=content_type
            )
            response['Content-Range'] = f'bytes {start}-{end}/{file_size}'
            response['Content-Length'] = str(length)
        else:
            # Serve full file with streaming support
            response = FileResponse(
                open(file_path, 'rb'),
                content_type=content_type
            )
            response['Content-Length'] = str(file_size)

        # Set headers for PDF viewing in browser
        response['Content-Disposition'] = f'inline; filename="{book.title}.pdf"'
        response['X-Content-Type-Options'] = 'nosniff'
        response['Accept-Ranges'] = 'bytes'  # Enable range requests
        response['Cache-Control'] = 'no-store'  # Prevent browser from caching PDF to disk
        response['X-Download-Options'] = 'noopen'  # Prevent IE/Edge from offering local open

        return response


# =============================================================================
# Annotation Views - Sprint 10
# =============================================================================

@method_decorator(rate_limit_api_read, name='get')
@method_decorator(rate_limit_api_write, name='post')
class BookmarkListCreateView(generics.ListCreateAPIView):
    """List and create bookmarks for the authenticated user"""
    serializer_class = BookmarkSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['book', 'page_number']
    ordering_fields = ['page_number', 'created_at']
    ordering = ['page_number']

    def get_queryset(self):
        """Return only bookmarks for the current user"""
        return Bookmark.objects.filter(user=self.request.user).select_related('book')


@method_decorator(rate_limit_api_read, name='get')
@method_decorator(rate_limit_api_write, name='put')
@method_decorator(rate_limit_api_write, name='patch')
@method_decorator(rate_limit_api_delete, name='delete')
class BookmarkDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a bookmark"""
    serializer_class = BookmarkSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Return only bookmarks for the current user"""
        return Bookmark.objects.filter(user=self.request.user).select_related('book')


@method_decorator(rate_limit_api_read, name='get')
@method_decorator(rate_limit_api_write, name='post')
class HighlightListCreateView(generics.ListCreateAPIView):
    """List and create highlights for the authenticated user"""
    serializer_class = HighlightSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['book', 'page_number', 'color']
    ordering_fields = ['page_number', 'created_at']
    ordering = ['page_number', 'created_at']

    def get_queryset(self):
        """Return only highlights for the current user"""
        return Highlight.objects.filter(user=self.request.user).select_related('book')


@method_decorator(rate_limit_api_read, name='get')
@method_decorator(rate_limit_api_write, name='put')
@method_decorator(rate_limit_api_write, name='patch')
@method_decorator(rate_limit_api_delete, name='delete')
class HighlightDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a highlight"""
    serializer_class = HighlightSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Return only highlights for the current user"""
        return Highlight.objects.filter(user=self.request.user).select_related('book')


@method_decorator(rate_limit_api_read, name='get')
@method_decorator(rate_limit_api_write, name='post')
class AnnotationListCreateView(generics.ListCreateAPIView):
    """List and create annotations for the authenticated user"""
    serializer_class = AnnotationSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['book', 'page_number', 'is_private']
    ordering_fields = ['page_number', 'created_at']
    ordering = ['page_number', 'created_at']

    def get_queryset(self):
        """Return only annotations for the current user"""
        return Annotation.objects.filter(user=self.request.user).select_related('book', 'highlight')


@method_decorator(rate_limit_api_read, name='get')
@method_decorator(rate_limit_api_write, name='put')
@method_decorator(rate_limit_api_write, name='patch')
@method_decorator(rate_limit_api_delete, name='delete')
class AnnotationDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete an annotation"""
    serializer_class = AnnotationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Return only annotations for the current user"""
        return Annotation.objects.filter(user=self.request.user).select_related('book', 'highlight')


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def export_book_notes(request, book_id):
    """
    Export all user notes (bookmarks, highlights, annotations) for a book as TXT.

    GET /api/content/books/{book_id}/export-notes/

    Returns a downloadable text file with all notes ordered by page number.
    """
    from django.http import HttpResponse
    from datetime import datetime

    book = get_object_or_404(Book, id=book_id)
    user = request.user

    # Fetch all user data for this book
    bookmarks = Bookmark.objects.filter(user=user, book=book).order_by('page_number')
    highlights = Highlight.objects.filter(user=user, book=book).order_by('page_number')
    annotations = Annotation.objects.filter(user=user, book=book).order_by('page_number')

    # Build the text content
    lines = []
    lines.append("=" * 60)
    lines.append(f"NOTAS DE LECTURA: {book.title}")
    lines.append(f"Autor: {book.author.name if book.author else 'Desconocido'}")
    lines.append(f"Exportado: {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    lines.append(f"Usuario: {user.username}")
    lines.append("=" * 60)
    lines.append("")

    # Group all items by page
    all_items = []

    for bookmark in bookmarks:
        all_items.append({
            'page': bookmark.page_number,
            'type': 'bookmark',
            'title': bookmark.title,
            'notes': bookmark.notes,
            'created_at': bookmark.created_at,
        })

    for highlight in highlights:
        all_items.append({
            'page': highlight.page_number,
            'type': 'highlight',
            'text': highlight.selected_text,
            'color': highlight.get_color_display(),
            'created_at': highlight.created_at,
        })

    for annotation in annotations:
        all_items.append({
            'page': annotation.page_number,
            'type': 'annotation',
            'content': annotation.content,
            'is_private': annotation.is_private,
            'created_at': annotation.created_at,
        })

    # Sort by page, then by created_at
    all_items.sort(key=lambda x: (x['page'], x['created_at']))

    if not all_items:
        lines.append("No hay notas guardadas para este libro.")
    else:
        current_page = None

        for item in all_items:
            # Add page header if new page
            if item['page'] != current_page:
                current_page = item['page']
                lines.append("")
                lines.append("-" * 40)
                lines.append(f"PAGINA {current_page}")
                lines.append("-" * 40)

            lines.append("")

            if item['type'] == 'bookmark':
                lines.append("[MARCADOR]")
                if item['title']:
                    lines.append(f"  Titulo: {item['title']}")
                if item['notes']:
                    lines.append(f"  Notas: {item['notes']}")

            elif item['type'] == 'highlight':
                lines.append(f"[RESALTADO - {item['color']}]")
                lines.append(f"  \"{item['text']}\"")

            elif item['type'] == 'annotation':
                privacy = "Privada" if item['is_private'] else "Publica"
                lines.append(f"[NOTA - {privacy}]")
                lines.append(f"  {item['content']}")

    lines.append("")
    lines.append("=" * 60)
    lines.append("Fin del documento")
    lines.append("=" * 60)

    # Create response
    content = "\n".join(lines)
    filename = f"notas_{book.slug}_{datetime.now().strftime('%Y%m%d')}.txt"

    response = HttpResponse(content, content_type='text/plain; charset=utf-8')
    response['Content-Disposition'] = f'attachment; filename="{filename}"'

    return response


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def institutional_analytics(request):
    """
    Obtener estadísticas detalladas para una institución.
    Solo accesible para administradores de la institución o staff.
    """
    user = request.user
    institution = user.institution

    if not institution and not user.is_staff:
        return Response(
            {'error': 'No perteneces a ninguna institución.'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Si es staff pero no tiene institución, requerir institution_id en query params
    if user.is_staff and not institution:
        institution_id = request.GET.get('institution_id')
        if not institution_id:
            return Response({'error': 'institution_id es requerido para staff.'}, status=400)
        from apps.institutions.models import Institution
        institution = get_object_or_404(Institution, id=institution_id)

    # Métricas de la institución
    from django.contrib.auth import get_user_model
    from django.db.models import Sum, Count
    User = get_user_model()
    
    users_in_inst = User.objects.filter(institution=institution)
    total_students = users_in_inst.count()
    
    # Lecturas de usuarios de esta institución
    inst_readings = Reading.objects.filter(user__in=users_in_inst)
    total_reading_time = inst_readings.aggregate(Sum('total_reading_time'))['total_reading_time__sum'] or 0
    pages_read = inst_readings.aggregate(Sum('current_page'))['current_page__sum'] or 0
    
    # Top 5 libros en la institución
    top_books = Book.objects.filter(
        reading_sessions__user__in=users_in_inst
    ).annotate(
        read_count=Count('reading_sessions')
    ).order_by('-read_count')[:5]
    
    top_books_data = BookListSerializer(top_books, many=True, context={'request': request}).data

    return Response({
        'institution_name': institution.name,
        'total_students': total_students,
        'total_reading_hours': round(total_reading_time / 3600, 1),
        'total_pages_read': pages_read,
        'top_books': top_books_data
    })
