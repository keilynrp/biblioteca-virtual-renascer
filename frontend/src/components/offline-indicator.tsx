'use client'

import { useState, useEffect } from 'react'
import { WifiOff } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function OfflineIndicator() {
    const [isOffline, setIsOffline] = useState(false)

    useEffect(() => {
        const handleOnline = () => setIsOffline(false)
        const handleOffline = () => setIsOffline(true)

        // Initial check
        if (typeof window !== 'undefined') {
            setIsOffline(!navigator.onLine)
        }

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [])

    if (!isOffline) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-destructive text-destructive-foreground w-full text-center py-1 px-4 text-sm font-medium flex items-center justify-center gap-2 top-0 z-50 sticky"
            >
                <WifiOff className="h-4 w-4" />
                Estás navegando sin conexión. Algunas funciones pueden estar limitadas.
            </motion.div>
        </AnimatePresence>
    )
}
