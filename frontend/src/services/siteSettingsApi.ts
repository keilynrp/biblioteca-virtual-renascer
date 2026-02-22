import axios from 'axios'
import api from '@/lib/api'

export interface SiteSettings {
    site_name: string
    tagline: string
    logo_url: string | null
    favicon_url: string | null
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
