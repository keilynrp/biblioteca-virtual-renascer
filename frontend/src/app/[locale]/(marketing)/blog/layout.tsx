import type { Metadata } from 'next'
import { fetchSiteSettings } from '@/lib/fetch-site-settings'
import { buildMetadata } from '@/lib/metadata'

export async function generateMetadata(): Promise<Metadata> {
    const settings = await fetchSiteSettings()
    return buildMetadata({
        title: 'Blog',
        description: 'Artículos, noticias y recursos sobre educación, tecnología y el mundo de las bibliotecas digitales.',
        url: '/es/blog',
        siteName: settings?.site_name,
        ogImage: settings?.og_image_url,
        twitterHandle: settings?.twitter_handle,
    })
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
    return children
}
