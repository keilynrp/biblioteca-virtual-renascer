import api from '../api';

export interface Institution {
    id: number;
    name: string;
    code: string;
    logo?: string;
    website?: string;
    address?: string;
}

export interface InstitutionCreate {
    name: string;
    code: string;
    logo?: File | string;
    website?: string;
    address?: string;
}

export const institutionsApi = {
    async getAll(): Promise<Institution[]> {
        const response = await api.get('/institutions/');
        // Handle both direct array and paginated object responses
        const data = response.data;
        return Array.isArray(data) ? data : (data.results || []);
    },

    async getById(id: number): Promise<Institution> {
        const response = await api.get(`/institutions/${id}/`);
        return response.data;
    },

    async create(data: InstitutionCreate): Promise<Institution> {
        const response = await api.post('/institutions/', data);
        return response.data;
    },

    async update(id: number, data: Partial<InstitutionCreate>): Promise<Institution> {
        const response = await api.patch(`/institutions/${id}/`, data);
        return response.data;
    },

    async delete(id: number): Promise<void> {
        await api.delete(`/institutions/${id}/`);
    },
};
