"use client"

import Link from "next/link"
import Image from "next/image"
import { useSiteSettings } from "@/context/site-settings-context"
import { useNavigation } from "@/context/navigation-context"
import type { NavItem } from "@/services/navigationApi"

// Hardcoded fallback columns
const FALLBACK_COLUMNS = [
    {
        label: "Plataforma",
        links: [
            { label: "Inicio", url: "/" },
            { label: "Acerca de", url: "/about" },
            { label: "Precios", url: "/pricing" },
            { label: "Contacto", url: "/contact" },
        ],
    },
    {
        label: "Cuenta",
        links: [
            { label: "Iniciar Sesión", url: "/login" },
            { label: "Registrarse", url: "/register" },
            { label: "Biblioteca", url: "/library" },
        ],
    },
]

function FooterLink({ item }: { item: { label: string; url: string; open_in_new_tab?: boolean } }) {
    return (
        <li>
            <Link
                href={item.url}
                target={item.open_in_new_tab ? "_blank" : undefined}
                rel={item.open_in_new_tab ? "noopener noreferrer" : undefined}
                className="hover:text-[#00576F]"
            >
                {item.label}
            </Link>
        </li>
    )
}

function FooterColumn({ label, items }: { label: string; items: NavItem[] }) {
    const visible = items.filter(i => i.is_visible && i.item_type === 'link')
    if (visible.length === 0) return null
    return (
        <div>
            <h4 className="text-white font-semibold mb-4">{label}</h4>
            <ul className="space-y-2 text-base">
                {visible.map(item => (
                    <FooterLink key={item.id ?? item.label} item={item} />
                ))}
            </ul>
        </div>
    )
}

export function Footer() {
    const { logo_url, site_name } = useSiteSettings()
    const { getZones } = useNavigation()

    const footerZones = getZones('footer')
    const useFooterNav = footerZones.length > 0

    return (
        <footer className="bg-gray-900 text-gray-300 py-12">
            <div className="container mx-auto max-w-6xl px-4">
                <div className="grid md:grid-cols-4 gap-8">
                    <div className="col-span-2">
                        <div className="mb-4">
                            {logo_url ? (
                                <img src={logo_url} alt={site_name} style={{ maxHeight: 62, width: 'auto' }} className="object-contain" />
                            ) : (
                                <Image src="/Logo_renascerdosaber.png" alt="Logo Renascer Saber" width={172} height={62} className="object-contain" />
                            )}
                        </div>
                        <p className="text-base text-gray-400 max-w-sm">
                            Plataforma digital de conocimiento para instituciones educativas.
                            Acceso ilimitado a contenido académico de calidad.
                        </p>
                    </div>
                    {useFooterNav ? (
                        footerZones.map(zone => (
                            <FooterColumn key={zone.id} label={zone.label} items={zone.items} />
                        ))
                    ) : (
                        FALLBACK_COLUMNS.map(col => (
                            <div key={col.label}>
                                <h4 className="text-white font-semibold mb-4">{col.label}</h4>
                                <ul className="space-y-2 text-base">
                                    {col.links.map(link => (
                                        <FooterLink key={link.url} item={link} />
                                    ))}
                                </ul>
                            </div>
                        ))
                    )}
                </div>
                <div className="border-t border-gray-800 mt-8 pt-8 text-center text-base text-gray-500">
                    <p>&copy; {new Date().getFullYear()} Biblioteca Virtual Renascer Saber. Todos los derechos reservados.</p>
                </div>
            </div>
        </footer>
    )
}
