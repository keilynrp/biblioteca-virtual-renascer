'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import { Trash2, Plus } from 'lucide-react'
import type { FormField, FormFieldOption, FormFieldType } from '@/types/form'
import { getFieldTypeLabel } from './FieldTypeSelector'

interface FieldEditDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    field: FormField | null
    onSave: (field: FormField) => void
}

const EMPTY_FIELD: FormField = {
    label: '',
    field_type: 'text',
    placeholder: '',
    help_text: '',
    is_required: false,
    validation_rules: {},
    options: [],
    default_value: '',
    order: 0,
}

export function FieldEditDialog({ open, onOpenChange, field, onSave }: FieldEditDialogProps) {
    const [draft, setDraft] = useState<FormField>(EMPTY_FIELD)

    useEffect(() => {
        if (field) {
            setDraft({ ...field })
        } else {
            setDraft({ ...EMPTY_FIELD })
        }
    }, [field, open])

    const hasOptions = draft.field_type === 'select' || draft.field_type === 'radio'
    const isText = ['text', 'email', 'textarea'].includes(draft.field_type)

    function handleSave() {
        if (!draft.label.trim()) return
        onSave(draft)
        onOpenChange(false)
    }

    function addOption() {
        setDraft(prev => ({
            ...prev,
            options: [...prev.options, { label: '', value: '' }],
        }))
    }

    function updateOption(index: number, partial: Partial<FormFieldOption>) {
        setDraft(prev => ({
            ...prev,
            options: prev.options.map((opt, i) =>
                i === index ? { ...opt, ...partial } : opt
            ),
        }))
    }

    function removeOption(index: number) {
        setDraft(prev => ({
            ...prev,
            options: prev.options.filter((_, i) => i !== index),
        }))
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {field?.id ? 'Editar campo' : 'Nuevo campo'} — {getFieldTypeLabel(draft.field_type)}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    {/* Label */}
                    <div className="space-y-2">
                        <Label>Etiqueta *</Label>
                        <Input
                            value={draft.label}
                            onChange={e => setDraft(prev => ({ ...prev, label: e.target.value }))}
                            placeholder="Nombre del campo"
                        />
                    </div>

                    {/* Placeholder */}
                    {draft.field_type !== 'checkbox' && draft.field_type !== 'hidden' && (
                        <div className="space-y-2">
                            <Label>Placeholder</Label>
                            <Input
                                value={draft.placeholder}
                                onChange={e => setDraft(prev => ({ ...prev, placeholder: e.target.value }))}
                                placeholder="Texto de ayuda dentro del campo"
                            />
                        </div>
                    )}

                    {/* Help text */}
                    <div className="space-y-2">
                        <Label>Texto de ayuda</Label>
                        <Input
                            value={draft.help_text}
                            onChange={e => setDraft(prev => ({ ...prev, help_text: e.target.value }))}
                            placeholder="Aparece debajo del campo"
                        />
                    </div>

                    {/* Required */}
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="is_required"
                            checked={draft.is_required}
                            onCheckedChange={(checked) =>
                                setDraft(prev => ({ ...prev, is_required: !!checked }))
                            }
                        />
                        <Label htmlFor="is_required" className="font-normal">Campo requerido</Label>
                    </div>

                    {/* Default value */}
                    {draft.field_type !== 'file' && (
                        <div className="space-y-2">
                            <Label>Valor por defecto</Label>
                            <Input
                                value={draft.default_value}
                                onChange={e => setDraft(prev => ({ ...prev, default_value: e.target.value }))}
                            />
                        </div>
                    )}

                    {/* Options (select / radio) */}
                    {hasOptions && (
                        <div className="space-y-3">
                            <Label>Opciones</Label>
                            {draft.options.map((opt, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <Input
                                        value={opt.label}
                                        onChange={e => updateOption(i, {
                                            label: e.target.value,
                                            value: opt.value || e.target.value.toLowerCase().replace(/\s+/g, '_'),
                                        })}
                                        placeholder="Etiqueta"
                                        className="flex-1"
                                    />
                                    <Input
                                        value={opt.value}
                                        onChange={e => updateOption(i, { value: e.target.value })}
                                        placeholder="Valor"
                                        className="flex-1"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeOption(i)}
                                    >
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                </div>
                            ))}
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addOption}
                            >
                                <Plus className="h-4 w-4 mr-1" /> Agregar opción
                            </Button>
                        </div>
                    )}

                    {/* Validation rules for text types */}
                    {isText && (
                        <div className="space-y-3">
                            <Label className="text-muted-foreground text-xs uppercase tracking-wider">
                                Validación
                            </Label>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label className="text-xs">Mín. caracteres</Label>
                                    <Input
                                        type="number"
                                        value={draft.validation_rules.min_length ?? ''}
                                        onChange={e => setDraft(prev => ({
                                            ...prev,
                                            validation_rules: {
                                                ...prev.validation_rules,
                                                min_length: e.target.value ? Number(e.target.value) : undefined,
                                            },
                                        }))}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Máx. caracteres</Label>
                                    <Input
                                        type="number"
                                        value={draft.validation_rules.max_length ?? ''}
                                        onChange={e => setDraft(prev => ({
                                            ...prev,
                                            validation_rules: {
                                                ...prev.validation_rules,
                                                max_length: e.target.value ? Number(e.target.value) : undefined,
                                            },
                                        }))}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Validation rules for number */}
                    {draft.field_type === 'number' && (
                        <div className="space-y-3">
                            <Label className="text-muted-foreground text-xs uppercase tracking-wider">
                                Validación
                            </Label>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label className="text-xs">Mínimo</Label>
                                    <Input
                                        type="number"
                                        value={draft.validation_rules.min ?? ''}
                                        onChange={e => setDraft(prev => ({
                                            ...prev,
                                            validation_rules: {
                                                ...prev.validation_rules,
                                                min: e.target.value ? Number(e.target.value) : undefined,
                                            },
                                        }))}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Máximo</Label>
                                    <Input
                                        type="number"
                                        value={draft.validation_rules.max ?? ''}
                                        onChange={e => setDraft(prev => ({
                                            ...prev,
                                            validation_rules: {
                                                ...prev.validation_rules,
                                                max: e.target.value ? Number(e.target.value) : undefined,
                                            },
                                        }))}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* File validation */}
                    {draft.field_type === 'file' && (
                        <div className="space-y-3">
                            <Label className="text-muted-foreground text-xs uppercase tracking-wider">
                                Validación
                            </Label>
                            <div className="space-y-2">
                                <Label className="text-xs">Extensiones permitidas (separadas por coma)</Label>
                                <Input
                                    value={draft.validation_rules.allowed_extensions?.join(', ') ?? ''}
                                    onChange={e => setDraft(prev => ({
                                        ...prev,
                                        validation_rules: {
                                            ...prev.validation_rules,
                                            allowed_extensions: e.target.value
                                                ? e.target.value.split(',').map(s => s.trim())
                                                : undefined,
                                        },
                                    }))}
                                    placeholder="pdf, jpg, png"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs">Tamaño máximo (MB)</Label>
                                <Input
                                    type="number"
                                    value={draft.validation_rules.max_file_size_mb ?? ''}
                                    onChange={e => setDraft(prev => ({
                                        ...prev,
                                        validation_rules: {
                                            ...prev.validation_rules,
                                            max_file_size_mb: e.target.value ? Number(e.target.value) : undefined,
                                        },
                                    }))}
                                />
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSave} disabled={!draft.label.trim()}>
                        Guardar campo
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
