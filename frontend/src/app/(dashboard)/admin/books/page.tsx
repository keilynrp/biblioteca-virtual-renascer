"use client"

import { useEffect, useState } from "react"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
import { BookOpen, Plus, Search, MoreVertical, Edit, Trash2, Eye, Download, FileSpreadsheet, FileText } from "lucide-react"
import Link from "next/link"

interface Book {
    id: number
    title: string
    slug: string
    author: {
        id: number
        name: string
    }
    category: {
        id: number
        name: string
    }
    description: string
    isbn: string
    publication_date: string
    is_premium: boolean
    created_at: string
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

interface BookFormData {
    title: string
    description: string
    author: string
    category: string
    isbn: string
    publication_date: string
    is_premium: boolean
    cover_image?: File | null
    file?: File | null
}

export default function AdminBooksPage() {
    const [books, setBooks] = useState<Book[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [authors, setAuthors] = useState<Author[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [filteredBooks, setFilteredBooks] = useState<Book[]>([])
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingBook, setEditingBook] = useState<Book | null>(null)
    const [formData, setFormData] = useState<BookFormData>({
        title: "",
        description: "",
        author: "",
        category: "",
        isbn: "",
        publication_date: "",
        is_premium: false,
    })
    const [submitting, setSubmitting] = useState(false)

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

    useEffect(() => {
        const filtered = books.filter(book =>
            book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            book.author.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        setFilteredBooks(filtered)
    }, [searchQuery, books])

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
            setFormData({
                title: book.title,
                description: book.description,
                author: String(book.author.id),
                category: String(book.category.id),
                isbn: book.isbn,
                publication_date: book.publication_date,
                is_premium: book.is_premium,
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
                is_premium: false,
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
            is_premium: false,
        })
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
            formDataToSend.append('publication_date', formData.publication_date)
            formDataToSend.append('is_premium', String(formData.is_premium))

            // Agregar archivos si existen
            if (formData.cover_image) {
                formDataToSend.append('cover_image', formData.cover_image)
            }
            if (formData.file) {
                formDataToSend.append('file', formData.file)
            } else if (!editingBook) {
                // Para nuevos libros sin archivo, usar placeholder
                const placeholderBlob = new Blob(['placeholder'], { type: 'application/pdf' })
                formDataToSend.append('file', placeholderBlob, 'placeholder.pdf')
            }

            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }

            if (editingBook) {
                // Actualizar libro existente
                const response = await api.patch(`/content/books/${editingBook.slug}/`, formDataToSend, config)
                setBooks(books.map(book => book.id === editingBook.id ? response.data : book))
            } else {
                // Crear nuevo libro
                const response = await api.post("/content/books/", formDataToSend, config)
                setBooks([response.data, ...books])
            }

            handleCloseDialog()
            alert(editingBook ? "Libro actualizado exitosamente" : "Libro creado exitosamente")
            fetchData() // Refrescar datos para obtener URLs completas
        } catch (err: any) {
            console.error("Error submitting book:", err)
            const errorMessage = err.response?.data?.detail || err.response?.data?.title?.[0] || "Error al guardar el libro"
            alert(errorMessage)
        } finally {
            setSubmitting(false)
        }
    }

    const exportToCSV = () => {
        // Prepare CSV data
        const headers = ['ID', 'Título', 'Autor', 'Categoría', 'ISBN', 'Fecha de Publicación', 'Premium']
        const rows = filteredBooks.map(book => [
            book.id,
            `"${book.title.replace(/"/g, '""')}"`,
            `"${book.author.name.replace(/"/g, '""')}"`,
            `"${book.category.name.replace(/"/g, '""')}"`,
            book.isbn,
            book.publication_date,
            book.is_premium ? 'Sí' : 'No'
        ])

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n')

        // Create blob and download
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', `catalogo_libros_${new Date().toISOString().split('T')[0]}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const exportToExcel = () => {
        // Create HTML table for Excel
        const headers = ['ID', 'Título', 'Autor', 'Categoría', 'ISBN', 'Fecha de Publicación', 'Premium']
        const rows = filteredBooks.map(book => [
            book.id,
            book.title,
            book.author.name,
            book.category.name,
            book.isbn,
            book.publication_date,
            book.is_premium ? 'Sí' : 'No'
        ])

        let htmlContent = '<html><head><meta charset="UTF-8"></head><body><table border="1">'
        htmlContent += '<thead><tr>' + headers.map(h => `<th>${h}</th>`).join('') + '</tr></thead>'
        htmlContent += '<tbody>'
        rows.forEach(row => {
            htmlContent += '<tr>' + row.map(cell => `<td>${cell}</td>`).join('') + '</tr>'
        })
        htmlContent += '</tbody></table></body></html>'

        // Create blob and download
        const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', `catalogo_libros_${new Date().toISOString().split('T')[0]}.xls`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
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
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold">Administrar Libros</h1>
                        <p className="text-muted-foreground mt-1">
                            Gestiona el catálogo de libros de la biblioteca
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline">
                                    <Download className="mr-2 h-4 w-4" />
                                    Exportar
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={exportToExcel}>
                                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                                    Exportar a Excel (.xls)
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={exportToCSV}>
                                    <FileText className="mr-2 h-4 w-4" />
                                    Exportar a CSV
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
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
                                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                                <BookOpen className="mx-auto h-12 w-12 mb-2 opacity-50" />
                                                <p>No se encontraron libros</p>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredBooks.map((book) => (
                                            <TableRow key={book.id}>
                                                <TableCell className="font-medium">{book.title}</TableCell>
                                                <TableCell>{book.author.name}</TableCell>
                                                <TableCell>{book.category.name}</TableCell>
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
                                                    {new Date(book.publication_date).toLocaleDateString('es-ES')}
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
                                    <Select
                                        value={formData.author}
                                        onValueChange={(value) => setFormData({ ...formData, author: value })}
                                        required
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar autor" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {authors.map((author) => (
                                                <SelectItem key={author.id} value={String(author.id)}>
                                                    {author.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="category">Categoría *</Label>
                                    <Select
                                        value={formData.category}
                                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                                        required
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar categoría" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((category) => (
                                                <SelectItem key={category.id} value={String(category.id)}>
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
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

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="isbn">ISBN</Label>
                                    <Input
                                        id="isbn"
                                        value={formData.isbn}
                                        onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                                        placeholder="978-3-16-148410-0"
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="publication_date">Fecha de Publicación *</Label>
                                    <Input
                                        id="publication_date"
                                        type="date"
                                        value={formData.publication_date}
                                        onChange={(e) => setFormData({ ...formData, publication_date: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="cover_image">Imagen de Portada</Label>
                                    <Input
                                        id="cover_image"
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setFormData({ ...formData, cover_image: e.target.files?.[0] || null })}
                                        className="cursor-pointer"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Formatos: JPG, PNG, WebP (Máx. 2MB)
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
        </>
    )
}
