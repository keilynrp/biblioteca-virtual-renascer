import axios from 'axios'
import api from '@/lib/api'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

// Public axios (no auth interceptors) for the public GET endpoint.
// The authenticated `api` instance may throw on expired tokens even for AllowAny endpoints.
const publicAxios = axios.create({ baseURL: BASE_URL })

export interface PuckData {
    content: Array<{
        type: string
        props: Record<string, unknown> & { id: string }
    }>
    root: { props: Record<string, unknown> }
}

export interface PageRecord {
    slug:              string
    title:             string
    page_type:         'marketing' | 'dashboard' | 'custom'
    page_type_display: string
    is_published:      boolean
    content:           PuckData
    created_at:        string
    updated_at:        string
}

export interface CreatePagePayload {
    slug:         string
    title:        string
    page_type:    'marketing' | 'dashboard' | 'custom'
    is_published?: boolean
    content?:     PuckData
}

export const pagesApi = {
    /** Public: fetch a single published page by slug (no auth required) */
    getPage: (slug: string): Promise<PageRecord> =>
        publicAxios.get<PageRecord>(`/pages/${slug}/`).then(r => r.data),

    /** Admin: list all pages */
    listPages: (): Promise<PageRecord[]> =>
        api.get('/pages/').then(r => {
            const data = r.data as PageRecord[] | { results: PageRecord[] }
            return Array.isArray(data) ? data : (data.results ?? [])
        }),

    /** Admin: create a new page */
    createPage: (payload: CreatePagePayload): Promise<PageRecord> =>
        api.post<PageRecord>('/pages/', payload).then(r => r.data),

    /** Admin: save (PATCH) Puck JSON content to an existing page */
    savePage: (slug: string, puckData: PuckData): Promise<PageRecord> =>
        api.patch<PageRecord>(`/pages/${slug}/`, { content: puckData }).then(r => r.data),

    /** Admin: toggle published state */
    updatePage: (slug: string, payload: Partial<CreatePagePayload>): Promise<PageRecord> =>
        api.patch<PageRecord>(`/pages/${slug}/`, payload).then(r => r.data),

    /** Admin: delete a custom page */
    deletePage: (slug: string): Promise<void> =>
        api.delete(`/pages/${slug}/`).then(() => undefined),
}
