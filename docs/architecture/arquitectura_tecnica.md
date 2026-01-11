# ARQUITECTURA TÉCNICA - BIBLIOTECA VIRTUAL RENASCER DO SABER

## VISIÓN GENERAL DE LA ARQUITECTURA

```
┌─────────────────────────────────────────────────────────────────┐
│                         USUARIOS FINALES                         │
│  (Estudiantes, Profesores, Instituciones, Administradores)      │
└─────────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                           CLOUDFLARE CDN                         │
│                     (Cache, DDoS Protection, SSL)                │
└─────────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      LOAD BALANCER / NGINX                       │
└─────────────────────────────────────────────────────────────────┘
                              ▼
        ┌─────────────────────────────────────────┐
        │                                         │
        ▼                                         ▼
┌──────────────────┐                    ┌──────────────────┐
│  FRONTEND LAYER  │                    │  BACKEND LAYER   │
│                  │                    │                  │
│  Next.js 14+     │◄──────────────────►│  Django 5.0+     │
│  React 18        │     REST API       │  DRF             │
│  TypeScript      │     WebSockets     │  Python 3.12     │
│  Tailwind CSS    │                    │  Celery          │
└──────────────────┘                    └──────────────────┘
                                                  │
                    ┌─────────────────────────────┼─────────────────────┐
                    │                             │                     │
                    ▼                             ▼                     ▼
        ┌──────────────────┐         ┌──────────────────┐   ┌──────────────────┐
        │   PostgreSQL     │         │  Redis Cache     │   │  Elasticsearch   │
        │   (Primary DB)   │         │  + Task Queue    │   │  (Full-text)     │
        └──────────────────┘         └──────────────────┘   └──────────────────┘
                    │
                    ▼
        ┌──────────────────────────────────────────┐
        │         AWS S3 / MinIO                   │
        │    (Storage de PDFs, EPUBs, Images)      │
        └──────────────────────────────────────────┘
```

---

## 1. CAPA DE PRESENTACIÓN (FRONTEND)

### 1.1 Tecnologías

```typescript
// Stack principal
- Next.js 14+ (App Router)
- React 18+
- TypeScript 5+
- Tailwind CSS
- shadcn/ui components
```

### 1.2 Estructura de Proyecto

```
biblioteca-virtual-frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Grupo de rutas autenticadas
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── reset-password/
│   │   ├── (dashboard)/       # Rutas principales
│   │   │   ├── page.tsx       # Dashboard
│   │   │   ├── catalog/       # Catálogo de libros
│   │   │   ├── reader/        # Lector de documentos
│   │   │   ├── library/       # Biblioteca personal
│   │   │   └── profile/       # Perfil de usuario
│   │   ├── (admin)/           # Panel administrativo
│   │   │   ├── users/
│   │   │   ├── books/
│   │   │   ├── institutions/
│   │   │   └── analytics/
│   │   ├── api/               # API Routes (si necesario)
│   │   ├── layout.tsx         # Layout raíz
│   │   └── page.tsx           # Página de inicio
│   ├── components/
│   │   ├── ui/                # Componentes shadcn/ui
│   │   ├── shared/            # Componentes compartidos
│   │   ├── features/          # Componentes por feature
│   │   │   ├── auth/
│   │   │   ├── books/
│   │   │   ├── reader/
│   │   │   └── payments/
│   │   └── layouts/           # Layouts reutilizables
│   ├── lib/
│   │   ├── api/               # Cliente API
│   │   ├── utils/             # Utilidades
│   │   ├── hooks/             # Custom hooks
│   │   └── constants/         # Constantes
│   ├── store/                 # Zustand stores
│   │   ├── authStore.ts
│   │   ├── bookStore.ts
│   │   └── readerStore.ts
│   ├── types/                 # TypeScript types
│   └── styles/                # Estilos globales
├── public/
│   ├── fonts/
│   ├── images/
│   └── locales/               # Traducciones i18n
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── .env.local
├── next.config.js
├── tailwind.config.ts
└── tsconfig.json
```

### 1.3 Componentes Clave

