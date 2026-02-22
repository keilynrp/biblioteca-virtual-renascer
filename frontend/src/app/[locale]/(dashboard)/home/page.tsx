"use client"

import { PageHeader } from "@/components/page-header"
import { StatsCard } from "@/components/stats-card"
import { BookOpen, Users, TrendingUp, Award, Clock, Star, Heart, BookMarked, BookUp, CreditCard, Flame } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useEffect, useState, useMemo, memo, useCallback } from "react"
import api, { handleApiError } from "@/lib/api"
import { DashboardSkeleton } from "@/components/dashboard-skeleton"
import Image from "next/image"
import { contentApi, Book } from "@/services/contentApi"
import { BookCard } from "@/components/book-card"
import { useTranslations } from "next-intl"
import { pagesApi, type PuckData } from "@/services/pagesApi"
import { PageRenderer } from "@/components/page-builder/page-renderer"
import { useAuthStoreHydrated } from "@/store/authStore"

// ─── Admin dashboard interfaces ───────────────────────────────────────────────

interface DashboardStats {
    total_books: number
    total_users: number
    average_rating: number
    books_borrowed: number
    total_reading_hours: number
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

// ─── User dashboard interfaces ────────────────────────────────────────────────

interface Subscription {
    plan_detail: { name: string; plan_type: string; duration_days: number }
    start_date: string
    end_date: string
    is_active: boolean
}

interface UserStats {
    books_completed: number
    books_reading: number
    total_reading_time: number
    streak_days: number
}

interface CurrentReading {
    book: number
    book_detail: {
        id: number
        title: string
        slug: string
        cover_image?: string
        author: { name: string }
    }
    current_page: number
    total_pages: number
    progress_percentage: number
    last_read_at: string
}

interface UserDashboardData {
    subscription: Subscription | null
    stats: UserStats
    active_loans: number
    favorites_count: number
    current_readings: CurrentReading[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })
}

function daysRemaining(endDate: string): number {
    return Math.max(0, Math.ceil((new Date(endDate).getTime() - Date.now()) / 86400000))
}

function userTypeLabel(userType: string): string {
    const map: Record<string, string> = {
        student: 'Estudiante',
        teacher: 'Profesor',
        librarian: 'Bibliotecario',
        admin: 'Administrador',
    }
    return map[userType] ?? userType.charAt(0).toUpperCase() + userType.slice(1)
}

// ─── Memoized admin book item ─────────────────────────────────────────────────

