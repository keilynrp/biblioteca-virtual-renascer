
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import api, { handleApiError } from "@/lib/api"
import { BookCard } from "@/components/book-card"
import { BookCardSkeleton } from "@/components/book-card-skeleton"
import { PageHeader } from "@/components/page-header"
import { Input } from "@/components/ui/input"
import { Search, Filter, Settings, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible"
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import { Card, CardContent } from "@/components/ui/card"

interface Book {
    id: number
    title: string
    slug: string
    description: string
    author: { id: number; name: string }
    category: { slug: string; name: string }
    cover_image: string | null
    is_premium: boolean
}

interface Category {
    id: number
    name: string
    slug: string
}

interface Author {
    id: number
    name: string
}

const BOOKS_PER_PAGE = 12

export default function LibraryPage() {
    const [books, setBooks] = useState<Book[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [authors, setAuthors] = useState<Author[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedCategory, setSelectedCategory] = useState<string>("all")
    const [selectedAuthor, setSelectedAuthor] = useState<string>("all")
    const [premiumFilter, setPremiumFilter] = useState<string>("all")
    const [currentPage, setCurrentPage] = useState(1)
    const [isFiltersOpen, setIsFiltersOpen] = useState(false)

    // Load categories and authors
    useEffect(() => {
        const fetchFilters = async () => {
            try {
                const [categoriesResponse, authorsResponse] = await Promise.all([
                    api.get('/content/categories/', { params: { page_size: 1000 } }),
                    api.get('/content/authors/', { params: { page_size: 1000 } })
                ])
                // Handle paginated responses
                const categoriesData = categoriesResponse.data?.results || categoriesResponse.data || []
                const authorsData = authorsResponse.data?.results || authorsResponse.data || []
                setCategories(Array.isArray(categoriesData) ? categoriesData : [])
                setAuthors(Array.isArray(authorsData) ? authorsData : [])
            } catch (error) {
                console.error("Failed to fetch filters", error)
                handleApiError(error, 'Error al cargar filtros')
            }
        }
        fetchFilters()
    }, [])

    // Fetch books with filters
    useEffect(() => {
        const fetchBooks = async () => {
            setLoading(true)
            try {
                const params: any = {
                    page_size: 1000  // Request all books
                }
                if (searchTerm) params.search = searchTerm
                if (selectedCategory !== "all") params.category = selectedCategory
                if (selectedAuthor !== "all") params.author = selectedAuthor
                if (premiumFilter !== "all") params.is_premium = premiumFilter === "premium"

                const response = await api.get('/content/books/', { params })
                // Handle paginated responses
                const booksData = response.data?.results || response.data || []
                setBooks(Array.isArray(booksData) ? booksData : [])
                setCurrentPage(1)
            } catch (error) {
                console.error("Failed to fetch books", error)
                handleApiError(error, 'Error al cargar libros')
                setBooks([])
            } finally {
                setLoading(false)
            }
        }

        const timeoutId = setTimeout(() => {
            fetchBooks()
        }, 500)

        return () => clearTimeout(timeoutId)
    }, [searchTerm, selectedCategory, selectedAuthor, premiumFilter])

    const totalPages = Math.ceil(books.length / BOOKS_PER_PAGE)
    const startIndex = (currentPage - 1) * BOOKS_PER_PAGE
    const endIndex = startIndex + BOOKS_PER_PAGE
    const currentBooks = books.slice(startIndex, endIndex)

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    return (
        <div className="px-6 py-5 space-y-6">
            <PageHeader
                title="Biblioteca"
                description="Explora nuestra vasta colección de conocimiento"
                actions={
                    <div className="flex items-center gap-3">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            <Input
                                placeholder="Buscar libros, autores..."
                                className="pl-10 pr-4 w-64 lg:w-80 bg-card/50 backdrop-blur-sm border-border focus:border-primary/50 focus:ring-primary/20 transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm("")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    ×
                                </button>
                            )}
                        </div>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                            className={`transition-all duration-300 ${
                                isFiltersOpen
                                    ? 'bg-primary text-white border-primary hover:bg-primary-dark'
                                    : 'hover:bg-primary/10 hover:border-primary/50'
                            }`}
                        >
                            <Filter className={`h-4 w-4 transition-transform duration-300 ${isFiltersOpen ? 'scale-110' : ''}`} />
                        </Button>
                        <Button asChild className="bg-gradient-to-r from-primary to-primary-dark hover:shadow-lg hover:shadow-primary/30 transition-all">
                            <Link href="/admin/books">
                                <Settings className="mr-2 h-4 w-4" />
                                Administrar
                            </Link>
                        </Button>
                    </div>
                }
            />

            <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
                <CollapsibleContent>
                    <Card className="mb-6 border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-transparent overflow-hidden animate-fadeInUp">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                        <CardContent className="pt-6 relative z-10">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-md">
                                    <Filter className="h-4 w-4 text-white" />
                                </div>
                                <h3 className="font-bold text-lg">Filtros de Búsqueda</h3>
                                {(selectedCategory !== "all" || selectedAuthor !== "all" || premiumFilter !== "all") && (
                                    <button
                                        onClick={() => {
                                            setSelectedCategory("all")
                                            setSelectedAuthor("all")
                                            setPremiumFilter("all")
                                        }}
                                        className="ml-auto text-xs text-primary hover:text-primary-dark font-medium underline"
                                    >
                                        Limpiar filtros
                                    </button>
                                )}
                            </div>

                            <div className="grid gap-6 md:grid-cols-3">
                                <div className="space-y-3">
                                    <label className="text-sm font-semibold flex items-center gap-2 text-foreground">
                                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                                        Categoría
                                    </label>
                                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                        <SelectTrigger className="bg-background border-primary/30 focus:border-primary focus:ring-primary/20">
                                            <SelectValue placeholder="Todas las categorías" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Todas las categorías</SelectItem>
                                            {categories.map((category) => (
                                                <SelectItem key={category.id} value={category.slug}>
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-sm font-semibold flex items-center gap-2 text-foreground">
                                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                                        Autor
                                    </label>
                                    <Select value={selectedAuthor} onValueChange={setSelectedAuthor}>
                                        <SelectTrigger className="bg-background border-primary/30 focus:border-primary focus:ring-primary/20">
                                            <SelectValue placeholder="Todos los autores" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Todos los autores</SelectItem>
                                            {authors.map((author) => (
                                                <SelectItem key={author.id} value={String(author.id)}>
                                                    {author.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-sm font-semibold flex items-center gap-2 text-foreground">
                                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                                        Tipo
                                    </label>
                                    <Select value={premiumFilter} onValueChange={setPremiumFilter}>
                                        <SelectTrigger className="bg-background border-primary/30 focus:border-primary focus:ring-primary/20">
                                            <SelectValue placeholder="Todos los libros" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Todos los libros</SelectItem>
                                            <SelectItem value="free">Solo gratuitos</SelectItem>
                                            <SelectItem value="premium">Solo premium</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Active Filters Pills */}
                            {(selectedCategory !== "all" || selectedAuthor !== "all" || premiumFilter !== "all") && (
                                <div className="mt-6 pt-6 border-t border-border">
                                    <p className="text-xs font-medium text-muted-foreground mb-3">Filtros activos:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedCategory !== "all" && (
                                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/15 text-primary rounded-full text-xs font-medium border border-primary/30">
                                                <span>{categories.find(c => c.slug === selectedCategory)?.name}</span>
                                                <button
                                                    onClick={() => setSelectedCategory("all")}
                                                    className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        )}
                                        {selectedAuthor !== "all" && (
                                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/15 text-primary rounded-full text-xs font-medium border border-primary/30">
                                                <span>{authors.find(a => String(a.id) === selectedAuthor)?.name}</span>
                                                <button
                                                    onClick={() => setSelectedAuthor("all")}
                                                    className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        )}
                                        {premiumFilter !== "all" && (
                                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/15 text-primary rounded-full text-xs font-medium border border-primary/30">
                                                <span>{premiumFilter === "premium" ? "Premium" : "Gratuito"}</span>
                                                <button
                                                    onClick={() => setPremiumFilter("all")}
                                                    className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </CollapsibleContent>
            </Collapsible>

            <div className="flex justify-between items-center bg-card/50 backdrop-blur-sm rounded-lg p-4 border border-border">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary-dark/20 flex items-center justify-center">
                        <BookOpen className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-foreground">
                            {loading ? (
                                "Cargando..."
                            ) : (
                                <>
                                    {books.length} {books.length === 1 ? 'libro encontrado' : 'libros encontrados'}
                                </>
                            )}
                        </p>
                        {!loading && books.length > 0 && (
                            <p className="text-xs text-muted-foreground">
                                Mostrando {startIndex + 1}-{Math.min(endIndex, books.length)} de {books.length}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <BookCardSkeleton key={i} />
                    ))}
                </div>
            ) : currentBooks.length > 0 ? (
                <>
                    <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                        {currentBooks.map((book, index) => (
                            <BookCard key={book.id} book={book} index={index} />
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <Pagination className="mt-8">
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault()
                                            if (currentPage > 1) handlePageChange(currentPage - 1)
                                        }}
                                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                    />
                                </PaginationItem>

                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                                    if (
                                        page === 1 ||
                                        page === totalPages ||
                                        (page >= currentPage - 1 && page <= currentPage + 1)
                                    ) {
                                        return (
                                            <PaginationItem key={page}>
                                                <PaginationLink
                                                    href="#"
                                                    onClick={(e) => {
                                                        e.preventDefault()
                                                        handlePageChange(page)
                                                    }}
                                                    isActive={currentPage === page}
                                                    className="cursor-pointer"
                                                >
                                                    {page}
                                                </PaginationLink>
                                            </PaginationItem>
                                        )
                                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                                        return (
                                            <PaginationItem key={page}>
                                                <PaginationEllipsis />
                                            </PaginationItem>
                                        )
                                    }
                                    return null
                                })}

                                <PaginationItem>
                                    <PaginationNext
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault()
                                            if (currentPage < totalPages) handlePageChange(currentPage + 1)
                                        }}
                                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    )}
                </>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 px-4">
                    <div className="relative mb-6">
                        <div className="h-32 w-32 rounded-full bg-gradient-to-br from-primary/20 to-primary-dark/20 flex items-center justify-center">
                            <Search className="h-16 w-16 text-primary/40" />
                        </div>
                        <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl animate-pulse" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">No se encontraron libros</h3>
                    <p className="text-muted-foreground text-center max-w-md mb-6">
                        No hay libros que coincidan con tu búsqueda. Intenta con otros filtros o términos de búsqueda.
                    </p>
                    <Button
                        onClick={() => {
                            setSearchTerm("")
                            setSelectedCategory("all")
                            setSelectedAuthor("all")
                            setPremiumFilter("all")
                        }}
                        className="bg-gradient-to-r from-primary to-primary-dark hover:shadow-lg hover:shadow-primary/30 transition-all"
                    >
                        Limpiar todos los filtros
                    </Button>
                </div>
            )}
        </div>
    )
}
