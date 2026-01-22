'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Download, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function InstallPwaPrompt() {
    const [installPrompt, setInstallPrompt] = useState<any>(null)
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const handleBeforeInstallPrompt = (e: any) => {
            // Prevent Chrome 67 and earlier from automatically showing the prompt
            e.preventDefault()
            // Stash the event so it can be triggered later.
            setInstallPrompt(e)
            // Show the UI to notify the user they can add to home screen
            setIsVisible(true)
        }

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
        }
    }, [])

    const handleInstallClick = async () => {
        if (!installPrompt) return

        // Show the install prompt
        installPrompt.prompt()

        // Wait for the user to respond to the prompt
        const { outcome } = await installPrompt.userChoice

        if (outcome === 'accepted') {
            console.log('User accepted the A2HS prompt')
        } else {
            console.log('User dismissed the A2HS prompt')
        }

        // We no longer need the prompt. Clear it
        setInstallPrompt(null)
        setIsVisible(false)
    }

    if (!isVisible) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-primary text-primary-foreground p-4 rounded-lg shadow-lg z-50 flex flex-col gap-3"
            >
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                            <Download className="h-5 w-5" />
                            Instalar Aplicación
                        </h3>
                        <p className="text-sm opacity-90 mt-1">
                            Instala BVS Renascer en tu dispositivo para un acceso más rápido y lectura offline.
                        </p>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-primary-foreground hover:bg-primary-foreground/20"
                        onClick={() => setIsVisible(false)}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
                <div className="flex gap-2 justify-end">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setIsVisible(false)}
                    >
                        Quizás luego
                    </Button>
                    <Button
                        variant="default"
                        size="sm"
                        className="bg-white text-primary hover:bg-white/90"
                        onClick={handleInstallClick}
                    >
                        Instalar
                    </Button>
                </div>
            </motion.div>
        </AnimatePresence>
    )
}
