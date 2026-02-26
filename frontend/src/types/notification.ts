export interface Notification {
    id: number
    type: string
    type_display: string
    title: string
    message: string
    link: string | null
    is_read: boolean
    is_emailed: boolean
    metadata: Record<string, unknown>
    created_at: string
    read_at: string | null
}

export interface NotificationUnreadCount {
    unread_count: number
}

// Map of notification types that are considered high-priority
export const IMPORTANT_NOTIFICATION_TYPES = [
    'loan_expiring',
    'subscription_expiring',
    'admin_announcement',
    'trial_expiring'
]

export const isImportantNotification = (type: string): boolean => {
    return IMPORTANT_NOTIFICATION_TYPES.includes(type)
}
