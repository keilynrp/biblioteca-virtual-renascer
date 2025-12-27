"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { X, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import api from '@/lib/api'

interface FilterOption {
  name: string
  count: number
}

interface Facets {
  categories: FilterOption[]
  authors: FilterOption[]
  is_premium: Array<{ is_premium: boolean; count: number }>
}

interface SearchFiltersProps {
  selectedCategory?: string
  selectedAuthor?: string
  selectedPremium?: boolean | null
  onFilterChange: (filters: {
    category?: string
    author?: string
    is_premium?: boolean | null
  }) => void
  className?: string
}

export function SearchFilters({
  selectedCategory,
  selectedAuthor,
  selectedPremium,
  onFilterChange,
  className
}: SearchFiltersProps) {
  const [facets, setFacets] = useState<Facets | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    authors: true,
    type: true
  })

  // Fetch facets from API
  useEffect(() => {
    const fetchFacets = async () => {
      try {
        setIsLoading(true)
        const response = await api.get('/content/search/facets/')
        setFacets(response.data)
      } catch (error) {
        console.error('Error fetching facets:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchFacets()
  }, [])

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const handleCategoryChange = (category: string) => {
    onFilterChange({
      category: selectedCategory === category ? undefined : category,
      author: selectedAuthor,
      is_premium: selectedPremium
    })
  }

  const handleAuthorChange = (author: string) => {
    onFilterChange({
      category: selectedCategory,
      author: selectedAuthor === author ? undefined : author,
      is_premium: selectedPremium
    })
  }

  const handlePremiumChange = (isPremium: boolean) => {
    onFilterChange({
      category: selectedCategory,
      author: selectedAuthor,
      is_premium: selectedPremium === isPremium ? null : isPremium
    })
  }

  const clearAllFilters = () => {
    onFilterChange({
      category: undefined,
      author: undefined,
      is_premium: null
    })
  }

  const hasActiveFilters = selectedCategory || selectedAuthor || selectedPremium !== null

  if (isLoading) {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="space-y-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-6 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
    )
  }

  if (!facets) {
    return (
      <div className={cn('text-center py-8', className)}>
        <p className="text-muted-foreground">No se pudieron cargar los filtros</p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header con clear all */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Filtros</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="h-auto p-0 text-primary hover:text-primary-dark"
          >
            Limpiar todo
          </Button>
        )}
      </div>

      {/* Categorías */}
      {facets.categories.length > 0 && (
        <div className="space-y-2">
          <button
            onClick={() => toggleSection('categories')}
            className="flex items-center justify-between w-full text-left font-medium"
          >
            <span>Categorías</span>
            {expandedSections.categories ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>

          {expandedSections.categories && (
            <div className="space-y-1 pl-2">
              {facets.categories.map((category) => (
                <label
                  key={category.name}
                  className={cn(
                    'flex items-center justify-between py-1.5 px-2 rounded cursor-pointer',
                    'hover:bg-muted transition-colors',
                    selectedCategory === category.name && 'bg-muted'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedCategory === category.name}
                      onChange={() => handleCategoryChange(category.name)}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm">{category.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {category.count}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Autores */}
      {facets.authors.length > 0 && (
        <div className="space-y-2">
          <button
            onClick={() => toggleSection('authors')}
            className="flex items-center justify-between w-full text-left font-medium"
          >
            <span>Autores</span>
            {expandedSections.authors ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>

          {expandedSections.authors && (
            <div className="space-y-1 pl-2 max-h-64 overflow-y-auto">
              {facets.authors.slice(0, 10).map((author) => (
                <label
                  key={author.name}
                  className={cn(
                    'flex items-center justify-between py-1.5 px-2 rounded cursor-pointer',
                    'hover:bg-muted transition-colors',
                    selectedAuthor === author.name && 'bg-muted'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedAuthor === author.name}
                      onChange={() => handleAuthorChange(author.name)}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm truncate">{author.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {author.count}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tipo (Premium/Gratis) */}
      {facets.is_premium.length > 0 && (
        <div className="space-y-2">
          <button
            onClick={() => toggleSection('type')}
            className="flex items-center justify-between w-full text-left font-medium"
          >
            <span>Tipo de acceso</span>
            {expandedSections.type ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>

          {expandedSections.type && (
            <div className="space-y-1 pl-2">
              {facets.is_premium.map((item) => (
                <label
                  key={item.is_premium ? 'premium' : 'free'}
                  className={cn(
                    'flex items-center justify-between py-1.5 px-2 rounded cursor-pointer',
                    'hover:bg-muted transition-colors',
                    selectedPremium === item.is_premium && 'bg-muted'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedPremium === item.is_premium}
                      onChange={() => handlePremiumChange(item.is_premium)}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm">
                      {item.is_premium ? 'Premium' : 'Gratis'}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {item.count}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Active filters summary */}
      {hasActiveFilters && (
        <div className="pt-4 border-t space-y-2">
          <p className="text-sm font-medium">Filtros activos:</p>
          <div className="flex flex-wrap gap-2">
            {selectedCategory && (
              <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                <span>{selectedCategory}</span>
                <button
                  onClick={() => handleCategoryChange(selectedCategory)}
                  className="hover:bg-primary/20 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            {selectedAuthor && (
              <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                <span>{selectedAuthor}</span>
                <button
                  onClick={() => handleAuthorChange(selectedAuthor)}
                  className="hover:bg-primary/20 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            {selectedPremium !== null && (
              <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                <span>{selectedPremium ? 'Premium' : 'Gratis'}</span>
                <button
                  onClick={() => handlePremiumChange(selectedPremium)}
                  className="hover:bg-primary/20 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