#### BookCard Component
```typescript
interface BookCardProps {
  id: string;
  title: string;
  authors: string[];
  coverUrl: string;
  category: string;
  rating: number;
  isAvailable: boolean;
}

export const BookCard: React.FC<BookCardProps> = ({ ... }) => {
  // Componente reutilizable para mostrar libros
};
```

#### PDFReader Component
```typescript
interface PDFReaderProps {
  documentUrl: string;
  documentId: string;
  enableAnnotations: boolean;
  enableDownload: boolean;
}

export const PDFReader: React.FC<PDFReaderProps> = ({ ... }) => {
  // Lector de PDF con PDF.js
};
```

### 1.4 State Management

```typescript
// authStore.ts - Zustand
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (credentials: Credentials) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  // implementación
}));
```

### 1.5 React Query para Data Fetching

```typescript
// hooks/useBooks.ts
export const useBooks = (filters: BookFilters) => {
  return useQuery({
    queryKey: ['books', filters],
    queryFn: () => fetchBooks(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

export const useBookDetails = (bookId: string) => {
  return useQuery({
    queryKey: ['book', bookId],
    queryFn: () => fetchBookDetails(bookId),
    enabled: !!bookId,
  });
};
```

---

## 2. CAPA DE APLICACIÓN (BACKEND)

### 2.1 Tecnologías

```python
# Stack principal
- Django 5.0+
- Django REST Framework 3.14+
- Python 3.12+
- Celery 5.3+
- Redis
```

### 2.2 Estructura de Proyecto Django

```
biblioteca-virtual-backend/
├── config/
│   ├── settings/
│   │   ├── base.py            # Configuración base
│   │   ├── development.py     # Dev settings
│   │   ├── production.py      # Prod settings
│   │   └── test.py            # Test settings
│   ├── urls.py                # URLs principales
│   ├── wsgi.py
│   └── asgi.py
├── apps/
│   ├── authentication/        # Autenticación y usuarios
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   ├── permissions.py
│   │   └── tests/
│   ├── subscriptions/         # Suscripciones y pagos
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── services/
│   │   │   ├── payment_gateway.py
│   │   │   └── subscription_manager.py
│   │   └── tasks.py           # Celery tasks
│   ├── books/                 # Libros y documentos
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── filters.py
│   │   ├── search_indexes.py  # Elasticsearch
│   │   └── services/
│   │       ├── pdf_processor.py
│   │       └── storage_manager.py
│   ├── reader/                # Funcionalidades del lector
│   │   ├── models.py          # Anotaciones, marcadores
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── services/
│   │       └── drm_manager.py
│   ├── institutions/          # Gestión institucional
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── permissions.py
│   ├── analytics/             # Analytics y reportes
│   │   ├── models.py
│   │   ├── views.py
│   │   ├── services/
│   │   │   └── report_generator.py
│   │   └── tasks.py
│   ├── notifications/         # Sistema de notificaciones
│   │   ├── models.py
│   │   ├── services/
│   │   │   ├── email_service.py
│   │   │   └── push_service.py
│   │   └── tasks.py
│   └── recommendations/       # Motor de recomendaciones
│       ├── models.py
│       ├── services/
│       │   └── recommendation_engine.py
│       └── tasks.py
├── core/
│   ├── middleware/            # Middlewares custom
│   ├── utils/                 # Utilidades generales
│   ├── exceptions.py          # Excepciones custom
│   └── validators.py          # Validadores
├── static/
├── media/
├── logs/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── fixtures/
├── requirements/
│   ├── base.txt
│   ├── development.txt
│   ├── production.txt
│   └── test.txt
├── manage.py
├── celery.py
└── pytest.ini
```

### 2.3 Modelos de Base de Datos

#### User Model
```python
from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    USER_TYPES = [
        ('student', 'Estudiante'),
        ('employee', 'Funcionário'),
        ('teacher', 'Professor'),
        ('other', 'Outro'),
    ]
    
    user_type = models.CharField(max_length=20, choices=USER_TYPES)
    institution = models.ForeignKey('institutions.Institution', 
                                   on_delete=models.SET_NULL, 
                                   null=True, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    bio = models.TextField(blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    preferences = models.JSONField(default=dict)
    is_verified = models.BooleanField(default=False)
    two_factor_enabled = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'users'
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['user_type']),
        ]
```

