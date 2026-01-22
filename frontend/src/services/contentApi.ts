import api from '@/lib/api';

export interface Book {
    id: number;
    title: string;
    slug: string;
    description: string;
    author: { name: string };
    category: { name: string };
    cover_image: string | null;
    file?: string | null;
    is_premium: boolean;
    average_rating?: number;
    review_count?: number;
    user_has_favorited?: boolean;
}

export const contentApi = {
    getRecommendedForYou: async () => {
        const response = await api.get<Book[]>('/content/recommendations/for-you/');
        return response.data;
    },

    getSimilarBooks: async (slug: string) => {
        const response = await api.get<Book[]>(`/content/books/${slug}/similar/`);
        return response.data;
    }
};
