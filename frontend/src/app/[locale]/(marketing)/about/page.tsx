import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, Users, Shield, GraduationCap, Globe } from "lucide-react"
import { fetchSiteSettings } from "@/lib/fetch-site-settings"
import { buildMetadata } from "@/lib/metadata"

export async function generateMetadata(): Promise<Metadata> {
    const [settings, t] = await Promise.all([
        fetchSiteSettings(),
        getTranslations('About'),
    ])
    return buildMetadata({
        title: t('metaTitle'),
        description: t('metaDescription'),
        url: '/about',
        siteName: settings?.site_name,
        ogImage: settings?.og_image_url,
        twitterHandle: settings?.twitter_handle,
    })
}

export default async function AboutPage() {
    const t = await getTranslations('About')

    return (
        <div className="pt-24 pb-20">
            {/* Hero Section */}
            <section className="bg-gradient-to-b from-cyan-50 to-white py-20 px-4">
                <div className="container mx-auto max-w-6xl text-center">
                    <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
                        {t('heroHeading')} <span className="text-[#00576F]">{t('heroHeadingAccent')}</span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                        {t('heroDescription')}
                    </p>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-20 px-4">
                <div className="container mx-auto max-w-6xl">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-6">
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{t('whoWeAreHeading')}</h2>
                            <p className="text-base md:text-lg text-gray-600">
                                {t('whoWeAreDescription')}
                            </p>
                            <div className="space-y-4">
                                <div className="flex gap-4">
                                    <div className="flex-shrink-0 w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center">
                                        <Shield className="h-6 w-6 text-[#00576F]" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{t('quality')}</h3>
                                        <p className="text-gray-600">{t('qualityDesc')}</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                        <Globe className="h-6 w-6 text-purple-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{t('globalAccess')}</h3>
                                        <p className="text-gray-600">{t('globalAccessDesc')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 bg-[#00576F]/10 rounded-3xl -rotate-3"></div>
                            <img
                                src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&q=80&w=1000"
                                alt={t('libraryAlt')}
                                className="relative rounded-3xl shadow-2xl object-cover h-[300px] md:h-[400px] w-full"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats/Values Section */}
            <section className="py-20 bg-gray-50 px-4">
                <div className="container mx-auto max-w-6xl">
                    <div className="grid md:grid-cols-3 gap-8 text-center">
                        <div className="space-y-4">
                            <div className="mx-auto w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center">
                                <BookOpen className="h-8 w-8 text-[#00576F]" />
                            </div>
                            <h3 className="text-3xl md:text-4xl font-bold text-gray-900">10k+</h3>
                            <p className="text-gray-600 font-medium">{t('stat1Label')}</p>
                        </div>
                        <div className="space-y-4">
                            <div className="mx-auto w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center">
                                <Users className="h-8 w-8 text-[#00576F]" />
                            </div>
                            <h3 className="text-3xl md:text-4xl font-bold text-gray-900">500+</h3>
                            <p className="text-gray-600 font-medium">{t('stat2Label')}</p>
                        </div>
                        <div className="space-y-4">
                            <div className="mx-auto w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center">
                                <GraduationCap className="h-8 w-8 text-[#00576F]" />
                            </div>
                            <h3 className="text-3xl md:text-4xl font-bold text-gray-900">50k+</h3>
                            <p className="text-gray-600 font-medium">{t('stat3Label')}</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
