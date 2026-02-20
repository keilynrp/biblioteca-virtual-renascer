import api from '@/lib/api'

export interface UserStats {
    total_reading_time: number
    books_completed: number
    books_reading: number
    pages_read: number
    streak_days: number
}

export const analyticsApi = {
    getUserStats: async (): Promise<UserStats> => {
        const response = await api.get('/analytics/user_stats/')
        return response.data
    },

    trackAction: async (action: string, details: Record<string, any> = {}) => {
        return api.post('/analytics/track_action/', { action, details })
    }
}
