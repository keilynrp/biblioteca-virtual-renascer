# =============================================================================
# Meilisearch Integration - BVS Backend
# =============================================================================
"""
Meilisearch integration for book search functionality.

This module replaces Elasticsearch with Meilisearch, providing:
- Full-text search
- Typo tolerance
- Faceted search
- Fast performance with low memory footprint (128MB vs 2GB)

Performance: Meilisearch uses only 128MB RAM vs Elasticsearch's 2GB = 384MB savings

Meilisearch is significantly lighter and faster for our use case while providing
similar search quality.
"""
import logging
from typing import List, Dict, Any, Optional
from django.conf import settings
import meilisearch

logger = logging.getLogger(__name__)

# =============================================================================
# Meilisearch Client Configuration
# =============================================================================

class MeilisearchClient:
    """
    Singleton client for Meilisearch connections.
    """
    _client = None
    _index = None

    @classmethod
    def get_client(cls) -> meilisearch.Client:
        """
        Get or create Meilisearch client instance.

        Returns:
            meilisearch.Client: Configured Meilisearch client
        """
        if cls._client is None:
            meili_host = getattr(settings, 'MEILISEARCH_HOST', 'http://meilisearch:7700')
            meili_key = getattr(settings, 'MEILISEARCH_MASTER_KEY', 'your-master-key-change-this')

            cls._client = meilisearch.Client(meili_host, meili_key)
            logger.info(f"Meilisearch client initialized: {meili_host}")

        return cls._client

    @classmethod
    def get_index(cls, index_name: str = 'books'):
        """
        Get or create Meilisearch index.
        """
        id_mock = id(cls.get_client())
        # print(f"DEBUG: get_index called. Client ID: {id_mock}")
        client = cls.get_client()

        try:
            cls._index = client.get_index(index_name)
            # print(f"DEBUG: returning index: {cls._index}")
        except meilisearch.errors.MeilisearchApiError:
            # Index doesn't exist, create it
            task = client.create_index(index_name, {'primaryKey': 'id'})
            client.wait_for_task(task.task_uid)
            cls._index = client.get_index(index_name)
            logger.info(f"Created new Meilisearch index: {index_name}")

            # Configure index settings
            cls._configure_index()

        return cls._index

    @classmethod
    def _configure_index(cls):
        """
        Configure Meilisearch index settings for optimal search.
        """
        if cls._index is None:
            return

        # Searchable attributes (fields to search in)
        cls._index.update_searchable_attributes([
            'title',
            'description',
            'author_name',
            'category_name'
        ])

        # Filterable attributes (for faceted search)
        cls._index.update_filterable_attributes([
            'category_id',
            'category_name',
            'author_id',
            'author_name',
            'is_premium',
            'is_open_access',
            'source',
            'publication_date',
            'created_at'
        ])

        # Sortable attributes
        cls._index.update_sortable_attributes([
            'title',
            'created_at',
            'publication_date'
        ])

        # Ranking rules (order of relevance)
        cls._index.update_ranking_rules([
            'words',      # Number of matching words
            'typo',       # Typo tolerance
            'proximity',  # Proximity of matched words
            'attribute',  # Attribute ranking (title > description)
            'sort',       # Custom sort
            'exactness'   # Exactness of match
        ])

        # Typo tolerance settings
        cls._index.update_typo_tolerance({
            'enabled': True,
            'minWordSizeForTypos': {
                'oneTypo': 4,    # Allow 1 typo for words >= 4 chars
                'twoTypos': 8    # Allow 2 typos for words >= 8 chars
            }
        })

        logger.info("Meilisearch index configured successfully")


# =============================================================================
# Book Indexing Functions
# =============================================================================

