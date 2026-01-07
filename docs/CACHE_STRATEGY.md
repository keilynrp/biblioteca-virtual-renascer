# 🚀 Cache Strategy - BVS Backend

> **Sprint 8 - CACHE-001**: Redis Cache Implementation
> **Date**: 2026-01-06
> **Status**: ✅ Implemented

---

## 📊 Overview

This document describes the caching strategy implemented for the BVS (Biblioteca Virtual Senén) backend to improve performance and reduce database load.

### Goals

- ✅ Reduce database queries by caching frequently accessed data
- ✅ Improve API response times (target: <100ms p95)
- ✅ Achieve >70% cache hit rate
- ✅ Reduce database load by 40%

---

## 🏗️ Architecture

### Cache Backend

- **Technology**: Redis 7 Alpine
- **Memory Allocation**: 512MB (increased from 256MB)
- **Eviction Policy**: `allkeys-lru` (Least Recently Used)
- **Persistence**:
  - AOF (Append-Only File) enabled
  - RDB snapshots every 60 seconds if 1000+ keys changed

### Cache Layers

```
┌─────────────────────────────────────────────────────────┐
│                    API Request                          │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
            ┌──────────────────────┐
            │   Cache Check        │
            │   (Redis)            │
            └──────┬───────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
        ▼                     ▼
  ┌─────────┐          ┌─────────────┐
  │ Cache   │          │ Cache       │
  │ HIT     │          │ MISS        │
  └─────┬───┘          └──────┬──────┘
        │                     │
        │                     ▼
        │              ┌──────────────┐
        │              │ Database     │
        │              │ Query        │
        │              └──────┬───────┘
        │                     │
        │                     ▼
        │              ┌──────────────┐
        │              │ Store in     │
        │              │ Cache        │
        │              └──────┬───────┘
        │                     │
        └─────────┬───────────┘
                  │
                  ▼
         ┌────────────────┐
         │ Return         │
         │ Response       │
         └────────────────┘
```

---

## ⏱️ Cache TTL (Time To Live)

Different data types have different TTL values based on how frequently they change:

| Data Type | TTL | Reasoning |
|-----------|-----|-----------|
| **Categories** | 1 hour (3600s) | Rarely changes |
| **Authors** | 1 hour (3600s) | Rarely changes |
| **Books List** | 15 minutes (900s) | Moderate changes |
| **Book Detail** | 30 minutes (1800s) | Moderate changes |
| **Dashboard Stats** | 15 minutes (900s) | Aggregated data |
| **Search Results** | 5 minutes (300s) | Frequent searches |
| **User Favorites** | 5 minutes (300s) | User-specific, changes often |
| **Reading History** | 5 minutes (300s) | User-specific, changes often |
| **Reviews** | 30 minutes (1800s) | Moderate changes |

### Configuration

TTL values are configured in `backend/config/settings.py`:

```python
CACHE_TTL = {
    'categories': 60 * 60,           # 1 hour
    'authors': 60 * 60,              # 1 hour
    'books_list': 60 * 15,           # 15 minutes
    'book_detail': 60 * 30,          # 30 minutes
    'search_results': 60 * 5,        # 5 minutes
    'dashboard_stats': 60 * 15,      # 15 minutes
    'user_favorites': 60 * 5,        # 5 minutes
    'user_reading_history': 60 * 5,  # 5 minutes
    'reviews': 60 * 30,              # 30 minutes
}
```

---

## 🔑 Cache Key Structure

Cache keys follow a consistent naming pattern for easy management:

### Pattern

```
<entity>:<operation>:<parameters>
```

### Examples

```python
# Categories list
categories:list

# Books list with filters
books:list:category=fiction:page=1

# Book detail
book:detail:slug=python-guide

# Dashboard stats
dashboard:stats

# User-specific favorites
user:123:favorites

# Search results (hashed for complex queries)
search:a3f4b2c1d5e6f7g8h9i0...
```

### Helper Functions

Located in `backend/apps/core/cache_utils.py`:

```python
# Simple keys
make_cache_key('books', 'list', page=1, category='fiction')
# Returns: 'books:list:category=fiction:page=1'

# Hash-based keys (for complex data)
make_hash_key('search', {'query': 'python', 'filters': {...}})
# Returns: 'search:a3f4b2c1d5e6...'

# User-specific keys
get_user_cache_key(123, 'favorites')
# Returns: 'user:123:favorites'
```

---

## 🔄 Cache Invalidation Strategy

Cache is automatically invalidated when data changes using Django signals.

### Invalidation Triggers

| Model Change | Cache Invalidated | File |
|--------------|-------------------|------|
| **Category** created/updated/deleted | `categories:*`, `dashboard:stats` | `signals.py` |
| **Author** created/updated/deleted | `authors:*` | `signals.py` |
| **Book** created/updated/deleted | `books:*`, `dashboard:stats`, `search:*`, `categories:list` | `signals.py` |
| **Review** created/updated/deleted | `book:detail:<slug>`, `reviews:*`, `user:<id>:reviews` | `signals.py` |
| **Favorite** created/deleted | `user:<id>:favorites` | `signals.py` |
| **ReadingHistory** created/updated | `user:<id>:reading_history` | `signals.py` |

