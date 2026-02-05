"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { PageHeader } from "@/components/page-header"
import { BookImportPanel } from "@/components/admin/book-import-panel"
import { ImportStatsPanel } from "@/components/admin/import-stats-panel"
import api from "@/lib/api"
import { Loader2, Shield } from "lucide-react"

export default function AdminPage() {
    const router = useRouter()
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        checkAdminStatus()
    }, [])

    const checkAdminStatus = async () => {
        try {
            // Verificar si el usuario es admin intentando acceder a las estadísticas
            await api.get('/content/admin/import-stats/')
            setIsAdmin(true)
        } catch (error) {
            setIsAdmin(false)
            // Redirigir al dashboard si no es admin
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

    if (!isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <Shield className="h-16 w-16 text-destructive" />
                <h1 className="text-2xl font-bold text-destructive">Acceso Denegado</h1>
                <p className="text-muted-foreground">No tienes permisos de administrador</p>
                <p className="text-sm text-muted-foreground">Redirigiendo...</p>
            </div>
        )
    }

    return (
        <div className="px-6 py-5 space-y-8">
            <PageHeader
                title="Panel de Administración"
                description="Gestiona la importación de libros y configura la biblioteca"
            />

            {/* Estadísticas */}
            <ImportStatsPanel />

            {/* Panel de Importación */}
            <BookImportPanel />
        </div>
    )
}
