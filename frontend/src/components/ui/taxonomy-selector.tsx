"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Plus, Search, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Item {
    id: number | string
    name: string
    parent?: number | string | null
    children?: Item[]
    [key: string]: any
}

interface TaxonomySelectorProps {
    items: Item[]
    value: string
    onValueChange: (value: string) => void
    placeholder?: string
    searchPlaceholder?: string
    onAddItem?: (name: string) => Promise<Item | null>
    loading?: boolean
}

export function TaxonomySelector({
    items,
    value,
    onValueChange,
    placeholder = "Seleccionar...",
    searchPlaceholder = "Buscar...",
    onAddItem,
    loading = false,
}: TaxonomySelectorProps) {
    const [open, setOpen] = React.useState(false)
    const [searchQuery, setSearchQuery] = React.useState("")
    const [isAdding, setIsAdding] = React.useState(false)
    const [mounted, setMounted] = React.useState(false)

    // SSR Hydration safety
    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <Button variant="outline" className="w-full justify-between opacity-50" disabled>
                {placeholder}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
        )
    }

    // Flatten items for searching but keep hierarchy info for display
    const flattenItems = (items: Item[], level = 0, parentPath = ""): (Item & { level: number; fullPath: string })[] => {
        return items.reduce((acc: any[], item) => {
            const currentPath = parentPath ? `${parentPath} > ${item.name}` : item.name
            acc.push({ ...item, level, fullPath: currentPath })
            if (item.children && item.children.length > 0) {
                acc.push(...flattenItems(item.children, level + 1, currentPath))
            }
            return acc
        }, [])
    }

    const allItems = flattenItems(items)

    const filteredItems = allItems.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const selectedItem = allItems.find((item) => String(item.id) === value)

    const handleAdd = async () => {
        if (!onAddItem || !searchQuery.trim()) return
        setIsAdding(true)
        try {
            const newItem = await onAddItem(searchQuery.trim())
            if (newItem) {
                onValueChange(String(newItem.id))
                setOpen(false)
                setSearchQuery("")
            }
        } finally {
            setIsAdding(false)
        }
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between text-left font-normal"
                    disabled={loading}
                >
                    {loading ? (
                        <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Cargando...</span>
                        </div>
                    ) : selectedItem ? (
                        <span className="truncate">{selectedItem.fullPath}</span>
                    ) : (
                        <span className="text-muted-foreground">{placeholder}</span>
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
                <div className="flex flex-col">
                    <div className="flex items-center border-b px-3 py-2">
                        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                        <Input
                            placeholder={searchPlaceholder}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-8 border-none focus-visible:ring-0 px-0"
                        />
                    </div>
                    <ScrollArea className="max-h-72">
                        <div className="p-1">
                            {filteredItems.length === 0 ? (
                                <div className="py-6 text-center text-sm text-muted-foreground">
                                    No se encontraron resultados
                                </div>
                            ) : (
                                filteredItems.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => {
                                            onValueChange(String(item.id))
                                            setOpen(false)
                                        }}
                                        className={cn(
                                            "relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                                            String(item.id) === value && "bg-accent text-accent-foreground"
                                        )}
                                        style={{ paddingLeft: `${(item.level * 12) + 8}px` }}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                String(item.id) === value ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        <span className="truncate">{item.name}</span>
                                    </button>
                                ))
                            )}
                        </div>
                    </ScrollArea>
                    {onAddItem && searchQuery.trim() && !allItems.some(i => i.name.toLowerCase() === searchQuery.toLowerCase()) && (
                        <div className="border-t p-1">
                            <button
                                onClick={handleAdd}
                                disabled={isAdding}
                                className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-primary hover:bg-accent disabled:opacity-50 transition-colors"
                            >
                                {isAdding ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Plus className="h-4 w-4" />
                                )}
                                <span className="font-medium">Añadir "{searchQuery}"</span>
                            </button>
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    )
}
