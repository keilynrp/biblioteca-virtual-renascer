import api from '@/lib/api'
import type { Notification, NotificationUnreadCount } from '@/types/notification'

const BASE_URL = '/notifications'

export const notificationsApi = {
    /**
     * Get paginated list of notifications
     */
    getNotifications: async (page = 1, pageSize = 10) => {
        const response = await api.get<{
            count: number
            results: Notification[]
        }>(`${BASE_URL}/`, {
            params: { page, page_size: pageSize }
        })
        return response.data
    },

    /**
     * Get recent notifications (last 10)
     */
    getRecent: async () => {
        const response = await api.get<Notification[]>(`${BASE_URL}/recent/`)
        return response.data
    },

    /**
     * Get unread notifications count (for polling)
     */
    getUnreadCount: async () => {
        const response = await api.get<NotificationUnreadCount>(`${BASE_URL}/unread_count/`)
        return response.data
    },

    /**
     * Mark a single notification as read
     */
    markAsRead: async (id: number) => {
        const response = await api.patch<Notification>(`${BASE_URL}/${id}/mark_read/`)
        return response.data
    },

    /**
     * Mark all notifications as read
     */
    markAllAsRead: async () => {
        const response = await api.post<{ message: string; count: number }>(`${BASE_URL}/mark_all_read/`)
        return response.data
    },

    /**
     * Delete a notification
     */
    deleteNotification: async (id: number) => {
        await api.delete(`${BASE_URL}/${id}/`)
    }
}
