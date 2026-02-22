"use client"

import Link from "next/link"
import { useNavigation } from "@/context/navigation-context"
import type { NavItem, NavZone } from "@/services/navigationApi"

function SidebarWidget({ type, content }: { type: string; content: Record<string, unknown> }) {
    if (type === 'text') {
        return (
            <div className="prose prose-sm max-w-none text-sm text-muted-foreground">
                {String(content.content ?? '')}
            </div>
        )
    }
    if (type === 'html') {
        return (
            <div
                className="text-sm"
                dangerouslySetInnerHTML={{ __html: String(content.content ?? '') }}
            />
        )
    }
    if (type === 'image') {
        const src = String(content.content ?? '')
        const href = content.href ? String(content.href) : undefined
        const img = <img src={src} alt={String(content.alt ?? '')} className="w-full rounded-md" />
        return href ? (
            <Link href={href} className="block">
                {img}
            </Link>
        ) : img
    }
    return null
}

function SidebarNavLink({ item }: { item: NavItem }) {
    return (
        <div>
            <Link
                href={item.url}
                target={item.open_in_new_tab ? "_blank" : undefined}
                rel={item.open_in_new_tab ? "noopener noreferrer" : undefined}
                className="block py-1 text-sm hover:text-primary transition-colors"
            >
                {item.label}
            </Link>
            {item.children && item.children.length > 0 && (
                <ul className="ml-3 mt-1 space-y-1 border-l pl-3">
                    {item.children.filter(c => c.is_visible).map(child => (
                        <li key={child.id ?? child.label}>
                            <Link
                                href={child.url}
                                target={child.open_in_new_tab ? "_blank" : undefined}
                                rel={child.open_in_new_tab ? "noopener noreferrer" : undefined}
                                className="block py-0.5 text-xs text-muted-foreground hover:text-primary transition-colors"
                            >
                                {child.label}
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

export function SidebarZone({
    location,
    className,
}: {
    location: 'sidebar_left' | 'sidebar_right'
    className?: string
}) {
    const { getZone } = useNavigation()
    const zone = getZone(location)
    if (!zone) return null

    const visibleItems = zone.items.filter(i => i.is_visible)
    if (visibleItems.length === 0) return null

    return (
        <aside className={className}>
            <h3 className="text-sm font-semibold mb-3">{zone.label}</h3>
            <div className="space-y-3">
                {visibleItems.map(item =>
                    item.item_type === 'link' ? (
                        <SidebarNavLink key={item.id ?? item.label} item={item} />
                    ) : (
                        <SidebarWidget
                            key={item.id ?? item.label}
                            type={item.widget_type}
                            content={item.widget_content}
                        />
                    )
                )}
            </div>
        </aside>
    )
}
