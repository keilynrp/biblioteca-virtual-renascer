import type { ComponentConfig } from '@puckeditor/core'
import type { StatsBlockProps } from '../types'

const BG_MAP: Record<StatsBlockProps['backgroundColor'], string> = {
    white:   'bg-white',
    gray:    'bg-gray-50',
    primary: 'bg-gradient-to-br from-[#00576F] to-[#003d4d]',
}

const VALUE_COLOR: Record<StatsBlockProps['backgroundColor'], string> = {
    white:   'text-[#00576F]',
    gray:    'text-[#00576F]',
    primary: 'text-cyan-400',
}

const LABEL_COLOR: Record<StatsBlockProps['backgroundColor'], string> = {
    white:   'text-gray-900',
    gray:    'text-gray-900',
    primary: 'text-white',
}

const DESC_COLOR: Record<StatsBlockProps['backgroundColor'], string> = {
    white:   'text-gray-500',
    gray:    'text-gray-500',
    primary: 'text-cyan-100',
}

export const StatsBlockConfig: ComponentConfig<StatsBlockProps> = {
    label: 'Estadísticas / Contadores',
    defaultProps: {
        backgroundColor: 'gray',
        items: [
            { value: '10,000+', label: 'Libros Digitales',  description: '' },
            { value: '500+',    label: 'Instituciones',     description: '' },
            { value: '24/7',    label: 'Acceso Total',      description: '' },
        ],
    },
    fields: {
        backgroundColor: {
            type: 'select',
            label: 'Color de fondo',
            options: [
                { value: 'white',   label: 'Blanco' },
                { value: 'gray',    label: 'Gris claro' },
                { value: 'primary', label: 'Color primario (#00576F)' },
            ],
        },
        items: {
            type: 'array',
            label: 'Estadísticas',
            arrayFields: {
                value:       { type: 'text', label: 'Valor (ej: 10,000+)' },
                label:       { type: 'text', label: 'Etiqueta (ej: Libros)' },
                description: { type: 'text', label: 'Descripción corta (opcional)' },
            },
        },
    },
    render: ({ items, backgroundColor }) => (
        <section className={`py-20 px-4 ${BG_MAP[backgroundColor]}`}>
            <div className="container mx-auto max-w-6xl">
                <div
                    className="grid gap-8 text-center"
                    style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
                >
                    {items.map((item, i) => (
                        <div key={i} className="space-y-2">
                            <p className={`text-5xl font-bold ${VALUE_COLOR[backgroundColor]}`}>
                                {item.value}
                            </p>
                            <p className={`text-lg font-semibold ${LABEL_COLOR[backgroundColor]}`}>
                                {item.label}
                            </p>
                            {item.description && (
                                <p className={`text-sm ${DESC_COLOR[backgroundColor]}`}>
                                    {item.description}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    ),
}
