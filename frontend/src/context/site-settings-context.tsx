"use client"

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { siteSettingsApi, type SiteSettings } from '@/services/siteSettingsApi'

type SiteSettingsContextType = {
    site_name: string
    tagline: string
    logo_url: string | null
    logo_small_url: string | null
    favicon_url: string | null
    favicon_16_url: string | null
    favicon_32_url: string | null
    apple_touch_icon_url: string | null
    android_chrome_192_url: string | null
    android_chrome_512_url: string | null
    og_image_url: string | null
    og_description: string
    twitter_handle: string
    safari_pinned_tab_color: string
    ms_tile_color: string
    theme_color: string
    ga_id: string
    gtm_id: string
    gsc_id: string
    cookie_consent_enabled: boolean
    privacy_policy_url: string
    terms_of_service_url: string
    cookie_policy_url: string
    cookies_analytics_enabled: boolean
    cookies_marketing_enabled: boolean
    cookies_functional_enabled: boolean
    compliance_gdpr: boolean
    compliance_lgpd: boolean
    compliance_hipaa: boolean
    compliance_ccpa: boolean
    cookie_banner_title: string
    cookie_banner_description: string
    refresh: () => void
}

const defaults: Omit<SiteSettingsContextType, 'refresh'> = {
    site_name: 'BVS',
    tagline: '',
    logo_url: null,
    logo_small_url: null,
    favicon_url: null,
    favicon_16_url: null,
    favicon_32_url: null,
    apple_touch_icon_url: null,
    android_chrome_192_url: null,
    android_chrome_512_url: null,
    og_image_url: null,
    og_description: '',
    twitter_handle: '',
    safari_pinned_tab_color: '#3b82f6',
    ms_tile_color: '#3b82f6',
    theme_color: '#3b82f6',
    ga_id: '',
    gtm_id: '',
    gsc_id: '',
    cookie_consent_enabled: false,
    privacy_policy_url: '',
    terms_of_service_url: '',
    cookie_policy_url: '',
    cookies_analytics_enabled: true,
    cookies_marketing_enabled: false,
    cookies_functional_enabled: true,
    compliance_gdpr: false,
    compliance_lgpd: false,
    compliance_hipaa: false,
    compliance_ccpa: false,
    cookie_banner_title: '',
    cookie_banner_description: '',
}

const SiteSettingsContext = createContext<SiteSettingsContextType>({
    ...defaults,
    refresh: () => { },
})

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<SiteSettings>({
        ...defaults,
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
            logo_small_url: settings.logo_small_url,
            favicon_url: settings.favicon_url,
            favicon_16_url: settings.favicon_16_url,
            favicon_32_url: settings.favicon_32_url,
            apple_touch_icon_url: settings.apple_touch_icon_url,
            android_chrome_192_url: settings.android_chrome_192_url,
            android_chrome_512_url: settings.android_chrome_512_url,
            og_image_url: settings.og_image_url,
            og_description: settings.og_description,
            twitter_handle: settings.twitter_handle,
            safari_pinned_tab_color: settings.safari_pinned_tab_color,
            ms_tile_color: settings.ms_tile_color,
            theme_color: settings.theme_color,
            ga_id: settings.ga_id,
            gtm_id: settings.gtm_id,
            gsc_id: settings.gsc_id,
            cookie_consent_enabled: settings.cookie_consent_enabled,
            privacy_policy_url: settings.privacy_policy_url,
            terms_of_service_url: settings.terms_of_service_url,
            cookie_policy_url: settings.cookie_policy_url,
            cookies_analytics_enabled: settings.cookies_analytics_enabled,
            cookies_marketing_enabled: settings.cookies_marketing_enabled,
            cookies_functional_enabled: settings.cookies_functional_enabled,
            compliance_gdpr: settings.compliance_gdpr,
            compliance_lgpd: settings.compliance_lgpd,
            compliance_hipaa: settings.compliance_hipaa,
            compliance_ccpa: settings.compliance_ccpa,
            cookie_banner_title: settings.cookie_banner_title,
            cookie_banner_description: settings.cookie_banner_description,
            refresh: fetchSettings,
        }}>
            {children}
        </SiteSettingsContext.Provider>
    )
}

export function useSiteSettings() {
    return useContext(SiteSettingsContext)
}
