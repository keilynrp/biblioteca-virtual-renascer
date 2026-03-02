'use client'

import { useEffect, useState } from 'react'
import type { ComponentConfig } from '@puckeditor/core'
import type { FormBlockProps } from '../types'
import { FormRenderer } from '@/components/forms/FormRenderer'
import { formsApi } from '@/services/formsApi'
import type { PublicFormData } from '@/types/form'

export const FormBlockConfig: ComponentConfig<FormBlockProps> = {
    label: 'Formulario',
    defaultProps: {
        formUuid: '',
        title: '',
        showTitle: true,
        backgroundColor: 'white',
        maxWidth: 'lg',
    },
    fields: {
        formUuid: { type: 'text', label: 'UUID del Formulario (copiar del panel admin)' },
        title: { type: 'text', label: 'Título personalizado (opcional)' },
        showTitle: {
            type: 'radio',
            label: 'Mostrar título',
            options: [
                { label: 'Sí', value: true },
                { label: 'No', value: false },
            ],
        },
        backgroundColor: {
            type: 'select',
            label: 'Color de fondo',
            options: [
                { label: 'Blanco', value: 'white' },
                { label: 'Gris', value: 'gray' },
                { label: 'Primario', value: 'primary' },
            ],
        },
        maxWidth: {
            type: 'select',
            label: 'Ancho máximo',
            options: [
                { label: 'Pequeño', value: 'sm' },
                { label: 'Mediano', value: 'md' },
                { label: 'Grande', value: 'lg' },
                { label: 'Extra Grande', value: 'xl' },
            ],
        },
    },
    render: ({ formUuid, title, showTitle, backgroundColor, maxWidth }) => {
        const [formData, setFormData] = useState<PublicFormData | null>(null)
        const [error, setError] = useState(false)

        useEffect(() => {
            if (formUuid) {
                setError(false)
                formsApi
                    .getPublicForm(formUuid)
                    .then(setFormData)
                    .catch(() => setError(true))
            }
        }, [formUuid])

        const bgClasses: Record<string, string> = {
            white: 'bg-white',
            gray: 'bg-gray-50',
            primary: 'bg-[#00576F]/5',
        }
        const maxWidthClasses: Record<string, string> = {
            sm: 'max-w-sm',
            md: 'max-w-md',
            lg: 'max-w-lg',
            xl: 'max-w-xl',
        }

        if (!formUuid) {
            return (
                <div className="p-8 text-center text-gray-400 border-2 border-dashed rounded-lg">
                    Seleccione un formulario (pegue su UUID en la configuración)
                </div>
            )
        }

        if (error) {
            return (
                <div className="p-8 text-center text-red-400 border-2 border-dashed border-red-200 rounded-lg">
                    No se encontró el formulario. Verifique el UUID.
                </div>
            )
        }

        return (
            <section className={`py-12 px-4 ${bgClasses[backgroundColor] ?? ''}`}>
                <div className={`mx-auto ${maxWidthClasses[maxWidth] ?? 'max-w-lg'}`}>
                    {showTitle && (title || formData?.title) && (
                        <h2 className="text-2xl font-bold mb-4 text-center">
                            {title || formData?.title}
                        </h2>
                    )}
                    {formData?.description && (
                        <p className="text-gray-600 mb-8 text-center">{formData.description}</p>
                    )}
                    {formData ? (
                        <FormRenderer formData={formData} />
                    ) : (
                        <div className="space-y-4 animate-pulse">
                            <div className="h-10 bg-gray-200 rounded" />
                            <div className="h-10 bg-gray-200 rounded" />
                            <div className="h-24 bg-gray-200 rounded" />
                            <div className="h-10 bg-gray-200 rounded" />
                        </div>
                    )}
                </div>
            </section>
        )
    },
}
