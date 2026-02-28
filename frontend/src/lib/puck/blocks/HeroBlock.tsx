import Link from 'next/link'
import type { ComponentConfig } from '@puckeditor/core'
import type { HeroBlockProps } from '../types'

export const HeroBlockConfig: ComponentConfig<HeroBlockProps> = {
    label: 'Hero / Banner',
    defaultProps: {
        title: 'Tu Título Principal',
        subtitle: 'Descripción de la sección hero.',
        backgroundImage: '',
        overlayOpacity: 50,
        primaryCta: { text: 'Empezar', url: '/register' },
        secondaryCta: { text: 'Saber más', url: '/about' },
    },
    fields: {
        title: { type: 'text', label: 'Título' },
        subtitle: { type: 'textarea', label: 'Subtítulo' },
        backgroundImage: { type: 'text', label: 'URL de imagen de fondo' },
        overlayOpacity: {
            type: 'number',
            label: 'Opacidad del overlay (0-100)',
            min: 0,
            max: 100,
        },
        primaryCta: {
            type: 'object',
            label: 'CTA Principal',
            objectFields: {
                text: { type: 'text', label: 'Texto del botón' },
                url: { type: 'text', label: 'URL de destino' },
            },
        },
        secondaryCta: {
            type: 'object',
            label: 'CTA Secundario',
            objectFields: {
                text: { type: 'text', label: 'Texto del botón' },
                url: { type: 'text', label: 'URL de destino' },
            },
        },
    },
    render: ({ title, subtitle, backgroundImage, overlayOpacity, primaryCta, secondaryCta }) => {
        const hasBackground = Boolean(backgroundImage)
        return (
            <section
                className="relative min-h-[60vh] flex items-center py-20 px-4 overflow-hidden"
                style={
                    hasBackground
                        ? {
                            backgroundImage: `url(${backgroundImage})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                        }
                        : {}
                }
            >
                {hasBackground && (
                    <div
                        className="absolute inset-0 bg-gray-900"
                        style={{ opacity: overlayOpacity / 100 }}
                    />
                )}
                {!hasBackground && (
                    <div className="absolute inset-0 bg-gradient-to-br from-[#00576F] to-[#003d4d]" />
                )}
                <div className="container mx-auto max-w-6xl relative z-10 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                        {title}
                    </h1>
                    <p className="text-xl text-gray-200 max-w-3xl mx-auto mb-8 leading-relaxed">
                        {subtitle}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        {primaryCta.text && primaryCta.url && (
                            <Link
                                href={primaryCta.url}
                                className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-white text-[#00576F] font-semibold text-lg hover:bg-gray-100 transition-colors shadow-xl"
                            >
                                {primaryCta.text}
                            </Link>
                        )}
                        {secondaryCta.text && secondaryCta.url && (
                            <Link
                                href={secondaryCta.url}
                                className="inline-flex items-center justify-center px-8 py-4 rounded-full border-2 border-white text-white font-semibold text-lg hover:bg-white/10 transition-colors"
                            >
                                {secondaryCta.text}
                            </Link>
                        )}
                    </div>
                </div>
            </section>
        )
    },
}
