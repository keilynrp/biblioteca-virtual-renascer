"use client"

import { PageHeader } from "@/components/page-header"
import { StatsCard } from "@/components/stats-card"
import { BookOpen, Users, TrendingUp, Award, Clock, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useEffect, useState, useMemo, memo, useCallback } from "react"
import api, { handleApiError } from "@/lib/api"
import { DashboardSkeleton } from "@/components/dashboard-skeleton"
import Image from "next/image"

interface DashboardStats {
    total_books: number
    total_users: number
    average_rating: number
    books_borrowed: number
    recent_books: Array<{
        id: number
        title: string
        author: { name: string }
        category?: { name: string }
        slug: string
        is_premium: boolean
        cover_image?: string
    }>
    top_categories: Array<{
        name: string
        book_count: number
    }>
}

// Memoized book item component
const BookItem = memo(({ book }: { book: DashboardStats['recent_books'][0] }) => (
    <Link href={`/library/${book.slug}`} className="group">
        <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted transition-all duration-200">
            {/* Book Cover */}
            <div className="relative h-16 w-12 flex-shrink-0 rounded overflow-hidden bg-gradient-to-br from-primary/10 to-primary-dark/10 shadow-sm group-hover:shadow-md transition-shadow">
                {book.cover_image ? (
                    <Image
                        src={book.cover_image}
                        alt={book.title}
                        fill
                        sizes="48px"
                        className="object-cover"
                    />
                ) : (
                    <div className="h-full w-full flex items-center justify-center">
                        <BookOpen className="h-6 w-6 text-primary/50" />
                    </div>
                )}
            </div>

            {/* Book Info */}
            <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground group-hover:text-primary transition-colors truncate">
                    {book.title}
                </p>
                <p className="text-sm text-muted-foreground truncate">
                    {book.author?.name || 'Autor desconocido'}
                </p>
                {book.category && (
                    <p className="text-xs text-muted-foreground/70 mt-0.5 truncate">
                        {book.category.name}
                    </p>
                )}
            </div>

            {/* Premium Badge */}
            <div className="flex-shrink-0">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    book.is_premium ? "bg-warning/10 text-warning" : "bg-success/10 text-success"
                }`}>
                    {book.is_premium ? 'Premium' : 'Gratis'}
                </span>
            </div>
        </div>
    </Link>
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
        <div className="p-6 space-y-8">
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

            {/* Popular Categories */}
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-foreground">Categorías Populares</h2>
                    <Link href="/library">
                        <Button variant="ghost" size="sm" className="text-primary hover:text-primary-dark">
                            Explorar todas
                        </Button>
                    </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {stats.top_categories && stats.top_categories.length > 0 ? (
                        stats.top_categories.map((category, index) => (
                            <Link
                                key={index}
                                href={`/library?category=${encodeURIComponent(category.name)}`}
                                className="group"
                            >
                                <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 to-primary-dark/5 hover:from-primary/10 hover:to-primary-dark/10 rounded-lg p-4 border border-border hover:border-primary/50 transition-all duration-200 cursor-pointer">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                                {category.name}
                                            </h3>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {category.book_count} {category.book_count === 1 ? 'libro' : 'libros'}
                                            </p>
                                        </div>
                                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                            <BookOpen className="h-6 w-6 text-primary" />
                                        </div>
                                    </div>
                                    <div className="absolute -right-2 -bottom-2 h-20 w-20 rounded-full bg-primary/5 group-hover:bg-primary/10 transition-colors" />
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-8">
                            <p className="text-muted-foreground">No hay categorías disponibles</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
