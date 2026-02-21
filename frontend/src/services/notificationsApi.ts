import api from '@/lib/api'
import type { Notification, NotificationUnreadCount } from '@/types/notification'

export interface AdminNotification {
    id: number; user: number; username: string; user_email: string
    type: string; type_display: string; title: string; message: string
    link: string | null; is_read: boolean; is_emailed: boolean
    metadata: Record<string, unknown>; created_at: string; read_at: string | null
}
export interface AdminNotificationCreate {
    user?: number; type: string; title: string; message: string
    link?: string; send_to_all?: boolean; send_email?: boolean
}
export interface AdminNotificationStats {
    total: number; unread: number; emailed: number
    by_type: { type: string; count: number }[]
}

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
    },

    admin: {
        list: (params?: { type?: string; is_read?: string; search?: string; page?: number; page_size?: number }) =>
            api.get<{ count: number; results: AdminNotification[] }>(`${BASE_URL}/admin/`, { params }).then(r => r.data),
        create: (data: AdminNotificationCreate) =>
            api.post(`${BASE_URL}/admin/`, data).then(r => r.data),
        delete: (id: number) =>
            api.delete(`${BASE_URL}/admin/${id}/`),
        bulkDelete: (ids: number[]) =>
            api.post<{ deleted: number }>(`${BASE_URL}/admin/bulk_delete/`, { ids }).then(r => r.data),
        stats: () =>
            api.get<AdminNotificationStats>(`${BASE_URL}/admin/stats/`).then(r => r.data),
    },
}
