"use client"

// CRITICAL: Puck editor CSS is ONLY imported in this file.
// Do NOT import this CSS anywhere else — it would pollute all public pages.
import "@puckeditor/core/dist/index.css"

import { useEffect, useState, useCallback, use } from "react"
import { useRouter } from "next/navigation"
import { Puck, type Data } from "@puckeditor/core"
import { puckConfig } from "@/lib/puck/config"
import { pagesApi, type PuckData, type PageRecord } from "@/services/pagesApi"
import { showSuccess, handleApiError } from "@/lib/api"
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Props {
    params: Promise<{ locale: string; slug: string }>
}

export default function PageEditorPage({ params }: Props) {
    const router = useRouter()
    const { slug } = use(params)

    const [page, setPage] = useState<PageRecord | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!slug) return
        setLoading(true)
        // Use the admin-authenticated API to fetch even unpublished pages
        import('@/lib/api').then(({ default: api }) =>
            api.get(`/pages/${slug}/`)
        ).then(r => {
            setPage(r.data)
        }).catch(() => {
            setError('Página no encontrada o sin acceso.')
        }).finally(() => {
            setLoading(false)
        })
    }, [slug])

    const handlePublish = useCallback(async (data: Data) => {
        if (!slug) return
        try {
            await pagesApi.savePage(slug, data as PuckData)
            showSuccess("Cambios guardados y publicados.")
        } catch (err) {
            handleApiError(err, "Error al guardar la página")
        }
    }, [slug])

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-[#00576F]" />
            </div>
        )
    }

    if (error || !page) {
        return (
            <div className="flex flex-col items-center justify-center h-screen gap-4 bg-background">
                <AlertCircle className="h-12 w-12 text-destructive" />
                <p className="text-lg text-muted-foreground">{error ?? 'Página no encontrada'}</p>
                <Button variant="outline" onClick={() => router.push('/admin/page-builder')}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Volver a la lista
                </Button>
            </div>
        )
    }

    const hasContent = Array.isArray(page.content?.content) && page.content.content.length > 0
    const initialData: Data = hasContent
        ? (page.content as unknown as Data)
        : { content: [], root: { props: {} } }

    return (
        <div style={{ height: '100vh' }}>
            <Puck
                config={puckConfig}
                data={initialData}
                onPublish={handlePublish}
                headerTitle={page.title}
                headerPath={`/${page.slug}`}
            />
        </div>
    )
}
