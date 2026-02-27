"use client"

import { AdminGuard } from "@/components/admin/admin-guard"
import { useEffect, useState, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { BookOpen, Plus, Search, MoreVertical, Edit, Trash2, Eye, Download, FileSpreadsheet, FileText, Upload } from "lucide-react"
import Link from "next/link"
import { YearPicker } from "@/components/ui/year-picker"
import { TaxonomySelector } from "@/components/ui/taxonomy-selector"
import { ImageUpload } from "@/components/ui/image-upload"

interface Book {
    id: number
    title: string
    slug: string
    author: {
        id: number
        name: string
    } | null
    category: {
        id: number
        name: string
    } | null
    description: string
    isbn: string | null
    publication_date: string | null
    is_premium: boolean
    doi: string | null
    is_open_access: boolean
    source: string
    external_url: string | null
    publisher: string
    language: string
    published_year: number | null
    created_at: string
    cover_image: string | null
    file: string | null
}

interface Author {
    id: number
    name: string
}

interface Category {
    id: number
    name: string
    slug: string
    parent?: number | null
    children?: Category[]
}

interface BookFormData {
    title: string
    description: string
    author: string
    category: string
    isbn: string
    publication_date: string
    publication_year: string  // Para manejar solo el año
    is_premium: boolean
    cover_image: File | null
    file: File | null
    publisher: string
    language: string
    doi: string
    external_url: string
    source: string
    is_open_access: boolean
}

function AdminBooksPageContent() {
    const [books, setBooks] = useState<Book[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [authors, setAuthors] = useState<Author[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [filteredBooks, setFilteredBooks] = useState<Book[]>([])
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [selectedBooks, setSelectedBooks] = useState<Set<number>>(new Set())
    const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)
    const [exportFormat, setExportFormat] = useState<"csv" | "xlsx">("csv")
    const [exportMode, setExportMode] = useState<"all" | "selected">("all")
    const [editingBook, setEditingBook] = useState<Book | null>(null)
    const [formData, setFormData] = useState<BookFormData>({
        title: "",
        description: "",
        author: "",
        category: "",
        isbn: "",
        publication_date: "",
        publication_year: "",
        is_premium: false,
        cover_image: null,
        file: null,
        publisher: "",
        language: "",
        doi: "",
        external_url: "",
        source: "manual",
        is_open_access: false,
    })
    const [submitting, setSubmitting] = useState(false)
    const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
    const [importing, setImporting] = useState(false)
    const [importResult, setImportResult] = useState<{ imported: number, skipped: number, errors: string[] } | null>(null)
    const [importFile, setImportFile] = useState<File | null>(null)
    const searchParams = useSearchParams()
    const editSlug = searchParams.get("edit")

    useEffect(() => {
        fetchData()
    }, [])

    async function fetchData() {
        try {
            const [booksRes, categoriesRes, authorsRes] = await Promise.all([
                api.get("/content/books/"),
                api.get("/content/categories/"),
                api.get("/content/authors/"),
            ])
            // Handle paginated responses
            const booksData = booksRes.data?.results || booksRes.data || []
            const categoriesData = categoriesRes.data?.results || categoriesRes.data || []
            const authorsData = authorsRes.data?.results || authorsRes.data || []

            const booksArray = Array.isArray(booksData) ? booksData : []
            const categoriesArray = Array.isArray(categoriesData) ? categoriesData : []
            const authorsArray = Array.isArray(authorsData) ? authorsData : []

            setBooks(booksArray)
            setFilteredBooks(booksArray)
            setCategories(categoriesArray)
            setAuthors(authorsArray)
        } catch (err) {
            console.error("Error fetching data:", err)
        } finally {
            setLoading(false)
        }
    }

    // Auto-open edit dialog if edit param is present
    useEffect(() => {
        if (!loading && editSlug && books.length > 0) {
            const bookToEdit = books.find(b => b.slug === editSlug || String(b.id) === editSlug)
            if (bookToEdit) {
                handleOpenDialog(bookToEdit)
            }
        }
    }, [loading, editSlug, books])

    useEffect(() => {
        const filtered = books.filter(book =>
            book.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            book.author?.name?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        setFilteredBooks(filtered)
    }, [searchQuery, books])

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedBooks(new Set(filteredBooks.map(b => b.id)))
        } else {
            setSelectedBooks(new Set())
        }
    }

    const handleSelectBook = (id: number, checked: boolean) => {
        const newSet = new Set(selectedBooks)
        if (checked) {
            newSet.add(id)
        } else {
            newSet.delete(id)
        }
        setSelectedBooks(newSet)
    }

    const handleExportConfirm = async () => {
        setIsExportDialogOpen(false)
        if (exportFormat === "csv") {
            await exportToCSV(exportMode === "selected")
        } else {
            await exportToExcel(exportMode === "selected")
        }
    }

    const handleDelete = async (slug: string, id: number) => {
        if (!confirm("¿Estás seguro de que quieres eliminar este libro?")) return

        try {
            await api.delete(`/content/books/${slug}/`)
            setBooks(books.filter(book => book.id !== id))
        } catch (err) {
            console.error("Error deleting book:", err)
            alert("Error al eliminar el libro")
        }
    }

    const handleOpenDialog = (book?: Book) => {
        if (book) {
            setEditingBook(book)

            // Extraer el año de publication_date si existe
            let year = "";
            console.log('📖 [DEBUG] Abriendo libro:', book.title);
            console.log('📅 [DEBUG] publication_date:', book.publication_date);

            if (book.publication_date) {
                try {
                    const yearStr = book.publication_date.substring(0, 4);
                    const yearNum = parseInt(yearStr, 10);
                    if (!isNaN(yearNum) && yearNum > 0) {
                        year = yearStr;
                    }
                } catch (error) {
                    console.warn("❌ [DEBUG] Error parsing publication_date:", error);
                }
            }

            console.log('🗓️ [DEBUG] year extraído:', year);

            setFormData({
                title: book.title || "",
                description: book.description || "",
                author: book.author?.id ? String(book.author.id) : "",
                category: book.category?.id ? String(book.category.id) : "",
                isbn: book.isbn || "",
                publication_date: book.publication_date || "",
                publication_year: year,
                is_premium: book.is_premium || false,
                cover_image: null,
                file: null,
                publisher: book.publisher || "",
                language: book.language || "",
                doi: book.doi || "",
                external_url: book.external_url || "",
                source: book.source || "manual",
                is_open_access: book.is_open_access || false,
            })
        } else {
            setEditingBook(null)
            setFormData({
                title: "",
                description: "",
                author: "",
                category: "",
                isbn: "",
                publication_date: "",
                publication_year: "",
                is_premium: false,
                cover_image: null,
                file: null,
                publisher: "",
                language: "",
                doi: "",
                external_url: "",
                source: "manual",
                is_open_access: false,
            })
        }
        setIsDialogOpen(true)
    }

    const handleCloseDialog = () => {
        setIsDialogOpen(false)
        setEditingBook(null)
        setFormData({
            title: "",
            description: "",
            author: "",
            category: "",
            isbn: "",
            publication_date: "",
            publication_year: "",
            is_premium: false,
            cover_image: null,
            file: null,
            publisher: "",
            language: "",
            doi: "",
            external_url: "",
            source: "manual",
            is_open_access: false,
        })
    }

    const handleAddAuthor = async (name: string) => {
        try {
            const res = await api.post("/content/authors/", { name })
            const newAuthor = res.data
            setAuthors(prev => [...prev, newAuthor])
            return newAuthor
        } catch (err) {
            console.error("Error creating author:", err)
            alert("Error al crear el autor")
            return null
        }
    }

    const handleAddCategory = async (name: string) => {
        try {
            const res = await api.post("/content/categories/", { name })
            const newCategory = res.data
            setCategories(prev => [...prev, newCategory])
            return newCategory
        } catch (err) {
            console.error("Error creating category:", err)
            alert("Error al crear la categoría")
            return null
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)

        try {
            const formDataToSend = new FormData()
            formDataToSend.append('title', formData.title)
            formDataToSend.append('description', formData.description)
            formDataToSend.append('author', formData.author)
            formDataToSend.append('category', formData.category)
            formDataToSend.append('isbn', formData.isbn)

            // Enviar publication_date siempre (incluso si está vacío) para permitir actualizaciones
            console.log('📋 [DEBUG] Estado actual de formData:');
            console.log('  - publication_year:', formData.publication_year);
            console.log('  - publication_date:', formData.publication_date);

            // Enviar el campo siempre, incluso si está vacío (para permitir borrar la fecha)
            if (formData.publication_date && formData.publication_date.trim() !== '') {
                formDataToSend.append('publication_date', formData.publication_date)
                console.log('📅 [DEBUG] Enviando publication_date:', formData.publication_date);
            } else {
                // Enviar campo vacío para permitir actualizaciones a null
                formDataToSend.append('publication_date', '')
                console.log('📅 [DEBUG] Enviando publication_date vacío (para limpiar)');
            }

            formDataToSend.append('is_premium', String(formData.is_premium))

            // Campos adicionales opcionales
            if (formData.publisher) formDataToSend.append('publisher', formData.publisher)
            if (formData.language) formDataToSend.append('language', formData.language)
            if (formData.doi) formDataToSend.append('doi', formData.doi)
            if (formData.external_url) formDataToSend.append('external_url', formData.external_url)
            formDataToSend.append('source', formData.source)
            formDataToSend.append('is_open_access', String(formData.is_open_access))

            // Agregar archivos si existen (usar los nombres correctos del serializer)
            if (formData.cover_image) {
                formDataToSend.append('cover_image_upload', formData.cover_image)
            }
            if (formData.file) {
                formDataToSend.append('file_upload', formData.file)
            } else if (!editingBook) {
                // Para nuevos libros sin archivo, usar placeholder (solo si es creación)
                const placeholderBlob = new Blob(['placeholder'], { type: 'application/pdf' })
                formDataToSend.append('file_upload', placeholderBlob, 'placeholder.pdf')
            }

            // No establecer Content-Type manualmente para multipart/form-data
            // El navegador lo configura automáticamente con el boundary correcto
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }

            if (editingBook) {
                // Actualizar libro existente
                await api.patch(`/content/books/${editingBook.slug}/`, formDataToSend, config)
            } else {
                // Crear nuevo libro
                await api.post("/content/books/", formDataToSend, config)
            }

            handleCloseDialog()
            alert(editingBook ? "Libro actualizado exitosamente" : "Libro creado exitosamente")
            // Refrescar todos los datos para asegurar estructura correcta
            await fetchData()
        } catch (err: unknown) {
            console.error("Error submitting book:", err)
            const error = err as { response?: { data?: { detail?: string; title?: string[] } } }
            const errorMessage = error.response?.data?.detail || error.response?.data?.title?.[0] || "Error al guardar el libro"
            alert(errorMessage)
        } finally {
            setSubmitting(false)
        }
    }

    const exportToCSV = async (onlySelected = false) => {
        try {
            const idsParam = onlySelected && selectedBooks.size > 0
                ? `&ids=${Array.from(selectedBooks).join(',')}`
                : ''
            const response = await api.get(`/content/books/export/?export_format=csv${idsParam}`, {
                responseType: 'blob'
            })
            const url = window.URL.createObjectURL(new Blob([response.data]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', `catalogo_libros_${new Date().toISOString().split('T')[0]}.csv`)
            document.body.appendChild(link)
            link.click()
            link.remove()
        } catch (err) {
            console.error("Error exporting to CSV:", err)
            alert("Error al exportar a CSV")
        }
    }

    const exportToExcel = async (onlySelected = false) => {
        try {
            const idsParam = onlySelected && selectedBooks.size > 0
                ? `&ids=${Array.from(selectedBooks).join(',')}`
                : ''
            const response = await api.get(`/content/books/export/?export_format=xlsx${idsParam}`, {
                responseType: 'blob'
            })
            const url = window.URL.createObjectURL(new Blob([response.data]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', `catalogo_libros_${new Date().toISOString().split('T')[0]}.xlsx`)
            document.body.appendChild(link)
            link.click()
            link.remove()
        } catch (err) {
            console.error("Error exporting to Excel:", err)
            alert("Error al exportar a Excel")
        }
    }

    const handleImport = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!importFile) return

        setImporting(true)
        setImportResult(null)

        try {
            const formData = new FormData()
            formData.append('file', importFile)

            const res = await api.post("/content/books/import/", formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })

            setImportResult(res.data)
            await fetchData()
        } catch (err) {
            console.error("Error importing books:", err)
            alert("Error al importar libros")
        } finally {
            setImporting(false)
        }
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div className="h-8 bg-muted rounded w-1/4 animate-pulse"></div>
                    <div className="h-10 bg-muted rounded w-32 animate-pulse"></div>
                </div>
                <Card>
                    <CardContent className="p-6">
                        <div className="space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="h-12 bg-muted rounded animate-pulse"></div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <>
            <div className="py-5 space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold">Administrar Libros</h1>
                        <p className="text-muted-foreground mt-1">
                            Gestiona el catálogo de libros de la biblioteca
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => {
                            setImportResult(null)
                            setImportFile(null)
                            setIsImportDialogOpen(true)
                        }}>
                            <Upload className="mr-2 h-4 w-4" />
                            Importar
                        </Button>
                        <Button variant="outline" onClick={() => {
                            setExportMode(selectedBooks.size > 0 ? "selected" : "all")
                            setIsExportDialogOpen(true)
                        }}>
                            <Download className="mr-2 h-4 w-4" />
                            Exportar {selectedBooks.size > 0 && `(${selectedBooks.size})`}
                        </Button>
                        <Button
                            className="bg-gradient-to-r from-primary to-primary-dark"
                            onClick={() => handleOpenDialog()}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Nuevo Libro
                        </Button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardDescription>Total de Libros</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{books.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardDescription>Libros Premium</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">
                                {books.filter(b => b.is_premium).length}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardDescription>Libros Gratuitos</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">
                                {books.filter(b => !b.is_premium).length}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardDescription>Categorías</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{categories.length}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search and Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Catálogo de Libros</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar libros por título o autor..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        {/* Books Table */}
                        <div className="border rounded-lg">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">
                                            <Checkbox
                                                checked={filteredBooks.length > 0 && selectedBooks.size === filteredBooks.length}
                                                onCheckedChange={handleSelectAll}
                                            />
                                        </TableHead>
                                        <TableHead className="w-20">Portada</TableHead>
                                        <TableHead>Título</TableHead>
                                        <TableHead>Autor</TableHead>
                                        <TableHead>Categoría</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead>Fecha de Publicación</TableHead>
                                        <TableHead className="text-right">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredBooks.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                                <BookOpen className="mx-auto h-12 w-12 mb-2 opacity-50" />
                                                <p>No se encontraron libros</p>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredBooks.map((book) => (
                                            <TableRow key={book.id}>
                                                <TableCell>
                                                    <Checkbox
                                                        checked={selectedBooks.has(book.id)}
                                                        onCheckedChange={(checked) => handleSelectBook(book.id, checked as boolean)}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    {book.cover_image ? (
                                                        <div className="relative w-12 h-16 rounded overflow-hidden border shadow-sm bg-muted/50 group">
                                                            <img
                                                                src={book.cover_image}
                                                                alt={book.title}
                                                                className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
                                                                onError={(e) => {
                                                                    e.currentTarget.src = 'https://via.placeholder.com/150?text=No+Cover'
                                                                }}
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="w-12 h-16 rounded bg-muted flex items-center justify-center border border-dashed text-muted-foreground/40">
                                                            <BookOpen className="h-6 w-6" />
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell className="font-medium">{book.title}</TableCell>
                                                <TableCell>{book.author?.name || 'Sin autor'}</TableCell>
                                                <TableCell>{book.category?.name || 'Sin categoría'}</TableCell>
                                                <TableCell>
                                                    {book.is_premium ? (
                                                        <Badge className="bg-gradient-to-r from-amber-500 to-amber-600 text-white border-0">
                                                            Premium
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline">Gratuito</Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {book.publication_date ? book.publication_date.substring(0, 4) : 'N/A'}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon">
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem asChild>
                                                                <Link href={`/library/${book.slug}`}>
                                                                    <Eye className="mr-2 h-4 w-4" />
                                                                    Ver Detalles
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleOpenDialog(book)}>
                                                                <Edit className="mr-2 h-4 w-4" />
                                                                Editar
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={(e) => {
                                                                    e.preventDefault()
                                                                    handleDelete(book.slug, book.id)
                                                                }}
                                                                className="text-destructive"
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                Eliminar
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Export Dialog */}
            <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Exportar Libros</DialogTitle>
                        <DialogDescription>
                            Selecciona el formato y los registros que deseas exportar.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-4">
                            <Label className="text-base text-foreground font-semibold">Registros a exportar</Label>
                            <div className="flex flex-col gap-3 ml-1">
                                <label className="flex items-center gap-3 text-sm font-medium cursor-pointer">
                                    <input
                                        type="radio"
                                        name="exportMode"
                                        value="all"
                                        checked={exportMode === "all"}
                                        onChange={() => setExportMode("all")}
                                        className="h-4 w-4 text-primary"
                                    />
                                    Todos los registros en la lista actual
                                </label>
                                <label className={`flex items-center gap-3 text-sm font-medium ${selectedBooks.size === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                                    <input
                                        type="radio"
                                        name="exportMode"
                                        value="selected"
                                        checked={exportMode === "selected"}
                                        onChange={() => setExportMode("selected")}
                                        disabled={selectedBooks.size === 0}
                                        className="h-4 w-4 text-primary"
                                    />
                                    Solo registros seleccionados ({selectedBooks.size})
                                </label>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Label className="text-base text-foreground font-semibold">Formato</Label>
                            <div className="flex flex-col gap-3 ml-1">
                                <label className="flex items-center gap-3 text-sm font-medium cursor-pointer">
                                    <input
                                        type="radio"
                                        name="exportFormat"
                                        value="xlsx"
                                        checked={exportFormat === "xlsx"}
                                        onChange={() => setExportFormat("xlsx")}
                                        className="h-4 w-4 text-primary"
                                    />
                                    Excel (.xlsx)
                                </label>
                                <label className="flex items-center gap-3 text-sm font-medium cursor-pointer">
                                    <input
                                        type="radio"
                                        name="exportFormat"
                                        value="csv"
                                        checked={exportFormat === "csv"}
                                        onChange={() => setExportFormat("csv")}
                                        className="h-4 w-4 text-primary"
                                    />
                                    CSV
                                </label>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsExportDialogOpen(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleExportConfirm}>
                            Exportar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Create/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingBook ? "Editar Libro" : "Crear Nuevo Libro"}
                        </DialogTitle>
                        <DialogDescription>
                            {editingBook
                                ? "Actualiza la información del libro"
                                : "Completa el formulario para agregar un nuevo libro a la biblioteca"}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="title">Título *</Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="author">Autor *</Label>
                                    <TaxonomySelector
                                        items={authors}
                                        value={formData.author}
                                        onValueChange={(value) => setFormData({ ...formData, author: value })}
                                        placeholder="Seleccionar autor"
                                        searchPlaceholder="Buscar o añadir autor..."
                                        onAddItem={handleAddAuthor}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="category">Categoría *</Label>
                                    <TaxonomySelector
                                        items={categories}
                                        value={formData.category}
                                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                                        placeholder="Seleccionar categoría"
                                        searchPlaceholder="Buscar o añadir categoría..."
                                        onAddItem={handleAddCategory}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="description">Descripción *</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={4}
                                    required
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="isbn">ISBN (Opcional)</Label>
                                <Input
                                    id="isbn"
                                    value={formData.isbn || ""}
                                    onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                                    placeholder="978-3-16-148410-0"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="publication_year">Año de Publicación (Opcional)</Label>
                                <YearPicker
                                    value={formData.publication_year}
                                    onChange={(year) => {
                                        console.log('🔄 [DEBUG] YearPicker onChange llamado con:', year);

                                        const date = year ? `${year}-01-01` : '';

                                        console.log('📅 [DEBUG] publication_date generado:', date);

                                        setFormData({
                                            ...formData,
                                            publication_year: year,
                                            publication_date: date
                                        });

                                        console.log('✅ [DEBUG] Estado actualizado');
                                    }}
                                    placeholder="Seleccionar año"
                                    minYear={1000}
                                    maxYear={new Date().getFullYear() + 10}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Selecciona o escribe el año de publicación
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="cover_image">Imagen de Portada</Label>
                                    <ImageUpload
                                        value={formData.cover_image || (editingBook?.cover_image)}
                                        onChange={(file) => setFormData({ ...formData, cover_image: file })}
                                        onRemove={() => setFormData({ ...formData, cover_image: null })}
                                    />
                                    <p className="text-xs text-muted-foreground mt-2">
                                        Arrastra una imagen o haz clic para seleccionar. Formatos: JPG, PNG, WebP (Máx. 2MB)
                                    </p>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="file">Archivo PDF</Label>
                                    <Input
                                        id="file"
                                        type="file"
                                        accept=".pdf,application/pdf"
                                        onChange={(e) => setFormData({ ...formData, file: e.target.files?.[0] || null })}
                                        className="cursor-pointer"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Formato: PDF (Máx. 50MB)
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="is_premium"
                                    checked={formData.is_premium}
                                    onChange={(e) => setFormData({ ...formData, is_premium: e.target.checked })}
                                    className="h-4 w-4 rounded border-gray-300"
                                />
                                <Label htmlFor="is_premium" className="cursor-pointer">
                                    Marcar como Premium
                                </Label>
                            </div>

                            {/* Información Adicional (Opcional) */}
                            <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
                                <p className="text-sm font-semibold text-muted-foreground">Información Adicional (Opcional)</p>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="publisher">Editorial</Label>
                                        <Input
                                            id="publisher"
                                            value={formData.publisher}
                                            onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                                            placeholder="ej: Cambridge University Press"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="language">Idioma</Label>
                                        <Input
                                            id="language"
                                            value={formData.language}
                                            onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                                            placeholder="ej: es, en, pt"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="doi">DOI</Label>
                                        <Input
                                            id="doi"
                                            value={formData.doi}
                                            onChange={(e) => setFormData({ ...formData, doi: e.target.value })}
                                            placeholder="ej: 10.1234/example"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="external_url">URL Externa (PDF)</Label>
                                        <Input
                                            id="external_url"
                                            type="url"
                                            value={formData.external_url}
                                            onChange={(e) => setFormData({ ...formData, external_url: e.target.value })}
                                            placeholder="https://..."
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="source">Fuente</Label>
                                        <Select
                                            value={formData.source}
                                            onValueChange={(value) => setFormData({ ...formData, source: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccionar fuente" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="manual">Manual</SelectItem>
                                                <SelectItem value="openlibrary">OpenLibrary</SelectItem>
                                                <SelectItem value="doab">DOAB</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>&nbsp;</Label>
                                        <div className="flex items-center space-x-2 h-10">
                                            <input
                                                type="checkbox"
                                                id="is_open_access"
                                                checked={formData.is_open_access}
                                                onChange={(e) => setFormData({ ...formData, is_open_access: e.target.checked })}
                                                className="h-4 w-4 rounded border-gray-300"
                                            />
                                            <Label htmlFor="is_open_access" className="cursor-pointer">
                                                Open Access
                                            </Label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleCloseDialog}
                                disabled={submitting}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={submitting}>
                                {submitting ? "Guardando..." : editingBook ? "Actualizar" : "Crear"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Import Dialog */}
            <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Importar Libros</DialogTitle>
                        <DialogDescription>
                            Sube un archivo CSV o XLSX para importar libros masivamente.
                        </DialogDescription>
                    </DialogHeader>

                    {!importResult ? (
                        <form onSubmit={handleImport} className="space-y-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="import-file">Archivo (CSV o XLSX)</Label>
                                <Input
                                    id="import-file"
                                    type="file"
                                    accept=".csv,.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                                    onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                                    required
                                />
                                <p className="text-xs text-muted-foreground">
                                    Asegúrate de que las columnas coincidan: Título, Autor, Categoría, Descripción, ISBN, Es Premium.
                                </p>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsImportDialogOpen(false)}>
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={!importFile || importing}>
                                    {importing ? "Importando..." : "Comenzar Importación"}
                                </Button>
                            </DialogFooter>
                        </form>
                    ) : (
                        <div className="py-4 space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-center">
                                <div className="border rounded-lg p-3">
                                    <div className="text-2xl font-bold text-green-600">{importResult.imported}</div>
                                    <div className="text-xs text-muted-foreground uppercase">Importados</div>
                                </div>
                                <div className="border rounded-lg p-3">
                                    <div className="text-2xl font-bold text-amber-600">{importResult.skipped}</div>
                                    <div className="text-xs text-muted-foreground uppercase">Omitidos</div>
                                </div>
                            </div>

                            {importResult.errors.length > 0 && (
                                <div className="space-y-2">
                                    <Label className="text-destructive font-semibold">Errores ({importResult.errors.length})</Label>
                                    <div className="max-h-32 overflow-y-auto border rounded p-2 text-xs bg-muted/30">
                                        {importResult.errors.map((err, i) => (
                                            <div key={i} className="mb-1 text-destructive">• {err}</div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <DialogFooter>
                                <Button onClick={() => setIsImportDialogOpen(false)}>
                                    Cerrar
                                </Button>
                            </DialogFooter>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    )
}

export default function AdminBooksPage() {
    return <AdminGuard><AdminBooksPageContent /></AdminGuard>
}
