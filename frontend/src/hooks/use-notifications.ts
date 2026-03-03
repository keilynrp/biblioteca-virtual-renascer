import { useState, useEffect, useCallback, useRef } from 'react'
import { notificationsApi } from '@/services/notificationsApi'
import type { Notification } from '@/types/notification'
import { isImportantNotification } from '@/types/notification'
import { useToast } from '@/hooks/use-toast'

const POLLING_INTERVAL = 30000 // 30 seconds

export function useNotifications() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const { toast } = useToast()

    const initialized = useRef(false)
    const knownNotificationIds = useRef<Set<number>>(new Set())

    // Fetch recent notifications
    const fetchNotifications = useCallback(async () => {
        try {
            const data = await notificationsApi.getRecent()

            data.forEach(n => {
                if (
                    initialized.current &&
                    !knownNotificationIds.current.has(n.id) &&
                    !n.is_read &&
                    isImportantNotification(n.type)
                ) {
                    toast({
                        title: "Aviso Importante",
                        description: n.title,
                        variant: "destructive",
                    })
                }
                knownNotificationIds.current.add(n.id)
            })

            initialized.current = true
            setNotifications(data)
        } catch (error) {
            console.error('Error fetching notifications:', error)
        }
    }, [toast])

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

    // Delete a notification
    const deleteNotification = useCallback(async (id: number) => {
        try {
            await notificationsApi.deleteNotification(id)

            // Update local state
            const notificationToDelete = notifications.find(n => n.id === id)
            setNotifications(prev => prev.filter(n => n.id !== id))

            // Update unread count if the deleted notification was unread
            if (notificationToDelete && !notificationToDelete.is_read) {
                setUnreadCount(prev => Math.max(0, prev - 1))
            }
        } catch (error) {
            console.error('Error deleting notification:', error)
        }
    }, [notifications])

    // Initial fetch
    useEffect(() => {
        fetchNotifications()
        fetchUnreadCount()
    }, [fetchNotifications, fetchUnreadCount])

    // Polling for unread count and new notifications
    useEffect(() => {
        const interval = setInterval(() => {
            fetchNotifications()
            fetchUnreadCount()
        }, POLLING_INTERVAL)

        return () => clearInterval(interval)
    }, [fetchNotifications, fetchUnreadCount])

    return {
        notifications,
        unreadCount,
        isLoading,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        refresh: fetchNotifications
    }
}
