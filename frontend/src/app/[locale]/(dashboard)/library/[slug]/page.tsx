
"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import Image from "next/image"
import {
    ArrowLeft,
    BookOpen,
    Calendar,
    Eye,
    Heart,
    Star,
    User,
    Pencil
} from "lucide-react"
import { ReviewForm } from "@/components/review-form"
import { ReviewList } from "@/components/review-list"
import { FavoriteButton } from "@/components/favorite-button"
import { ReadingStatusSelector } from "@/components/reading-status-selector"
import { BorrowBookButton } from "@/components/loans/borrow-book-button"
import { contentApi, Book } from "@/services/contentApi"
import { BookCard } from "@/components/book-card"
import { useAuthStoreHydrated } from "@/store/authStore"
import dynamic from "next/dynamic"

// Dynamically import FlipbookPreview to avoid SSR issues with PDF.js DOMMatrix
const FlipbookPreview = dynamic(
    () => import("@/components/flipbook-preview").then((mod) => mod.FlipbookPreview),
    {
        ssr: false,
        loading: () => (
            <div className="flex items-center justify-center min-h-[600px] border-2 rounded-lg bg-muted/20">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                    <p className="text-muted-foreground">Cargando vista previa...</p>
                </div>
            </div>
        )
    }
)

interface BookDetail {
    id: number
    title: string
    slug: string
    description: string
    author: {
        id: number
        name: string
        bio: string
    }
    category: {
        id: number
        name: string
        slug: string
    }
    cover_image: string | null
    file: string
    is_premium: boolean
    isbn: string
    publication_date: string
    average_rating?: number
    review_count?: number
    user_has_favorited?: boolean
    user_review?: any
    user_reading_status?: {
        status: "reading" | "completed" | "want_to_read" | "abandoned"
    }
}

