"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

export default function SiteSettingsError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error("[SiteSettings] Error boundary:", error)
    }, [error])

    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 p-6">
            <AlertTriangle className="h-10 w-10 text-destructive" />
            <h2 className="text-lg font-semibold">Error en Ajustes del Sitio</h2>
            <p className="text-sm text-muted-foreground text-center max-w-md">
                {error.message || "Ocurrió un error inesperado."}
            </p>
            {error.digest && (
                <code className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                    Digest: {error.digest}
                </code>
            )}
            <Button onClick={reset} variant="outline">
                Intentar de nuevo
            </Button>
        </div>
    )
}
