import axios, { AxiosError } from 'axios';
import { toast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/authStore';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
});

// Obtener el store fuera de React (para usar en interceptores)
let getAuthState: (() => ReturnType<typeof useAuthStore.getState>) | null = null;

if (typeof window !== 'undefined') {
    getAuthState = () => useAuthStore.getState();
}

// Request interceptor to add token from Zustand
api.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined' && getAuthState) {
            const { accessToken } = getAuthState();
            if (accessToken) {
                config.headers.Authorization = `Bearer ${accessToken}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh and errors
api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<{ error?: { message?: string }; detail?: string }>) => {
        const originalRequest = error.config as typeof error.config & { _retry?: boolean };

        // If error is 401 and we haven't tried to refresh yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            if (typeof window !== 'undefined' && getAuthState) {
                const state = getAuthState();
                const { refreshToken, user } = state;

                if (refreshToken) {
                    try {
                        const response = await axios.post(
                            `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/auth/refresh/`,
                            { refresh: refreshToken }
                        );

                        const { access } = response.data;

                        // Actualizar solo el accessToken en Zustand
                        // Usamos el método login existente con los datos actuales
                        if (user) {
                            state.login(user, access, refreshToken);
                        }

                        // Retry original request with new token
                        originalRequest.headers.Authorization = `Bearer ${access}`;
                        return api(originalRequest);
                    } catch (refreshError) {
                        // Refresh failed, logout usando Zustand
                        state.logout();

                        // Redirigir al login
                        if (typeof window !== 'undefined') {
                            window.location.href = '/login';
                        }
                        return Promise.reject(refreshError);
                    }
                } else {
                    // No hay refresh token, logout
                    state.logout();
                    if (typeof window !== 'undefined') {
                        window.location.href = '/login';
                    }
                }
            }
        }

        return Promise.reject(error);
    }
);

// Utility function to extract error message
export function getErrorMessage(error: unknown): string {
    if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ error?: { message?: string }; detail?: string; message?: string; [key: string]: unknown }>;

        // Check for standardized error format from backend
        if (axiosError.response?.data?.error) {
            return axiosError.response.data.error.message || 'Ocurrió un error';
        }

        // Check for common error formats
        if (axiosError.response?.data?.detail) {
            return axiosError.response.data.detail;
        }

        if (axiosError.response?.data?.message) {
            return axiosError.response.data.message;
        }

        // Field-specific errors
        if (axiosError.response?.data) {
            const data = axiosError.response.data;
            const firstKey = Object.keys(data)[0];
            if (firstKey && Array.isArray(data[firstKey])) {
                return data[firstKey][0];
            }
        }

        // Network errors
        if (axiosError.message === 'Network Error') {
            return 'Error de red. Verifica tu conexión a internet.';
        }

        // Status code based messages
        if (axiosError.response?.status) {
            const status = axiosError.response.status;
            if (status >= 500) {
                return 'Error del servidor. Intenta nuevamente más tarde.';
            }
            if (status === 404) {
                return 'Recurso no encontrado.';
            }
            if (status === 403) {
                return 'No tienes permisos para realizar esta acción.';
            }
        }

        return axiosError.message || 'Ocurrió un error inesperado';
    }

    if (error instanceof Error) {
        return error.message;
    }

    return 'Ocurrió un error inesperado';
}

// Utility function to handle API errors with toast
export function handleApiError(error: unknown, customMessage?: string) {
    const message = customMessage || getErrorMessage(error);

    toast({
        variant: 'error',
        title: 'Error',
        description: message,
    });
}

// Utility function to show success toast
export function showSuccess(message: string, title = 'Éxito') {
    toast({
        variant: 'success',
        title,
        description: message,
    });
}

export default api;
