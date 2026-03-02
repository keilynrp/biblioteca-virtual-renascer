'use client'

import { useState, useRef, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { FormFieldInput } from './FormFieldInput'
import { useFormValidation, buildDefaults } from './useFormValidation'
import { CaptchaWidget, type CaptchaResult } from './CaptchaWidget'
import { formsApi } from '@/services/formsApi'
import type { PublicFormData, FormSubmitResponse } from '@/types/form'

interface FormRendererProps {
    formData: PublicFormData
    onSuccess?: (response: FormSubmitResponse) => void
    className?: string
}

export function FormRenderer({ formData, onSuccess, className }: FormRendererProps) {
    const [submitted, setSubmitted] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [successMessage, setSuccessMessage] = useState('')
    const [captchaError, setCaptchaError] = useState('')

    // Captcha state
    const captchaDataRef = useRef<CaptchaResult>({})
    const formLoadedAt = useRef(Date.now() / 1000) // Unix seconds

    const zodSchema = useFormValidation(formData.fields)
    const form = useForm({
        resolver: zodResolver(zodSchema),
        defaultValues: buildDefaults(formData.fields),
    })

    const handleCaptchaVerify = useCallback((data: CaptchaResult) => {
        captchaDataRef.current = { ...captchaDataRef.current, ...data }
        setCaptchaError('')
    }, [])

    async function onSubmit(values: Record<string, unknown>) {
        // Pre-flight: check if captcha is required but not completed
        const provider = formData.captcha_provider
        if (provider === 'turnstile' || provider === 'recaptcha_v3') {
            if (!captchaDataRef.current.captcha_token) {
                setCaptchaError('Completa la verificación de captcha antes de enviar.')
                return
            }
        }
        if (provider === 'numeric') {
            if (!captchaDataRef.current.captcha_answer) {
                setCaptchaError('Resuelve la operación matemática antes de enviar.')
                return
            }
        }

        setSubmitting(true)
        setCaptchaError('')

        try {
            const hasFiles = formData.fields.some(f => f.field_type === 'file')

            // Build the submission data
            const dataObj: Record<string, string> = {}
            const files: Record<string, File> = {}
            for (const [key, val] of Object.entries(values)) {
                if (val instanceof File) {
                    files[key] = val
                } else {
                    dataObj[key] = String(val ?? '')
                }
            }

            // Captcha + time fields
            const captchaFields: Record<string, string> = {
                honeypot: '',
                form_loaded_at: String(formLoadedAt.current),
                ...(captchaDataRef.current.captcha_token
                    ? { captcha_token: captchaDataRef.current.captcha_token }
                    : {}),
                ...(captchaDataRef.current.captcha_answer
                    ? {
                          captcha_answer: captchaDataRef.current.captcha_answer,
                          captcha_expected: captchaDataRef.current.captcha_expected ?? '',
                      }
                    : {}),
            }

            let payload: FormData | Record<string, unknown>

            if (hasFiles) {
                const fd = new FormData()
                fd.append('data', JSON.stringify(dataObj))
                for (const [key, file] of Object.entries(files)) {
                    fd.append(key, file)
                }
                for (const [key, val] of Object.entries(captchaFields)) {
                    fd.append(key, val)
                }
                payload = fd
            } else {
                payload = { data: dataObj, ...captchaFields }
            }

            const response = await formsApi.submitForm(formData.uuid, payload)
            setSubmitted(true)
            setSuccessMessage(response.message)
            onSuccess?.(response)

            if (response.redirect_url) {
                window.location.href = response.redirect_url
            }
        } catch (err: unknown) {
            // Check if it's a captcha-specific error
            const axiosErr = err as { response?: { data?: { captcha_failed?: boolean; error?: string } } }
            if (axiosErr?.response?.data?.captcha_failed) {
                setCaptchaError(axiosErr.response.data.error || 'Verificación de captcha fallida.')
            } else {
                form.setError('root', {
                    message: 'Error al enviar el formulario. Inténtalo de nuevo.',
                })
            }
        } finally {
            setSubmitting(false)
        }
    }

    if (submitted) {
        return (
            <div className="text-center p-8 rounded-lg bg-green-50 border border-green-200">
                <svg
                    className="mx-auto h-12 w-12 text-green-500 mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                </svg>
                <p className="text-lg font-medium text-green-800">
                    {successMessage || formData.success_message}
                </p>
            </div>
        )
    }

    const visibleFields = formData.fields.filter(f => f.field_type !== 'hidden')
    const showCaptchaWidget = formData.captcha_provider !== 'none' && formData.captcha_provider !== 'time_based'

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className={className}>
            {/* Honeypot — hidden from users, visible to bots */}
            <div className="absolute opacity-0 pointer-events-none h-0 overflow-hidden" aria-hidden="true">
                <input
                    type="text"
                    name={formData.honeypot_field_name}
                    tabIndex={-1}
                    autoComplete="off"
                />
            </div>

            <div className="space-y-5">
                {visibleFields.map(field => (
                    <FormFieldInput
                        key={field.id ?? field.order}
                        field={field}
                        control={form.control}
                        errors={form.formState.errors}
                    />
                ))}
            </div>

            {/* Captcha widget */}
            {showCaptchaWidget && (
                <div className="mt-5">
                    <CaptchaWidget
                        provider={formData.captcha_provider}
                        siteKey={formData.captcha_site_key}
                        onVerify={handleCaptchaVerify}
                    />
                </div>
            )}

            {captchaError && (
                <p className="text-sm text-red-500 mt-3">{captchaError}</p>
            )}

            {form.formState.errors.root && (
                <p className="text-sm text-red-500 mt-4">
                    {form.formState.errors.root.message}
                </p>
            )}

            <Button
                type="submit"
                className="mt-6 w-full"
                disabled={submitting}
            >
                {submitting ? 'Enviando...' : 'Enviar'}
            </Button>

            {/* Time-based protection notice */}
            {formData.captcha_provider === 'time_based' && (
                <p className="text-xs text-muted-foreground text-center mt-2">
                    Formulario protegido contra envío automático
                </p>
            )}
        </form>
    )
}
