"use client"

import { X, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { NotificationItem } from './notification-item'
import type { Notification } from '@/types/notification'

interface NotificationDropdownProps {
    notifications: Notification[]
    isLoading: boolean
    onMarkAsRead: (id: number) => void
    onMarkAllAsRead: () => void
    onClose: () => void
}

export function NotificationDropdown({
    notifications,
    isLoading,
    onMarkAsRead,
    onMarkAllAsRead,
    onClose
}: NotificationDropdownProps) {
    const hasUnread = notifications.some(n => !n.is_read)

    return (
        <div className="w-80 bg-background border border-border rounded-lg shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
                <h3 className="font-semibold text-lg">Notificaciones</h3>
                <div className="flex items-center gap-1">
                    {hasUnread && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onMarkAllAsRead}
                            className="h-8 text-xs"
                        >
                            <Check className="h-3 w-3 mr-1" />
                            Marcar todas
                        </Button>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="h-8 w-8"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Notifications List */}
            <ScrollArea className="h-[400px]">
                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                        <p className="text-muted-foreground text-sm">
                            No tienes notificaciones
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-border">
                        {notifications.map((notification) => (
                            <NotificationItem
                                key={notification.id}
                                notification={notification}
                                onMarkAsRead={onMarkAsRead}
                            />
                        ))}
                    </div>
                )}
            </ScrollArea>

            {/* Footer */}
            {notifications.length > 0 && (
                <div className="p-3 border-t border-border text-center">
                    <a
                        href="/notifications"
                        className="text-sm text-primary hover:underline"
                        onClick={onClose}
                    >
                        Ver todas las notificaciones
                    </a>
                </div>
            )}
        </div>
    )
}
