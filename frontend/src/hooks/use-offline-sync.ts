import { useState, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'

interface SyncItem {
    id: string
    type: 'bookmark' | 'annotation' | 'highlight'
    action: 'create' | 'update' | 'delete'
    data: Record<string, unknown>
    timestamp: number
}

export function useOfflineSync() {
    const [isOnline, setIsOnline] = useState(true)
    const [pendingSyncs, setPendingSyncs] = useState<SyncItem[]>([])
    const { toast } = useToast()

    // Load pending syncs from localStorage
    useEffect(() => {
        const stored = localStorage.getItem('pendingSyncs')
        if (stored) {
            try {
                setPendingSyncs(JSON.parse(stored))
            } catch (e) {
                console.error('Failed to parse pending syncs', e)
            }
        }
    }, [])

    // Update localStorage when pendingSyncs changes
    useEffect(() => {
        localStorage.setItem('pendingSyncs', JSON.stringify(pendingSyncs))
    }, [pendingSyncs])

    const syncData = async () => {
        if (pendingSyncs.length === 0) return

        toast({
            title: 'Sincronizando...',
            description: `Enviando ${pendingSyncs.length} cambios pendientes.`,
        })

        // Process sync items (Mock implementation for now)
        // In a real implementation, you would iterate and API call

        // Simulating sync success
        setTimeout(() => {
            setPendingSyncs([])
            localStorage.removeItem('pendingSyncs')
            toast({
                title: 'Sincronización completada',
                description: 'Tus datos están actualizados.',
                variant: 'success'
            })
        }, 2000)
    }

    // Monitor connectivity
    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true)
            if (pendingSyncs.length > 0) {
                syncData()
            }
        }
        const handleOffline = () => setIsOnline(false)

        if (typeof window !== 'undefined') {
            setIsOnline(navigator.onLine)
        }

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pendingSyncs])

    const saveOffline = (type: SyncItem['type'], action: SyncItem['action'], data: Record<string, unknown>) => {
        const newItem: SyncItem = {
            id: crypto.randomUUID(),
            type,
            action,
            data,
            timestamp: Date.now()
        }

        setPendingSyncs(prev => [...prev, newItem])

        toast({
            title: 'Guardado offline',
            description: 'Se sincronizará cuando recuperes conexión.',
        })
    }

    return {
        isOnline,
        pendingSyncs,
        saveOffline,
        syncData
    }
}
