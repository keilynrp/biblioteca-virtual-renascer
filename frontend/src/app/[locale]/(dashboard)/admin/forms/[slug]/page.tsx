'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { AdminGuard } from '@/components/admin/admin-guard'
import { FormEditor } from '@/components/forms/admin/FormEditor'
import { formsApi } from '@/services/formsApi'
import type { FormRecord } from '@/types/form'
import { userToast } from '@/lib/toast-utils'

function EditFormContent({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params)
    const router = useRouter()
    const [form, setForm] = useState<FormRecord | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        formsApi
            .getForm(slug)
            .then(setForm)
            .catch(() => userToast.error('Error al cargar el formulario'))
            .finally(() => setLoading(false))
    }, [slug])

    function handleSaved(updated: FormRecord) {
        setForm(updated)
        // If slug changed, navigate to new URL
        if (updated.slug !== slug) {
            router.replace(`../forms/${updated.slug}`)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (!form) {
        return (
            <div className="text-center py-20 text-muted-foreground">
                Formulario no encontrado
            </div>
        )
    }

    return (
        <div className="p-6">
            <FormEditor initialData={form} onSaved={handleSaved} />
        </div>
    )
}

export default function EditFormPage({ params }: { params: Promise<{ slug: string }> }) {
    return (
        <AdminGuard>
            <EditFormContent params={params} />
        </AdminGuard>
    )
}
