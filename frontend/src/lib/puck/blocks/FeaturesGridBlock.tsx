import type { ComponentConfig } from '@puckeditor/core'
import type { FeaturesGridBlockProps } from '../types'
import {
    Library,
    BookOpen,
    Shield,
    Clock,
    Users,
    Search,
    Star,
    Globe,
    Mail,
    GraduationCap,
    Zap,
    Award,
    Heart,
    Lock,
    TrendingUp,
    CheckCircle,
    type LucideIcon,
} from 'lucide-react'

const ICON_MAP: Record<string, LucideIcon> = {
    Library,
    BookOpen,
    Shield,
    Clock,
    Users,
    Search,
    Star,
    Globe,
    Mail,
    GraduationCap,
    Zap,
    Award,
    Heart,
    Lock,
    TrendingUp,
    CheckCircle,
}

const COLUMN_CLASS: Record<number, string> = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-2 lg:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4',
}

export const FeaturesGridBlockConfig: ComponentConfig<FeaturesGridBlockProps> = {
    label: 'Grid de Características',
    defaultProps: {
        title: 'Nuestras Características',
        subtitle: 'Todo lo que necesitas en una plataforma',
        columns: 3,
        items: [
            { icon: 'BookOpen', title: 'Característica 1', description: 'Descripción de la primera característica.', color: '#00576F' },
            { icon: 'Shield',   title: 'Característica 2', description: 'Descripción de la segunda característica.', color: '#16a34a' },
            { icon: 'Clock',    title: 'Característica 3', description: 'Descripción de la tercera característica.',  color: '#ea580c' },
        ],
    },
    fields: {
        title:    { type: 'text',     label: 'Título de sección' },
        subtitle: { type: 'textarea', label: 'Subtítulo de sección' },
        columns: {
            type: 'select',
            label: 'Número de columnas',
            options: [
                { value: 2, label: '2 columnas' },
                { value: 3, label: '3 columnas' },
                { value: 4, label: '4 columnas' },
            ],
        },
        items: {
            type: 'array',
            label: 'Tarjetas',
            arrayFields: {
                icon:        { type: 'text',     label: 'Icono (nombre Lucide: Library, BookOpen, Shield…)' },
                title:       { type: 'text',     label: 'Título' },
                description: { type: 'textarea', label: 'Descripción' },
                color:       { type: 'text',     label: 'Color (hex, ej: #00576F)' },
            },
        },
    },
    render: ({ title, subtitle, columns, items }) => (
        <section className="py-20 bg-white px-4">
            <div className="container mx-auto max-w-6xl">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">{title}</h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">{subtitle}</p>
                </div>
                <div className={`grid gap-8 ${COLUMN_CLASS[columns] ?? 'lg:grid-cols-3'}`}>
                    {items.map((item, i) => {
                        const Icon = ICON_MAP[item.icon] ?? BookOpen
                        return (
                            <div
                                key={i}
                                className="border-2 rounded-xl p-6 hover:border-[#00576F] transition-all hover:shadow-lg bg-white"
                            >
                                <div
                                    className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                                    style={{ backgroundColor: `${item.color}22` }}
                                >
                                    <Icon className="h-6 w-6" style={{ color: item.color }} />
                                </div>
                                <h3 className="text-xl font-semibold mb-3 text-gray-900">{item.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{item.description}</p>
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    ),
}
