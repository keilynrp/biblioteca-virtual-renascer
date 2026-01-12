"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useBookStore } from "@/store/bookStore"
import { BookCard } from "@/components/book-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, ArrowLeft, Loader2 } from "lucide-react"

export default function FavoritesPage() {
    const router = useRouter()
    const pathname = usePathname()
    const { favorites, fetchFavorites } = useBookStore()
    const [isLoading, setIsLoading] = useState(true)

    console.log('[FavoritesPage] Component rendered with favorites:', favorites?.length || 0)

    // Reload favorites when component mounts OR when pathname changes back to /favorites
    useEffect(() => {
        console.log('[FavoritesPage] Pathname changed to:', pathname)
        if (pathname === '/favorites') {
            console.log('[FavoritesPage] Loading favorites...')
            loadFavorites()
        }
    }, [pathname])

    // Reload favorites when window regains focus (e.g., after adding a favorite from another page)
    useEffect(() => {
        const handleFocus = () => {
            loadFavorites()
        }

        window.addEventListener('focus', handleFocus)
        return () => window.removeEventListener('focus', handleFocus)
    }, [])

    // Reload favorites when component becomes visible (e.g., switching tabs)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                loadFavorites()
            }
        }

        document.addEventListener('visibilitychange', handleVisibilityChange)
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
    }, [])

    const loadFavorites = async () => {
        console.log('[loadFavorites] Starting to load favorites...')
        setIsLoading(true)
        try {
            await fetchFavorites()
            console.log('[loadFavorites] Favorites loaded successfully')
        } catch (error) {
            console.error("[loadFavorites] Error loading favorites:", error)
        } finally {
            setIsLoading(false)
            console.log('[loadFavorites] Loading finished')
        }
    }

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            onClick={() => router.push("/library")}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Volver
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-2">
                                <Heart className="h-8 w-8 fill-red-500 text-red-500" />
                                Mis Favoritos
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                {favorites.length} {favorites.length === 1 ? 'libro' : 'libros'} en tu lista de favoritos
                            </p>
                        </div>
                    </div>
                </div>

                {/* Favorites Grid */}
                {favorites.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                        {favorites.map((favorite) => (
                            <BookCard key={favorite.id} book={favorite.book} />
                        ))}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-16">
                            <Heart className="h-16 w-16 text-muted-foreground mb-4" />
                            <h2 className="text-2xl font-semibold mb-2">No tienes favoritos aún</h2>
                            <p className="text-muted-foreground mb-6 text-center max-w-md">
                                Explora la biblioteca y guarda tus libros favoritos haciendo clic en el botón de favoritos
                            </p>
                            <Button onClick={() => router.push("/library")}>
                                Explorar Biblioteca
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
