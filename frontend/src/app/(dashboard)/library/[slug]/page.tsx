
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
    Download,
    Eye,
    Heart,
    Share2,
    Star,
    User
} from "lucide-react"

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
}

export default function BookDetailPage() {
    const params = useParams()
    const router = useRouter()
    const { slug } = params
    const [book, setBook] = useState<BookDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchBook = async () => {
            try {
                setLoading(true)
                const response = await api.get(`/content/books/${slug}/`)
                setBook(response.data)
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
                        <div className="mt-4 space-y-2">
                            {book.file && (
                                <>
                                    <Button className="w-full" size="lg" asChild>
                                        <a href={book.file} target="_blank" rel="noopener noreferrer">
                                            <Eye className="mr-2 h-5 w-5" />
                                            Leer en Línea
                                        </a>
                                    </Button>
                                    <Button variant="outline" className="w-full" size="lg" asChild>
                                        <a href={book.file} download>
                                            <Download className="mr-2 h-5 w-5" />
                                            Descargar
                                        </a>
                                    </Button>
                                </>
                            )}
                            <div className="flex gap-2">
                                <Button variant="outline" className="flex-1">
                                    <Heart className="mr-2 h-4 w-4" />
                                    Guardar
                                </Button>
                                <Button variant="outline" className="flex-1">
                                    <Share2 className="mr-2 h-4 w-4" />
                                    Compartir
                                </Button>
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
                                            {new Date(book.publication_date).toLocaleDateString('es-ES', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
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
                                    <CardContent className="flex items-center gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className="h-5 w-5 fill-amber-400 text-amber-400"
                                            />
                                        ))}
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
            </div>
        </div>
    )
}
