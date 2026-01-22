import { useState, useEffect, useCallback } from 'react'
import { notificationsApi } from '@/services/notificationsApi'
import type { Notification } from '@/types/notification'

const POLLING_INTERVAL = 30000 // 30 seconds

export function useNotifications() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [isLoading, setIsLoading] = useState(true)

    // Fetch recent notifications
    const fetchNotifications = useCallback(async () => {
        try {
            const data = await notificationsApi.getRecent()
            setNotifications(data)
        } catch (error) {
            console.error('Error fetching notifications:', error)
        }
    }, [])

    // Fetch unread count
    const fetchUnreadCount = useCallback(async () => {
        try {
            const data = await notificationsApi.getUnreadCount()
            setUnreadCount(data.unread_count)
        } catch (error) {
            console.error('Error fetching unread count:', error)
        } finally {
            setIsLoading(false)
        }
    }, [])

    // Mark single notification as read
    const markAsRead = useCallback(async (id: number) => {
        try {
            await notificationsApi.markAsRead(id)

            // Update local state
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n)
            )
            setUnreadCount(prev => Math.max(0, prev - 1))
        } catch (error) {
            console.error('Error marking notification as read:', error)
        }
    }, [])

    // Mark all notifications as read
    const markAllAsRead = useCallback(async () => {
        try {
            await notificationsApi.markAllAsRead()

            // Update local state
            setNotifications(prev =>
                prev.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
            )
            setUnreadCount(0)
        } catch (error) {
            console.error('Error marking all as read:', error)
        }
    }, [])

    // Initial fetch
    useEffect(() => {
        fetchNotifications()
        fetchUnreadCount()
    }, [fetchNotifications, fetchUnreadCount])

    // Polling for unread count
    useEffect(() => {
        const interval = setInterval(() => {
            fetchUnreadCount()
        }, POLLING_INTERVAL)

        return () => clearInterval(interval)
    }, [fetchUnreadCount])

    return {
        notifications,
        unreadCount,
        isLoading,
        markAsRead,
        markAllAsRead,
        refresh: fetchNotifications
    }
}
