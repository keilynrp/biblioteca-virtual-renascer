"use client"

import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface NotificationBellProps {
    unreadCount: number
    onClick: () => void
    className?: string
}

export function NotificationBell({ unreadCount, onClick, className }: NotificationBellProps) {
    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={onClick}
            className={cn("relative", className)}
            aria-label="Notificaciones"
        >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {unreadCount > 9 ? '9+' : unreadCount}
                </span>
            )}
        </Button>
    )
}
