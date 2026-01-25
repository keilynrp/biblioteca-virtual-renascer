"use client"

import { PageHeader } from "@/components/page-header"
import { useNotifications } from "@/hooks/use-notifications"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Bell,
    Check,
    CheckCheck,
    Clock,
    Info,
    AlertTriangle,
    CheckCircle,
    X,
    Trash2
} from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

export default function NotificationsPage() {
    const {
        notifications,
        isLoading,
        unreadCount,
        markAllAsRead,
        markAsRead,
        deleteNotification
    } = useNotifications()

    const unreadNotifications = notifications.filter(n => !n.is_read)

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />
            case 'warning': return <AlertTriangle className="h-5 w-5 text-amber-500" />
            case 'error': return <X className="h-5 w-5 text-red-500" />
            default: return <Info className="h-5 w-5 text-blue-500" />
        }
    }

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-5 max-w-4xl">
                <PageHeader
                    title="Notificaciones"
                    description="Mantente al día con tu actividad"
                />
                <div className="space-y-4 mt-8">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-24 bg-muted/50 rounded-lg animate-pulse" />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-5 max-w-4xl">
            <PageHeader
                title="Notificaciones"
                description="Mantente al día con tu actividad"
                actions={
                    unreadCount > 0 && (
                        <Button onClick={() => markAllAsRead()} variant="outline" size="sm">
                            <CheckCheck className="mr-2 h-4 w-4" />
                            Marcar todo como leído
                        </Button>
                    )
                }
            />

            {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center border rounded-xl bg-card mt-8">
                    <div className="rounded-full bg-muted p-6 mb-4">
                        <Bell className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No tienes notificaciones</h3>
                    <p className="text-muted-foreground">
                        Te avisaremos cuando haya novedades importantes
                    </p>
                </div>
            ) : (
                <Tabs defaultValue="all" className="mt-8">
                    <TabsList>
                        <TabsTrigger value="all" className="relative">
                            Todas
                            <span className="ml-2 bg-muted px-2 py-0.5 rounded-full text-xs">
                                {notifications.length}
                            </span>
                        </TabsTrigger>
                        <TabsTrigger value="unread">
                            No leídas
                            {unreadCount > 0 && (
                                <span className="ml-2 bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-bold">
                                    {unreadCount}
                                </span>
                            )}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="all" className="space-y-4 mt-4">
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={cn(
                                    "flex gap-4 p-4 rounded-xl border transition-all hover:bg-muted/30",
                                    !notification.is_read ? "bg-primary/5 border-primary/20" : "bg-card border-border"
                                )}
                            >
                                <div className="flex-shrink-0 mt-1">
                                    {getIcon(notification.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <h4 className={cn("font-medium", !notification.is_read && "text-primary")}>
                                                {notification.title}
                                            </h4>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {notification.message}
                                            </p>
                                        </div>
                                        <div className="flex items-center text-xs text-muted-foreground whitespace-nowrap">
                                            <Clock className="h-3 w-3 mr-1" />
                                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: es })}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    {!notification.is_read && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => markAsRead(notification.id)}
                                            title="Marcar como leída"
                                            className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                                        >
                                            <Check className="h-4 w-4" />
                                        </Button>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => deleteNotification(notification.id)}
                                        title="Eliminar"
                                        className="h-8 w-8 hover:bg-red-100 hover:text-red-500"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </TabsContent>

                    <TabsContent value="unread" className="space-y-4 mt-4">
                        {unreadNotifications.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                ¡Estás al día! No tienes notificaciones sin leer.
                            </div>
                        ) : (
                            unreadNotifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className="flex gap-4 p-4 rounded-xl border bg-primary/5 border-primary/20 transition-all hover:bg-primary/10"
                                >
                                    <div className="flex-shrink-0 mt-1">
                                        {getIcon(notification.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <h4 className="font-medium text-primary">
                                                    {notification.title}
                                                </h4>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {notification.message}
                                                </p>
                                            </div>
                                            <div className="flex items-center text-xs text-muted-foreground whitespace-nowrap">
                                                <Clock className="h-3 w-3 mr-1" />
                                                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: es })}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => markAsRead(notification.id)}
                                            title="Marcar como leída"
                                            className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                                        >
                                            <Check className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </TabsContent>
                </Tabs>
            )}
        </div>
    )
}
