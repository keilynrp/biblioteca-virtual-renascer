import type { Metadata } from 'next'
import { fetchSiteSettings } from '@/lib/fetch-site-settings'
import { buildMetadata } from '@/lib/metadata'

export async function generateMetadata(): Promise<Metadata> {
    const settings = await fetchSiteSettings()
    return buildMetadata({
        title: 'Planes y Precios',
        description: 'Elige el plan perfecto para tu institución o uso personal. Acceso a miles de libros digitales con planes flexibles.',
        url: '/es/pricing',
        siteName: settings?.site_name,
        ogImage: settings?.og_image_url,
        twitterHandle: settings?.twitter_handle,
    })
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
    return children
}
