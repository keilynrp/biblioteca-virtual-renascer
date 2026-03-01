"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { blogService, BlogPost, Category, Tag } from "@/lib/blog"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
import {
    Layout,
    Save,
    Image as ImageIcon,
    Settings,
    ChevronLeft,
    Loader2,
    Calendar,
    Globe,
    FileText,
    Eye,
    Upload
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { Separator } from "@/components/ui/separator"
import { TiptapEditor } from "@/components/ui/tiptap-editor"
import { AdminGuard } from "@/components/admin/admin-guard"

export default function EditPostPage() {
    return (
        <AdminGuard>
            <EditPostContent />
        </AdminGuard>
    )
}

function EditPostContent() {
    const params = useParams()
    const router = useRouter()
    const isEditing = !!params.slug
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [loading, setLoading] = useState(isEditing)
    const [saving, setSaving] = useState(false)
    const [categories, setCategories] = useState<Category[]>([])
    const [tags, setTags] = useState<Tag[]>([])

    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        description: "",
        content: "",
        category: "",
        status: "draft",
        featured_image: null as string | null
    })
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)

    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const [cats, tgs] = await Promise.all([
                    blogService.getCategories(),
                    blogService.getTags()
                ])
                setCategories(cats)
                setTags(tgs)
            } catch (error) {
                console.error("Error fetching metadata:", error)
            }
        }

        const fetchPost = async () => {
            if (!isEditing) return
            try {
                const post = await blogService.getPost(params.slug as string)
                setFormData({
                    title: post.title,
                    slug: post.slug,
                    description: post.description,
                    content: post.content,
                    category: typeof post.category === 'object' ? post.category?.id?.toString() : post.category?.toString(),
                    status: post.status,
                    featured_image: post.featured_image
                })
                if (post.featured_image) setPreviewUrl(post.featured_image)
            } catch (error) {
                toast.error("Error al cargar la publicación")
                router.push("/gestion-de-noticias")
            } finally {
                setLoading(false)
            }
        }

        fetchMetadata()
        if (isEditing) fetchPost()
    }, [isEditing, params.slug])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setSelectedFile(file)
            const url = URL.createObjectURL(file)
            setPreviewUrl(url)
        }
    }

    const handleSave = async () => {
        if (!formData.title) {
            toast.error("El título es obligatorio")
            return
        }

        setSaving(true)
        try {
            const dataToSend = new FormData()
            dataToSend.append('title', formData.title)
            dataToSend.append('description', formData.description)
            dataToSend.append('content', formData.content)
            if (formData.category) dataToSend.append('category', formData.category)
            dataToSend.append('status', formData.status)

            if (selectedFile) {
                dataToSend.append('featured_image', selectedFile)
            }

            if (isEditing) {
                await blogService.updatePost(params.slug as string, dataToSend)
                toast.success("Publicación actualizada")
            } else {
                await blogService.createPost(dataToSend)
                toast.success("Publicación creada")
            }
            router.push("/gestion-de-noticias")
        } catch (error) {
            console.error("Save error:", error)
            toast.error("Error al guardar la publicación")
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-muted-foreground font-medium">Preparando editor...</p>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-7xl">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <Link href="/gestion-de-noticias" className="hover:text-primary transition-colors flex items-center gap-1">
                            <ChevronLeft className="h-4 w-4" /> Gestión de noticias
                        </Link>
                    </div>
                    <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                        {isEditing ? "Editar Publicación" : "Nueva Publicación"}
                    </h1>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Button variant="outline" asChild className="rounded-xl flex-1 md:flex-none">
                        <Link href="/gestion-de-noticias">Cancelar</Link>
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="rounded-xl px-8 gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 flex-1 md:flex-none"
                    >
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        {isEditing ? "Guardar cambios" : "Publicar ahora"}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="rounded-2xl border-none shadow-xl shadow-primary/5 bg-card/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-xl font-bold flex items-center gap-2">
                                <FileText className="h-5 w-5 text-primary" /> Contenido Principal
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="title" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Título de la noticia</Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Introduce un título impactante..."
                                    className="h-14 text-xl font-bold rounded-xl bg-background/50 border-muted-foreground/20 focus:ring-primary focus:border-primary"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Extracto / Resumen</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Breve descripción que aparecerá en el listado..."
                                    className="min-h-[100px] resize-none rounded-xl bg-background/50 border-muted-foreground/20"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Contenido del artículo</Label>
                                <TiptapEditor
                                    content={formData.content}
                                    onChange={(html) => setFormData({ ...formData, content: html })}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Areas */}
                <div className="space-y-6">
                    {/* Status & Visibility */}
                    <Card className="rounded-2xl border-none shadow-xl shadow-primary/5 bg-card/50 backdrop-blur-sm">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <Settings className="h-4 w-4 text-primary" /> Publicación
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Estado</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(val) => setFormData({ ...formData, status: val })}
                                >
                                    <SelectTrigger className="rounded-xl h-11">
                                        <SelectValue placeholder="Seleccionar estado" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-none shadow-2xl">
                                        <SelectItem value="draft" className="py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 w-2 rounded-full bg-amber-400" />
                                                Borrador
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="published" className="py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                                Publicado
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center justify-between py-2 border-t border-muted/30 pt-4">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Globe className="h-4 w-4" /> Visibilidad
                                </div>
                                <span className="text-sm font-bold">Público</span>
                            </div>

                            <div className="flex items-center justify-between py-2">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Calendar className="h-4 w-4" /> Fecha
                                </div>
                                <span className="text-sm font-bold">Inmediata</span>
                            </div>
                        </CardContent>
                        <CardFooter className="bg-muted/30 rounded-b-2xl py-4">
                            <Button variant="ghost" size="sm" className="w-full text-xs font-bold gap-2 hover:bg-primary/5 text-primary">
                                <Eye className="h-3.3 w-3.3" /> Vista Previa
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* Taxonomy */}
                    <Card className="rounded-2xl border-none shadow-xl shadow-primary/5 bg-card/50 backdrop-blur-sm">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <Layout className="h-4 w-4 text-primary" /> Organización
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Categoría</Label>
                                <Select
                                    value={formData.category}
                                    onValueChange={(val) => setFormData({ ...formData, category: val })}
                                >
                                    <SelectTrigger className="rounded-xl h-11">
                                        <SelectValue placeholder="Elegir categoría" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-none shadow-2xl">
                                        {categories.map(cat => (
                                            <SelectItem key={cat.id} value={cat.id.toString()}>
                                                {cat.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Featured Image */}
                    <Card className="rounded-2xl border-none shadow-xl shadow-primary/5 bg-card/50 backdrop-blur-sm overflow-hidden">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <ImageIcon className="h-4 w-4 text-primary" /> Imagen Destacada
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="aspect-video rounded-xl bg-muted/50 border-2 border-dashed border-muted-foreground/20 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-muted/80 transition-all overflow-hidden relative group"
                            >
                                {previewUrl ? (
                                    <>
                                        <img src={previewUrl} alt="Featured" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                            <div className="flex flex-col items-center gap-2">
                                                <Upload className="h-6 w-6 text-white" />
                                                <span className="text-white text-xs font-bold">Cambiar imagen</span>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <ImageIcon className="h-8 w-8 text-muted-foreground opacity-30" />
                                        <span className="text-xs font-medium text-muted-foreground text-center px-4">Haz clic para subir una imagen de portada</span>
                                    </>
                                )}
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
