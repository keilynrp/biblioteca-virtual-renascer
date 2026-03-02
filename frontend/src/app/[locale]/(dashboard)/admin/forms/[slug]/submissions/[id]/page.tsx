'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Loader2, Eye, ShieldAlert, ShieldCheck } from 'lucide-react'
import { AdminGuard } from '@/components/admin/admin-guard'
import { formsApi } from '@/services/formsApi'
import type { FormSubmission } from '@/types/form'
import { toast } from 'sonner'

function SubmissionDetailContent({
    params,
}: {
    params: Promise<{ slug: string; id: string }>
}) {
    const { slug, id } = use(params)
    const router = useRouter()
    const [submission, setSubmission] = useState<FormSubmission | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        formsApi
            .getSubmission(slug, Number(id))
            .then(data => {
                setSubmission(data)
                // Auto-mark as read
                if (!data.is_read) {
                    formsApi.markRead(slug, data.id).catch(() => {})
                }
            })
            .catch(() => toast.error('Error al cargar el envío'))
            .finally(() => setLoading(false))
    }, [slug, id])

    async function toggleSpam() {
        if (!submission) return
        try {
            const result = await formsApi.markSpam(slug, submission.id)
            setSubmission(prev => prev ? { ...prev, is_spam: result.is_spam } : null)
            toast.success(result.is_spam ? 'Marcado como spam' : 'Desmarcado como spam')
        } catch {
            toast.error('Error')
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (!submission) {
        return <div className="text-center py-20 text-muted-foreground">Envío no encontrado</div>
    }

    return (
        <div className="p-6 space-y-6 max-w-3xl">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`../../${slug}/submissions`)}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Detalle del envío</h1>
                        <p className="text-muted-foreground text-sm">
                            {new Date(submission.created_at).toLocaleString()}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {submission.is_spam ? (
                        <Button variant="outline" onClick={toggleSpam}>
                            <ShieldCheck className="h-4 w-4 mr-2" /> No es spam
                        </Button>
                    ) : (
                        <Button variant="outline" onClick={toggleSpam}>
                            <ShieldAlert className="h-4 w-4 mr-2" /> Marcar spam
                        </Button>
                    )}
                </div>
            </div>

            {/* Status badges */}
            <div className="flex gap-2">
                {submission.is_spam && <Badge variant="destructive">Spam</Badge>}
                {submission.is_read && <Badge variant="secondary">Leído</Badge>}
                <Badge variant="outline">v{submission.form_version}</Badge>
            </div>

            {/* Submission data */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Datos del formulario</CardTitle>
                </CardHeader>
                <CardContent>
                    <dl className="space-y-4">
                        {Object.entries(submission.data).map(([key, value]) => (
                            <div key={key} className="grid grid-cols-3 gap-4">
                                <dt className="font-medium text-sm text-muted-foreground">{key}</dt>
                                <dd className="col-span-2 text-sm whitespace-pre-wrap">
                                    {value || <span className="text-muted-foreground italic">vacío</span>}
                                </dd>
                            </div>
                        ))}
                    </dl>
                </CardContent>
            </Card>

            {/* File uploads */}
            {Object.keys(submission.file_uploads).length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Archivos adjuntos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {Object.entries(submission.file_uploads).map(([label, path]) => (
                                <li key={label} className="flex items-center gap-2 text-sm">
                                    <span className="font-medium">{label}:</span>
                                    <a
                                        href={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/media/${path}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary underline"
                                    >
                                        Descargar
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}

            {/* Metadata */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Metadatos</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                    <p><span className="font-medium">UUID:</span> {submission.uuid}</p>
                    <p><span className="font-medium">IP:</span> {submission.ip_address || 'N/A'}</p>
                    <p><span className="font-medium">User Agent:</span> <span className="text-xs text-muted-foreground break-all">{submission.user_agent || 'N/A'}</span></p>
                    <p><span className="font-medium">Versión del formulario:</span> {submission.form_version}</p>
                </CardContent>
            </Card>
        </div>
    )
}

export default function SubmissionDetailPage({
    params,
}: {
    params: Promise<{ slug: string; id: string }>
}) {
    return (
        <AdminGuard>
            <SubmissionDetailContent params={params} />
        </AdminGuard>
    )
}
