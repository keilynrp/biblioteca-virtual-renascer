import { useState, useCallback, useMemo } from 'react'

interface UsePaginationOptions {
  initialPage?: number
  initialPageSize?: number
  totalItems?: number
}

interface UsePaginationReturn {
  currentPage: number
  pageSize: number
  totalPages: number
  offset: number
  setPage: (page: number) => void
  nextPage: () => void
  previousPage: () => void
  setPageSize: (size: number) => void
  canGoNext: boolean
  canGoPrevious: boolean
  resetPagination: () => void
}

/**
 * Hook para manejar paginación de listas
 *
 * @param options - Opciones de paginación
 * @returns Objeto con estado y funciones de paginación
 */
export function usePagination({
  initialPage = 1,
  initialPageSize = 12,
  totalItems = 0,
}: UsePaginationOptions = {}): UsePaginationReturn {
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [pageSize, setPageSizeState] = useState(initialPageSize)

  // Calcular número total de páginas
  const totalPages = useMemo(() => {
    return Math.ceil(totalItems / pageSize)
  }, [totalItems, pageSize])

  // Calcular offset para la API
  const offset = useMemo(() => {
    return (currentPage - 1) * pageSize
  }, [currentPage, pageSize])

  // Verificar si se puede avanzar o retroceder
  const canGoNext = currentPage < totalPages
  const canGoPrevious = currentPage > 1

  // Función para cambiar de página
  const setPage = useCallback(
    (page: number) => {
      const pageNumber = Math.max(1, Math.min(page, totalPages))
      setCurrentPage(pageNumber)
    },
    [totalPages]
  )

  // Avanzar página
  const nextPage = useCallback(() => {
    if (canGoNext) {
      setCurrentPage((prev) => prev + 1)
    }
  }, [canGoNext])

  // Retroceder página
  const previousPage = useCallback(() => {
    if (canGoPrevious) {
      setCurrentPage((prev) => prev - 1)
    }
  }, [canGoPrevious])

  // Cambiar tamaño de página
  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size)
    setCurrentPage(1) // Reset to first page when changing page size
  }, [])

  // Reset paginación
  const resetPagination = useCallback(() => {
    setCurrentPage(initialPage)
    setPageSizeState(initialPageSize)
  }, [initialPage, initialPageSize])

  return {
    currentPage,
    pageSize,
    totalPages,
    offset,
    setPage,
    nextPage,
    previousPage,
    setPageSize,
    canGoNext,
    canGoPrevious,
    resetPagination,
  }
}
