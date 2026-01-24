"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { PageHeader } from "@/components/page-header"
import { InstitutionalAnalyticsPanel } from "@/components/admin/institutional-analytics-panel"
import api from "@/lib/api"
import { Loader2, Shield, TrendingUp } from "lucide-react"

export default function InstitutionalAnalyticsPage() {
    const router = useRouter()
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        checkAuthorization()
    }, [])

    const checkAuthorization = async () => {
        try {
            // Verificar si el usuario tiene acceso a analíticas institucionales
            await api.get('/content/institutions/analytics/')
            setIsAuthorized(true)
        } catch (error) {
            setIsAuthorized(false)
            // Redirigir al dashboard si no está autorizado
            setTimeout(() => router.push('/home'), 2000)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!isAuthorized) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <Shield className="h-16 w-16 text-destructive" />
                <h1 className="text-2xl font-bold text-destructive">Acceso Denegado</h1>
                <p className="text-muted-foreground">No tienes permisos para ver las analíticas institucionales</p>
                <p className="text-sm text-muted-foreground">Redirigiendo...</p>
            </div>
        )
    }

    return (
        <div className="p-6 space-y-8">
            <PageHeader
                title="Analíticas Institucionales"
                description="Métricas de lectura y participación de tu institución"
            />

            <InstitutionalAnalyticsPanel />
        </div>
    )
}
