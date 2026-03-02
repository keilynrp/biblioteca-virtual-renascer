import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PageRenderer } from '@/components/page-builder/page-renderer'
import { fetchPage } from '@/lib/fetch-page'
import { fetchSiteSettings } from '@/lib/fetch-site-settings'
import { buildMetadata } from '@/lib/metadata'

interface Props {
    params: Promise<{ locale: string; slug: string }>
}

export default async function CustomLandingPage({ params }: Props) {
    const { slug } = await params
    const page = await fetchPage(slug)

    if (!page || !page.is_published || !page.content?.content?.length) {
        notFound()
    }

    return <PageRenderer data={page.content} />
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug, locale } = await params
    try {
        const [page, settings] = await Promise.all([
            fetchPage(slug),
            fetchSiteSettings(),
        ])
        if (page?.title) {
            return buildMetadata({
                title: page.title,
                description: `${page.title} — ${settings?.site_name || 'BVS'}`,
                url: `/${locale}/p/${slug}`,
                locale,
                siteName: settings?.site_name,
                ogImage: settings?.og_image_url,
                twitterHandle: settings?.twitter_handle,
            })
        }
    } catch {}
    return {}
}
