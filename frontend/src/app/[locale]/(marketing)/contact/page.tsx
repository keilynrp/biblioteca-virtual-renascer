import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { Mail, Phone, MapPin } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { fetchSiteSettings } from "@/lib/fetch-site-settings"
import { buildMetadata } from "@/lib/metadata"
import { ContactForm } from "./contact-form"

export async function generateMetadata(): Promise<Metadata> {
    const [settings, t] = await Promise.all([
        fetchSiteSettings(),
        getTranslations('Contact'),
    ])
    return buildMetadata({
        title: t('metaTitle'),
        description: t('metaDescription'),
        url: '/contact',
        siteName: settings?.site_name,
        ogImage: settings?.og_image_url,
        twitterHandle: settings?.twitter_handle,
    })
}

export default async function ContactPage() {
    const t = await getTranslations('Contact')

    return (
        <div className="pt-24 pb-20">
            <section className="py-20 px-4">
                <div className="container mx-auto max-w-6xl">
                    <div className="text-center mb-16">
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            {t('heading')} <span className="text-[#00576F]">{t('headingAccent')}</span>
                        </h1>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            {t('subheading')}
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Contact Info */}
                        <div className="space-y-6 lg:col-span-1">
                            <Card className="border-none shadow-lg bg-[#00576F] text-white">
                                <CardContent className="p-8 space-y-8">
                                    <h2 className="text-2xl font-bold">{t('infoTitle')}</h2>
                                    <div className="space-y-6">
                                        <div className="flex items-start gap-4">
                                            <Mail className="h-6 w-6 text-cyan-200 mt-1" />
                                            <div>
                                                <p className="font-semibold">{t('emailLabel')}</p>
                                                <p className="text-cyan-100">soporte@renascerdosaber.com</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-4">
                                            <Phone className="h-6 w-6 text-cyan-200 mt-1" />
                                            <div>
                                                <p className="font-semibold">{t('phoneLabel')}</p>
                                                <p className="text-cyan-100">+1 (555) 000-0000</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-4">
                                            <MapPin className="h-6 w-6 text-cyan-200 mt-1" />
                                            <div>
                                                <p className="font-semibold">{t('locationLabel')}</p>
                                                <p className="text-cyan-100">Ciudad de Conocimiento, Digital Center</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Contact Form — dynamic */}
                        <div className="lg:col-span-2">
                            <Card className="border-none shadow-xl">
                                <CardContent className="p-8">
                                    <ContactForm />
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