#### Subscription Model
```python
class Subscription(models.Model):
    PLAN_TYPES = [
        ('quarterly', 'Trimestral'),
        ('biannual', 'Semestral'),
        ('annual', 'Anual'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Ativa'),
        ('expired', 'Expirada'),
        ('cancelled', 'Cancelada'),
        ('suspended', 'Suspensa'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, 
                            related_name='subscriptions')
    plan_type = models.CharField(max_length=20, choices=PLAN_TYPES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    auto_renew = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'subscriptions'
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['end_date']),
        ]
```

#### Book Model
```python
class Book(models.Model):
    FORMAT_CHOICES = [
        ('pdf', 'PDF'),
        ('epub', 'EPUB'),
        ('mobi', 'MOBI'),
    ]
    
    isbn = models.CharField(max_length=13, unique=True, blank=True, null=True)
    title = models.CharField(max_length=500)
    subtitle = models.CharField(max_length=500, blank=True)
    authors = models.ManyToManyField('Author', related_name='books')
    publisher = models.ForeignKey('Publisher', on_delete=models.SET_NULL, 
                                  null=True, related_name='books')
    publication_date = models.DateField(null=True, blank=True)
    language = models.CharField(max_length=10, default='pt')
    pages = models.IntegerField(null=True, blank=True)
    description = models.TextField(blank=True)
    
    # Archivos
    file_pdf = models.FileField(upload_to='books/pdf/', null=True, blank=True)
    file_epub = models.FileField(upload_to='books/epub/', null=True, blank=True)
    file_mobi = models.FileField(upload_to='books/mobi/', null=True, blank=True)
    cover_image = models.ImageField(upload_to='books/covers/')
    thumbnail = models.ImageField(upload_to='books/thumbnails/', 
                                  null=True, blank=True)
    
    # Categorización
    categories = models.ManyToManyField('Category', related_name='books')
    tags = models.ManyToManyField('Tag', related_name='books', blank=True)
    
    # Métricas
    views_count = models.IntegerField(default=0)
    downloads_count = models.IntegerField(default=0)
    average_rating = models.DecimalField(max_digits=3, decimal_places=2, 
                                        default=0.0)
    ratings_count = models.IntegerField(default=0)
    
    # Control
    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    available_for = models.CharField(max_length=50, default='all')  # all, institutional, premium
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'books'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['isbn']),
            models.Index(fields=['title']),
            models.Index(fields=['-created_at']),
            models.Index(fields=['is_active', 'is_featured']),
        ]
```

#### Reading Activity Model
```python
class ReadingActivity(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    book = models.ForeignKey(Book, on_delete=models.CASCADE)
    current_page = models.IntegerField(default=1)
    total_pages = models.IntegerField()
    progress_percentage = models.DecimalField(max_digits=5, decimal_places=2)
    time_spent = models.DurationField(default=timedelta)
    last_read_at = models.DateTimeField(auto_now=True)
    completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'reading_activities'
        unique_together = ['user', 'book']
```

### 2.4 API Endpoints

```python
# urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'books', BookViewSet)
router.register(r'subscriptions', SubscriptionViewSet)
router.register(r'institutions', InstitutionViewSet)

urlpatterns = [
    # Authentication
    path('api/auth/register/', RegisterView.as_view()),
    path('api/auth/login/', LoginView.as_view()),
    path('api/auth/logout/', LogoutView.as_view()),
    path('api/auth/refresh/', RefreshTokenView.as_view()),
    path('api/auth/verify-email/', VerifyEmailView.as_view()),
    path('api/auth/reset-password/', ResetPasswordView.as_view()),
    
    # Main API
    path('api/', include(router.urls)),
    
    # Books
    path('api/books/search/', BookSearchView.as_view()),
    path('api/books/<int:pk>/read/', BookReadView.as_view()),
    path('api/books/<int:pk>/download/', BookDownloadView.as_view()),
    path('api/books/<int:pk>/reviews/', BookReviewListView.as_view()),
    
    # Reader
    path('api/reader/annotations/', AnnotationListCreateView.as_view()),
    path('api/reader/bookmarks/', BookmarkListCreateView.as_view()),
    path('api/reader/progress/', ReadingProgressView.as_view()),
    
    # Recommendations
    path('api/recommendations/', RecommendationView.as_view()),
    
    # Analytics
    path('api/analytics/dashboard/', AnalyticsDashboardView.as_view()),
    path('api/analytics/reports/', GenerateReportView.as_view()),
]
```

