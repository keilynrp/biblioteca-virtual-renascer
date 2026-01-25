"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Pencil, Trash2, Users, BookOpen } from "lucide-react"
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

interface Author {
    id: number
    name: string
    bio: string
    photo: string | null
}

interface AuthorFormData {
    name: string
    bio: string
    photo?: File | null
}

export default function AuthorsAdminPage() {
    const [authors, setAuthors] = useState<Author[]>([])
    const [filteredAuthors, setFilteredAuthors] = useState<Author[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingAuthor, setEditingAuthor] = useState<Author | null>(null)
    const [submitting, setSubmitting] = useState(false)
    const [totalBooks, setTotalBooks] = useState(0)

    const [formData, setFormData] = useState<AuthorFormData>({
        name: "",
        bio: "",
        photo: null,
    })

    useEffect(() => {
        fetchData()
    }, [])

    useEffect(() => {
        const filtered = authors.filter(author =>
            author.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            author.bio.toLowerCase().includes(searchTerm.toLowerCase())
        )
        setFilteredAuthors(filtered)
    }, [searchTerm, authors])

    const fetchData = async () => {
        try {
            const [authorsResponse, booksResponse] = await Promise.all([
                api.get("/content/authors/"),
                api.get("/content/books/")
            ])
            // Handle paginated responses
            const authorsData = authorsResponse.data?.results || authorsResponse.data || []
            const booksData = booksResponse.data?.results || booksResponse.data || []
            const authorsArray = Array.isArray(authorsData) ? authorsData : []
            const booksArray = Array.isArray(booksData) ? booksData : []

            setAuthors(authorsArray)
            setFilteredAuthors(authorsArray)
            setTotalBooks(booksArray.length)
        } catch (err) {
            console.error("Error fetching data:", err)
            alert("Error al cargar los datos")
        } finally {
            setLoading(false)
        }
    }

    const handleOpenDialog = (author?: Author) => {
        if (author) {
            setEditingAuthor(author)
            setFormData({
                name: author.name,
                bio: author.bio,
                photo: null,
            })
        } else {
            setEditingAuthor(null)
            setFormData({
                name: "",
                bio: "",
                photo: null,
            })
        }
        setDialogOpen(true)
    }

    const handleCloseDialog = () => {
        setDialogOpen(false)
        setEditingAuthor(null)
        setFormData({
            name: "",
            bio: "",
            photo: null,
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)

        try {
            const formDataToSend = new FormData()
            formDataToSend.append('name', formData.name)
            formDataToSend.append('bio', formData.bio)

            if (formData.photo) {
                formDataToSend.append('photo', formData.photo)
            }

            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }

            if (editingAuthor) {
                const response = await api.patch(`/content/authors/${editingAuthor.id}/`, formDataToSend, config)
                setAuthors(authors.map(author => author.id === editingAuthor.id ? response.data : author))
            } else {
                const response = await api.post("/content/authors/", formDataToSend, config)
                setAuthors([response.data, ...authors])
            }

            handleCloseDialog()
            alert(editingAuthor ? "Autor actualizado exitosamente" : "Autor creado exitosamente")
            fetchData()
        } catch (err: any) {
            console.error("Error submitting author:", err)
            const errorMessage = err.response?.data?.detail || err.response?.data?.name?.[0] || "Error al guardar el autor"
            alert(errorMessage)
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async (author: Author) => {
        if (!confirm(`¿Estás seguro de eliminar al autor "${author.name}"?`)) {
            return
        }

        try {
            await api.delete(`/content/authors/${author.id}/`)
            setAuthors(authors.filter(a => a.id !== author.id))
            alert("Autor eliminado exitosamente")
        } catch (err: any) {
            console.error("Error deleting author:", err)
            alert("Error al eliminar el autor. Puede que tenga libros asociados.")
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Cargando autores...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-5 px-4 max-w-7xl">
            {/* Header */}
            <div className="flex flex-col gap-4 mb-8">
                <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                        Gestión de Autores
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Administra los autores de tu biblioteca
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Autores
                            </CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{authors.length}</div>
                            <p className="text-xs text-muted-foreground">
                                Autores registrados en el sistema
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
                        placeholder="Buscar autores por nombre o biografía..."
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
                    Nuevo Autor
                </Button>
            </div>

            {/* Table */}
            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Foto</TableHead>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Biografía</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredAuthors.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                    {searchTerm ? "No se encontraron autores" : "No hay autores registrados"}
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredAuthors.map((author) => (
                                <TableRow key={author.id}>
                                    <TableCell>
                                        {author.photo ? (
                                            <img
                                                src={author.photo}
                                                alt={author.name}
                                                className="h-12 w-12 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                                                <Users className="h-6 w-6 text-muted-foreground" />
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="font-medium">{author.name}</TableCell>
                                    <TableCell className="max-w-md truncate">{author.bio || "Sin biografía"}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleOpenDialog(author)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(author)}
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
                            {editingAuthor ? "Editar Autor" : "Nuevo Autor"}
                        </DialogTitle>
                        <DialogDescription>
                            {editingAuthor
                                ? "Modifica los datos del autor"
                                : "Completa los datos del nuevo autor"}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nombre *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Ej: Gabriel García Márquez"
                                required
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="bio">Biografía</Label>
                            <Textarea
                                id="bio"
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                placeholder="Breve biografía del autor..."
                                rows={4}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="photo">Foto del Autor</Label>
                            <Input
                                id="photo"
                                type="file"
                                accept="image/*"
                                onChange={(e) => setFormData({ ...formData, photo: e.target.files?.[0] || null })}
                                className="cursor-pointer"
                            />
                            <p className="text-xs text-muted-foreground">
                                Formatos: JPG, PNG, WebP (Máx. 2MB)
                            </p>
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
                                    : editingAuthor
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
