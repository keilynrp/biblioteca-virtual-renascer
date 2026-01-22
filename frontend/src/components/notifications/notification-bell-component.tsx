"use client"

import { useState } from 'react'
import { useNotifications } from '@/hooks/use-notifications'
import { NotificationBell } from '@/components/notifications/notification-bell'
import { NotificationDropdown } from '@/components/notifications/notification-dropdown'

export function NotificationBellComponent() {
    const [isOpen, setIsOpen] = useState(false)
    const {
        notifications,
        unreadCount,
        isLoading,
        markAsRead,
        markAllAsRead
    } = useNotifications()

    return (
        <div className="relative">
            <NotificationBell
                unreadCount={unreadCount}
                onClick={() => setIsOpen(!isOpen)}
                className="relative rounded-xl hover:bg-muted/80 transition-all duration-300 hover:scale-110 active:scale-95"
            />

            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Dropdown */}
                    <div className="absolute right-0 top-full mt-2 z-50">
                        <NotificationDropdown
                            notifications={notifications}
                            isLoading={isLoading}
                            onMarkAsRead={markAsRead}
                            onMarkAllAsRead={markAllAsRead}
                            onClose={() => setIsOpen(false)}
                        />
                    </div>
                </>
            )}
        </div>
    )
}