### 2.5 Serializers

```python
# books/serializers.py
from rest_framework import serializers

class BookSerializer(serializers.ModelSerializer):
    authors = AuthorSerializer(many=True, read_only=True)
    publisher = PublisherSerializer(read_only=True)
    categories = CategorySerializer(many=True, read_only=True)
    is_favorited = serializers.SerializerMethodField()
    user_rating = serializers.SerializerMethodField()
    
    class Meta:
        model = Book
        fields = [
            'id', 'isbn', 'title', 'subtitle', 'authors', 'publisher',
            'publication_date', 'language', 'pages', 'description',
            'cover_image', 'categories', 'average_rating', 'ratings_count',
            'views_count', 'is_favorited', 'user_rating'
        ]
    
    def get_is_favorited(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.favorites.filter(user=request.user).exists()
        return False
    
    def get_user_rating(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            rating = obj.ratings.filter(user=request.user).first()
            return rating.score if rating else None
        return None
```

### 2.6 ViewSets

```python
# books/views.py
from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

class BookViewSet(viewsets.ModelViewSet):
    queryset = Book.objects.filter(is_active=True)
    serializer_class = BookSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, 
                      filters.OrderingFilter]
    filterset_fields = ['categories', 'language', 'publisher']
    search_fields = ['title', 'authors__name', 'description']
    ordering_fields = ['created_at', 'title', 'average_rating']
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'destroy']:
            return [IsAdminUser()]
        return [IsAuthenticatedOrReadOnly()]
    
    @action(detail=True, methods=['post'])
    def rate(self, request, pk=None):
        """Calificar un libro"""
        book = self.get_object()
        score = request.data.get('score')
        # Lógica de calificación
        return Response({'status': 'rating saved'})
    
    @action(detail=True, methods=['post'])
    def favorite(self, request, pk=None):
        """Agregar/quitar de favoritos"""
        book = self.get_object()
        # Lógica de favoritos
        return Response({'status': 'toggled'})
```

### 2.7 Celery Tasks

```python
# subscriptions/tasks.py
from celery import shared_task
from django.utils import timezone
from datetime import timedelta

@shared_task
def check_expiring_subscriptions():
    """Verificar suscripciones por vencer"""
    expiring_date = timezone.now() + timedelta(days=7)
    expiring_subs = Subscription.objects.filter(
        status='active',
        end_date__lte=expiring_date,
        end_date__gte=timezone.now()
    )
    
    for sub in expiring_subs:
        send_expiration_reminder.delay(sub.id)

@shared_task
def send_expiration_reminder(subscription_id):
    """Enviar recordatorio de expiración"""
    sub = Subscription.objects.get(id=subscription_id)
    # Lógica de envío de email
    
@shared_task
def process_book_upload(book_id):
    """Procesar libro subido"""
    book = Book.objects.get(id=book_id)
    # Generar thumbnail
    # Extraer texto para búsqueda
    # Optimizar PDF
```

---

## 3. CAPA DE DATOS

### 3.1 PostgreSQL

#### Esquema de Base de Datos

