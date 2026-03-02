"use client"
import Link from "next/link"
import { useNavigation } from "@/context/navigation-context"
import { useSiteSettings } from "@/context/site-settings-context"
import { useState, useEffect } from "react"

export function Footer() {
    const { getZones } = useNavigation()
    const { logo_url, site_name } = useSiteSettings()
    const footerZones = getZones('footer')
    const [year, setYear] = useState<number | null>(null)

    useEffect(() => {
        setYear(new Date().getFullYear())
    }, [])

    return (
        <footer className="bg-gray-900 text-gray-300 py-12">
            <div className="container mx-auto max-w-6xl px-4">
                <div className="grid md:grid-cols-4 gap-8">
                    <div className="col-span-2">
                        <div className="mb-4">
                            <img
                                src={logo_url || '/Logo_renascerdosaber.png'}
                                alt={site_name || 'Logo'}
                                className="object-contain h-[62px] max-w-[172px]"
                            />
                        </div>
                        <p className="text-base text-gray-400 max-w-sm">
                            Plataforma digital de conocimiento para instituciones educativas.
                            Acceso ilimitado a contenido académico de calidad.
                        </p>
                    </div>
                    {footerZones.length > 0 ? (
                        footerZones.map((zone) => (
                            <div key={zone.id}>
                                <h4 className="text-white font-semibold mb-4">{zone.label}</h4>
                                <ul className="space-y-2 text-base">
                                    {zone.items.map((item) => (
                                        <li key={item.id ?? item.url}>
                                            <Link
                                                href={item.url}
                                                target={item.open_in_new_tab ? "_blank" : undefined}
                                                className="hover:text-[#00576F]"
                                            >
                                                {item.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))
                    ) : (
                        <>
                            <div>
                                <h4 className="text-white font-semibold mb-4">Plataforma</h4>
                                <ul className="space-y-2 text-base">
                                    <li><Link href="/" className="hover:text-[#00576F]">Inicio</Link></li>
                                    <li><Link href="/about" className="hover:text-[#00576F]">Acerca de</Link></li>
                                    <li><Link href="/es/blog" className="hover:text-[#00576F]">Noticias</Link></li>
                                    <li><Link href="/pricing" className="hover:text-[#00576F]">Precios</Link></li>
                                    <li><Link href="/contact" className="hover:text-[#00576F]">Contacto</Link></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-white font-semibold mb-4">Cuenta</h4>
                                <ul className="space-y-2 text-base">
                                    <li><Link href="/login" className="hover:text-[#00576F]">Iniciar Sesión</Link></li>
                                    <li><Link href="/register" className="hover:text-[#00576F]">Registrarse</Link></li>
                                    <li><Link href="/library" className="hover:text-[#00576F]">Biblioteca</Link></li>
                                </ul>
                            </div>
                        </>
                    )}
                </div>
                <div className="border-t border-gray-800 mt-8 pt-8 text-center text-base text-gray-500">
                    <p>&copy; {year || '...'} Biblioteca Virtual Renascer Saber. Todos los derechos reservados.</p>
                </div>
            </div>
        </footer>
    )
}
