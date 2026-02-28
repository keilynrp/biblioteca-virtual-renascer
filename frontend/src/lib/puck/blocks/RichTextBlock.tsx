import type { ComponentConfig } from '@puckeditor/core'
import type { RichTextBlockProps } from '../types'

const MAX_WIDTH_MAP: Record<RichTextBlockProps['maxWidth'], string> = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
    full: 'max-w-full',
}

const ALIGNMENT_MAP: Record<RichTextBlockProps['alignment'], string> = {
    left: 'text-left',
    center: 'text-center mx-auto',
    right: 'text-right ml-auto',
}

const BG_MAP: Record<RichTextBlockProps['backgroundColor'], string> = {
    white: 'bg-white',
    gray: 'bg-gray-50',
    primary: 'bg-gradient-to-br from-[#00576F] to-[#003d4d]',
}

const TEXT_MAP: Record<RichTextBlockProps['backgroundColor'], string> = {
    white: 'text-gray-700',
    gray: 'text-gray-700',
    primary: 'text-white',
}

export const RichTextBlockConfig: ComponentConfig<RichTextBlockProps> = {
    label: 'Texto Enriquecido',
    defaultProps: {
        content: 'Escribe tu contenido aquí...',
        alignment: 'left',
        maxWidth: '4xl',
        backgroundColor: 'white',
    },
    fields: {
        content: { type: 'textarea', label: 'Contenido' },
        alignment: {
            type: 'select',
            label: 'Alineación',
            options: [
                { value: 'left', label: 'Izquierda' },
                { value: 'center', label: 'Centro' },
                { value: 'right', label: 'Derecha' },
            ],
        },
        maxWidth: {
            type: 'select',
            label: 'Ancho máximo',
            options: [
                { value: 'sm', label: 'Pequeño' },
                { value: 'md', label: 'Mediano' },
                { value: 'lg', label: 'Grande' },
                { value: 'xl', label: 'Extra grande' },
                { value: '2xl', label: '2x Extra grande' },
                { value: '4xl', label: '4x Extra grande' },
                { value: 'full', label: 'Completo' },
            ],
        },
        backgroundColor: {
            type: 'select',
            label: 'Fondo',
            options: [
                { value: 'white', label: 'Blanco' },
                { value: 'gray', label: 'Gris' },
                { value: 'primary', label: 'Color primario' },
            ],
        },
    },
    render: ({ content, alignment, maxWidth, backgroundColor }) => (
        <section className={`py-16 px-4 ${BG_MAP[backgroundColor]}`}>
            <div className={`container mx-auto ${MAX_WIDTH_MAP[maxWidth]}`}>
                <div className={ALIGNMENT_MAP[alignment]}>
                    {content.split('\n').map((line, i) =>
                        line.trim() ? (
                            <p
                                key={i}
                                className={`text-lg leading-relaxed mb-4 ${TEXT_MAP[backgroundColor]}`}
                            >
                                {line}
                            </p>
                        ) : (
                            <br key={i} />
                        )
                    )}
                </div>
            </div>
        </section>
    ),
}
