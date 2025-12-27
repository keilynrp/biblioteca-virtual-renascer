import { useEffect, useState } from 'react'

/**
 * Hook para debounce de valores
 * Útil para búsquedas y inputs que disparan requests frecuentes
 *
 * @param value - Valor a hacer debounce
 * @param delay - Delay en milisegundos (default: 300ms)
 * @returns Valor con debounce aplicado
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    // Set up the timeout
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Clean up timeout if value changes (also on component unmount)
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}
