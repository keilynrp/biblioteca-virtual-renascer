"use client"

import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { Bell, BookOpen, Star, Package, Megaphone, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Notification } from '@/types/notification'

export interface NotificationItemProps {
    notification: Notification
    onMarkAsRead: (id: number) => void
}

export function NotificationItem({ notification, onMarkAsRead }: NotificationItemProps) {
    const handleClick = () => {
        if (!notification.is_read) {
            onMarkAsRead(notification.id)
        }

        // Navigate to link if exists
        if (notification.link) {
            window.location.href = notification.link
        }
    }

    const getIcon = () => {
        switch (notification.type) {
            case 'book_available':
                return <BookOpen className="h-5 w-5 text-green-500" />
            case 'new_review':
                return <Star className="h-5 w-5 text-yellow-500" />
            case 'subscription_expiring':
                return <Package className="h-5 w-5 text-orange-500" />
            case 'admin_announcement':
                return <Megaphone className="h-5 w-5 text-blue-500" />
            case 'book_recommendation':
                return <Sparkles className="h-5 w-5 text-purple-500" />
            default:
                return <Bell className="h-5 w-5 text-gray-500" />
        }
    }

    return (
        <button
            onClick={handleClick}
            className={cn(
                "w-full flex gap-3 p-3 text-left transition-colors hover:bg-muted",
                !notification.is_read && "bg-primary/5"
            )}
        >
            <div className="flex-shrink-0 mt-1">
                {getIcon()}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                    <h4 className={cn(
                        "text-sm",
                        !notification.is_read && "font-semibold"
                    )}>
                        {notification.title}
                    </h4>
                    {!notification.is_read && (
                        <span className="flex h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                    )}
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {notification.message}
                </p>

                <span className="text-xs text-muted-foreground mt-1 block">
                    {formatDistanceToNow(new Date(notification.created_at), {
                        addSuffix: true,
                        locale: es
                    })}
                </span>
            </div>
        </button>
    )
}