```sql
-- Índices principales
CREATE INDEX idx_books_isbn ON books(isbn);
CREATE INDEX idx_books_title_gin ON books USING gin(to_tsvector('portuguese', title));
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_subscriptions_end_date ON subscriptions(end_date);

-- Índices compuestos
CREATE INDEX idx_reading_activity_user_book ON reading_activities(user_id, book_id);
CREATE INDEX idx_annotations_user_book ON annotations(user_id, book_id);

-- Full-text search
ALTER TABLE books ADD COLUMN search_vector tsvector;
CREATE INDEX idx_books_search_vector ON books USING gin(search_vector);

-- Trigger para actualizar search_vector
CREATE TRIGGER tsvector_update BEFORE INSERT OR UPDATE
ON books FOR EACH ROW EXECUTE FUNCTION
tsvector_update_trigger(search_vector, 'pg_catalog.portuguese', title, description);
```

#### Particionamiento

```sql
-- Particionar tabla de analytics por fecha
CREATE TABLE analytics_events (
    id BIGSERIAL,
    event_type VARCHAR(50),
    user_id INTEGER,
    data JSONB,
    created_at TIMESTAMP
) PARTITION BY RANGE (created_at);

CREATE TABLE analytics_events_2024_q1 
PARTITION OF analytics_events 
FOR VALUES FROM ('2024-01-01') TO ('2024-04-01');
```

### 3.2 Redis

#### Estructura de Cache

```python
# cache_keys.py
CACHE_KEYS = {
    'book_detail': 'book:{book_id}',
    'book_list': 'books:list:{page}:{filters_hash}',
    'user_profile': 'user:{user_id}:profile',
    'user_favorites': 'user:{user_id}:favorites',
    'trending_books': 'trending:books',
    'popular_categories': 'popular:categories',
}

# Ejemplo de uso
from django.core.cache import cache

def get_book_detail(book_id):
    cache_key = CACHE_KEYS['book_detail'].format(book_id=book_id)
    book_data = cache.get(cache_key)
    
    if not book_data:
        book = Book.objects.get(id=book_id)
        book_data = BookSerializer(book).data
        cache.set(cache_key, book_data, timeout=3600)  # 1 hora
    
    return book_data
```

#### Celery con Redis

```python
# celery.py
from celery import Celery
from celery.schedules import crontab

app = Celery('biblioteca_virtual')
app.config_from_object('django.conf:settings', namespace='CELERY')

app.conf.beat_schedule = {
    'check-expiring-subscriptions': {
        'task': 'subscriptions.tasks.check_expiring_subscriptions',
        'schedule': crontab(hour=8, minute=0),  # Diario a las 8 AM
    },
    'generate-daily-analytics': {
        'task': 'analytics.tasks.generate_daily_analytics',
        'schedule': crontab(hour=1, minute=0),  # Diario a la 1 AM
    },
}
```

### 3.3 Elasticsearch

#### Mapping de Books

```json
{
  "mappings": {
    "properties": {
      "id": { "type": "integer" },
      "isbn": { "type": "keyword" },
      "title": {
        "type": "text",
        "analyzer": "portuguese",
        "fields": {
          "keyword": { "type": "keyword" },
          "suggest": { "type": "completion" }
        }
      },
      "authors": {
        "type": "nested",
        "properties": {
          "id": { "type": "integer" },
          "name": { "type": "text", "analyzer": "portuguese" }
        }
      },
      "categories": {
        "type": "nested",
        "properties": {
          "id": { "type": "integer" },
          "name": { "type": "keyword" }
        }
      },
      "description": {
        "type": "text",
        "analyzer": "portuguese"
      },
      "publication_date": { "type": "date" },
      "language": { "type": "keyword" },
      "average_rating": { "type": "float" },
      "views_count": { "type": "integer" }
    }
  }
}
```

#### Búsqueda Avanzada

```python
# books/search.py
from elasticsearch_dsl import Search, Q

def search_books(query, filters=None):
    s = Search(index='books')
    
    # Búsqueda multi-match
    if query:
        s = s.query(
            'multi_match',
            query=query,
            fields=['title^3', 'authors.name^2', 'description'],
            type='best_fields',
            fuzziness='AUTO'
        )
    
    # Filtros
    if filters:
        if filters.get('categories'):
            s = s.filter('terms', **{'categories.id': filters['categories']})
        
        if filters.get('language'):
            s = s.filter('term', language=filters['language'])
        
        if filters.get('year_from'):
            s = s.filter('range', publication_date={'gte': filters['year_from']})
    
    # Ordenamiento
    s = s.sort('-_score', '-average_rating')
    
    # Agregaciones
    s.aggs.bucket('categories', 'nested', path='categories') \
           .bucket('category_names', 'terms', field='categories.name')
    
    return s.execute()
```

