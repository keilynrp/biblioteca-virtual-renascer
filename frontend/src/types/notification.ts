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
