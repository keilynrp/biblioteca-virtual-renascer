import { useMemo } from 'react'
import { z } from 'zod'
import type { FormField } from '@/types/form'

/**
 * Dynamically build a Zod schema from a FormField[] definition.
 */
export function useFormValidation(fields: FormField[]) {
    return useMemo(() => {
        const shape: Record<string, z.ZodTypeAny> = {}

        for (const field of fields) {
            if (field.field_type === 'hidden') continue

            let schema: z.ZodTypeAny

            switch (field.field_type) {
                case 'email':
                    schema = z.string().email('Email inválido')
                    if (field.validation_rules.max_length)
                        schema = (schema as z.ZodString).max(field.validation_rules.max_length)
                    break

                case 'number': {
                    let numSchema = z.coerce.number({ invalid_type_error: 'Debe ser un número' })
                    if (field.validation_rules.min !== undefined)
                        numSchema = numSchema.min(field.validation_rules.min)
                    if (field.validation_rules.max !== undefined)
                        numSchema = numSchema.max(field.validation_rules.max)
                    schema = numSchema
                    break
                }

                case 'checkbox':
                    schema = z.boolean()
                    if (field.is_required)
                        schema = (schema as z.ZodBoolean).refine(v => v === true, {
                            message: `${field.label} es requerido`,
                        })
                    break

                case 'file':
                    schema = z.any()
                    break

                case 'date':
                    schema = z.string()
                    break

                default: {
                    // text, textarea, select, radio
                    let strSchema = z.string()
                    if (field.validation_rules.min_length)
                        strSchema = strSchema.min(
                            field.validation_rules.min_length,
                            `Mínimo ${field.validation_rules.min_length} caracteres`,
                        )
                    if (field.validation_rules.max_length)
                        strSchema = strSchema.max(
                            field.validation_rules.max_length,
                            `Máximo ${field.validation_rules.max_length} caracteres`,
                        )
                    if (field.validation_rules.pattern)
                        strSchema = strSchema.regex(
                            new RegExp(field.validation_rules.pattern),
                            'Formato inválido',
                        )
                    schema = strSchema
                    break
                }
            }

            // Make optional if not required (checkbox handled above)
            if (!field.is_required && field.field_type !== 'checkbox') {
                schema = schema.optional().or(z.literal(''))
            } else if (field.is_required && field.field_type !== 'checkbox' && field.field_type !== 'number') {
                schema = (schema as z.ZodString).min(1, `${field.label} es requerido`)
            }

            shape[field.label] = schema
        }

        return z.object(shape)
    }, [fields])
}

/**
 * Build default values for a form from its field definitions.
 */
export function buildDefaults(fields: FormField[]): Record<string, string | boolean> {
    const defaults: Record<string, string | boolean> = {}
    for (const field of fields) {
        if (field.field_type === 'hidden') continue
        if (field.field_type === 'checkbox') {
            defaults[field.label] = field.default_value === 'true'
        } else {
            defaults[field.label] = field.default_value || ''
        }
    }
    return defaults
}
