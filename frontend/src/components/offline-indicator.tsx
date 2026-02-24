'use client'

import { useState, useEffect } from 'react'
import { WifiOff, RefreshCw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useOfflineSync } from '@/hooks/use-offline-sync'

export function OfflineIndicator() {
    const [isOffline, setIsOffline] = useState(false)
    const { pendingSyncs, syncData } = useOfflineSync()
    const [syncing, setSyncing] = useState(false)

    useEffect(() => {
        const handleOnline  = () => setIsOffline(false)
        const handleOffline = () => setIsOffline(true)

        if (typeof window !== 'undefined') {
            setIsOffline(!navigator.onLine)
        }

        window.addEventListener('online',  handleOnline)
        window.addEventListener('offline', handleOffline)

        return () => {
            window.removeEventListener('online',  handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [])

    const handleManualSync = async () => {
        if (syncing) return
        setSyncing(true)
        await syncData()
        setSyncing(false)
    }

    const showBanner = isOffline || pendingSyncs.length > 0

    return (
        <AnimatePresence>
            {showBanner && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`w-full text-center py-1 px-4 text-sm font-medium flex items-center justify-center gap-2 top-0 z-50 sticky ${
                        isOffline
                            ? 'bg-destructive text-destructive-foreground'
                            : 'bg-yellow-500 text-yellow-950'
                    }`}
                >
                    <WifiOff className="h-4 w-4 shrink-0" />

                    {isOffline ? (
                        <>
                            Estás sin conexión.
                            {pendingSyncs.length > 0 && (
                                <span className="opacity-80">
                                    {pendingSyncs.length} cambio{pendingSyncs.length !== 1 ? 's' : ''} pendiente{pendingSyncs.length !== 1 ? 's' : ''}.
                                </span>
                            )}
                        </>
                    ) : (
                        <>
                            <span>
                                {pendingSyncs.length} cambio{pendingSyncs.length !== 1 ? 's' : ''} sin sincronizar.
                            </span>
                            <button
                                onClick={handleManualSync}
                                disabled={syncing}
                                className="flex items-center gap-1 underline underline-offset-2 hover:no-underline disabled:opacity-50"
                            >
                                <RefreshCw className={`h-3 w-3 ${syncing ? 'animate-spin' : ''}`} />
                                {syncing ? 'Sincronizando...' : 'Sincronizar ahora'}
                            </button>
                        </>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    )
}
