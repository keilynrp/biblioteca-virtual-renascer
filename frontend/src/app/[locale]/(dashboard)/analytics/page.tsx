"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { analyticsApi, UserStats } from "@/services/analyticsApi"
import { UserStatsCharts } from "@/components/analytics/UserStatsCharts"
import { PageHeader } from "@/components/page-header"
import { StatsCard } from "@/components/stats-card"
import { BookOpen, Clock, Zap, Target, Download, Flame, FileText } from "lucide-react"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"

export default function AnalyticsPage() {
    const t = useTranslations("AnalyticsPage")
    const [stats, setStats] = useState<UserStats | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadStats() {
            try {
                const data = await analyticsApi.getUserStats()
                setStats(data)
            } catch (error) {
                console.error("Error loading analytics:", error)
            } finally {
                setLoading(false)
            }
        }
        loadStats()
    }, [])

    const handleExport = async () => {
        try {
            const response = await api.get('/analytics/export_report/', { responseType: 'blob' })
            const url = window.URL.createObjectURL(new Blob([response.data]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', 'user_activity.csv')
            document.body.appendChild(link)
            link.click()
            link.remove()
        } catch (error) {
            console.error("Error exporting report:", error)
        }
    }

    if (loading || !stats) {
        return <div className="p-6">Authorizing...</div>
    }

    const cards = [
        {
            title: "Total Leído",
            value: `${(stats.total_reading_time / 60).toFixed(1)} h`,
            icon: Clock,
            description: "tiempo total dedicado"
        },
        {
            title: "Libros Completados",
            value: stats.books_completed,
            icon: BookOpen,
            description: "libros terminados"
        },
        {
            title: "Racha Actual",
            value: `${stats.streak_days} días`,
            icon: Flame,
            description: "días consecutivos"
        },
        {
            title: "Páginas Leídas",
            value: stats.pages_read,
            icon: FileText,
            description: "total estimado"
        }
    ]

    return (
        <div className="p-6 space-y-6">
            <PageHeader
                title="Mis Estadísticas"
                description="Analiza tu progreso y hábitos de lectura"
                actions={
                    <Button onClick={handleExport} variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Exportar Reporte
                    </Button>
                }
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card, i) => (
                    <StatsCard key={i} {...card} />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <UserStatsCharts stats={stats} />
                </div>
                {/* Placeholder for future detailed breakdown or heatmap */}
                <div className="bg-card rounded-xl border p-6">
                    <h3 className="font-semibold mb-4">Próximos Logros</h3>
                    <div className="text-muted-foreground text-sm">
                        Sistema de gamificación próximamente...
                    </div>
                </div>
            </div>
        </div>
    )
}
