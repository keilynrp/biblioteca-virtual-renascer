import type { PuckData } from '@/services/pagesApi'

export interface PageApiResponse {
    slug:         string
    title:        string
    is_published: boolean
    content:      PuckData
}

/**
 * Fetches a page from the Django API.
 * Uses API_INTERNAL_URL for server-side calls (Docker internal network)
 * and falls back to NEXT_PUBLIC_API_URL for local dev without Docker.
 */
export async function fetchPage(slug: string): Promise<PageApiResponse | null> {
    // API_INTERNAL_URL is set to http://backend:8000/api inside Docker.
    // NEXT_PUBLIC_API_URL is http://localhost:8000/api (browser-facing).
    const apiUrl =
        process.env.API_INTERNAL_URL ||
        process.env.NEXT_PUBLIC_API_URL ||
        'http://localhost:8000/api'

    try {
        const res = await fetch(`${apiUrl}/pages/${slug}/`, {
            cache: 'no-store',
        })
        if (!res.ok) return null
        return res.json()
    } catch {
        return null
    }
}
