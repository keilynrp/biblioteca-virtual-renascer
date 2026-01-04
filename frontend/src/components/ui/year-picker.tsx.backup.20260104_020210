"use client"

import * as React from "react"
import { Calendar, ChevronLeft, ChevronRight, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface YearPickerProps {
  value?: string
  onChange: (year: string) => void
  placeholder?: string
  minYear?: number
  maxYear?: number
  className?: string
}

export function YearPicker({
  value,
  onChange,
  placeholder = "Seleccionar año",
  minYear = 1000,
  maxYear = new Date().getFullYear() + 10,
  className,
}: YearPickerProps) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [displayYear, setDisplayYear] = React.useState(
    value ? parseInt(value) : new Date().getFullYear()
  )

  // Sincronizar displayYear cuando cambia el value prop
  React.useEffect(() => {
    if (value && !isNaN(parseInt(value))) {
      setDisplayYear(parseInt(value))
    }
  }, [value])

  // Calcular el rango de década a mostrar (12 años por vista)
  const startYear = Math.floor(displayYear / 12) * 12
  const years = Array.from({ length: 12 }, (_, i) => startYear + i)

  // Filtrar años según búsqueda
  const filteredYears = searchQuery
    ? years.filter(year => year.toString().includes(searchQuery))
    : years

  const handleYearSelect = (year: number) => {
    onChange(year.toString())
    setOpen(false)
    setSearchQuery("")
  }

  const handlePreviousDecade = () => {
    setDisplayYear(prev => prev - 12)
  }

  const handleNextDecade = () => {
    setDisplayYear(prev => prev + 12)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)

    // Si escriben un año válido de 4 dígitos, navegar a esa década
    if (query.length === 4) {
      const yearNum = parseInt(query)
      if (!isNaN(yearNum) && yearNum >= minYear && yearNum <= maxYear) {
        setDisplayYear(yearNum)
      }
    }
  }

  const handleDirectInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    // Solo permitir números
    if (inputValue === "" || /^\d+$/.test(inputValue)) {
      onChange(inputValue)
    }
  }

  return (
    <div className="flex gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "justify-start text-left font-normal",
              !value && "text-muted-foreground",
              className
            )}
          >
            <Calendar className="mr-2 h-4 w-4" />
            {value || placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start">
          <div className="p-3 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar año..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-8"
                autoFocus
              />
            </div>
          </div>

          <div className="p-3">
            <div className="flex items-center justify-between mb-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePreviousDecade}
                disabled={startYear - 12 < minYear}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="font-semibold text-sm">
                {startYear} - {startYear + 11}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNextDecade}
                disabled={startYear + 12 > maxYear}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {filteredYears.map((year) => {
                const isSelected = value === year.toString()
                const isCurrentYear = year === new Date().getFullYear()
                const isDisabled = year < minYear || year > maxYear

                return (
                  <Button
                    key={year}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleYearSelect(year)}
                    disabled={isDisabled}
                    className={cn(
                      "h-9",
                      isCurrentYear && !isSelected && "border-blue-500 border-2",
                      isSelected && "bg-blue-600 hover:bg-blue-700"
                    )}
                  >
                    {year}
                  </Button>
                )
              })}
            </div>

            {filteredYears.length === 0 && (
              <div className="text-center py-6 text-sm text-muted-foreground">
                No se encontraron años
              </div>
            )}
          </div>

          <div className="p-3 border-t bg-muted/50">
            <div className="text-xs text-muted-foreground">
              Año actual: <span className="font-medium text-foreground">{new Date().getFullYear()}</span>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Input
        type="number"
        placeholder="o escribe el año"
        value={value || ""}
        onChange={handleDirectInput}
        min={minYear}
        max={maxYear}
        className="w-40"
      />
    </div>
  )
}
