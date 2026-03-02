import type { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Phone, MapPin, Send } from "lucide-react"
import { fetchSiteSettings } from "@/lib/fetch-site-settings"
import { buildMetadata } from "@/lib/metadata"

export async function generateMetadata(): Promise<Metadata> {
    const settings = await fetchSiteSettings()
    return buildMetadata({
        title: 'Contacto',
        description: 'Ponte en contacto con nuestro equipo. Estamos aquí para ayudarte con cualquier consulta sobre la plataforma.',
        url: '/es/contact',
        siteName: settings?.site_name,
        ogImage: settings?.og_image_url,
        twitterHandle: settings?.twitter_handle,
    })
}

export default function ContactPage() {
    return (
        <div className="pt-24 pb-20">
            <section className="py-20 px-4">
                <div className="container mx-auto max-w-6xl">
                    <div className="text-center mb-16">
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Contacta con <span className="text-[#00576F]">Nosotros</span></h1>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">Estamos aquí para ayudarte. Déjanos un mensaje y te responderemos lo antes posible.</p>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Contact Info */}
                        <div className="space-y-6 lg:col-span-1">
                            <Card className="border-none shadow-lg bg-[#00576F] text-white">
                                <CardContent className="p-8 space-y-8">
                                    <h2 className="text-2xl font-bold">Información de Contacto</h2>
                                    <div className="space-y-6">
                                        <div className="flex items-start gap-4">
                                            <Mail className="h-6 w-6 text-cyan-200 mt-1" />
                                            <div>
                                                <p className="font-semibold">Email</p>
                                                <p className="text-cyan-100">soporte@renascerdosaber.com</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-4">
                                            <Phone className="h-6 w-6 text-cyan-200 mt-1" />
                                            <div>
                                                <p className="font-semibold">Teléfono</p>
                                                <p className="text-cyan-100">+1 (555) 000-0000</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-4">
                                            <MapPin className="h-6 w-6 text-cyan-200 mt-1" />
                                            <div>
                                                <p className="font-semibold">Ubicación</p>
                                                <p className="text-cyan-100">Ciudad de Conocimiento, Digital Center</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Contact Form */}
                        <div className="lg:col-span-2">
                            <Card className="border-none shadow-xl">
                                <CardContent className="p-8">
                                    <form className="space-y-6">
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700">Nombre</label>
                                                <Input placeholder="Tu nombre" className="rounded-xl border-gray-200" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700">Email</label>
                                                <Input type="email" placeholder="tu@email.com" className="rounded-xl border-gray-200" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Asunto</label>
                                            <Input placeholder="¿En qué podemos ayudarte?" className="rounded-xl border-gray-200" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Mensaje</label>
                                            <Textarea placeholder="Escribe tu mensaje aquí..." className="rounded-xl border-gray-200 min-h-[150px]" />
                                        </div>
                                        <Button className="w-full bg-[#00576F] hover:bg-[#004558] text-white py-6 text-lg rounded-xl transition-all">
                                            Enviar Mensaje
                                            <Send className="ml-2 h-5 w-5" />
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
