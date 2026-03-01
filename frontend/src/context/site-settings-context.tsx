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

const SiteSettingsContext = createContext<SiteSettingsContextType>({
    site_name: 'BVS',
    tagline: '',
    logo_url: null,
    favicon_url: null,
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
