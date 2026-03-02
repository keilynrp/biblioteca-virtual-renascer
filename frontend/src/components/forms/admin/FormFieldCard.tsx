'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { FormField } from '@/types/form'
import { getFieldTypeLabel } from './FieldTypeSelector'

interface FormFieldCardProps {
    field: FormField
    onEdit: () => void
    onDelete: () => void
}

export function FormFieldCard({ field, onEdit, onDelete }: FormFieldCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: field.id ?? `new-${field.order}` })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                'flex items-center gap-3 p-3 bg-card border rounded-lg group',
                isDragging && 'shadow-lg',
            )}
        >
            <button
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
            >
                <GripVertical className="h-5 w-5" />
            </button>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate">{field.label}</span>
                    {field.is_required && (
                        <span className="text-red-500 text-xs">*</span>
                    )}
                </div>
                {field.placeholder && (
                    <p className="text-xs text-muted-foreground truncate">{field.placeholder}</p>
                )}
            </div>

            <Badge variant="secondary" className="text-xs shrink-0">
                {getFieldTypeLabel(field.field_type)}
            </Badge>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
                    <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onDelete}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
            </div>
        </div>
    )
}
