'use client'

import { useRouter } from 'next/navigation'
import { AdminGuard } from '@/components/admin/admin-guard'
import { FormEditor } from '@/components/forms/admin/FormEditor'
import type { FormRecord } from '@/types/form'

function NewFormContent() {
    const router = useRouter()

    function handleSaved(form: FormRecord) {
        router.push(`../forms/${form.slug}`)
    }

    return (
        <div className="p-6">
            <FormEditor onSaved={handleSaved} />
        </div>
    )
}

export default function NewFormPage() {
    return (
        <AdminGuard>
            <NewFormContent />
        </AdminGuard>
    )
}
