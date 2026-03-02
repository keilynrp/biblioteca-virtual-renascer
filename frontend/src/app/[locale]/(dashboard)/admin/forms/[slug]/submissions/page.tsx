'use client'

import { useState, useEffect, use } from 'react'
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, Download, Loader2, Inbox } from 'lucide-react'
import { AdminGuard } from '@/components/admin/admin-guard'
import { formsApi } from '@/services/formsApi'
import type { FormSubmission } from '@/types/form'
import { toast } from 'sonner'

function SubmissionsContent({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params)
    const router = useRouter()
    const [submissions, setSubmissions] = useState<FormSubmission[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<string>('all')

    const fetchSubmissions = async () => {
        setLoading(true)
        try {
            const data = await formsApi.listSubmissions(
                slug,
                filter !== 'all' ? filter : undefined,
            )
            setSubmissions(data)
        } catch {
            toast.error('Error al cargar envíos')
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
            toast.error('Error al exportar')
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
                                onClick={() => router.push(`../${slug}/submissions/${sub.id}`)}
                            >
                                <TableCell className="text-sm">
                                    {new Date(sub.created_at).toLocaleString()}
                                </TableCell>
                                {dataKeys.map(key => (
                                    <TableCell key={key} className="text-sm max-w-[200px] truncate">
                                        {sub.data[key] || '—'}
                                    </TableCell>
                                ))}
                                <TableCell>
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
                                <TableCell className="text-xs text-muted-foreground">
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