def index_book(book) -> Dict[str, Any]:
    """
    Index a single book in Meilisearch.

    Args:
        book: Book model instance

    Returns:
        dict: Task info from Meilisearch
    """
    index = MeilisearchClient.get_index()

    document = {
        'id': book.id,
        'title': book.title,
        'description': book.description or '',
        'author_id': book.author.id if book.author else None,
        'author_name': book.author.name if book.author else '',
        'category_id': book.category.id if book.category else None,
        'category_name': book.category.name if book.category else '',
        'isbn': book.isbn or '',
        'publication_date': book.publication_date.isoformat() if book.publication_date else None,
        'is_premium': book.is_premium,
        'is_open_access': book.is_open_access,
        'source': book.source,
        'doi': book.doi or '',
        'external_url': book.external_url or '',
        'created_at': book.created_at.isoformat(),
        'slug': book.slug,
        'cover_image_url': book.cover_image.url if book.cover_image else ''
    }

    task = index.add_documents([document])
    logger.info(f"Indexed book: {book.title} (ID: {book.id})")

    return task


def index_books_bulk(books) -> Dict[str, Any]:
    """
    Index multiple books in Meilisearch (bulk operation).

    Args:
        books: QuerySet or list of Book instances

    Returns:
        dict: Task info from Meilisearch
    """
    index = MeilisearchClient.get_index()

    documents = []
    for book in books:
        documents.append({
            'id': book.id,
            'title': book.title,
            'description': book.description or '',
            'author_id': book.author.id if book.author else None,
            'author_name': book.author.name if book.author else '',
            'category_id': book.category.id if book.category else None,
            'category_name': book.category.name if book.category else '',
            'isbn': book.isbn or '',
            'publication_date': book.publication_date.isoformat() if book.publication_date else None,
            'is_premium': book.is_premium,
            'is_open_access': book.is_open_access,
            'source': book.source,
            'doi': book.doi or '',
            'external_url': book.external_url or '',
            'created_at': book.created_at.isoformat(),
            'slug': book.slug,
            'cover_image_url': book.cover_image.url if book.cover_image else ''
        })

    if documents:
        task = index.add_documents(documents)
        logger.info(f"Bulk indexed {len(documents)} books")
        return task

    return None


def delete_book_from_index(book_id: int) -> Dict[str, Any]:
    """
    Delete a book from Meilisearch index.

    Args:
        book_id: ID of the book to delete

    Returns:
        dict: Task info from Meilisearch
    """
    index = MeilisearchClient.get_index()
    task = index.delete_document(book_id)
    logger.info(f"Deleted book from index: ID {book_id}")
    return task


# =============================================================================
# Search Functions
# =============================================================================

def search_books(
    query: str = '',
    category: Optional[int] = None,
    author: Optional[int] = None,
    is_premium: Optional[bool] = None,
    offset: int = 0,
    limit: int = 12,
    sort_by: Optional[str] = None
) -> Dict[str, Any]:
    """
    Search books with filters and pagination.

    Args:
        query: Search query text
        category: Category ID to filter by
        author: Author ID to filter by
        is_premium: Filter by premium status
        offset: Pagination offset
        limit: Number of results per page
        sort_by: Sort field (created_at, publication_date, title)

    Returns:
        dict: Search results with metadata
            - hits: List of matching books
            - total: Total number of results
            - offset: Current offset
            - limit: Results per page
            - processing_time_ms: Search duration
    """
    index = MeilisearchClient.get_index()

    # Build filter string
    filters = []
    if category is not None:
        filters.append(f'category_id = {category}')
    if author is not None:
        filters.append(f'author_id = {author}')
    if is_premium is not None:
        premium_value = 'true' if is_premium else 'false'
        filters.append(f'is_premium = {premium_value}')

    filter_str = ' AND '.join(filters) if filters else None

    # Build sort list
    sort = []
    if sort_by == 'created_at':
        sort = ['created_at:desc']
    elif sort_by == 'publication_date':
        sort = ['publication_date:desc']
    elif sort_by == 'title':
        sort = ['title:asc']

    # Execute search
    try:
        results = index.search(
            query=query or '',
            opt_params={
                'filter': filter_str,
                'sort': sort if sort else None,
                'offset': offset,
                'limit': limit,
                'attributesToHighlight': ['title', 'description', 'author_name'],
                'highlightPreTag': '<mark>',
                'highlightPostTag': '</mark>'
            }
        )

        logger.info(
            f"Search executed: query='{query}', "
            f"filters={filter_str}, "
            f"results={results['estimatedTotalHits']}, "
            f"time={results['processingTimeMs']}ms"
        )

        return {
            'hits': results['hits'],
            'total': results['estimatedTotalHits'],
            'offset': results.get('offset', offset),
            'limit': results.get('limit', limit),
            'processing_time_ms': results['processingTimeMs']
        }

    except Exception as e:
        logger.error(f"Search error: {e}")
        return {
            'hits': [],
            'total': 0,
            'offset': 0,
            'limit': limit,
            'processing_time_ms': 0,
            'error': str(e)
        }


