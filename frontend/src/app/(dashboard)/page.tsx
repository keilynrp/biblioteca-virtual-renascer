"use client"

import { PageHeader } from "@/components/page-header"
import { StatsCard } from "@/components/stats-card"
import { BookOpen, Users, TrendingUp, Award, Clock, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useEffect, useState, useMemo, memo, useCallback } from "react"
import api, { handleApiError } from "@/lib/api"
import { DashboardSkeleton } from "@/components/dashboard-skeleton"

interface DashboardStats {
    total_books: number
    total_users: number
    average_rating: number
    books_borrowed: number
    recent_books: Array<{
        id: number
        title: string
        author: { name: string }
        slug: string
        is_premium: boolean
    }>
    top_categories: Array<{
        name: string
        book_count: number
    }>
}

// Memoized book item component
const BookItem = memo(({ book }: { book: DashboardStats['recent_books'][0] }) => (
    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors">
        <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary-dark/20 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
                <p className="font-medium text-foreground">{book.title}</p>
                <p className="text-sm text-muted-foreground">{book.author?.name || 'Autor desconocido'}</p>
            </div>
        </div>
        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
            book.is_premium ? "bg-warning/10 text-warning" : "bg-success/10 text-success"
        }`}>
            {book.is_premium ? 'Premium' : 'Disponible'}
        </span>
    </div>
))

BookItem.displayName = 'BookItem'

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchStats = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await api.get('/content/dashboard/stats/')
            setStats(response.data)
        } catch (err) {
            console.error('Error fetching dashboard stats:', err)
            setError('Error al cargar estadísticas')
            handleApiError(err)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchStats()
    }, [fetchStats])

    if (loading) {
        return <DashboardSkeleton />
    }

    // Memoize stats cards to avoid recalculation on re-renders
    const statsCards = useMemo(() => {
        if (!stats) return []

        return [
            {
                title: "Total de Libros",
                value: stats.total_books.toLocaleString(),
                change: 0,
                trend: "up" as const,
                icon: BookOpen,
                description: "en la biblioteca"
            },
            {
                title: "Usuarios Activos",
                value: stats.total_users.toLocaleString(),
                change: 0,
                trend: "up" as const,
                icon: Users,
                description: "registrados"
            },
            {
                title: "Libros Prestados",
                value: stats.books_borrowed.toLocaleString(),
                change: 0,
                trend: "up" as const,
                icon: TrendingUp,
                description: "este mes"
            },
            {
                title: "Calificación Promedio",
                value: stats.average_rating.toString(),
                change: 0,
                trend: "up" as const,
                icon: Star,
                description: "de 5 estrellas"
            }
        ]
    }, [stats])

    if (error || !stats) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center space-y-4">
                    <p className="text-destructive">{error || 'Error al cargar datos'}</p>
                    <Button onClick={fetchStats}>Reintentar</Button>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <PageHeader
                title="Dashboard"
                description="Bienvenido a tu biblioteca virtual"
                actions={
                    <Link href="/library">
                        <Button className="bg-gradient-to-r from-primary to-primary-dark hover:shadow-lg hover:shadow-primary/30 transition-all">
                            <BookOpen className="mr-2 h-4 w-4" />
                            Explorar Biblioteca
                        </Button>
                    </Link>
                }
            />

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statsCards.map((stat, index) => (
                    <StatsCard key={index} {...stat} />
                ))}
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Books */}
                <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-foreground">Libros Recientes</h2>
                        <Link href="/library">
                            <Button variant="ghost" size="sm" className="text-primary hover:text-primary-dark">
                                Ver todos
                            </Button>
                        </Link>
                    </div>
                    <div className="space-y-4">
                        {stats.recent_books && stats.recent_books.length > 0 ? (
                            stats.recent_books.map((book) => (
                                <BookItem key={book.id} book={book} />
                            ))
                        ) : (
                            <p className="text-muted-foreground text-center py-4">No hay libros recientes</p>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                    <h2 className="text-xl font-bold text-foreground mb-6">Acciones Rápidas</h2>
                    <div className="space-y-3">
                        <Link href="/library">
                            <Button variant="outline" className="w-full justify-start hover:bg-primary/5 hover:border-primary transition-all">
                                <BookOpen className="mr-3 h-5 w-5" />
                                Buscar Libros
                            </Button>
                        </Link>
                        <Link href="/plans">
                            <Button variant="outline" className="w-full justify-start hover:bg-primary/5 hover:border-primary transition-all">
                                <Award className="mr-3 h-5 w-5" />
                                Ver Planes
                            </Button>
                        </Link>
                        <Link href="/profile">
                            <Button variant="outline" className="w-full justify-start hover:bg-primary/5 hover:border-primary transition-all">
                                <Users className="mr-3 h-5 w-5" />
                                Mi Perfil
                            </Button>
                        </Link>
                        <Button variant="outline" className="w-full justify-start hover:bg-primary/5 hover:border-primary transition-all">
                            <Clock className="mr-3 h-5 w-5" />
                            Historial de Préstamos
                        </Button>
                    </div>
                </div>
            </div>

            {/* Activity Chart Placeholder */}
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                <h2 className="text-xl font-bold text-foreground mb-6">Actividad Mensual</h2>
                <div className="h-64 flex items-center justify-center bg-muted/50 rounded-lg border-2 border-dashed border-border">
                    <div className="text-center">
                        <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground">Gráfico de actividad próximamente</p>
                        <p className="text-sm text-muted-foreground mt-1">Integración con biblioteca de gráficos en desarrollo</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
