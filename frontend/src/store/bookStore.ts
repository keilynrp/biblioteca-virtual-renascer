import { create } from 'zustand';
import api from '@/lib/api';

interface BookRef {
    id: number;
    title: string;
    slug?: string;
    [key: string]: unknown;
}

interface Review {
    id: number;
    user: { id: number; username: string; avatar?: string };
    rating: number;
    title: string;
    comment: string;
    helpful_count: number;
    user_has_voted_helpful: boolean;
    is_verified_reader: boolean;
    created_at: string;
    updated_at: string;
}

interface Favorite {
    id: number;
    book: BookRef;
    notes: string;
    created_at: string;
}

interface ReadingHistory {
    id: number;
    book: BookRef;
    status: 'reading' | 'completed' | 'want_to_read' | 'abandoned';
    progress_percentage: number;
    started_at?: string;
    completed_at?: string;
    last_read_at: string;
    created_at: string;
}

interface Reading {
    id: number;
    book: BookRef;
    current_page: number;
    total_pages: number;
    progress_percentage: string;
    zoom_level: string;
    started_at: string;
    last_read_at: string;
    total_reading_time: number;
    is_finished: boolean;
    pages_remaining: number;
}

interface BookStore {
    reviews: Review[];
    favorites: Favorite[];
    readingHistory: ReadingHistory[];
    readings: Reading[];

    // Review actions
    fetchReviews: (bookSlug: string) => Promise<void>;
    addReview: (bookSlug: string, data: { rating: number; title: string; comment: string }) => Promise<void>;
    markReviewHelpful: (reviewId: number) => Promise<void>;

    // Favorite actions
    fetchFavorites: () => Promise<void>;
    toggleFavorite: (bookId: number) => Promise<boolean>;

    // Reading history actions
    fetchReadingHistory: (status?: string) => Promise<void>;
    updateReadingStatus: (bookId: number, data: Partial<ReadingHistory>) => Promise<void>;

    // Reading (PDF viewer) actions
    fetchReadings: () => Promise<void>;
    startReading: (bookId: number) => Promise<Reading>;
    getReading: (bookId: number) => Promise<Reading | null>;
    updateReadingProgress: (bookId: number, data: { current_page: number; zoom_level: number; total_reading_time: number }) => Promise<void>;
}