def autocomplete(query: str, limit: int = 5) -> List[Dict[str, Any]]:
    """
    Autocomplete suggestions for book search.

    Args:
        query: Search query text
        limit: Maximum number of suggestions

    Returns:
        list: List of autocomplete suggestions
    """
    if not query or len(query) < 2:
        return []

    index = MeilisearchClient.get_index()

    try:
        results = index.search(
            query=query,
            opt_params={
                'limit': limit,
                'attributesToRetrieve': ['id', 'title', 'author_name', 'slug'],
                'attributesToCrop': ['title:20']
            }
        )

        suggestions = []
        for hit in results['hits']:
            suggestions.append({
                'id': hit['id'],
                'title': hit['title'],
                'author': hit.get('author_name', ''),
                'slug': hit['slug']
            })

        return suggestions

    except Exception as e:
        logger.error(f"Autocomplete error: {e}")
        return []


def get_facets() -> Dict[str, List[Dict[str, Any]]]:
    """
    Get faceted data for filters (categories, authors, premium status).

    Returns:
        dict: Faceted data with counts
            - categories: List of {name, count}
            - authors: List of {name, count}
            - is_premium: List of {value, count}
    """
    index = MeilisearchClient.get_index()

    try:
        # Get all documents with facet distribution
        results = index.search(
            '',
            opt_params={
                'facets': ['category_name', 'author_name', 'is_premium', 'is_open_access', 'source'],
                'limit': 0  # We only need facets, not documents
            }
        )

        facets = results.get('facetDistribution', {})

        return {
            'categories': [
                {'name': name, 'count': count}
                for name, count in facets.get('category_name', {}).items()
            ],
            'authors': [
                {'name': name, 'count': count}
                for name, count in facets.get('author_name', {}).items()
            ],
            'is_premium': [
                {'is_premium': value, 'count': count}
                for value, count in facets.get('is_premium', {}).items()
            ],
            'is_open_access': [
                {'is_open_access': value, 'count': count}
                for value, count in facets.get('is_open_access', {}).items()
            ],
            'source': [
                {'source': value, 'count': count}
                for value, count in facets.get('source', {}).items()
            ]
        }

    except Exception as e:
        logger.error(f"Facets error: {e}")
        return {
            'categories': [],
            'authors': [],
            'is_premium': [],
            'is_open_access': [],
            'source': []
        }


# =============================================================================
# Index Management
# =============================================================================

def clear_index():
    """
    Clear all documents from the index.
    """
    index = MeilisearchClient.get_index()
    task = index.delete_all_documents()
    logger.warning("Cleared all documents from Meilisearch index")
    return task


def get_index_stats() -> Dict[str, Any]:
    """
    Get statistics about the Meilisearch index.

    Returns:
        dict: Index statistics (number of documents, etc.)
    """
    index = MeilisearchClient.get_index()

    try:
        stats = index.get_stats()
        return {
            'number_of_documents': stats['numberOfDocuments'],
            'is_indexing': stats['isIndexing'],
            'field_distribution': stats.get('fieldDistribution', {})
        }
    except Exception as e:
        logger.error(f"Failed to get index stats: {e}")
        return {
            'number_of_documents': 0,
            'is_indexing': False,
            'field_distribution': {}
        }
