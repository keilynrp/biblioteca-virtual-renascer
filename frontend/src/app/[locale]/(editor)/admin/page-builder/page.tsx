"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { pagesApi, type PageRecord, type CreatePagePayload } from "@/services/pagesApi"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { LayoutTemplate, Plus, Edit2, Loader2, ExternalLink } from "lucide-react"
import { handleApiError, showSuccess } from "@/lib/api"

export default function PageBuilderListPage() {
    const router = useRouter()
    const [pages, setPages] = useState<PageRecord[]>([])
    const [loading, setLoading] = useState(true)
    const [createOpen, setCreateOpen] = useState(false)
    const [creating, setCreating] = useState(false)
    const [newPage, setNewPage] = useState<Pick<CreatePagePayload, 'title' | 'slug' | 'page_type'>>({
        title: '',
        slug: '',
        page_type: 'custom',
    })

    const loadPages = useCallback(async () => {
        setLoading(true)
        try {
            const data = await pagesApi.listPages()
            setPages(data)
        } catch (error) {
            handleApiError(error, "Error al cargar páginas")
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        loadPages()
    }, [loadPages])

    const handleCreate = async () => {
        if (!newPage.title || !newPage.slug) return
        setCreating(true)
        try {
            await pagesApi.createPage({
                ...newPage,
                is_published: false,
                content: { content: [], root: { props: {} } },
            })
            showSuccess("Página creada correctamente")
            setCreateOpen(false)
            setNewPage({ title: '', slug: '', page_type: 'custom' })
            await loadPages()
        } catch (error) {
            handleApiError(error, "Error al crear página")
        } finally {
            setCreating(false)
        }
    }

    // Auto-generate slug from title
    const handleTitleChange = (title: string) => {
        const slug = title
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim()
        setNewPage(prev => ({ ...prev, title, slug }))
    }

    const PAGE_TYPE_LABELS: Record<string, string> = {
        marketing: 'Marketing',
        dashboard: 'Dashboard',
        custom:    'Landing personalizada',
    }

    const PREVIEW_PATHS: Record<string, string> = {
        homepage:       '/',
        about:          '/about',
        contact:        '/contact',
        'dashboard-home': '/home',
    }

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <LayoutTemplate className="h-6 w-6 text-[#00576F]" />
                            Constructor de Páginas
                        </h1>
                        <p className="text-muted-foreground text-sm mt-1">
                            Diseña páginas con drag & drop. Cambios publicados instantáneamente.
                        </p>
                    </div>
                    <Button onClick={() => setCreateOpen(true)} className="gap-2 bg-[#00576F] hover:bg-[#004558]">
                        <Plus className="h-4 w-4" />
                        Nueva Landing
                    </Button>
                </div>

                {/* Pages table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Páginas disponibles</CardTitle>
                        <CardDescription>
                            Haz clic en "Editar" para abrir el editor visual de una página.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-[#00576F]" />
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Título</TableHead>
                                        <TableHead>Slug</TableHead>
                                        <TableHead>Tipo</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead>Actualizado</TableHead>
                                        <TableHead className="text-right">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {pages.map(page => (
                                        <TableRow key={page.slug}>
                                            <TableCell className="font-medium">{page.title}</TableCell>
                                            <TableCell className="text-muted-foreground font-mono text-sm">
                                                {page.slug}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {PAGE_TYPE_LABELS[page.page_type] ?? page.page_type}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={page.is_published ? 'default' : 'secondary'}
                                                    className={page.is_published ? 'bg-green-600 hover:bg-green-700' : ''}
                                                >
                                                    {page.is_published ? 'Publicado' : 'Borrador'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-sm">
                                                {new Date(page.updated_at).toLocaleDateString('es-ES', {
                                                    day: '2-digit', month: 'short', year: 'numeric'
                                                })}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {PREVIEW_PATHS[page.slug] && (
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="gap-1 text-muted-foreground"
                                                            onClick={() => window.open(PREVIEW_PATHS[page.slug], '_blank')}
                                                        >
                                                            <ExternalLink className="h-3 w-3" />
                                                            Ver
                                                        </Button>
                                                    )}
                                                    {page.page_type === 'custom' && (
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="gap-1 text-muted-foreground"
                                                            onClick={() => window.open(`/p/${page.slug}`, '_blank')}
                                                        >
                                                            <ExternalLink className="h-3 w-3" />
                                                            Ver
                                                        </Button>
                                                    )}
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="gap-1"
                                                        onClick={() => router.push(`/admin/page-builder/${page.slug}`)}
                                                    >
                                                        <Edit2 className="h-3 w-3" />
                                                        Editar
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Create page dialog */}
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent className="sm:max-w-[460px]">
                    <DialogHeader>
                        <DialogTitle>Nueva Landing Page</DialogTitle>
                        <DialogDescription>
                            Crea una nueva página personalizada accesible en <code>/p/[slug]</code>.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="title">Título de la página</Label>
                            <Input
                                id="title"
                                placeholder="Ej: Promoción de Enero"
                                value={newPage.title}
                                onChange={e => handleTitleChange(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="slug">Slug (URL)</Label>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">/p/</span>
                                <Input
                                    id="slug"
                                    placeholder="promo-enero"
                                    value={newPage.slug}
                                    onChange={e => setNewPage(prev => ({ ...prev, slug: e.target.value }))}
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={creating}>
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleCreate}
                            disabled={creating || !newPage.title || !newPage.slug}
                            className="bg-[#00576F] hover:bg-[#004558]"
                        >
                            {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Crear y editar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