### Signal Implementation

Located in `backend/apps/content/signals.py`:

```python
@receiver(post_save, sender=Category)
def invalidate_category_cache_on_save(sender, instance, created, **kwargs):
    """Invalidate category cache when a category is created or updated"""
    cache.delete(make_cache_key('categories', 'list'))
    cache.delete(make_cache_key('dashboard', 'stats'))
    invalidate_cache('categories:*')
```

---

## 📦 Cached Views

### Categories List

**Endpoint**: `GET /api/content/categories/`

```python
@method_decorator(rate_limit_api_read, name='get')
class CategoryListView(generics.ListCreateAPIView):
    def list(self, request, *args, **kwargs):
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
```

**Benefits**:
- ✅ Reduces database queries for frequently accessed data
- ✅ Categories rarely change, so 1-hour TTL is appropriate
- ✅ Invalidated automatically when categories are modified

### Authors List

**Endpoint**: `GET /api/content/authors/`

**Implementation**: Similar to Categories List
**TTL**: 1 hour
**Invalidation**: Automatic on create/update/delete

### Dashboard Stats

**Endpoint**: `GET /api/content/dashboard-stats/`

```python
@api_view(['GET'])
def dashboard_stats(request):
    cache_key = make_cache_key('dashboard', 'stats')

    def compute_dashboard_stats():
        # Heavy aggregation queries
        total_books = Book.objects.count()
        total_users = User.objects.count()
        recent_books = Book.objects.select_related('author', 'category')[:5]
        books_by_category = Category.objects.annotate(
            book_count=Count('books')
        ).values('name', 'book_count')[:5]

        return {
            'total_books': total_books,
            'total_users': total_users,
            'recent_books': recent_books_data,
            'top_categories': list(books_by_category),
        }

    data = get_or_set_cache(
        cache_key,
        compute_dashboard_stats,
        timeout=settings.CACHE_TTL['dashboard_stats']
    )

    return Response(data)
```

**Benefits**:
- ✅ Avoids expensive aggregation queries on every request
- ✅ 15-minute TTL balances freshness vs performance
- ✅ Invalidated when books/categories change

---

## 📊 Monitoring & Metrics

### Cache Statistics

Get cache statistics via Redis:

```python
from apps.core.cache_utils import get_cache_stats

stats = get_cache_stats()
# Returns:
# {
#     'hit_rate': 0.75,  # 75% cache hit rate
#     'hits': 1500,
#     'misses': 500,
#     'used_memory': '128MB',
#     'connected_clients': 5
# }
```

### Target Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| **Cache Hit Rate** | >70% | Redis INFO stats |
| **API Response Time (p95)** | <100ms | Application monitoring |
| **Database Load Reduction** | 40% | Database query count |
| **Memory Usage** | <480MB | Redis INFO memory |

### Monitoring Commands

```bash
# Connect to Redis
docker exec -it <redis-container> redis-cli

# Get cache info
INFO stats
INFO memory

# View cache keys
KEYS bvs_cache:*

# Check specific key
GET bvs_cache:categories:list

# Monitor cache in real-time
MONITOR
```

---

## 🛠️ Utility Functions

### Core Cache Utilities

Located in `backend/apps/core/cache_utils.py`:

#### Cache Key Builders

```python
# Simple key builder
make_cache_key('books', 'list', page=1)

# Hash-based key (for complex data)
make_hash_key('search', {'query': '...', 'filters': {...}})

# User-specific key
get_user_cache_key(user_id, 'favorites')
```

#### Cache Operations

```python
# Get or set pattern
data = get_or_set_cache(key, callback_function, timeout=3600)

# Pattern-based invalidation
invalidate_cache('books:*')

# Model-based invalidation
invalidate_model_cache('book', instance_id=123)
```

#### Cache Decorators

```python
# Function caching
@cache_function(timeout=3600, key_prefix='categories')
def get_all_categories():
    return Category.objects.all()

# View caching
@cache_view(timeout=300)
def list(self, request):
    ...
```

---

## 🧪 Testing

### Running Cache Tests

```bash
# Run all cache tests
pytest backend/apps/core/tests/test_cache.py -v

# Run specific test class
pytest backend/apps/core/tests/test_cache.py::TestCacheUtils -v

# Run with coverage
pytest backend/apps/core/tests/test_cache.py --cov=apps.core.cache_utils
```

### Test Coverage

- ✅ Cache key generation
- ✅ Cache hit/miss behavior
- ✅ Cache timeout/expiration
- ✅ Pattern-based invalidation
- ✅ Signal-based invalidation
- ✅ Configuration validation

---

