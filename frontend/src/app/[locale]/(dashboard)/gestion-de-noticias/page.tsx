"use client"

import { useState, useEffect } from "react"
import { blogService, BlogPost } from "@/lib/blog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    Newspaper,
    Plus,
    Search,
    Loader2,
    MoreVertical,
    Edit,
    Trash2,
    Eye,
    CheckCircle2,
    Circle
} from "lucide-react"
import { Input } from "@/components/ui/input"
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
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { userToast } from '@/lib/toast-utils'
import { AdminGuard } from "@/components/admin/admin-guard"

export default function GestionNoticiasPage() {
    return (
        <AdminGuard>
            <GestionNoticiasContent />
        </AdminGuard>
    )
}

function GestionNoticiasContent() {
    const [posts, setPosts] = useState<BlogPost[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")

    const fetchPosts = async () => {
        setLoading(true)
        try {
            const data = await blogService.getPosts()
            setPosts(data)
        } catch (error) {
            console.error("Error fetching admin posts:", error)
            userToast.error("No se pudieron cargar las noticias")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchPosts()
    }, [])

    const handleDelete = async (slug: string) => {
        if (!confirm("¿Estás seguro de que deseas eliminar esta publicación?")) return

        try {
            await blogService.deletePost(slug)
            userToast.success("Publicación eliminada correctamente")
            fetchPosts()
        } catch (error) {
            userToast.error("Error al eliminar la publicación")
        }
    }

    const filteredPosts = posts.filter(post =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.author_name?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div className="space-y-1">
                    <h1 className="text-4xl font-extrabold tracking-tight flex items-center gap-3">
                        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                            <Newspaper className="h-7 w-7 text-primary" />
                        </div>
                        Gestión de noticias
                    </h1>
                    <p className="text-muted-foreground text-lg">Administra las publicaciones del blog y anuncios de la biblioteca.</p>
                </div>
                <Button asChild className="rounded-xl px-6 gap-2 h-12 shadow-lg shadow-primary/20">
                    <Link href="/gestion-de-noticias/nuevo">
                        <Plus className="h-5 w-5" />
                        Nueva publicación
                    </Link>
                </Button>
            </div>

            <Card className="rounded-3xl border-none shadow-xl shadow-primary/5 overflow-hidden bg-card/50 backdrop-blur-sm">
                <CardHeader className="p-8 border-b border-border/50 bg-gradient-to-r from-primary/5 via-transparent to-transparent">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                            Listado de Publicaciones
                        </CardTitle>
                        <div className="relative max-w-sm w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar noticias..."
                                className="pl-10 h-10 rounded-xl"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-4">
                            <Loader2 className="h-10 w-10 animate-spin text-primary" />
                            <p className="text-muted-foreground font-medium">Cargando publicaciones...</p>
                        </div>
                    ) : filteredPosts.length === 0 ? (
                        <div className="text-center py-24 text-muted-foreground">
                            <Newspaper className="h-16 w-16 mx-auto mb-4 opacity-20" />
                            <p className="text-lg">No se encontraron publicaciones</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-muted/30">
                                    <TableRow>
                                        <TableHead className="pl-8 py-5">Título</TableHead>
                                        <TableHead>Autor</TableHead>
                                        <TableHead>Categoría</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead>Fecha</TableHead>
                                        <TableHead className="text-right pr-8">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredPosts.map((post) => (
                                        <TableRow key={post.id} className="hover:bg-primary/[0.02] transition-colors border-border/50">
                                            <TableCell className="pl-8 py-5 font-bold text-foreground">
                                                <div className="flex flex-col gap-1">
                                                    <span className="line-clamp-1">{post.title}</span>
                                                    <span className="text-[10px] font-mono text-muted-foreground uppercase">{post.slug}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-sm">
                                                {post.author_name}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="rounded-md font-medium">
                                                    {post.category_name || "Sin categoría"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {post.status === 'published' ? (
                                                    <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-md gap-1 px-2">
                                                        <CheckCircle2 className="h-3 w-3" />
                                                        Publicado
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 rounded-md gap-1 px-2">
                                                        <Circle className="h-3 w-3" />
                                                        Borrador
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-sm">
                                                {post.created_at ? format(new Date(post.created_at), "d MMM, yyyy", { locale: es }) : '-'}
                                            </TableCell>
                                            <TableCell className="text-right pr-8">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0 rounded-full hover:bg-muted">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48 rounded-xl">
                                                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/blog/${post.slug}`} target="_blank" className="flex items-center gap-2 cursor-pointer">
                                                                <Eye className="h-4 w-4" /> Ver artículo
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/gestion-de-noticias/${post.slug}`} className="flex items-center gap-2 cursor-pointer">
                                                                <Edit className="h-4 w-4" /> Editar
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            className="text-red-600 focus:text-red-700 flex items-center gap-2 cursor-pointer"
                                                            onClick={() => handleDelete(post.slug)}
                                                        >
                                                            <Trash2 className="h-4 w-4" /> Eliminar
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
