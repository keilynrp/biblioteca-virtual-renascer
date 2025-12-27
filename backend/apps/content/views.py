
from rest_framework import generics, permissions, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count, Avg
from .models import Book, Category, Author
from .serializers import BookListSerializer, BookDetailSerializer, CategorySerializer, AuthorSerializer

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
@permission_classes([permissions.IsAuthenticated])
def dashboard_stats(request):
    """
    Obtener estadísticas para el dashboard
    """
    from django.contrib.auth import get_user_model
    User = get_user_model()

    # Total de libros
    total_books = Book.objects.count()

    # Total de usuarios (puedes filtrar por activos si tienes ese campo)
    total_users = User.objects.count()

    # Calificación promedio (si tienes reviews implementadas, si no, usar un valor por defecto)
    # avg_rating = Book.objects.aggregate(Avg('rating'))['rating__avg'] or 4.5
    avg_rating = 4.5  # Placeholder hasta implementar reviews

    # Libros recientes
    recent_books = Book.objects.select_related('author', 'category').order_by('-created_at')[:5]
    recent_books_data = BookListSerializer(recent_books, many=True).data

    # Estadísticas por categoría
    books_by_category = Category.objects.annotate(
        book_count=Count('book')
    ).values('name', 'book_count').order_by('-book_count')[:5]

    return Response({
        'total_books': total_books,
        'total_users': total_users,
        'average_rating': round(avg_rating, 1),
        'books_borrowed': 0,  # Placeholder - implementar cuando tengas sistema de préstamos
        'recent_books': recent_books_data,
        'top_categories': list(books_by_category),
    })
