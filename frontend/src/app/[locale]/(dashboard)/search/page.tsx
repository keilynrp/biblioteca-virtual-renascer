"use client"

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { SearchBar } from '@/components/search-bar'
import { SearchFilters } from '@/components/search-filters'
import { BookCard } from '@/components/book-card'
import { Pagination } from '@/components/pagination'
import { Button } from '@/components/ui/button'
import { usePagination } from '@/hooks/use-pagination'
import api, { handleApiError } from '@/lib/api'
import { cn } from '@/lib/utils'

interface SearchBook {
  id: number
  title: string
  slug: string
  description: string
  author: {
    id: number
    name: string
  }
  category?: {
    id: number
    name: string
  } | null
  is_premium: boolean
  created_at: string
  cover_image_url?: string
  score: number
}

interface SearchResponse {
  count: number
  page: number
  page_size: number
  total_pages: number
  results: SearchBook[]
}

function SearchPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [books, setBooks] = useState<SearchBook[]>([])
  const [totalBooks, setTotalBooks] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)

  // Get search params
  const query = searchParams.get('q') || ''
  const category = searchParams.get('category') || undefined
  const author = searchParams.get('author') || undefined
  const isPremiumParam = searchParams.get('is_premium')
  const sortBy = searchParams.get('sort_by') || '_score'
  const pageParam = searchParams.get('page') || '1'

  const isPremium = isPremiumParam === 'true' ? true : isPremiumParam === 'false' ? false : null

  // Pagination
  const pagination = usePagination({
    initialPage: parseInt(pageParam),
    initialPageSize: 12,
    totalItems: totalBooks
  })

  // Fetch search results
  useEffect(() => {
    const fetchResults = async () => {
      try {
        setIsLoading(true)

        const params: Record<string, string | number> = {
          page: pagination.currentPage,
          page_size: pagination.pageSize,
          sort_by: sortBy
        }

        if (query) params.q = query
        if (category) params.category = category
        if (author) params.author = author
        if (isPremium !== null) params.is_premium = isPremium.toString()

        const response = await api.get<SearchResponse>('/content/search/', { params })

        setBooks(response.data.results)
        setTotalBooks(response.data.count)

      } catch (error) {
        console.error('Error fetching search results:', error)
        handleApiError(error)
        setBooks([])
        setTotalBooks(0)
      } finally {
        setIsLoading(false)
      }
    }

    fetchResults()
  }, [query, category, author, isPremium, sortBy, pagination.currentPage, pagination.pageSize])

  // Update URL when filters change
  const updateFilters = (filters: {
    category?: string
    author?: string
    is_premium?: boolean | null
  }) => {
    const params = new URLSearchParams()

    if (query) params.set('q', query)
    if (filters.category) params.set('category', filters.category)
    if (filters.author) params.set('author', filters.author)
    if (filters.is_premium !== null && filters.is_premium !== undefined) {
      params.set('is_premium', filters.is_premium.toString())
    }
    if (sortBy !== '_score') params.set('sort_by', sortBy)

    router.push(`/search?${params.toString()}`)
    pagination.setPage(1) // Reset to first page when filters change
  }

  // Update URL when page changes
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams()

    if (query) params.set('q', query)
    if (category) params.set('category', category)
    if (author) params.set('author', author)
    if (isPremium !== null) params.set('is_premium', isPremium.toString())
    if (sortBy !== '_score') params.set('sort_by', sortBy)
    params.set('page', page.toString())

    router.push(`/search?${params.toString()}`)
    pagination.setPage(page)

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Update sort
  const handleSortChange = (newSortBy: string) => {
    const params = new URLSearchParams()

    if (query) params.set('q', query)
    if (category) params.set('category', category)
    if (author) params.set('author', author)
    if (isPremium !== null) params.set('is_premium', isPremium.toString())
    params.set('sort_by', newSortBy)

    router.push(`/search?${params.toString()}`)
  }

  const hasActiveFilters = category || author || isPremium !== null

  return (
    <div className="min-h-screen py-5">
      {/* Search Header */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Buscar Libros</h1>
            <SearchBar
              placeholder="Buscar por título, autor, categoría..."
              showSuggestions={true}
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Filters Sidebar - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-4">
              <SearchFilters
                selectedCategory={category}
                selectedAuthor={author}
                selectedPremium={isPremium}
                onFilterChange={updateFilters}
              />
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">
                  {query ? (
                    <>
                      Resultados para &quot;<span className="text-primary">{query}</span>&quot;
                    </>
                  ) : (
                    'Todos los libros'
                  )}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {isLoading ? 'Buscando...' : `${totalBooks} libros encontrados`}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Sort Dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="_score">Más relevante</option>
                  <option value="created_at">Más reciente</option>
                  <option value="title">Título (A-Z)</option>
                  <option value="publication_date">Fecha de publicación</option>
                </select>

                {/* Mobile Filter Toggle */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden"
                >
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filtros
                  {hasActiveFilters && (
                    <span className="ml-2 bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">
                      {[category, author, isPremium !== null].filter(Boolean).length}
                    </span>
                  )}
                </Button>
              </div>
            </div>

            {/* Mobile Filters */}
            {showFilters && (
              <div className="lg:hidden mb-6 p-4 bg-card rounded-lg border border-border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Filtros</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFilters(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <SearchFilters
                  selectedCategory={category}
                  selectedAuthor={author}
                  selectedPremium={isPremium}
                  onFilterChange={(filters) => {
                    updateFilters(filters)
                    setShowFilters(false)
                  }}
                />
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-96 bg-muted animate-pulse rounded-xl" />
                ))}
              </div>
            )}

            {/* Results Grid */}
            {!isLoading && books.length > 0 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {books.map((book) => (
                    <BookCard
                      key={book.id}
                      book={{
                        id: book.id,
                        title: book.title,
                        slug: book.slug,
                        description: book.description,
                        author: { name: book.author.name },
                        category: book.category ? { name: book.category.name } : { name: 'Sin categoría' },
                        cover_image: book.cover_image_url || null,
                        is_premium: book.is_premium
                      }}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="mt-8">
                    <Pagination
                      currentPage={pagination.currentPage}
                      totalPages={pagination.totalPages}
                      onPageChange={handlePageChange}
                      showFirstLast={true}
                      maxPages={5}
                    />
                  </div>
                )}
              </>
            )}

            {/* Empty State */}
            {!isLoading && books.length === 0 && (
              <div className="text-center py-16">
                <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">No se encontraron resultados</h3>
                <p className="text-muted-foreground mb-6">
                  {query ? (
                    <>
                      No encontramos libros que coincidan con &quot;<span className="font-medium">{query}</span>&quot;
                    </>
                  ) : (
                    'Intenta ajustar los filtros de búsqueda'
                  )}
                </p>
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    onClick={() => updateFilters({
                      category: undefined,
                      author: undefined,
                      is_premium: null
                    })}
                  >
                    Limpiar filtros
                  </Button>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-16 w-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando búsqueda...</p>
        </div>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  )
}
