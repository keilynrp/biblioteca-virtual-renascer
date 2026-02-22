"use client"

import { useEffect } from 'react'
import { useSiteSettings } from '@/context/site-settings-context'

export function DynamicFavicon() {
    const { favicon_url } = useSiteSettings()

    useEffect(() => {
        if (!favicon_url) return
        let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
        if (!link) {
            link = document.createElement('link')
            link.rel = 'icon'
            document.head.appendChild(link)
        }
        link.href = favicon_url
    }, [favicon_url])

    return null
}
