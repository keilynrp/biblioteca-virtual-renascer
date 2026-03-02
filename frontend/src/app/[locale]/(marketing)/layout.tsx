import type { Metadata } from "next"
import { Navbar } from "@/components/marketing/navbar"
import { Footer } from "@/components/marketing/footer"
import { BackToTop } from "@/components/marketing/back-to-top"
import { CurrencyProvider } from "@/context/currency-context"
import { JsonLd } from "@/components/json-ld"
import { fetchSiteSettings } from "@/lib/fetch-site-settings"
import { buildMetadata } from "@/lib/metadata"
import { buildOrganizationSchema, buildWebSiteSchema } from "@/lib/structured-data"

export async function generateMetadata(): Promise<Metadata> {
    const settings = await fetchSiteSettings()
    const siteName = settings?.site_name || 'BVS'
    const description = settings?.og_description || 'Biblioteca virtual para instituciones educativas. Acceso a miles de libros digitales, comunidades de lectura y herramientas de aprendizaje.'

    return buildMetadata({
        title: siteName,
        description,
        url: '/',
        siteName,
        ogImage: settings?.og_image_url,
        twitterHandle: settings?.twitter_handle,
    })
}

export default async function MarketingLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const settings = await fetchSiteSettings()
    const siteName = settings?.site_name || 'BVS'

    const structuredData = [
        buildOrganizationSchema(siteName, settings?.logo_url),
        buildWebSiteSchema(siteName),
    ]

    return (
        <div className="min-h-screen flex flex-col">
            <JsonLd data={structuredData} />
            <Navbar />
            <main className="flex-grow">
                <CurrencyProvider>
                    {children}
                </CurrencyProvider>
            </main>
            <BackToTop />
            <Footer />
        </div>
    )
}
