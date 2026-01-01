import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface User {
    username: string;
    email: string;
    user_type: string;
    avatar?: string;
}

interface AuthState {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    _hasHydrated: boolean;
    login: (user: User, accessToken: string, refreshToken: string) => void;
    logout: () => void;
    setHasHydrated: (state: boolean) => void;
}

const useAuthStoreBase = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            _hasHydrated: false,

            login: (user, accessToken, refreshToken) => {
                set({
                    user,
                    accessToken,
                    refreshToken,
                    isAuthenticated: true
                });
            },

            logout: () => {
                set({
                    user: null,
                    accessToken: null,
                    refreshToken: null,
                    isAuthenticated: false
                });
            },

            setHasHydrated: (state) => {
                set({ _hasHydrated: state });
            },
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => {
                // Protección SSR: solo usar localStorage en el cliente
                if (typeof window === 'undefined') {
                    return {
                        getItem: () => null,
                        setItem: () => {},
                        removeItem: () => {},
                    };
                }
                return localStorage;
            }),
            onRehydrateStorage: () => (state) => {
                // Marcar como hidratado cuando termine la rehidratación
                state?.setHasHydrated(true);
            },
            partialize: (state) => ({
                // Solo persistir estos campos
                user: state.user,
                accessToken: state.accessToken,
                refreshToken: state.refreshToken,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);

export const useAuthStore = useAuthStoreBase;

/**
 * Hook que espera a que el store esté hidratado antes de devolver datos persistentes
 * Útil para prevenir errores de hidratación en componentes que dependen del estado de autenticación
 */
export const useAuthStoreHydrated = () => {
    const store = useAuthStore();

    // Si no está hidratado, devolver estado inicial seguro
    if (!store._hasHydrated) {
        return {
            ...store,
            isAuthenticated: false,
            user: null,
            accessToken: null,
            refreshToken: null,
        };
    }

    return store;
};
