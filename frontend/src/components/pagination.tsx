"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { memo } from "react"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  showFirstLast?: boolean
  maxPages?: number
}

export const Pagination = memo(function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showFirstLast = true,
  maxPages = 5,
}: PaginationProps) {
  if (totalPages <= 1) return null

  const canGoPrevious = currentPage > 1
  const canGoNext = currentPage < totalPages

  // Generar array de páginas a mostrar
  const getPageNumbers = () => {
    const pages: (number | string)[] = []

    if (totalPages <= maxPages) {
      // Si hay pocas páginas, mostrar todas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Calcular rango de páginas a mostrar
      const halfMax = Math.floor(maxPages / 2)
      let start = Math.max(1, currentPage - halfMax)
      let end = Math.min(totalPages, start + maxPages - 1)

      // Ajustar start si end está en el límite
      if (end === totalPages) {
        start = Math.max(1, end - maxPages + 1)
      }

      // Agregar primera página y ellipsis si es necesario
      if (start > 1) {
        pages.push(1)
        if (start > 2) {
          pages.push('...')
        }
      }

      // Agregar páginas del rango
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      // Agregar ellipsis y última página si es necesario
      if (end < totalPages) {
        if (end < totalPages - 1) {
          pages.push('...')
        }
        pages.push(totalPages)
      }
    }

    return pages
  }

  const pageNumbers = getPageNumbers()

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      {showFirstLast && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={!canGoPrevious}
          className="h-9 w-9 p-0"
        >
          <ChevronsLeft className="h-4 w-4" />
          <span className="sr-only">Primera página</span>
        </Button>
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!canGoPrevious}
        className="h-9 w-9 p-0"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">Página anterior</span>
      </Button>

      <div className="flex items-center gap-1">
        {pageNumbers.map((page, index) => {
          if (page === '...') {
            return (
              <span
                key={`ellipsis-${index}`}
                className="flex h-9 w-9 items-center justify-center text-sm text-muted-foreground"
              >
                ...
              </span>
            )
          }

          const pageNum = page as number
          const isActive = pageNum === currentPage

          return (
            <Button
              key={pageNum}
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(pageNum)}
              className="h-9 w-9 p-0"
            >
              {pageNum}
            </Button>
          )
        })}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!canGoNext}
        className="h-9 w-9 p-0"
      >
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">Página siguiente</span>
      </Button>

      {showFirstLast && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={!canGoNext}
          className="h-9 w-9 p-0"
        >
          <ChevronsRight className="h-4 w-4" />
          <span className="sr-only">Última página</span>
        </Button>
      )}
    </div>
  )
})
