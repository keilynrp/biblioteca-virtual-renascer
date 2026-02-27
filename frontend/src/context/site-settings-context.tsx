"use client"

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { siteSettingsApi, type SiteSettings } from '@/services/siteSettingsApi'

type SiteSettingsContextType = {
    site_name: string
    tagline: string
    logo_url: string | null
    favicon_url: string | null
    ga_id: string
    gtm_id: string
    gsc_id: string
    refresh: () => void
}

const SiteSettingsContext = createContext<SiteSettingsContextType>({
    site_name: 'BVS',
    tagline: '',
    logo_url: null,
    favicon_url: null,
    ga_id: '',
    gtm_id: '',
    gsc_id: '',
    refresh: () => { },
})

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<SiteSettings>({
        site_name: 'BVS',
        tagline: '',
        logo_url: null,
        favicon_url: null,
        ga_id: '',
        gtm_id: '',
        gsc_id: '',
        updated_at: '',
    })

    const fetchSettings = useCallback(async () => {
        try {
            const data = await siteSettingsApi.get()
            setSettings(data)
        } catch {
            // mantiene fallback
        }
    }, [])

    useEffect(() => { fetchSettings() }, [fetchSettings])

    return (
        <SiteSettingsContext.Provider value={{
            site_name: settings.site_name,
            tagline: settings.tagline,
            logo_url: settings.logo_url,
            favicon_url: settings.favicon_url,
            ga_id: settings.ga_id,
            gtm_id: settings.gtm_id,
            gsc_id: settings.gsc_id,
            refresh: fetchSettings,
        }}>
            {children}
        </SiteSettingsContext.Provider>
    )
}

export function useSiteSettings() {
    return useContext(SiteSettingsContext)
}
