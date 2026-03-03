import { useState, useEffect, useRef, useCallback } from 'react'
import { useToast } from '@/hooks/use-toast'
import api from '@/lib/api'

// ─── Types ───────────────────────────────────────────────────────────────────

export type SyncType = 'bookmark' | 'highlight' | 'annotation' | 'reading_progress'
export type SyncAction = 'create' | 'update' | 'delete'

export interface SyncItem {
    id: string           // UUID local, no el ID del backend
    type: SyncType
    action: SyncAction
    data: Record<string, unknown>
    timestamp: number
    retries: number      // intentos fallidos
}

const STORAGE_KEY = 'pendingSyncs'
const MAX_RETRIES = 3

// ─── API routes por tipo y acción ────────────────────────────────────────────

function getEndpoint(item: SyncItem): { url: string; method: 'post' | 'patch' | 'delete' | 'put' } {
    const { type, action, data } = item
    const id = data.id as number | undefined

    switch (type) {
        case 'bookmark':
            if (action === 'create') return { url: '/content/user/bookmarks/', method: 'post' }
            if (action === 'update') return { url: `/content/user/bookmarks/${id}/`, method: 'patch' }
            return { url: `/content/user/bookmarks/${id}/`, method: 'delete' }

        case 'highlight':
            if (action === 'create') return { url: '/content/user/highlights/', method: 'post' }
            if (action === 'update') return { url: `/content/user/highlights/${id}/`, method: 'patch' }
            return { url: `/content/user/highlights/${id}/`, method: 'delete' }

        case 'annotation':
            if (action === 'create') return { url: '/content/user/annotations/', method: 'post' }
            if (action === 'update') return { url: `/content/user/annotations/${id}/`, method: 'patch' }
            return { url: `/content/user/annotations/${id}/`, method: 'delete' }

        case 'reading_progress': {
            const bookId = data.book_id as number
            return { url: `/content/user/readings/${bookId}/progress/`, method: 'put' }
        }
    }
}

// ─── Payload a enviar (sin campos de solo lectura) ───────────────────────────

function buildPayload(item: SyncItem): Record<string, unknown> {
    if (item.action === 'delete') return {}

    // Excluir campos read-only y el ID local
    const { id, book_title, book_slug, color_display, highlight_data, created_at, updated_at, ...rest } = item.data
    void id; void book_title; void book_slug; void color_display; void highlight_data
    void created_at; void updated_at

    return rest
}

// ─── Persistencia ────────────────────────────────────────────────────────────

function loadQueue(): SyncItem[] {
    if (typeof window === 'undefined') return []
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    } catch {
        return []
    }
}

function saveQueue(items: SyncItem[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useOfflineSync() {
    const [isOnline, setIsOnline] = useState(
        typeof window !== 'undefined' ? navigator.onLine : true
    )
    const [pendingSyncs, setPendingSyncs] = useState<SyncItem[]>(loadQueue)
    const { toast } = useToast()
    const isSyncing = useRef(false)

    // Persistir cola en localStorage cuando cambia
    useEffect(() => {
        saveQueue(pendingSyncs)
    }, [pendingSyncs])

    // ── Procesar la cola ───────────────────────────────────────────────────
    const syncData = useCallback(async (queue?: SyncItem[]) => {
        const items = queue ?? pendingSyncs
        if (items.length === 0 || isSyncing.current) return
        isSyncing.current = true

        toast({
            title: 'Sincronizando...',
            description: `Enviando ${items.length} cambio${items.length !== 1 ? 's' : ''} pendiente${items.length !== 1 ? 's' : ''}.`,
        })

        const failed: SyncItem[] = []
        let successCount = 0

        for (const item of items) {
            const { url, method } = getEndpoint(item)
            const payload = buildPayload(item)

            try {
                if (method === 'delete') {
                    await api.delete(url)
                } else {
                    await api[method](url, payload)
                }
                successCount++
            } catch (err: unknown) {
                const status = (err as { response?: { status?: number } })?.response?.status

                // 404/409 = ítem ya no existe o conflicto irrecuperable → descartar
                if (status === 404 || status === 409) {
                    console.warn(`[OfflineSync] Descartando item ${item.id} (HTTP ${status})`)
                } else if (item.retries < MAX_RETRIES) {
                    failed.push({ ...item, retries: item.retries + 1 })
                } else {
                    console.error(`[OfflineSync] Item ${item.id} alcanzó máximo de reintentos. Descartando.`)
                }
            }
        }

        setPendingSyncs(failed)

        if (successCount > 0 && failed.length === 0) {
            toast({
                title: 'Sincronización completada',
                description: `${successCount} cambio${successCount !== 1 ? 's' : ''} guardado${successCount !== 1 ? 's' : ''} correctamente.`,
                variant: 'default',
            })
        } else if (successCount > 0 && failed.length > 0) {
            toast({
                title: 'Sincronización parcial',
                description: `${successCount} cambio${successCount !== 1 ? 's' : ''} guardado${successCount !== 1 ? 's' : ''}. ${failed.length} pendiente${failed.length !== 1 ? 's' : ''}.`,
                variant: 'default',
            })
        } else if (failed.length > 0) {
            toast({
                title: 'Error al sincronizar',
                description: `No se pudieron enviar ${failed.length} cambio${failed.length !== 1 ? 's' : ''}. Se reintentará al reconectarte.`,
                variant: 'destructive',
            })
        }

        isSyncing.current = false
    }, [pendingSyncs, toast])

    // ── Monitoreo de conectividad ──────────────────────────────────────────
    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true)
            const currentQueue = loadQueue()
            if (currentQueue.length > 0) {
                syncData(currentQueue)
            }
        }
        const handleOffline = () => setIsOnline(false)

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [syncData])

    // ── Guardar un ítem para sync posterior ───────────────────────────────
    const saveOffline = useCallback(
        (type: SyncType, action: SyncAction, data: Record<string, unknown>) => {
            const newItem: SyncItem = {
                id: crypto.randomUUID(),
                type,
                action,
                data,
                timestamp: Date.now(),
                retries: 0,
            }

            setPendingSyncs(prev => {
                // Para reading_progress: reemplazar si ya existe uno para el mismo libro
                if (type === 'reading_progress') {
                    const bookId = data.book_id
                    const filtered = prev.filter(
                        p => !(p.type === 'reading_progress' && p.data.book_id === bookId)
                    )
                    return [...filtered, newItem]
                }
                return [...prev, newItem]
            })

            toast({
                title: 'Guardado sin conexión',
                description: 'Se sincronizará automáticamente al reconectarte.',
            })
        },
        [toast]
    )

    return {
        isOnline,
        pendingSyncs,
        saveOffline,
        syncData,
    }
}
