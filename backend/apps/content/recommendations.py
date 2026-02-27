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
    Analyze user history and explicit preferences to find preferred categories and authors.
    """
    # 1. Explicit Preferences from Onboarding
    explicit_pref_categories = []
    if user.preferences and 'preferred_categories' in user.preferences:
        pref_ids = user.preferences['preferred_categories']
        explicit_pref_categories = list(Category.objects.filter(id__in=pref_ids))

    # 2. Favorites
    favorite_books = Book.objects.filter(favorited_by__user=user)
    
    # 3. Highly rated reviews (>= 4 stars)
    liked_reviews = Book.objects.filter(reviews__user=user, reviews__rating__gte=4)
    
    # 4. Read history (completed or reading)
    read_books = Book.objects.filter(
        readers__user=user, 
        readers__status__in=['completed', 'reading']
    )
    
    # Combine all relevant books for history-based analysis
    relevant_books = (favorite_books | liked_reviews | read_books).distinct()
    
    # Extract preferred categories and authors from history
    history_categories = []
    author_ids = []
    
    if relevant_books.exists():
        history_categories = list(Category.objects.filter(books__in=relevant_books).annotate(
            count=Count('books')
        ).order_by('-count'))
        author_ids = list(relevant_books.values_list('author', flat=True))
    
    # Combine explicit and history-based categories (explicit first)
    # We use a dict to maintain uniqueness while preserving order
    all_categories_dict = {cat.id: cat for cat in explicit_pref_categories}
    for cat in history_categories:
        if cat.id not in all_categories_dict:
            all_categories_dict[cat.id] = cat
            
    final_categories = list(all_categories_dict.values())

    if not final_categories and not author_ids:
        return None
        
    return {
        'categories': final_categories,
        'author_ids': author_ids
    }

def _get_language_boost(user):
    """
    Infer preferred language from age_range and user_type.
    Younger users and students get Spanish-first content;
    professors/employees may prefer English academic content.
    Returns a list of preferred languages (most preferred first), or empty list.
    """
    age = getattr(user, 'age_range', '') or ''
    utype = getattr(user, 'user_type', '') or ''

    # Academic users are more likely to read in English
    if utype in ('professor', 'librarian') or age in ('35-44', '45-54', '55-64', '65+'):
        return ['en', 'es']
    # Students and younger users prefer Spanish
    if utype == 'student' or age in ('13-17', '18-24'):
        return ['es', 'en']
    return []


def get_recommended_for_user(user, limit=10):
    """
    Get personalized recommendations for a user.
    Uses preferred_categories, reading history, age_range, and user_type.
    """
    preferences = get_user_preferences(user)

    if not preferences:
        return get_trending_books(limit)

    top_categories = preferences['categories'][:3]
    preferred_author_ids = list(preferences['author_ids'])

    # Books from preferred categories or authors, excluding read books
    read_book_ids = ReadingHistory.objects.filter(user=user).values_list('book_id', flat=True)

    base_q = Q(category__in=top_categories) | Q(author__id__in=preferred_author_ids)

    # Language boost: prioritise books matching user profile language
    preferred_langs = _get_language_boost(user)
    lang_filter = Q()
    if preferred_langs:
        lang_filter = Q(language=preferred_langs[0])

    recommendations = Book.objects.filter(base_q).exclude(
        id__in=read_book_ids
    ).select_related('author', 'category').annotate(
        average_rating_annotated=Avg('reviews__rating'),
        lang_match=Count('id', filter=lang_filter)
    ).order_by('-lang_match', '-average_rating_annotated', '-created_at')

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
