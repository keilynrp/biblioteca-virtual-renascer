import axios from 'axios'
import api from '@/lib/api'
import type {
    FormRecord,
    FormListItem,
    FormSubmission,
    PublicFormData,
    FormSubmitResponse,
} from '@/types/form'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
const publicAxios = axios.create({ baseURL: BASE_URL })

export const formsApi = {
    // ── Admin ──────────────────────────────────────────────────────────

    listForms: (): Promise<FormListItem[]> =>
        api.get('/forms/').then(r => {
            const data = r.data as FormListItem[] | { results: FormListItem[] }
            return Array.isArray(data) ? data : (data.results ?? [])
        }),

    getForm: (slug: string): Promise<FormRecord> =>
        api.get<FormRecord>(`/forms/${slug}/`).then(r => r.data),

    createForm: (payload: Partial<FormRecord>): Promise<FormRecord> =>
        api.post<FormRecord>('/forms/', payload).then(r => r.data),

    updateForm: (slug: string, payload: Partial<FormRecord>): Promise<FormRecord> =>
        api.patch<FormRecord>(`/forms/${slug}/`, payload).then(r => r.data),

    deleteForm: (slug: string): Promise<void> =>
        api.delete(`/forms/${slug}/`).then(() => undefined),

    publishForm: (slug: string): Promise<FormRecord> =>
        api.post<FormRecord>(`/forms/${slug}/publish/`).then(r => r.data),

    archiveForm: (slug: string): Promise<FormRecord> =>
        api.post<FormRecord>(`/forms/${slug}/archive/`).then(r => r.data),

    // ── Submissions ───────────────────────────────────────────────────

    listSubmissions: (formSlug: string, filter?: string): Promise<FormSubmission[]> =>
        api.get(`/forms/${formSlug}/submissions/`, {
            params: filter ? { filter } : undefined,
        }).then(r => {
            const data = r.data as FormSubmission[] | { results: FormSubmission[] }
            return Array.isArray(data) ? data : (data.results ?? [])
        }),

    getSubmission: (formSlug: string, id: number): Promise<FormSubmission> =>
        api.get<FormSubmission>(`/forms/${formSlug}/submissions/${id}/`).then(r => r.data),

    markRead: (formSlug: string, id: number): Promise<void> =>
        api.patch(`/forms/${formSlug}/submissions/${id}/mark-read/`).then(() => undefined),

    markSpam: (formSlug: string, id: number): Promise<{ is_spam: boolean }> =>
        api.patch(`/forms/${formSlug}/submissions/${id}/mark-spam/`).then(r => r.data),

    exportCsv: (formSlug: string): Promise<Blob> =>
        api.get(`/forms/${formSlug}/submissions/export/`, { responseType: 'blob' })
            .then(r => r.data),

    // ── Public (no auth) ──────────────────────────────────────────────

    getPublicForm: (uuid: string): Promise<PublicFormData> =>
        publicAxios.get<PublicFormData>(`/forms/public/${uuid}/`).then(r => r.data),

    getPublicFormBySlug: (slug: string): Promise<PublicFormData> =>
        publicAxios.get<PublicFormData>(`/forms/public/by-slug/${slug}/`).then(r => r.data),

    submitForm: (
        uuid: string,
        data: FormData | Record<string, unknown>,
    ): Promise<FormSubmitResponse> =>
        publicAxios.post<FormSubmitResponse>(`/forms/submit/${uuid}/`, data).then(r => r.data),
}