---

## 4. SEGURIDAD

### 4.1 Autenticación JWT

```python
# settings.py
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': env('SECRET_KEY'),
    'AUTH_HEADER_TYPES': ('Bearer',),
}
```

### 4.2 Permisos

```python
# permissions.py
from rest_framework import permissions

class IsOwnerOrAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.is_staff:
            return True
        return obj.user == request.user

class HasActiveSubscription(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.user.is_anonymous:
            return False
        
        return request.user.subscriptions.filter(
            status='active',
            end_date__gt=timezone.now()
        ).exists()
```

### 4.3 DRM y Watermarking

```python
# reader/services/drm_manager.py
from PyPDF2 import PdfReader, PdfWriter
from reportlab.pdfgen import canvas
from io import BytesIO

class DRMManager:
    def add_watermark(self, pdf_path, user_email):
        """Agregar watermark dinámico al PDF"""
        # Crear watermark
        watermark = self._create_watermark(user_email)
        
        # Aplicar a cada página
        reader = PdfReader(pdf_path)
        writer = PdfWriter()
        
        for page in reader.pages:
            page.merge_page(watermark)
            writer.add_page(page)
        
        # Guardar PDF watermarked
        output = BytesIO()
        writer.write(output)
        return output.getvalue()
    
    def _create_watermark(self, text):
        """Crear watermark invisible/visible"""
        packet = BytesIO()
        can = canvas.Canvas(packet)
        can.setFillColorRGB(0.5, 0.5, 0.5, alpha=0.3)
        can.drawString(10, 10, f"Licenciado para: {text}")
        can.save()
        
        packet.seek(0)
        return PdfReader(packet).pages[0]
```

### 4.4 Rate Limiting

```python
# middleware/rate_limit.py
from django.core.cache import cache
from rest_framework.exceptions import Throttled

class RateLimitMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        if request.user.is_authenticated:
            key = f'rate_limit:{request.user.id}'
            requests_count = cache.get(key, 0)
            
            if requests_count >= 100:  # 100 requests por minuto
                raise Throttled(detail='Rate limit exceeded')
            
            cache.set(key, requests_count + 1, timeout=60)
        
        return self.get_response(request)
```

---

## 5. INTEGRACIÓN DE SERVICIOS

### 5.1 Pasarela de Pagos

```python
# subscriptions/services/payment_gateway.py
import stripe

class PaymentGateway:
    def __init__(self):
        stripe.api_key = settings.STRIPE_SECRET_KEY
    
    def create_payment_intent(self, amount, currency='aoa', metadata=None):
        """Crear intención de pago"""
        return stripe.PaymentIntent.create(
            amount=int(amount * 100),  # Convertir a centavos
            currency=currency,
            metadata=metadata or {}
        )
    
    def create_subscription(self, user, plan):
        """Crear suscripción recurrente"""
        customer = stripe.Customer.create(
            email=user.email,
            name=user.get_full_name()
        )
        
        subscription = stripe.Subscription.create(
            customer=customer.id,
            items=[{'price': plan.stripe_price_id}]
        )
        
        return subscription
```

### 5.2 Almacenamiento S3

```python
# core/storage.py
from storages.backends.s3boto3 import S3Boto3Storage

class MediaStorage(S3Boto3Storage):
    location = 'media'
    file_overwrite = False
    
class StaticStorage(S3Boto3Storage):
    location = 'static'
    default_acl = 'public-read'

# Uso
class Book(models.Model):
    file_pdf = models.FileField(storage=MediaStorage())
    cover_image = models.ImageField(storage=MediaStorage())
```

### 5.3 Email Service

