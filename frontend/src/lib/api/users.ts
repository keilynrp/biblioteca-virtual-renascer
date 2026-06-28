import api from '../api';

export type UserType = 'student' | 'employee' | 'teacher' | 'librarian' | 'moderator' | 'content_manager' | 'admin' | 'other';

export interface User {
    id: number;
    username: string;
    email: string;
    first_name?: string;
    last_name?: string;
    user_type: UserType;
    institution?: number;
    institution_detail?: {
        id: number;
        name: string;
        code: string;
    };
    avatar?: string;
    is_staff?: boolean;
    is_superuser?: boolean;
}

export interface UserCreate {
    username: string;
    email: string;
    password: string;
    first_name?: string;
    last_name?: string;
    user_type: UserType;
    institution?: number;
}

export interface UserUpdate {
    username?: string;
    email?: string;
    first_name?: string;
    last_name?: string;
    user_type?: UserType;
    institution?: number;
}

export interface UserFilters {
    institution?: number;
    search?: string;
}

export const usersApi = {
    async getAll(filters?: UserFilters): Promise<User[]> {
        const params = new URLSearchParams();
        if (filters?.institution) {
            params.append('institution', filters.institution.toString());
        }
        if (filters?.search) {
            params.append('search', filters.search);
        }
        const response = await api.get(`/auth/users/?${params.toString()}`);
        // Handle both direct array and paginated object responses
        const data = response.data;
        return Array.isArray(data) ? data : (data.results || []);
    },

    async getById(id: number): Promise<User> {
        const response = await api.get(`/auth/users/${id}/`);
        return response.data;
    },

    async create(data: UserCreate): Promise<User> {
        const response = await api.post('/auth/users/', data);
        return response.data;
    },

    async update(id: number, data: UserUpdate): Promise<User> {
        const response = await api.patch(`/auth/users/${id}/`, data);
        return response.data;
    },

    async delete(id: number): Promise<void> {
        await api.delete(`/auth/users/${id}/`);
    },
};
