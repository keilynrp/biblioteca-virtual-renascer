import api from "./api";

export interface Author {
    id: number;
    first_name: string;
    last_name: string;
    avatar: string | null;
}

export interface Category {
    id: number;
    name: string;
    slug: string;
    description: string;
}

export interface Tag {
    id: number;
    name: string;
    slug: string;
}

export interface BlogPost {
    id: number;
    title: string;
    slug: string;
    description: string;
    content: string;
    featured_image: string | null;
    category: Category | number | null;
    category_name?: string;
    author_name?: string;
    author: Author;
    tags: Tag[] | number[];
    status: 'draft' | 'published';
    published_at: string | null;
    created_at: string;
}

export const blogService = {
    // Public/Admin List
    getPosts: async (params?: any) => {
        const response = await api.get('/blog/posts/', { params });
        return Array.isArray(response.data) ? response.data : response.data.results || [];
    },
    // Detail
    getPost: async (slug: string) => {
        const response = await api.get(`/blog/posts/${slug}/`);
        return response.data;
    },
    // Admin CRUD
    createPost: async (data: any) => {
        const response = await api.post('/blog/posts/', data);
        return response.data;
    },
    updatePost: async (slug: string, data: any) => {
        const response = await api.patch(`/blog/posts/${slug}/`, data);
        return response.data;
    },
    deletePost: async (slug: string) => {
        const response = await api.delete(`/blog/posts/${slug}/`);
        return response.data;
    },

    // Categories
    getCategories: async () => {
        const response = await api.get('/blog/categories/');
        return Array.isArray(response.data) ? response.data : response.data.results || [];
    },
    createCategory: async (data: any) => {
        const response = await api.post('/blog/categories/', data);
        return response.data;
    },

    // Tags
    getTags: async () => {
        const response = await api.get('/blog/tags/');
        return Array.isArray(response.data) ? response.data : response.data.results || [];
    },
    createTag: async (data: any) => {
        const response = await api.post('/blog/tags/', data);
        return response.data;
    }
};

export default blogService;
