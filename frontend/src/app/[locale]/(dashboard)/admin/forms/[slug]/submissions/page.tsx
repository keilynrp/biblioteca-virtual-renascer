'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, Download, Loader2, Inbox, Trash2 } from 'lucide-react'
import { AdminGuard } from '@/components/admin/admin-guard'
import { formsApi } from '@/services/formsApi'
import type { FormSubmission } from '@/types/form'
import { userToast } from '@/lib/toast-utils'

function SubmissionsContent({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params)
    const router = useRouter()
    const [submissions, setSubmissions] = useState<FormSubmission[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<string>('all')
    const [selected, setSelected] = useState<Set<number>>(new Set())
    const [deleting, setDeleting] = useState(false)

    const fetchSubmissions = async () => {
        setLoading(true)
        try {
            const data = await formsApi.listSubmissions(
                slug,
                filter !== 'all' ? filter : undefined,
            )
            setSubmissions(data)
            setSelected(new Set())
        } catch {
            userToast.error('Error al cargar envíos')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchSubmissions() }, [slug, filter])

    async function handleExport() {
        try {
            const blob = await formsApi.exportCsv(slug)
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `submissions-${slug}.csv`
            a.click()
            window.URL.revokeObjectURL(url)
        } catch {
            userToast.error('Error al exportar')
        }
    }

    function toggleSelect(id: number) {
        setSelected(prev => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }

    function toggleSelectAll() {
        if (selected.size === submissions.length) {
            setSelected(new Set())
        } else {
            setSelected(new Set(submissions.map(s => s.id)))
        }
    }

    async function handleBulkDelete() {
        if (selected.size === 0) return
        const count = selected.size
        if (!confirm(`¿Eliminar ${count} envío${count > 1 ? 's' : ''}? Esta acción no se puede deshacer.`)) return

        setDeleting(true)
        try {
            await formsApi.bulkDeleteSubmissions(slug, Array.from(selected))
            userToast.success(`${count} envío${count > 1 ? 's' : ''} eliminado${count > 1 ? 's' : ''}`)
            fetchSubmissions()
        } catch {
            userToast.error('Error al eliminar')
        } finally {
            setDeleting(false)
        }
    }

    // Get first 3 field keys from the first submission for table columns
    const dataKeys = submissions.length > 0
        ? Object.keys(submissions[0].data).slice(0, 3)
        : []

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => router.push(`../${slug}`)}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Envíos</h1>
                        <p className="text-muted-foreground text-sm">
                            Formulario: {slug}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {selected.size > 0 && (
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleBulkDelete}
                            disabled={deleting}
                        >
                            {deleting
                                ? <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                : <Trash2 className="h-4 w-4 mr-2" />
                            }
                            Eliminar ({selected.size})
                        </Button>
                    )}
                    <Select value={filter} onValueChange={setFilter}>
                        <SelectTrigger className="w-40">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            <SelectItem value="unread">Sin leer</SelectItem>
                            <SelectItem value="spam">Spam</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline" onClick={handleExport}>
                        <Download className="h-4 w-4 mr-2" /> Exportar CSV
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : submissions.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg">
                    <Inbox className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No hay envíos {filter !== 'all' ? `con filtro "${filter}"` : ''}</p>
                </div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-10">
                                <Checkbox
                                    checked={selected.size === submissions.length}
                                    onCheckedChange={toggleSelectAll}
                                />
                            </TableHead>
                            <TableHead>Fecha</TableHead>
                            {dataKeys.map(key => (
                                <TableHead key={key}>{key}</TableHead>
                            ))}
                            <TableHead>Estado</TableHead>
                            <TableHead>IP</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {submissions.map(sub => (
                            <TableRow
                                key={sub.id}
                                className="cursor-pointer hover:bg-muted/50"
                            >
                                <TableCell onClick={e => e.stopPropagation()}>
                                    <Checkbox
                                        checked={selected.has(sub.id)}
                                        onCheckedChange={() => toggleSelect(sub.id)}
                                    />
                                </TableCell>
                                <TableCell
                                    className="text-sm"
                                    onClick={() => router.push(`../${slug}/submissions/${sub.id}`)}
                                >
                                    {new Date(sub.created_at).toLocaleString()}
                                </TableCell>
                                {dataKeys.map(key => (
                                    <TableCell
                                        key={key}
                                        className="text-sm max-w-[200px] truncate"
                                        onClick={() => router.push(`../${slug}/submissions/${sub.id}`)}
                                    >
                                        {sub.data[key] || '—'}
                                    </TableCell>
                                ))}
                                <TableCell onClick={() => router.push(`../${slug}/submissions/${sub.id}`)}>
                                    <div className="flex gap-1">
                                        {sub.is_spam && (
                                            <Badge variant="destructive" className="text-xs">Spam</Badge>
                                        )}
                                        {!sub.is_read && !sub.is_spam && (
                                            <Badge variant="default" className="text-xs">Nuevo</Badge>
                                        )}
                                        {sub.is_read && !sub.is_spam && (
                                            <Badge variant="secondary" className="text-xs">Leído</Badge>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell
                                    className="text-xs text-muted-foreground"
                                    onClick={() => router.push(`../${slug}/submissions/${sub.id}`)}
                                >
                                    {sub.ip_address || '—'}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </div>
    )
}

export default function SubmissionsPage({ params }: { params: Promise<{ slug: string }> }) {
    return (
        <AdminGuard>
            <SubmissionsContent params={params} />
        </AdminGuard>
    )
}
