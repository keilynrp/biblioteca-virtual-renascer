'use client'

import { Controller, type Control, type FieldErrors } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import type { FormField } from '@/types/form'

interface FormFieldInputProps {
    field: FormField
    control: Control<Record<string, unknown>>
    errors: FieldErrors
}

export function FormFieldInput({ field, control, errors }: FormFieldInputProps) {
    const error = errors[field.label]
    const errorMessage = error?.message as string | undefined

    return (
        <div className="space-y-2">
            {field.field_type !== 'hidden' && field.field_type !== 'checkbox' && (
                <Label htmlFor={field.label}>
                    {field.label}
                    {field.is_required && <span className="text-red-500 ml-1">*</span>}
                </Label>
            )}

            <Controller
                name={field.label}
                control={control}
                render={({ field: controllerField }) => {
                    switch (field.field_type) {
                        case 'textarea':
                            return (
                                <Textarea
                                    id={field.label}
                                    placeholder={field.placeholder}
                                    value={(controllerField.value as string) || ''}
                                    onChange={controllerField.onChange}
                                    onBlur={controllerField.onBlur}
                                    rows={4}
                                />
                            )

                        case 'select':
                            return (
                                <Select
                                    value={(controllerField.value as string) || ''}
                                    onValueChange={controllerField.onChange}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={field.placeholder || 'Seleccionar...'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {field.options.map(opt => (
                                            <SelectItem key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )

                        case 'radio':
                            return (
                                <RadioGroup
                                    value={(controllerField.value as string) || ''}
                                    onValueChange={controllerField.onChange}
                                    className="flex flex-col space-y-2"
                                >
                                    {field.options.map(opt => (
                                        <div key={opt.value} className="flex items-center space-x-2">
                                            <RadioGroupItem value={opt.value} id={`${field.label}-${opt.value}`} />
                                            <Label htmlFor={`${field.label}-${opt.value}`} className="font-normal">
                                                {opt.label}
                                            </Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            )

                        case 'checkbox':
                            return (
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id={field.label}
                                        checked={!!controllerField.value}
                                        onCheckedChange={controllerField.onChange}
                                    />
                                    <Label htmlFor={field.label} className="font-normal">
                                        {field.label}
                                        {field.is_required && <span className="text-red-500 ml-1">*</span>}
                                    </Label>
                                </div>
                            )

                        case 'file':
                            return (
                                <Input
                                    id={field.label}
                                    type="file"
                                    onChange={e => {
                                        const file = e.target.files?.[0]
                                        controllerField.onChange(file)
                                    }}
                                    accept={
                                        field.validation_rules.allowed_extensions
                                            ?.map(ext => `.${ext}`)
                                            .join(',') || undefined
                                    }
                                />
                            )

                        case 'number':
                            return (
                                <Input
                                    id={field.label}
                                    type="number"
                                    placeholder={field.placeholder}
                                    value={(controllerField.value as string) || ''}
                                    onChange={controllerField.onChange}
                                    onBlur={controllerField.onBlur}
                                    min={field.validation_rules.min}
                                    max={field.validation_rules.max}
                                />
                            )

                        case 'date':
                            return (
                                <Input
                                    id={field.label}
                                    type="date"
                                    placeholder={field.placeholder}
                                    value={(controllerField.value as string) || ''}
                                    onChange={controllerField.onChange}
                                    onBlur={controllerField.onBlur}
                                />
                            )

                        case 'hidden':
                            return (
                                <input
                                    type="hidden"
                                    value={(controllerField.value as string) || field.default_value}
                                />
                            )

                        case 'email':
                            return (
                                <Input
                                    id={field.label}
                                    type="email"
                                    placeholder={field.placeholder}
                                    value={(controllerField.value as string) || ''}
                                    onChange={controllerField.onChange}
                                    onBlur={controllerField.onBlur}
                                />
                            )

                        default:
                            // text
                            return (
                                <Input
                                    id={field.label}
                                    type="text"
                                    placeholder={field.placeholder}
                                    value={(controllerField.value as string) || ''}
                                    onChange={controllerField.onChange}
                                    onBlur={controllerField.onBlur}
                                />
                            )
                    }
                }}
            />

            {field.help_text && (
                <p className="text-sm text-muted-foreground">{field.help_text}</p>
            )}

            {errorMessage && (
                <p className="text-sm text-red-500">{errorMessage}</p>
            )}
        </div>
    )
}
