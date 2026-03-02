'use client'

import {
    Type, Mail, AlignLeft, ChevronDown, CheckSquare,
    Circle, Hash, Calendar, Paperclip, EyeOff,
} from 'lucide-react'
import type { FormFieldType } from '@/types/form'

interface FieldTypeOption {
    type: FormFieldType
    label: string
    icon: React.ReactNode
}

const FIELD_TYPES: FieldTypeOption[] = [
    { type: 'text', label: 'Texto', icon: <Type className="h-5 w-5" /> },
    { type: 'email', label: 'Email', icon: <Mail className="h-5 w-5" /> },
    { type: 'textarea', label: 'Texto largo', icon: <AlignLeft className="h-5 w-5" /> },
    { type: 'select', label: 'Selección', icon: <ChevronDown className="h-5 w-5" /> },
    { type: 'checkbox', label: 'Casilla', icon: <CheckSquare className="h-5 w-5" /> },
    { type: 'radio', label: 'Opción múltiple', icon: <Circle className="h-5 w-5" /> },
    { type: 'number', label: 'Número', icon: <Hash className="h-5 w-5" /> },
    { type: 'date', label: 'Fecha', icon: <Calendar className="h-5 w-5" /> },
    { type: 'file', label: 'Archivo', icon: <Paperclip className="h-5 w-5" /> },
    { type: 'hidden', label: 'Oculto', icon: <EyeOff className="h-5 w-5" /> },
]

interface FieldTypeSelectorProps {
    onSelect: (type: FormFieldType) => void
}

export function FieldTypeSelector({ onSelect }: FieldTypeSelectorProps) {
    return (
        <div className="grid grid-cols-2 gap-3">
            {FIELD_TYPES.map(ft => (
                <button
                    key={ft.type}
                    type="button"
                    onClick={() => onSelect(ft.type)}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border
                               hover:border-primary hover:bg-primary/5 transition-colors text-left"
                >
                    <div className="text-muted-foreground">{ft.icon}</div>
                    <span className="text-sm font-medium">{ft.label}</span>
                </button>
            ))}
        </div>
    )
}

export function getFieldTypeLabel(type: FormFieldType): string {
    return FIELD_TYPES.find(ft => ft.type === type)?.label ?? type
}
