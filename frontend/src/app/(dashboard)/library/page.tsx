
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import api, { handleApiError } from "@/lib/api"
import { BookCard } from "@/components/book-card"
import { BookCardSkeleton } from "@/components/book-card-skeleton"
import { PageHeader } from "@/components/page-header"
import { Input } from "@/components/ui/input"
import { Search, Filter, Settings } from "lucide-react"
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
        <div className="p-6 space-y-6">
            <PageHeader
                title="Biblioteca"
                description="Explora nuestra vasta colección de conocimiento"
                actions={
                    <div className="flex items-center space-x-3">
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar libros..."
                                className="pl-10 bg-card border-border"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                        >
                            <Filter className="h-4 w-4" />
                        </Button>
                        <Button asChild className="bg-gradient-to-r from-primary to-primary-dark">
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
                    <Card className="mb-6">
                        <CardContent className="pt-6">
                            <div className="grid gap-4 md:grid-cols-3">
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Category</label>
                                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="All Categories" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Categories</SelectItem>
                                            {categories.map((category) => (
                                                <SelectItem key={category.id} value={category.slug}>
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <label className="text-sm font-medium mb-2 block">Author</label>
                                    <Select value={selectedAuthor} onValueChange={setSelectedAuthor}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="All Authors" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Authors</SelectItem>
                                            {authors.map((author) => (
                                                <SelectItem key={author.id} value={String(author.id)}>
                                                    {author.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <label className="text-sm font-medium mb-2 block">Type</label>
                                    <Select value={premiumFilter} onValueChange={setPremiumFilter}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="All Books" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Books</SelectItem>
                                            <SelectItem value="free">Free Only</SelectItem>
                                            <SelectItem value="premium">Premium Only</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </CollapsibleContent>
            </Collapsible>

            <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                    {loading ? (
                        "Loading..."
                    ) : (
                        <>
                            Showing {currentBooks.length > 0 ? startIndex + 1 : 0}-{Math.min(endIndex, books.length)} of {books.length} books
                        </>
                    )}
                </p>
            </div>

            {loading ? (
                <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <BookCardSkeleton key={i} />
                    ))}
                </div>
            ) : currentBooks.length > 0 ? (
                <>
                    <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                        {currentBooks.map((book) => (
                            <BookCard key={book.id} book={book} />
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
                <div className="text-center py-12 text-gray-500">
                    No books found matching your criteria.
                </div>
            )}
        </div>
    )
}