export const useBookStore = create<BookStore>((set) => ({
    reviews: [],
    favorites: [],
    readingHistory: [],
    readings: [],

    // ============================================================================
    // REVIEW ACTIONS
    // ============================================================================

    fetchReviews: async (bookSlug: string) => {
        try {
            const response = await api.get(`/content/books/${bookSlug}/reviews/`);
            set({ reviews: Array.isArray(response.data) ? response.data : [] });
        } catch (error) {
            console.error('Error fetching reviews:', error);
            set({ reviews: [] });
            throw error;
        }
    },

    addReview: async (bookSlug: string, data) => {
        try {
            const response = await api.post(`/content/books/${bookSlug}/reviews/`, data);
            set((state) => ({
                reviews: Array.isArray(state.reviews)
                    ? [response.data, ...state.reviews]
                    : [response.data]
            }));
        } catch (error) {
            console.error('Error adding review:', error);
            throw error;
        }
    },

    markReviewHelpful: async (reviewId: number) => {
        try {
            const response = await api.post(`/content/reviews/${reviewId}/helpful/`);
            set((state) => ({
                reviews: Array.isArray(state.reviews)
                    ? state.reviews.map((r) =>
                          r.id === reviewId
                              ? {
                                    ...r,
                                    helpful_count: response.data.helpful_count,
                                    user_has_voted_helpful: response.data.status === 'added'
                                }
                              : r
                      )
                    : [],
            }));
        } catch (error) {
            console.error('Error marking review helpful:', error);
            throw error;
        }
    },

    // ============================================================================
    // FAVORITE ACTIONS
    // ============================================================================

    fetchFavorites: async () => {
        try {
            console.log('[fetchFavorites] Fetching favorites from API...');
            const response = await api.get('/content/user/favorites/');
            console.log('[fetchFavorites] Response:', response.data);
            console.log('[fetchFavorites] Favorites count:', response.data?.length || 0);
            set({ favorites: Array.isArray(response.data) ? response.data : [] });
        } catch (error) {
            console.error('Error fetching favorites:', error);
            set({ favorites: [] });
            throw error;
        }
    },

    toggleFavorite: async (bookId: number) => {
        try {
            console.log('[toggleFavorite] Toggling favorite for book:', bookId);
            const response = await api.post(`/content/user/favorites/${bookId}/`);
            console.log('[toggleFavorite] API Response:', response.data);

            if (response.data.status === 'added') {
                console.log('[toggleFavorite] Adding favorite:', response.data.favorite);
                set((state) => {
                    const newFavorites = Array.isArray(state.favorites)
                        ? [response.data.favorite, ...state.favorites]
                        : [response.data.favorite];
                    console.log('[toggleFavorite] New favorites count:', newFavorites.length);
                    return { favorites: newFavorites };
                });
            } else {
                console.log('[toggleFavorite] Removing favorite for book:', bookId);
                set((state) => {
                    const newFavorites = Array.isArray(state.favorites)
                        ? state.favorites.filter((f) => f.book.id !== bookId)
                        : [];
                    console.log('[toggleFavorite] New favorites count:', newFavorites.length);
                    return { favorites: newFavorites };
                });
            }

            return response.data.is_favorited;
        } catch (error) {
            console.error('Error toggling favorite:', error);
            throw error;
        }
    },

    // ============================================================================
    // READING HISTORY ACTIONS
    // ============================================================================

    fetchReadingHistory: async (status?: string) => {
        try {
            const params = status ? { status } : {};
            const response = await api.get('/content/user/reading-history/', { params });
            set({ readingHistory: Array.isArray(response.data) ? response.data : [] });
        } catch (error) {
            console.error('Error fetching reading history:', error);
            set({ readingHistory: [] });
            throw error;
        }
    },

    updateReadingStatus: async (bookId: number, data) => {
        try {
            const response = await api.post(`/content/user/reading-history/${bookId}/`, data);
            set((state) => ({
                readingHistory: Array.isArray(state.readingHistory)
                    ? state.readingHistory.some((h) => h.book.id === bookId)
                        ? state.readingHistory.map((h) =>
                              h.book.id === bookId ? response.data : h
                          )
                        : [response.data, ...state.readingHistory]
                    : [response.data],
            }));
        } catch (error) {
            console.error('Error updating reading status:', error);
            throw error;
        }
    },

    // ============================================================================
    // READING (PDF VIEWER) ACTIONS
    // ============================================================================

    fetchReadings: async () => {
        try {
            const response = await api.get('/content/user/readings/');
            set({ readings: Array.isArray(response.data) ? response.data : [] });
        } catch (error) {
            console.error('Error fetching readings:', error);
            set({ readings: [] });
            throw error;
        }
    },

    startReading: async (bookId: number) => {
        try {
            const response = await api.post(`/content/user/readings/start/${bookId}/`);
            set((state) => ({
                readings: Array.isArray(state.readings)
                    ? state.readings.some((r) => r.book.id === bookId)
                        ? state.readings.map((r) =>
                              r.book.id === bookId ? response.data.reading : r
                          )
                        : [response.data.reading, ...state.readings]
                    : [response.data.reading],
            }));
            return response.data.reading;
        } catch (error) {
            console.error('Error starting reading:', error);
            throw error;
        }
    },

    getReading: async (bookId: number) => {
        try {
            const response = await api.get(`/content/user/readings/${bookId}/`);
            return response.data;
        } catch (error) {
            console.error('Error getting reading:', error);
            return null;
        }
    },

    updateReadingProgress: async (bookId: number, data) => {
        try {
            const response = await api.patch(`/content/user/readings/${bookId}/progress/`, data);
            set((state) => ({
                readings: Array.isArray(state.readings)
                    ? state.readings.map((r) =>
                          r.book.id === bookId ? { ...r, ...response.data } : r
                      )
                    : [],
            }));
        } catch (error) {
            console.error('Error updating reading progress:', error);
            throw error;
        }
    },
}));
