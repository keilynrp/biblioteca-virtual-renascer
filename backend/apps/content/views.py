
from rest_framework import generics, permissions, filters, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count, Avg
from django.shortcuts import get_object_or_404
from .models import Book, Category, Author, Review, ReviewHelpful, Favorite, ReadingHistory, Reading
from .serializers import (
    BookListSerializer, BookDetailSerializer, CategorySerializer, AuthorSerializer,
    ReviewSerializer, FavoriteSerializer, ReadingHistorySerializer, ReadingSerializer,
    ReadingProgressUpdateSerializer
)
from .documents import BookDocument
from .permissions import IsOwnerOrReadOnly
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
            recent_books_data = BookListSerializer(recent_books, many=True, context={'request': request}).data
        except Exception as e:
            logger.error(f"Error fetching recent books: {str(e)}", exc_info=True)
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
        - auto_index: Auto-indexar en Elasticsearch (default: true)
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
        if auto_index and imported_books:
            try:
                for book_data in imported_books:
                    book = book_data['book']
                    doc = BookDocument.from_django_model(book)
                    doc.save()
                    indexed_count += 1
            except Exception as e:
                logger.error(f"Error indexing books: {str(e)}")

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
            # TODO: Check if user has active subscription
            # For now, we'll allow it
            pass

        # Get or create reading session
        reading, created = Reading.objects.get_or_create(
            user=request.user,
            book=book,
            defaults={
                'current_page': 1,
                'zoom_level': 1.0,
            }
        )

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


class ServeBookFileView(APIView):
    """Serve book PDF file with authentication and permission check"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, book_id):
        from django.http import FileResponse, Http404
        import os

        book = get_object_or_404(Book, id=book_id)

        # Check if user has access
        if book.is_premium:
            # TODO: Verify user has active subscription
            pass

        # Check if file exists
        if not book.file:
            raise Http404("Book file not found")

        # Get file path
        file_path = book.file.path

        if not os.path.exists(file_path):
            raise Http404("Book file not found on server")

        # Log the access
        logger.info(f"User {request.user.username} accessed book {book.title}")

        # Update or create reading session
        Reading.objects.get_or_create(
            user=request.user,
            book=book,
            defaults={'current_page': 1}
        )

        # Serve the file
        response = FileResponse(
            open(file_path, 'rb'),
            content_type='application/pdf'
        )

        # Set headers for PDF viewing in browser
        response['Content-Disposition'] = f'inline; filename="{book.title}.pdf"'
        response['X-Content-Type-Options'] = 'nosniff'

        return response