export default function BookDetailPage() {
    const params = useParams()
    const router = useRouter()
    const { slug } = params
    const [book, setBook] = useState<BookDetail | null>(null)
    const [similarBooks, setSimilarBooks] = useState<Book[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const { user, _hasHydrated } = useAuthStoreHydrated()

    const canEdit = _hasHydrated && user && [
        "admin",
        "content_manager",
        "moderator",
        "librarian"
    ].includes(user.user_type)

    useEffect(() => {
        const fetchBook = async () => {
            try {
                setLoading(true)
                // Normalize slug - can be string or string[] in Next.js App Router
                const slugStr = Array.isArray(slug) ? slug[0] : slug
                if (!slugStr) {
                    setError("Slug de libro no válido")
                    return
                }

                const response = await api.get(`/content/books/${slugStr}/`)
                setBook(response.data)

                // Fetch similar books
                try {
                    const similar = await contentApi.getSimilarBooks(slugStr)
                    setSimilarBooks(similar)
                } catch (simError) {
                    console.error("Failed to fetch similar books", simError)
                }
            } catch (err) {
                console.error("Failed to fetch book details", err)
                setError("No se pudo cargar el libro")
            } finally {
                setLoading(false)
            }
        }
        if (slug) fetchBook()
    }, [slug])

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto">
                    <div className="animate-pulse space-y-8">
                        <div className="h-8 bg-muted rounded w-1/4"></div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="md:col-span-1">
                                <div className="aspect-[2/3] bg-muted rounded"></div>
                            </div>
                            <div className="md:col-span-2 space-y-4">
                                <div className="h-10 bg-muted rounded w-3/4"></div>
                                <div className="h-6 bg-muted rounded w-1/2"></div>
                                <div className="h-20 bg-muted rounded"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (error || !book) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto text-center">
                    <h1 className="text-2xl font-bold mb-4">Error</h1>
                    <p className="text-muted-foreground mb-8">{error || "Libro no encontrado"}</p>
                    <Button onClick={() => router.push("/library")}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Volver a la Biblioteca
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-6xl mx-auto">
                {/* Back Button */}
                <Button
                    variant="ghost"
                    onClick={() => router.push("/library")}
                    className="mb-6"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver a la Biblioteca
                </Button>

                {/* Book Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Book Cover */}
                    <div className="md:col-span-1">
                        <Card className="overflow-hidden">
                            <div className="relative aspect-[2/3] bg-muted">
                                {book.cover_image ? (
                                    <Image
                                        src={book.cover_image}
                                        alt={book.title}
                                        fill
                                        className="object-cover"
                                        priority
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        <BookOpen className="h-24 w-24 text-muted-foreground" />
                                    </div>
                                )}
                            </div>
                        </Card>

                        {/* Action Buttons */}
                        <div className="mt-4 space-y-3">
                            {book.file && (
                                <>
                                    <Button className="w-full" size="lg" asChild>
                                        <Link href={`/reader/${book.id}`}>
                                            <Eye className="mr-2 h-5 w-5" />
                                            Leer Libro Completo
                                        </Link>
                                    </Button>
                                </>
                            )}

                            {/* Favorite Button */}
                            <FavoriteButton
                                bookId={book.id}
                                initialFavorited={book.user_has_favorited}
                                variant="outline"
                                size="lg"
                                className="w-full"
                            />

                            {/* Borrow Book Button */}
                            <BorrowBookButton
                                bookId={book.id}
                                bookTitle={book.title}
                                className="w-full"
                            />


                            {/* Edit Button (Admin Only) */}
                            {canEdit && (
                                <Button
                                    variant="secondary"
                                    className="w-full bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-200"
                                    size="lg"
                                    asChild
                                >
                                    <Link href={`/admin/books?edit=${book.slug}`}>
                                        <Pencil className="mr-2 h-4 w-4" />
                                        Editar Libro
                                    </Link>
                                </Button>
                            )}

                            {/* Reading Status Selector */}
                            <div className="pt-2">
                                <label className="text-sm font-medium mb-2 block">
                                    Estado de Lectura
                                </label>
                                <ReadingStatusSelector
                                    bookId={book.id}
                                    initialStatus={book.user_reading_status?.status}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Book Information */}
                    <div className="md:col-span-2">
                        <div className="space-y-6">
                            {/* Title and Badges */}
                            <div>
                                <div className="flex items-start gap-3 mb-3">
                                    <h1 className="text-4xl font-bold flex-1">{book.title}</h1>
                                    {book.is_premium && (
                                        <Badge className="bg-gradient-to-r from-amber-500 to-amber-600 text-white border-0">
                                            Premium
                                        </Badge>
                                    )}
                                </div>
                                <Link
                                    href={`/library?author=${book.author.id}`}
                                    className="text-xl text-primary hover:underline flex items-center gap-2"
                                >
                                    <User className="h-5 w-5" />
                                    {book.author.name}
                                </Link>
                            </div>

                            <Separator />

                            {/* Book Info Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardDescription>Categoría</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Link
                                            href={`/library?category=${book.category.id}`}
                                            className="font-semibold hover:text-primary"
                                        >
                                            {book.category.name}
                                        </Link>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardDescription>Fecha de Publicación</CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-semibold">
                                            {book.publication_date
                                                ? book.publication_date.substring(0, 4)
                                                : 'N/A'}
                                        </span>
                                    </CardContent>
                                </Card>

                                {book.isbn && (
                                    <Card>
                                        <CardHeader className="pb-3">
                                            <CardDescription>ISBN</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <span className="font-semibold font-mono">{book.isbn}</span>
                                        </CardContent>
                                    </Card>
                                )}

                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardDescription>Valoración</CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex items-center gap-2">
                                        {book.average_rating !== undefined && book.average_rating > 0 ? (
                                            <>
                                                <div className="flex items-center gap-1">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={`h-5 w-5 ${i < Math.round(book.average_rating!)
                                                                ? "fill-amber-400 text-amber-400"
                                                                : "text-gray-300"
                                                                }`}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="font-semibold text-lg">
                                                    {book.average_rating.toFixed(1)}
                                                </span>
                                                {book.review_count !== undefined && book.review_count > 0 && (
                                                    <span className="text-sm text-muted-foreground">
                                                        ({book.review_count} reseñas)
                                                    </span>
                                                )}
                                            </>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <Star className="h-5 w-5 text-gray-300" />
                                                <span className="text-sm text-muted-foreground">Sin reseñas aún</span>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>

                            <Separator />

                            {/* Description */}
                            <div>
                                <h2 className="text-2xl font-bold mb-4">Descripción</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    {book.description}
                                </p>
                            </div>

                            {/* Author Bio */}
                            {book.author.bio && (
                                <>
                                    <Separator />
                                    <div>
                                        <h2 className="text-2xl font-bold mb-4">Sobre el Autor</h2>
                                        <p className="text-muted-foreground leading-relaxed">
                                            {book.author.bio}
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Flipbook Preview Section */}
                {book.file && (
                    <div className="mt-12">
                        <Separator className="mb-8" />
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-3xl font-bold mb-2">Vista Previa del Libro</h2>
                                    <p className="text-muted-foreground">
                                        Explora las primeras páginas antes de leer el libro completo
                                    </p>
                                </div>
                                <Button asChild size="lg" variant="outline" className="hidden md:flex">
                                    <Link href={`/reader/${book.id}`}>
                                        <BookOpen className="mr-2 h-5 w-5" />
                                        Ir al Lector Completo
                                    </Link>
                                </Button>
                            </div>
                            <FlipbookPreview
                                pdfUrl={book.file}
                                bookId={book.id}
                                bookTitle={book.title}
                                previewPages={10}
                            />
                        </div>
                    </div>
                )}

                {/* Reviews Section */}
                <div className="mt-12">
                    <Separator className="mb-8" />

                    <h2 className="text-3xl font-bold mb-6">Reseñas y Valoraciones</h2>

                    {/* Review Statistics */}
                    {book.average_rating !== undefined && book.average_rating > 0 && (
                        <Card className="mb-8">
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-8">
                                    <div className="text-center">
                                        <div className="text-5xl font-bold mb-2">
                                            {book.average_rating.toFixed(1)}
                                        </div>
                                        <div className="flex items-center gap-1 mb-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`h-5 w-5 ${i < Math.round(book.average_rating!)
                                                        ? "fill-amber-400 text-amber-400"
                                                        : "text-gray-300"
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {book.review_count} {book.review_count === 1 ? 'reseña' : 'reseñas'}
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-muted-foreground">
                                            Valoración promedio basada en {book.review_count} {book.review_count === 1 ? 'opinión' : 'opiniones'} de lectores.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Review Form - Only show if user hasn't reviewed yet */}
                    {!book.user_review && (
                        <div className="mb-8">
                            <ReviewForm
                                bookSlug={book.slug}
                                onSuccess={() => {
                                    // Refetch book data to update reviews
                                    window.location.reload()
                                }}
                            />
                        </div>
                    )}

                    {/* User's own review if exists */}
                    {book.user_review && (
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-semibold">Tu reseña</h3>
                                <Badge variant="secondary">Tu opinión</Badge>
                            </div>
                            <Card className="border-primary/50">
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-2 mb-2">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`h-5 w-5 ${i < book.user_review.rating
                                                    ? "fill-amber-400 text-amber-400"
                                                    : "text-gray-300"
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    <h4 className="font-semibold text-lg mb-2">{book.user_review.title}</h4>
                                    <p className="text-muted-foreground whitespace-pre-wrap">
                                        {book.user_review.comment}
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* All Reviews List */}
                    <div>
                        <h3 className="text-xl font-semibold mb-4">
                            Todas las reseñas {book.review_count ? `(${book.review_count})` : ''}
                        </h3>
                        <ReviewList bookSlug={book.slug} />
                    </div>
                </div>
            </div>

            {/* Similar Books Section */}
            {similarBooks.length > 0 && (
                <div className="mt-12">
                    <Separator className="mb-8" />
                    <h2 className="text-3xl font-bold mb-6">Libros Similares</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                        {similarBooks.map((book, i) => (
                            <div key={book.id} className="h-full">
                                <BookCard book={book} index={i} />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
