"use client"

import { useEffect, useState } from "react"
import { StatsCard } from "@/components/stats-card"
import { Users, Clock, BookOpen, BarChart2, Loader2 } from "lucide-react"
import api, { handleApiError } from "@/lib/api"
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar
} from "recharts"

interface InstitutionalStats {
    total_users: number
    total_reading_hours: number
    books_borrowed: number
    reading_activity: Array<{
        date: string
        hours: number
        count: number
    }>
}

export function InstitutionalAnalyticsPanel() {
    const [stats, setStats] = useState<InstitutionalStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchInstitutionalStats()
    }, [])

    const fetchInstitutionalStats = async () => {
        try {
            setLoading(true)
            const response = await api.get('/content/institutions/analytics/')
            setStats(response.data)
        } catch (err) {
            console.error('Error fetching institutional stats:', err)
            setError('Error al cargar estadísticas institucionales')
            handleApiError(err)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (error || !stats) {
        return (
            <div className="p-6 text-center text-destructive">
                {error || 'No se pudieron cargar los datos'}
            </div>
        )
    }

    const cards = [
        {
            title: "Usuarios de la Institución",
            value: stats.total_users,
            icon: Users,
            description: "Total de miembros registrados"
        },
        {
            title: "Horas de Lectura",
            value: stats.total_reading_hours,
            icon: Clock,
            description: "Tiempo total acumulado"
        },
        {
            title: "Libros Prestados",
            value: stats.books_borrowed,
            icon: BookOpen,
            description: "Total de préstamos realizados"
        }
    ]

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {cards.map((card, index) => (
                    <StatsCard key={index} {...card} trend="up" change={0} />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Reading Hours Activity */}
                <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-6">
                        <BarChart2 className="h-5 w-5 text-primary" />
                        <h3 className="font-bold text-lg">Actividad de Lectura (Horas)</h3>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={stats.reading_activity}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                <XAxis
                                    dataKey="date"
                                    stroke="hsl(var(--muted-foreground))"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="hsl(var(--muted-foreground))"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `${value}h`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--card))',
                                        borderColor: 'hsl(var(--border))',
                                        borderRadius: '8px',
                                        color: 'hsl(var(--foreground))'
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="hours"
                                    stroke="hsl(var(--primary))"
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: 'hsl(var(--primary))', strokeWidth: 2, stroke: 'hsl(var(--card))' }}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Daily Engagement (Préstamos) */}
                <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-6">
                        <BarChart2 className="h-5 w-5 text-secondary" />
                        <h3 className="font-bold text-lg">Interacción Diaria (Préstamos)</h3>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.reading_activity}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                <XAxis
                                    dataKey="date"
                                    stroke="hsl(var(--muted-foreground))"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="hsl(var(--muted-foreground))"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--card))',
                                        borderColor: 'hsl(var(--border))',
                                        borderRadius: '8px',
                                        color: 'hsl(var(--foreground))'
                                    }}
                                />
                                <Bar
                                    dataKey="count"
                                    fill="hsl(var(--secondary))"
                                    radius={[4, 4, 0, 0]}
                                    maxBarSize={40}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    )
}
