import axios from 'axios'
import api from '@/lib/api'

export interface SiteSettings {
    site_name: string
    tagline: string
    logo_url: string | null
    favicon_url: string | null
    ga_id: string
    gtm_id: string
    gsc_id: string
    // Cookie & Privacy
    cookie_consent_enabled: boolean
    privacy_policy_url: string
    terms_of_service_url: string
    cookie_policy_url: string
    cookies_analytics_enabled: boolean
    cookies_marketing_enabled: boolean
    cookies_functional_enabled: boolean
    // Compliance
    compliance_gdpr: boolean
    compliance_lgpd: boolean
    compliance_hipaa: boolean
    compliance_ccpa: boolean
    // Banner
    cookie_banner_title: string
    cookie_banner_description: string
    updated_at: string
}

// Use a plain axios instance (no auth interceptors) for the public GET endpoint.
// The authenticated `api` instance adds a JWT token; if it's expired the backend
// returns 401, the token-refresh interceptor fires and may throw a Network Error
// even though this endpoint is AllowAny.
const publicAxios = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
})

export const siteSettingsApi = {
    get: () => publicAxios.get<SiteSettings>('/site-settings/').then(r => r.data),
    update: (data: FormData) =>
        api.patch<SiteSettings>('/site-settings/', data, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }).then(r => r.data),
}
