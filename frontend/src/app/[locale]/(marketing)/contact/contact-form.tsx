'use client'

import { useEffect, useState } from 'react'
import { FormRenderer } from '@/components/forms/FormRenderer'
import { formsApi } from '@/services/formsApi'
import type { PublicFormData } from '@/types/form'
import { Loader2 } from 'lucide-react'

/**
 * Loads the published form with slug "contact" and renders it dynamically.
 * The admin must create and publish a form with slug "contact" from the admin panel.
 */
export function ContactForm() {
    const [formData, setFormData] = useState<PublicFormData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    useEffect(() => {
        formsApi
            .getPublicFormBySlug('contact')
            .then(setFormData)
            .catch(() => setError(true))
            .finally(() => setLoading(false))
    }, [])

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (error || !formData) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                <p className="mb-2">El formulario de contacto no está disponible en este momento.</p>
                <p className="text-sm">
                    Por favor, escríbenos directamente a{' '}
                    <a href="mailto:soporte@renascerdosaber.com" className="text-[#00576F] underline">
                        soporte@renascerdosaber.com
                    </a>
                </p>
            </div>
        )
    }

    return <FormRenderer formData={formData} />
}
