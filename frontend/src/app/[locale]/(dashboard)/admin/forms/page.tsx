'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Plus, MoreHorizontal, Pencil, Inbox, Trash2, Loader2 } from 'lucide-react'
import { AdminGuard } from '@/components/admin/admin-guard'
import { formsApi } from '@/services/formsApi'
import type { FormListItem } from '@/types/form'
import { userToast } from '@/lib/toast-utils'

const STATUS_BADGE: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
    draft: { label: 'Borrador', variant: 'secondary' },
    published: { label: 'Publicado', variant: 'default' },
    archived: { label: 'Archivado', variant: 'outline' },
}

function FormsListContent() {
    const router = useRouter()
    const [forms, setForms] = useState<FormListItem[]>([])
    const [loading, setLoading] = useState(true)

    const fetchForms = async () => {
        try {
            const data = await formsApi.listForms()
            setForms(data)
        } catch {
            userToast.error('Error al cargar formularios')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchForms() }, [])

    async function handleDelete(slug: string) {
        if (!confirm('¿Estás seguro de eliminar este formulario?')) return
        try {
            await formsApi.deleteForm(slug)
            userToast.success('Formulario eliminado')
            fetchForms()
        } catch {
            userToast.error('Error al eliminar')
        }
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Formularios</h1>
                    <p className="text-muted-foreground text-sm">
                        Crea y gestiona formularios dinámicos
                    </p>
                </div>
                <Button onClick={() => router.push('./forms/new')}>
                    <Plus className="h-4 w-4 mr-2" /> Nuevo formulario
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : forms.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg">
                    <Inbox className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">No hay formularios todavía</p>
                    <p className="text-sm mb-4">Crea tu primer formulario para empezar</p>
                    <Button onClick={() => router.push('./forms/new')}>
                        <Plus className="h-4 w-4 mr-2" /> Crear formulario
                    </Button>
                </div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Título</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead className="text-center">Envíos</TableHead>
                            <TableHead className="text-center">Sin leer</TableHead>
                            <TableHead>Versión</TableHead>
                            <TableHead>Actualizado</TableHead>
                            <TableHead className="w-10" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {forms.map(form => {
                            const badge = STATUS_BADGE[form.status] ?? STATUS_BADGE.draft
                            return (
                                <TableRow key={form.id}>
                                    <TableCell className="font-medium">{form.title}</TableCell>
                                    <TableCell>
                                        <Badge variant={badge.variant}>{badge.label}</Badge>
                                    </TableCell>
                                    <TableCell className="text-center">{form.submission_count}</TableCell>
                                    <TableCell className="text-center">
                                        {form.unread_count > 0 ? (
                                            <Badge variant="destructive" className="text-xs">
                                                {form.unread_count}
                                            </Badge>
                                        ) : (
                                            '0'
                                        )}
                                    </TableCell>
                                    <TableCell>v{form.version}</TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {new Date(form.updated_at).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    onClick={() => router.push(`./forms/${form.slug}`)}
                                                >
                                                    <Pencil className="h-4 w-4 mr-2" /> Editar
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => router.push(`./forms/${form.slug}/submissions`)}
                                                >
                                                    <Inbox className="h-4 w-4 mr-2" /> Envíos
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-red-600"
                                                    onClick={() => handleDelete(form.slug)}
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" /> Eliminar
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            )}
        </div>
    )
}

export default function FormsAdminPage() {
    return (
        <AdminGuard>
            <FormsListContent />
        </AdminGuard>
    )
}
