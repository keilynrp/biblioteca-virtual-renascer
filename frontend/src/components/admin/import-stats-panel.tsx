"use client"

import { useEffect, useState } from "react"
import api, { handleApiError } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, BookOpen, Users, FolderTree, Image, DollarSign } from "lucide-react"

interface ImportStats {
    total_books: number
    total_authors: number
    total_categories: number
    categories_stats: Array<{
        id: number
        name: string
        book_count: number
    }>
    books_with_cover: number
    books_without_cover: number
    premium_books: number
    free_books: number
    recent_books: Array<any>
}

export function ImportStatsPanel() {
    const [stats, setStats] = useState<ImportStats | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchStats()
    }, [])

    const fetchStats = async () => {
        try {
            setLoading(true)
            const response = await api.get('/content/admin/import-stats/')
            setStats(response.data)
        } catch (error) {
            handleApiError(error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center p-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </CardContent>
            </Card>
        )
    }

    if (!stats) return null

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Estadísticas de la Biblioteca</h2>

            {/* Grid de estadísticas principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total de Libros</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total_books.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {stats.books_with_cover} con portada
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Autores</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total_authors.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            registrados
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Categorías</CardTitle>
                        <FolderTree className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total_categories.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            diferentes temas
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Portadas</CardTitle>
                        <Image className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {Math.round((stats.books_with_cover / stats.total_books) * 100)}%
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {stats.books_without_cover} sin portada
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Top Categorías */}
            <Card>
                <CardHeader>
                    <CardTitle>Top 10 Categorías</CardTitle>
                    <CardDescription>Categorías con más libros</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {stats.categories_stats.map((category, index) => {
                            const maxCount = stats.categories_stats[0]?.book_count || 1
                            const percentage = (category.book_count / maxCount) * 100

                            return (
                                <div key={category.id} className="space-y-1">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium">
                                            {index + 1}. {category.name}
                                        </span>
                                        <span className="text-muted-foreground">
                                            {category.book_count} libros
                                        </span>
                                    </div>
                                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary transition-all"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
