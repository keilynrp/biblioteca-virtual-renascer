"use client"

import { useEffect } from 'react'
import { useSiteSettings } from '@/context/site-settings-context'

function upsertLink(selector: string, attrs: Record<string, string>) {
    let el = document.querySelector<HTMLLinkElement>(selector)
    if (!el) {
        el = document.createElement('link')
        document.head.appendChild(el)
    }
    for (const [k, v] of Object.entries(attrs)) {
        el.setAttribute(k, v)
    }
}

function upsertMeta(name: string, content: string) {
    let el = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`)
    if (!el) {
        el = document.createElement('meta')
        el.setAttribute('name', name)
        document.head.appendChild(el)
    }
    el.setAttribute('content', content)
}

export function DynamicFavicon() {
    const {
        favicon_url,
        favicon_16_url,
        favicon_32_url,
        apple_touch_icon_url,
        ms_tile_color,
        theme_color,
    } = useSiteSettings()

    useEffect(() => {
        // Only inject if we have at least one favicon variant
        if (!favicon_url && !favicon_32_url) return

        if (favicon_32_url) {
            upsertLink('link[rel="icon"][sizes="32x32"]', {
                rel: 'icon',
                type: 'image/png',
                sizes: '32x32',
                href: favicon_32_url,
            })
        }

        if (favicon_16_url) {
            upsertLink('link[rel="icon"][sizes="16x16"]', {
                rel: 'icon',
                type: 'image/png',
                sizes: '16x16',
                href: favicon_16_url,
            })
        }

        if (apple_touch_icon_url) {
            upsertLink('link[rel="apple-touch-icon"]', {
                rel: 'apple-touch-icon',
                sizes: '180x180',
                href: apple_touch_icon_url,
            })
        }

        // Fallback: generic icon link for browsers that don't match sizes
        if (favicon_url) {
            upsertLink('link[rel="icon"]:not([sizes])', {
                rel: 'icon',
                href: favicon_url,
            })
        }

        // Manifest
        const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
        upsertLink('link[rel="manifest"]', {
            rel: 'manifest',
            href: `${apiBase}/site-settings/manifest.webmanifest`,
        })

        if (ms_tile_color) {
            upsertMeta('msapplication-TileColor', ms_tile_color)
        }

        if (theme_color) {
            upsertMeta('theme-color', theme_color)
        }
    }, [favicon_url, favicon_16_url, favicon_32_url, apple_touch_icon_url, ms_tile_color, theme_color])

    return null
}
