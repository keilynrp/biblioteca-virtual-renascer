import { WifiOff, BookOpen, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function OfflinePage() {
    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
            <div className="text-center max-w-md">
                {/* Icon */}
                <div className="relative mx-auto mb-8 w-24 h-24">
                    <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-pulse" />
                    <div className="relative flex items-center justify-center w-24 h-24 bg-slate-800 rounded-full border border-slate-700">
                        <WifiOff className="h-10 w-10 text-blue-400" />
                    </div>
                </div>

                {/* Logo */}
                <div className="flex items-center justify-center gap-2 mb-6">
                    <BookOpen className="h-6 w-6 text-blue-400" />
                    <span className="text-lg font-semibold text-white">BVS Renascer</span>
                </div>

                {/* Message */}
                <h1 className="text-2xl font-bold text-white mb-3">
                    Sin conexión a internet
                </h1>
                <p className="text-slate-400 mb-8">
                    No hay conexión disponible. Las páginas que visitaste recientemente
                    pueden seguir siendo accesibles. Los cambios que realices se
                    sincronizarán automáticamente al recuperar la conexión.
                </p>

                {/* Action */}
                <Button
                    onClick={() => window.location.reload()}
                    variant="outline"
                    className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white gap-2"
                >
                    <RefreshCw className="h-4 w-4" />
                    Intentar de nuevo
                </Button>
            </div>
        </div>
    )
}

export const metadata = {
    title: 'Sin conexión — BVS Renascer',
}
