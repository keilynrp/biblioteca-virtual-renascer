"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Pencil, Trash2, FolderOpen, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import api from "@/lib/api"

interface Category {
    id: number
    name: string
    slug: string
    description: string
}

interface CategoryFormData {
    name: string
    description: string
}

export default function CategoriesAdminPage() {
    const [categories, setCategories] = useState<Category[]>([])
    const [filteredCategories, setFilteredCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingCategory, setEditingCategory] = useState<Category | null>(null)
    const [submitting, setSubmitting] = useState(false)
    const [totalBooks, setTotalBooks] = useState(0)

    const [formData, setFormData] = useState<CategoryFormData>({
        name: "",
        description: "",
    })

    useEffect(() => {
        fetchData()
    }, [])

    useEffect(() => {
        const filtered = categories.filter(category =>
            category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            category.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
        setFilteredCategories(filtered)
    }, [searchTerm, categories])

    const fetchData = async () => {
        try {
            const [categoriesResponse, booksResponse] = await Promise.all([
                api.get("/content/categories/"),
                api.get("/content/books/")
            ])
            // Handle paginated responses
            const categoriesData = categoriesResponse.data?.results || categoriesResponse.data || []
            const booksData = booksResponse.data?.results || booksResponse.data || []
            const categoriesArray = Array.isArray(categoriesData) ? categoriesData : []
            const booksArray = Array.isArray(booksData) ? booksData : []

            setCategories(categoriesArray)
            setFilteredCategories(categoriesArray)
            setTotalBooks(booksArray.length)
        } catch (err) {
            console.error("Error fetching data:", err)
            alert("Error al cargar los datos")
        } finally {
            setLoading(false)
        }
    }

    const handleOpenDialog = (category?: Category) => {
        if (category) {
            setEditingCategory(category)
            setFormData({
                name: category.name,
                description: category.description,
            })
        } else {
            setEditingCategory(null)
            setFormData({
                name: "",
                description: "",
            })
        }
        setDialogOpen(true)
    }

    const handleCloseDialog = () => {
        setDialogOpen(false)
        setEditingCategory(null)
        setFormData({
            name: "",
            description: "",
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)

        try {
            const dataToSend = {
                name: formData.name,
                description: formData.description,
            }

            if (editingCategory) {
                const response = await api.patch(`/content/categories/${editingCategory.id}/`, dataToSend)
                setCategories(categories.map(category => category.id === editingCategory.id ? response.data : category))
            } else {
                const response = await api.post("/content/categories/", dataToSend)
                setCategories([response.data, ...categories])
            }

            handleCloseDialog()
            alert(editingCategory ? "Categoría actualizada exitosamente" : "Categoría creada exitosamente")
            fetchData()
        } catch (err: any) {
            console.error("Error submitting category:", err)
            const errorMessage = err.response?.data?.detail || err.response?.data?.name?.[0] || "Error al guardar la categoría"
            alert(errorMessage)
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async (category: Category) => {
        if (!confirm(`¿Estás seguro de eliminar la categoría "${category.name}"?`)) {
            return
        }

        try {
            await api.delete(`/content/categories/${category.id}/`)
            setCategories(categories.filter(c => c.id !== category.id))
            alert("Categoría eliminada exitosamente")
        } catch (err: any) {
            console.error("Error deleting category:", err)
            alert("Error al eliminar la categoría. Puede que tenga libros asociados.")
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Cargando categorías...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-7xl">
            {/* Header */}
            <div className="flex flex-col gap-4 mb-8">
                <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                        Gestión de Categorías
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Administra las categorías de tu biblioteca
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Categorías
                            </CardTitle>
                            <FolderOpen className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{categories.length}</div>
                            <p className="text-xs text-muted-foreground">
                                Categorías registradas en el sistema
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Libros
                            </CardTitle>
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalBooks}</div>
                            <p className="text-xs text-muted-foreground">
                                Libros en la biblioteca
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Search and Create */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                        placeholder="Buscar categorías por nombre o descripción..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Button
                    onClick={() => handleOpenDialog()}
                    className="bg-gradient-to-r from-primary to-primary-dark"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Nueva Categoría
                </Button>
            </div>

            {/* Table */}
            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Slug</TableHead>
                            <TableHead>Descripción</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredCategories.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                    {searchTerm ? "No se encontraron categorías" : "No hay categorías registradas"}
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredCategories.map((category) => (
                                <TableRow key={category.id}>
                                    <TableCell className="font-medium">{category.name}</TableCell>
                                    <TableCell>
                                        <code className="text-xs bg-muted px-2 py-1 rounded">
                                            {category.slug}
                                        </code>
                                    </TableCell>
                                    <TableCell className="max-w-md truncate">
                                        {category.description || "Sin descripción"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleOpenDialog(category)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(category)}
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>

            {/* Create/Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>
                            {editingCategory ? "Editar Categoría" : "Nueva Categoría"}
                        </DialogTitle>
                        <DialogDescription>
                            {editingCategory
                                ? "Modifica los datos de la categoría"
                                : "Completa los datos de la nueva categoría"}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nombre *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Ej: Ficción Literaria"
                                required
                            />
                            <p className="text-xs text-muted-foreground">
                                El slug se generará automáticamente
                            </p>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">Descripción</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Breve descripción de la categoría..."
                                rows={4}
                            />
                        </div>

                        <Separator />

                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleCloseDialog}
                                disabled={submitting}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={submitting}
                                className="bg-gradient-to-r from-primary to-primary-dark"
                            >
                                {submitting
                                    ? "Guardando..."
                                    : editingCategory
                                        ? "Actualizar"
                                        : "Crear"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