const BookItem = memo(({ book }: { book: DashboardStats['recent_books'][0] }) => (
    <Link href={`/library/${book.slug}`} className="group">
        <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted transition-all duration-200">
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
            <div className="flex-shrink-0">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${book.is_premium ? "bg-warning/10 text-warning" : "bg-success/10 text-success"}`}>
                    {book.is_premium ? 'Premium' : 'Gratis'}
                </span>
            </div>
        </div>
    </Link>
))

BookItem.displayName = 'BookItem'

// ─── User dashboard view ──────────────────────────────────────────────────────

interface UserDashboardViewProps {
    username: string
    userType: string
    data: UserDashboardData
    recommendations: Book[]
    dashboardBanner: PuckData | null
}

const UserDashboardView = memo(({
    username,
    userType,
    data,
    recommendations,
    dashboardBanner,
}: UserDashboardViewProps) => {
    const { subscription, stats, active_loans, favorites_count, current_readings } = data

    const userStatsCards = [
        {
            title: 'Libros Completados',
            value: stats.books_completed.toLocaleString(),
            change: 0,
            trend: 'up' as const,
            icon: BookOpen,
            description: 'finalizados',
        },
        {
            title: 'En Lectura',
            value: stats.books_reading.toLocaleString(),
            change: 0,
            trend: 'up' as const,
            icon: BookMarked,
            description: 'en progreso',
        },
        {
            title: 'Préstamos Activos',
            value: active_loans.toLocaleString(),
            change: 0,
            trend: 'up' as const,
            icon: BookUp,
            description: 'prestados ahora',
        },
        {
            title: 'Favoritos',
            value: favorites_count.toLocaleString(),
            change: 0,
            trend: 'up' as const,
            icon: Heart,
            description: 'guardados',
        },
    ]

    // Subscription progress: percentage of plan time elapsed
    const subProgressPct = (() => {
        if (!subscription) return 0
        const duration = subscription.plan_detail.duration_days
        if (!duration) return 0
        const elapsed = duration - daysRemaining(subscription.end_date)
        return Math.min(100, Math.max(0, Math.round((elapsed / duration) * 100)))
    })()

    return (
        <div className="px-6 py-5 space-y-8">
            {/* Optional page builder banner */}
            {dashboardBanner && (
                <div className="-mx-6 -mt-5 mb-0">
                    <PageRenderer data={dashboardBanner} />
                </div>
            )}

            {/* Welcome header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">
                        ¡Bienvenido, {username}!
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Aqui tienes un resumen de tu actividad de lectura.
                    </p>
                </div>
                <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-sm font-semibold px-3 py-1.5 rounded-full">
                    {userTypeLabel(userType)}
                </span>
            </div>

            {/* Subscription card (full width) */}
            {!subscription || !subscription.is_active ? (
                <div className="bg-card rounded-xl border border-border p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                            <CreditCard className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                            <p className="font-semibold text-foreground">Sin suscripcion activa</p>
                            <p className="text-sm text-muted-foreground">Activa un plan para acceder a todo el contenido.</p>
                        </div>
                    </div>
                    <Link href="/plans">
                        <Button className="bg-gradient-to-r from-primary to-primary-dark hover:shadow-lg hover:shadow-primary/30 transition-all whitespace-nowrap">
                            Ver Planes
                        </Button>
                    </Link>
                </div>
            ) : (
                <div className="bg-card rounded-xl border border-border p-6 shadow-sm space-y-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <CreditCard className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="font-bold text-foreground text-lg leading-tight">
                                    {subscription.plan_detail.name}
                                </p>
                                <p className="text-sm text-muted-foreground capitalize">
                                    {subscription.plan_detail.plan_type}
                                </p>
                            </div>
                        </div>
                        <span className="inline-flex items-center gap-1.5 bg-success/10 text-success text-xs font-semibold px-3 py-1 rounded-full">
                            Activo
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                        <div>
                            <p className="text-muted-foreground text-xs uppercase tracking-wide mb-0.5">Inicio</p>
                            <p className="font-medium text-foreground">{formatDate(subscription.start_date)}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground text-xs uppercase tracking-wide mb-0.5">Vencimiento</p>
                            <p className="font-medium text-foreground">{formatDate(subscription.end_date)}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground text-xs uppercase tracking-wide mb-0.5">Dias restantes</p>
                            <p className="font-bold text-primary">{daysRemaining(subscription.end_date)} dias</p>
                        </div>
                    </div>

                    {/* Progress bar: time consumed */}
                    <div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                            <span>Tiempo consumido</span>
                            <span>{subProgressPct}%</span>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary rounded-full transition-all duration-500"
                                style={{ width: `${subProgressPct}%` }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Stats grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {userStatsCards.map((card, i) => (
                    <StatsCard key={i} {...card} />
                ))}
            </div>

            {/* Continuar leyendo */}
            {current_readings.length > 0 && (
                <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <BookMarked className="h-5 w-5 text-primary" />
                            <h2 className="text-xl font-bold text-foreground">Continuar Leyendo</h2>
                        </div>
                    </div>
                    <div className="space-y-4">
                        {current_readings.slice(0, 3).map((reading) => (
                            <div
                                key={reading.book}
                                className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted transition-all duration-200"
                            >
                                {/* Cover */}
                                <div className="relative h-16 w-12 flex-shrink-0 rounded overflow-hidden bg-gradient-to-br from-primary/10 to-primary-dark/10 shadow-sm">
                                    {reading.book_detail.cover_image ? (
                                        <Image
                                            src={reading.book_detail.cover_image}
                                            alt={reading.book_detail.title}
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

                                {/* Info + progress */}
                                <div className="flex-1 min-w-0 space-y-1.5">
                                    <p className="font-medium text-foreground truncate">
                                        {reading.book_detail.title}
                                    </p>
                                    <p className="text-sm text-muted-foreground truncate">
                                        {reading.book_detail.author.name}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary rounded-full"
                                                style={{ width: `${reading.progress_percentage}%` }}
                                            />
                                        </div>
                                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                                            {reading.progress_percentage}%
                                        </span>
                                    </div>
                                </div>

                                {/* Action */}
                                <Link href={`/reader/${reading.book_detail.slug}`} className="flex-shrink-0">
                                    <Button size="sm" variant="outline" className="hover:bg-primary/5 hover:border-primary transition-all">
                                        Continuar
                                    </Button>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recommendations */}
            {recommendations.length > 0 && (
                <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-6">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        <h2 className="text-xl font-bold text-foreground">Recomendado para ti</h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {recommendations.slice(0, 6).map((book, i) => (
                            <div key={book.id} className="h-full">
                                <BookCard book={book} index={i} />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Quick actions */}
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                <h2 className="text-xl font-bold text-foreground mb-6">Acciones Rapidas</h2>
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
                        Historial de Prestamos
                    </Button>
                </div>
            </div>
        </div>
    )
})

UserDashboardView.displayName = 'UserDashboardView'

// ─── Main page ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
    const t = useTranslations("HomePage")
    const commonT = useTranslations("Common")
    const { user } = useAuthStoreHydrated()

    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [userDashboard, setUserDashboard] = useState<UserDashboardData | null>(null)
    const [recommendations, setRecommendations] = useState<Book[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [dashboardBanner, setDashboardBanner] = useState<PuckData | null>(null)

    const fetchStats = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            const isAdmin = user?.user_type === 'admin'

            if (isAdmin) {
                // ── Admin path: existing endpoint ───────────────────────────
                const response = await api.get('/content/dashboard/stats/')
                setStats(response.data)
            } else {
                // ── Non-admin path: personalised endpoints ──────────────────
                const [subResult, statsResult, loansResult, favsResult, readingsResult] =
                    await Promise.allSettled([
                        api.get('/subscriptions/my-subscription/'),
                        api.get('/analytics/user_stats/'),
                        api.get('/loans/loans/active/'),
                        api.get('/content/user/favorites/'),
                        api.get('/content/user/readings/'),
                    ])

                const subscription: Subscription | null =
                    subResult.status === 'fulfilled' ? subResult.value.data : null

                const defaultStats: UserStats = {
                    books_completed: 0,
                    books_reading: 0,
                    total_reading_time: 0,
                    streak_days: 0,
                }
                const userStats: UserStats =
                    statsResult.status === 'fulfilled'
                        ? { ...defaultStats, ...statsResult.value.data }
                        : defaultStats

                const active_loans: number =
                    loansResult.status === 'fulfilled'
                        ? (Array.isArray(loansResult.value.data) ? loansResult.value.data.length : 0)
                        : 0

                const favorites_count: number =
                    favsResult.status === 'fulfilled'
                        ? (Array.isArray(favsResult.value.data) ? favsResult.value.data.length : 0)
                        : 0

                const current_readings: CurrentReading[] =
                    readingsResult.status === 'fulfilled'
                        ? (Array.isArray(readingsResult.value.data) ? readingsResult.value.data : [])
                        : []

                setUserDashboard({ subscription, stats: userStats, active_loans, favorites_count, current_readings })
            }

            // Recommendations and banner fetch for all users
            try {
                const recs = await contentApi.getRecommendedForYou()
                setRecommendations(recs)
            } catch (recError) {
                console.error('Error fetching recommendations:', recError)
            }
        } catch (err) {
            console.error('Error fetching dashboard stats:', err)
            setError('Error al cargar estadisticas')
            handleApiError(err)
        } finally {
            setLoading(false)
        }
    }, [user?.user_type])

    useEffect(() => {
        fetchStats()
    }, [fetchStats])

    useEffect(() => {
        pagesApi.getPage('dashboard-home')
            .then(p => {
                if (p.content?.content?.length) setDashboardBanner(p.content)
            })
            .catch(() => {})
    }, [])

    // Memoize admin stats cards — must be called before conditional returns
    const statsCards = useMemo(() => {
        if (!stats) return []
        return [
            {
                title: "Total de Libros",
                value: stats.total_books.toLocaleString(),
                change: 0,
                trend: "up" as const,
                icon: BookOpen,
                description: "en la biblioteca",
            },
            {
                title: "Usuarios Activos",
                value: stats.total_users.toLocaleString(),
                change: 0,
                trend: "up" as const,
                icon: Users,
                description: "registrados",
            },
            {
                title: "Horas de Lectura",
                value: (stats.total_reading_hours || 0).toLocaleString(),
                change: 0,
                trend: "up" as const,
                icon: Clock,
                description: "total acumulado",
            },
            {
                title: "Calificacion Promedio",
                value: stats.average_rating.toString(),
                change: 0,
                trend: "up" as const,
                icon: Star,
                description: "de 5 estrellas",
            },
        ]
    }, [stats])

    if (loading) {
        return <DashboardSkeleton />
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center space-y-4">
                    <p className="text-destructive">{error}</p>
                    <Button onClick={fetchStats}>Reintentar</Button>
                </div>
            </div>
        )
    }

    // ── Non-admin users: personalised dashboard ─────────────────────────────
    if (user?.user_type !== 'admin') {
        if (!userDashboard) {
            return (
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center space-y-4">
                        <p className="text-destructive">Error al cargar datos</p>
                        <Button onClick={fetchStats}>Reintentar</Button>
                    </div>
                </div>
            )
        }

        return (
            <UserDashboardView
                username={user?.username ?? 'Usuario'}
                userType={user?.user_type ?? ''}
                data={userDashboard}
                recommendations={recommendations}
                dashboardBanner={dashboardBanner}
            />
        )
    }

    // ── Admin dashboard (unchanged) ─────────────────────────────────────────
    if (!stats) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center space-y-4">
                    <p className="text-destructive">Error al cargar datos</p>
                    <Button onClick={fetchStats}>Reintentar</Button>
                </div>
            </div>
        )
    }

    return (
        <div className="px-6 py-5 space-y-8">
            {dashboardBanner && (
                <div className="-mx-6 -mt-5 mb-0">
                    <PageRenderer data={dashboardBanner} />
                </div>
            )}
            <PageHeader
                title={t("title")}
                description={t("description")}
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
                    <h2 className="text-xl font-bold text-foreground mb-6">Acciones Rapidas</h2>
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
                            Historial de Prestamos
                        </Button>
                    </div>
                </div>
            </div>

            {/* Recommendations Section */}
            {recommendations.length > 0 && (
                <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-primary" />
                            <h2 className="text-xl font-bold text-foreground">Recomendado para ti</h2>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {recommendations.slice(0, 6).map((book, i) => (
                            <div key={book.id} className="h-full">
                                <BookCard book={book} index={i} />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Popular Categories */}
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-foreground">Categorias Populares</h2>
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
                            <p className="text-muted-foreground">No hay categorias disponibles</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
