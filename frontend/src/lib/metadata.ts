import type { Metadata } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
const FALLBACK_OG_IMAGE = '/og-default.jpg'

const LOCALE_MAP: Record<string, string> = {
    es: 'es_ES',
    pt: 'pt_BR',
    en: 'en_US',
}

interface BuildMetadataOptions {
    title: string
    description: string
    url: string
    locale?: string
    siteName?: string
    ogImage?: string | null
    twitterHandle?: string
    type?: 'website' | 'article'
    article?: {
        publishedTime?: string
        authors?: string[]
    }
}

export function buildMetadata({
    title,
    description,
    url,
    locale = 'es',
    siteName = 'BVS',
    ogImage,
    twitterHandle,
    type = 'website',
    article,
}: BuildMetadataOptions): Metadata {
    const ogLocale = LOCALE_MAP[locale] || 'es_ES'
    const absoluteUrl = url.startsWith('http') ? url : `${SITE_URL}${url}`
    const imageUrl = ogImage || `${SITE_URL}${FALLBACK_OG_IMAGE}`

    const metadata: Metadata = {
        title,
        description,
        alternates: {
            canonical: absoluteUrl,
        },
        openGraph: {
            title,
            description,
            url: absoluteUrl,
            siteName,
            locale: ogLocale,
            type,
            images: [
                {
                    url: imageUrl,
                    width: 1200,
                    height: 630,
                    alt: title,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [imageUrl],
            ...(twitterHandle ? { site: twitterHandle, creator: twitterHandle } : {}),
        },
    }

    if (type === 'article' && article && metadata.openGraph) {
        (metadata.openGraph as any).publishedTime = article.publishedTime
        ;(metadata.openGraph as any).authors = article.authors
    }

    return metadata
}