## 🚀 Deployment

### Docker Compose Configuration

```yaml
redis:
  image: redis:7-alpine
  volumes:
    - redis_data:/data
  ports:
    - "6379:6379"
  deploy:
    resources:
      limits:
        memory: 512M
      reservations:
        memory: 256M
  command: >
    redis-server
    --maxmemory 480mb
    --maxmemory-policy allkeys-lru
    --save 60 1000
    --appendonly yes
    --appendfsync everysec
```

### Environment Variables

Add to `.env`:

```bash
# Redis Cache Configuration
REDIS_URL=redis://redis:6379/1
CACHE_TIMEOUT=300  # Default 5 minutes
```

### Starting Services

```bash
# Start all services including Redis
docker-compose up -d

# Check Redis health
docker exec -it <redis-container> redis-cli ping
# Should return: PONG

# Clear cache (if needed)
docker exec -it <redis-container> redis-cli FLUSHDB
```

---

## 📈 Performance Impact

### Before Cache Implementation

| Metric | Value |
|--------|-------|
| Dashboard load time | 800-1200ms |
| Categories endpoint | 150-250ms |
| Authors endpoint | 150-250ms |
| Database queries per request | 5-15 |

### After Cache Implementation (Expected)

| Metric | Target Value | Improvement |
|--------|--------------|-------------|
| Dashboard load time | <100ms | ✅ 88% faster |
| Categories endpoint | <50ms | ✅ 75% faster |
| Authors endpoint | <50ms | ✅ 75% faster |
| Database queries per request | 0-2 (on cache hit) | ✅ 85% reduction |
| Cache hit rate | >70% | ✅ Target |

---

## 🔧 Troubleshooting

### Cache Not Working

```bash
# 1. Check Redis is running
docker ps | grep redis

# 2. Check Redis connection
docker exec -it <redis-container> redis-cli ping

# 3. Check Django cache configuration
docker exec -it <backend-container> python manage.py shell
>>> from django.core.cache import cache
>>> cache.set('test', 'value')
>>> cache.get('test')
# Should return: 'value'
```

### High Memory Usage

```bash
# Check memory usage
docker exec -it <redis-container> redis-cli INFO memory

# Find largest keys
docker exec -it <redis-container> redis-cli --bigkeys

# Clear cache if needed
docker exec -it <redis-container> redis-cli FLUSHDB
```

### Cache Not Invalidating

```bash
# Check signals are connected
docker exec -it <backend-container> python manage.py shell
>>> from apps.content.signals import *
>>> # Signals should be imported without errors

# Check logs for invalidation messages
docker logs <backend-container> | grep "Invalidating"
```

---

## 📚 References

### Documentation

- [Django Cache Framework](https://docs.djangoproject.com/en/stable/topics/cache/)
- [Redis Documentation](https://redis.io/documentation)
- [Django Signals](https://docs.djangoproject.com/en/stable/topics/signals/)

### Related Files

- `backend/config/settings.py` - Cache configuration
- `backend/apps/core/cache_utils.py` - Cache utilities
- `backend/apps/content/signals.py` - Cache invalidation
- `backend/apps/content/views.py` - Cached views
- `backend/apps/core/tests/test_cache.py` - Cache tests
- `docker-compose.yml` - Redis configuration

---

## ✅ Checklist

### Implementation Status

- [x] Configure Redis in docker-compose.yml (512MB)
- [x] Configure Django cache settings
- [x] Create cache utility functions
- [x] Implement caching in CategoryListView
- [x] Implement caching in AuthorListView
- [x] Implement caching in dashboard_stats
- [x] Add cache invalidation signals for Category
- [x] Add cache invalidation signals for Author
- [x] Add cache invalidation signals for Book
- [x] Add cache invalidation signals for Review
- [x] Add cache invalidation signals for Favorite
- [x] Write cache tests
- [x] Document cache strategy

### Testing

- [ ] Run cache tests and verify they pass
- [ ] Test cache hit/miss in development
- [ ] Monitor cache hit rate (target: >70%)
- [ ] Verify cache invalidation works correctly
- [ ] Load test with caching enabled

### Production Checklist

- [ ] Configure Redis persistence (AOF + RDB)
- [ ] Set up Redis monitoring/alerts
- [ ] Configure backup strategy for Redis
- [ ] Set appropriate memory limits
- [ ] Monitor cache hit rate in production
- [ ] Set up alerts for cache failures

---

## 🎯 Next Steps

1. **Run Tests**: Execute cache tests to verify functionality
2. **Performance Testing**: Measure actual performance improvements
3. **Monitoring**: Set up dashboards to track cache metrics
4. **Optimization**: Fine-tune TTL values based on actual usage patterns
5. **Documentation**: Update API documentation with caching behavior

---

**Version**: 1.0
**Last Updated**: 2026-01-06
**Author**: BVS Development Team
**Sprint**: Sprint 8 - DevOps Critical Part 2
