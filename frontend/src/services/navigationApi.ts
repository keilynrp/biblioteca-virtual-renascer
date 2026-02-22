import axios from 'axios'
import api from '@/lib/api'

export interface NavItem {
    id?: number
    label: string
    url: string
    open_in_new_tab: boolean
    item_type: 'link' | 'widget'
    widget_type: string
    widget_content: Record<string, unknown>
    order: number
    is_visible: boolean
    children: NavItem[]
}

export interface NavZone {
    id: number
    label: string
    location: 'header' | 'footer' | 'sidebar_left' | 'sidebar_right'
    order: number
    items: NavItem[]
}

const publicAxios = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
})

export const navigationApi = {
    getAll: (): Promise<NavZone[]> =>
        publicAxios.get('/navigation/').then(r => r.data.results ?? r.data),
    createZone: (data: Partial<NavZone>): Promise<NavZone> =>
        api.post('/navigation/', data).then(r => r.data),
    updateZone: (id: number, data: Partial<NavZone>): Promise<NavZone> =>
        api.patch(`/navigation/${id}/`, data).then(r => r.data),
    deleteZone: (id: number): Promise<void> =>
        api.delete(`/navigation/${id}/`),
    saveItems: (id: number, items: NavItem[]): Promise<NavZone> =>
        api.put(`/navigation/${id}/items/`, { items }).then(r => r.data),
}