```python
# notifications/services/email_service.py
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string

class EmailService:
    def send_welcome_email(self, user):
        subject = 'Bem-vindo à Biblioteca Virtual'
        from_email = settings.DEFAULT_FROM_EMAIL
        to_email = user.email
        
        html_content = render_to_string('emails/welcome.html', {
            'user': user,
            'login_url': settings.FRONTEND_URL + '/login'
        })
        
        msg = EmailMultiAlternatives(subject, '', from_email, [to_email])
        msg.attach_alternative(html_content, "text/html")
        msg.send()
```

---

## 6. MONITOREO Y LOGGING

### 6.1 Sentry Integration

```python
# settings.py
import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration

sentry_sdk.init(
    dsn=env('SENTRY_DSN'),
    integrations=[DjangoIntegration()],
    traces_sample_rate=0.1,
    send_default_pii=True,
    environment=env('ENVIRONMENT', default='development')
)
```

### 6.2 Structured Logging

```python
# settings.py
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'json': {
            '()': 'pythonjsonlogger.jsonlogger.JsonFormatter',
            'format': '%(asctime)s %(name)s %(levelname)s %(message)s'
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'json'
        },
        'file': {
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': 'logs/django.log',
            'maxBytes': 1024 * 1024 * 10,  # 10MB
            'backupCount': 5,
            'formatter': 'json'
        }
    },
    'loggers': {
        'django': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
        },
        'apps': {
            'handlers': ['console', 'file'],
            'level': 'DEBUG',
        }
    }
}
```

---

## 7. DOCKER Y DEPLOYMENT

### 7.1 Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  db:
    image: postgres:15
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: biblioteca_virtual
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  elasticsearch:
    image: elasticsearch:8.8.0
    environment:
      - discovery.type=single-node
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    ports:
      - "9200:9200"
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data

  backend:
    build: ./backend
    command: gunicorn config.wsgi:application --bind 0.0.0.0:8000
    volumes:
      - ./backend:/app
      - static_volume:/app/static
      - media_volume:/app/media
    ports:
      - "8000:8000"
    env_file:
      - .env
    depends_on:
      - db
      - redis
      - elasticsearch

  celery:
    build: ./backend
    command: celery -A config worker -l info
    volumes:
      - ./backend:/app
    env_file:
      - .env
    depends_on:
      - db
      - redis

  celery-beat:
    build: ./backend
    command: celery -A config beat -l info
    volumes:
      - ./backend:/app
    env_file:
      - .env
    depends_on:
      - db
      - redis

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    env_file:
      - .env
    depends_on:
      - backend

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - static_volume:/static
      - media_volume:/media
      - ./certbot/conf:/etc/letsencrypt
      - ./certbot/www:/var/www/certbot
    depends_on:
      - backend
      - frontend

volumes:
  postgres_data:
  elasticsearch_data:
  static_volume:
  media_volume:
```

### 7.2 Nginx Configuration

```nginx
# nginx/nginx.conf
upstream backend {
    server backend:8000;
}

upstream frontend {
    server frontend:3000;
}

server {
    listen 80;
    server_name bibliotecavirtual.renascerdosaber.com;
    
    # Redirect to HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name bibliotecavirtual.renascerdosaber.com;
    
    ssl_certificate /etc/letsencrypt/live/bibliotecavirtual.renascerdosaber.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/bibliotecavirtual.renascerdosaber.com/privkey.pem;
    
    # Frontend
    location / {
        proxy_pass http://frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
    
    # Static files
    location /static/ {
        alias /static/;
    }
    
    # Media files
    location /media/ {
        alias /media/;
    }
}
```

---

## 8. CI/CD PIPELINE

### 8.1 GitHub Actions

```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.12'
      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements/test.txt
      - name: Run tests
        run: |
          cd backend
          pytest --cov=apps --cov-report=xml
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: |
          cd frontend
          npm ci
      - name: Run tests
        run: |
          cd frontend
          npm test -- --coverage
      - name: Run E2E tests
        run: |
          cd frontend
          npm run test:e2e

  deploy:
    needs: [test-backend, test-frontend]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to production
        run: |
          # Deploy script
```

---

Este documento proporciona la arquitectura técnica completa del sistema. ¿Necesitas que profundice en alguna sección específica?
