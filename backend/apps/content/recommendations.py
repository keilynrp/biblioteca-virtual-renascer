from django.db.models import Count, Q, Avg
from django.utils import timezone
from .models import Book, ReadingHistory, Review, Favorite, Category
import random

def get_similar_books(book, limit=6):
    """
    Get books similar to the given book.
    Strategy:
    1. Same Author (Strongest signal)
    2. Same Category
    3. Exclude the book itself
    """
    similar_books = Book.objects.filter(
        Q(author=book.author) | Q(category=book.category)
    ).exclude(id=book.id).select_related('author', 'category').annotate(
        average_rating_annotated=Avg('reviews__rating')
    ).order_by('-average_rating_annotated', '-created_at')
    
    # If not enough, fill with random top rated from same category
    if similar_books.count() < limit:
        remaining = limit - similar_books.count()
        more_books = Book.objects.filter(category=book.category).exclude(
            id__in=[b.id for b in similar_books]
        ).exclude(id=book.id).order_by('?')[:remaining]
        similar_books = list(similar_books) + list(more_books)
        
    return similar_books[:limit]

def get_user_preferences(user):
    """
    Analyze user history to find preferred categories and authors.
    """
    # 1. Favorites
    favorite_books = Book.objects.filter(favorited_by__user=user)
    
    # 2. Highly rated reviews (>= 4 stars)
    liked_reviews = Book.objects.filter(reviews__user=user, reviews__rating__gte=4)
    
    # 3. Read history (completed or reading)
    read_books = Book.objects.filter(
        readers__user=user, 
        readers__status__in=['completed', 'reading']
    )
    
    # Combine all relevant books
    relevant_books = (favorite_books | liked_reviews | read_books).distinct()
    
    if not relevant_books.exists():
        return None
        
    # Extract preferred categories and authors
    categories = Category.objects.filter(books__in=relevant_books).annotate(
        count=Count('books')
    ).order_by('-count')
    
    authors_ids = relevant_books.values_list('author', flat=True)
    
    return {
        'categories': categories,
        'author_ids': authors_ids
    }

def get_recommended_for_user(user, limit=10):
    """
    Get personalized recommendations for a user.
    """
    preferences = get_user_preferences(user)
    
    if not preferences:
        return get_trending_books(limit)
        
    top_categories = preferences['categories'][:3]
    preferred_author_ids = list(preferences['author_ids'])
    
    # Books from preferred categories or authors, excluding read books
    read_book_ids = ReadingHistory.objects.filter(user=user).values_list('book_id', flat=True)
    
    recommendations = Book.objects.filter(
        Q(category__in=top_categories) | Q(author__id__in=preferred_author_ids)
    ).exclude(
        id__in=read_book_ids
    ).select_related('author', 'category').annotate(
        average_rating_annotated=Avg('reviews__rating')
    ).order_by('-average_rating_annotated', '-created_at')
    
    recommendations = list(recommendations[:limit])
    
    # If not enough, fill with trending
    if len(recommendations) < limit:
        exclude_ids = list(read_book_ids) + [b.id for b in recommendations]
        trending = get_trending_books(limit - len(recommendations), exclude_ids=exclude_ids)
        recommendations.extend(trending)
        
    return recommendations

def get_trending_books(limit=10, exclude_ids=None):
    """
    Get trending/popular books as fallback.
    """
    qs = Book.objects.all().select_related('author', 'category').annotate(
        review_count_annotated=Count('reviews'),
        average_rating_annotated=Avg('reviews__rating')
    ).order_by('-review_count_annotated', '-average_rating_annotated')
    
    if exclude_ids:
        qs = qs.exclude(id__in=exclude_ids)
        
    return list(qs[:limit])
