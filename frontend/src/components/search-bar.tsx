"use client"

import { useState, useEffect, useRef, KeyboardEvent } from 'react'
import { Search, X, Loader2 } from 'lucide-react'
import { useDebounce } from '@/hooks/use-debounce'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { cn } from '@/lib/utils'

interface Suggestion {
  id: number
  title: string
  author: string
  slug: string
}

interface SearchBarProps {
  className?: string
  placeholder?: string
  onSearch?: (query: string) => void
  showSuggestions?: boolean
}

export function SearchBar({
  className,
  placeholder = 'Buscar libros, autores...',
  onSearch,
  showSuggestions = true
}: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Debounce query para autocomplete
  const debouncedQuery = useDebounce(query, 300)

  // Fetch autocomplete suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!debouncedQuery || debouncedQuery.length < 2 || !showSuggestions) {
        setSuggestions([])
        setShowDropdown(false)
        return
      }

      try {
        setIsLoading(true)
        const response = await api.get('/content/search/autocomplete/', {
          params: { q: debouncedQuery, size: 5 }
        })
        setSuggestions(response.data.suggestions || [])
        setShowDropdown(response.data.suggestions?.length > 0)
      } catch (error) {
        console.error('Error fetching suggestions:', error)
        setSuggestions([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchSuggestions()
  }, [debouncedQuery, showSuggestions])

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle keyboard navigation
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || suggestions.length === 0) {
      if (e.key === 'Enter' && query) {
        handleSearch()
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break

      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1))
        break

      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[selectedIndex])
        } else if (query) {
          handleSearch()
        }
        break

      case 'Escape':
        setShowDropdown(false)
        setSelectedIndex(-1)
        inputRef.current?.blur()
        break
    }
  }

  const handleSearch = () => {
    if (!query.trim()) return

    setShowDropdown(false)
    setSelectedIndex(-1)

    if (onSearch) {
      onSearch(query)
    } else {
      router.push(`/search?q=${encodeURIComponent(query)}`)
    }
  }

  const handleSuggestionClick = (suggestion: Suggestion) => {
    setQuery('')
    setShowDropdown(false)
    setSelectedIndex(-1)
    router.push(`/library/${suggestion.slug}`)
  }

  const handleClear = () => {
    setQuery('')
    setSuggestions([])
    setShowDropdown(false)
    setSelectedIndex(-1)
    inputRef.current?.focus()
  }

  return (
    <div className={cn('relative w-full', className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowDropdown(true)
            }
          }}
          placeholder={placeholder}
          className={cn(
            'w-full pl-10 pr-10 py-2.5 rounded-lg',
            'bg-background border border-input',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
            'placeholder:text-muted-foreground',
            'transition-all duration-200'
          )}
        />

        {/* Loading or Clear button */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {isLoading ? (
            <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
          ) : query ? (
            <button
              onClick={handleClear}
              className="p-0.5 rounded-full hover:bg-muted transition-colors"
              aria-label="Limpiar búsqueda"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          ) : null}
        </div>
      </div>

      {/* Suggestions Dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className={cn(
            'absolute top-full left-0 right-0 mt-2 z-50',
            'bg-popover border border-border rounded-lg shadow-lg',
            'overflow-hidden'
          )}
        >
          <div className="py-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={suggestion.id}
                onClick={() => handleSuggestionClick(suggestion)}
                className={cn(
                  'w-full px-4 py-2.5 text-left',
                  'hover:bg-muted transition-colors',
                  'flex items-center justify-between gap-3',
                  selectedIndex === index && 'bg-muted'
                )}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">
                    {suggestion.title}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    {suggestion.author}
                  </p>
                </div>
                <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              </button>
            ))}
          </div>

          {/* Search all results footer */}
          {query && (
            <div className="border-t border-border px-4 py-2 bg-muted/50">
              <button
                onClick={handleSearch}
                className="text-sm text-primary hover:underline font-medium"
              >
                Ver todos los resultados para "{query}"
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
