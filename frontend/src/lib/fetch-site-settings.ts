export interface SiteSettingsSSR {
    site_name: string
    tagline: string
    logo_url: string | null
    og_image_url: string | null
    og_description: string
    twitter_handle: string
}

/**
 * Fetches site settings from the Django API (server-side).
 * Uses API_INTERNAL_URL for Docker internal network, falls back to NEXT_PUBLIC_API_URL.
 * Cached for 5 minutes via Next.js fetch cache.
 */
export async function fetchSiteSettings(): Promise<SiteSettingsSSR | null> {
    const apiUrl =
        process.env.API_INTERNAL_URL ||
        process.env.NEXT_PUBLIC_API_URL ||
        'http://localhost:8000/api'

    try {
        const res = await fetch(`${apiUrl}/site-settings/`, {
            next: { revalidate: 300 },
        })
        if (!res.ok) return null
        return res.json()
    } catch {
        return null
    }
}
