"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAuthStoreHydrated } from "@/store/authStore"
import { notificationsApi } from "@/services/notificationsApi"
import type { AdminNotification, AdminNotificationStats, AdminNotificationCreate } from "@/services/notificationsApi"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
    Bell,
    BookOpen,
    Star,
    Package,
    Megaphone,
    Sparkles,
    Timer,
    Plus,
    Trash2,
    Search,
    Mail,
    BellDot,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

const NOTIFICATION_TYPES = [
    { value: 'book_available', label: 'Libro Disponible' },
    { value: 'loan_expiring', label: 'Préstamo por Vencer' },
    { value: 'new_review', label: 'Nueva Reseña' },
    { value: 'subscription_expiring', label: 'Suscripción por Vencer' },
    { value: 'admin_announcement', label: 'Anuncio Administrativo' },
    { value: 'welcome', label: 'Bienvenida' },
    { value: 'book_recommendation', label: 'Recomendación de Libro' },
    { value: 'community_activity', label: 'Actividad en Club' },
    { value: 'trial_expiring', label: 'Trial por Vencer' },
]

function getTypeIcon(type: string) {
    switch (type) {
        case 'book_available': return <BookOpen className="h-4 w-4 text-green-500" />
        case 'new_review': return <Star className="h-4 w-4 text-yellow-500" />
        case 'subscription_expiring': return <Package className="h-4 w-4 text-orange-500" />
        case 'admin_announcement': return <Megaphone className="h-4 w-4 text-blue-500" />
        case 'book_recommendation': return <Sparkles className="h-4 w-4 text-purple-500" />
        case 'trial_expiring': return <Timer className="h-4 w-4 text-amber-500" />
        default: return <Bell className="h-4 w-4 text-gray-500" />
    }
}

const PAGE_SIZE = 20

export default function AdminNotificationsPage() {
    const router = useRouter()
    const { user, _hasHydrated } = useAuthStoreHydrated()

    const [stats, setStats] = useState<AdminNotificationStats | null>(null)
    const [notifications, setNotifications] = useState<AdminNotification[]>([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(true)

    const [filterType, setFilterType] = useState<string>("")
    const [filterRead, setFilterRead] = useState<string>("")
    const [search, setSearch] = useState<string>("")
    const [searchInput, setSearchInput] = useState<string>("")

    const [selected, setSelected] = useState<Set<number>>(new Set())

    const [createOpen, setCreateOpen] = useState(false)
    const [createLoading, setCreateLoading] = useState(false)
    const [form, setForm] = useState<AdminNotificationCreate>({
        type: '',
        title: '',
        message: '',
        link: '',
        send_to_all: false,
        send_email: false,
    })

    // Auth check
    useEffect(() => {
        if (!_hasHydrated) return
        if (user?.user_type !== 'admin') {
            router.push('/home')
        }
    }, [_hasHydrated, user, router])

    const fetchData = useCallback(async () => {
        setLoading(true)
        try {
            const params: Parameters<typeof notificationsApi.admin.list>[0] = {
                page,
                page_size: PAGE_SIZE,
            }
            if (filterType) params.type = filterType
            if (filterRead) params.is_read = filterRead
            if (search) params.search = search

            const [statsData, listData] = await Promise.all([
                notificationsApi.admin.stats(),
                notificationsApi.admin.list(params),
            ])
            setStats(statsData)
            setNotifications(listData.results)
            setTotal(listData.count)
        } catch {
            // ignore
        } finally {
            setLoading(false)
        }
    }, [page, filterType, filterRead, search])

    useEffect(() => {
        if (!_hasHydrated || user?.user_type !== 'admin') return
        fetchData()
    }, [fetchData, _hasHydrated, user])

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(searchInput)
            setPage(1)
        }, 400)
        return () => clearTimeout(timer)
    }, [searchInput])

    const handleFilterType = (val: string) => {
        setFilterType(val === 'all' ? '' : val)
        setPage(1)
    }

    const handleFilterRead = (val: string) => {
        setFilterRead(val === 'all' ? '' : val)
        setPage(1)
    }

    const toggleSelect = (id: number) => {
        setSelected(prev => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }

    const toggleSelectAll = () => {
        if (selected.size === notifications.length) {
            setSelected(new Set())
        } else {
            setSelected(new Set(notifications.map(n => n.id)))
        }
    }

    const handleDelete = async (id: number) => {
        if (!window.confirm('¿Eliminar esta notificación?')) return
        await notificationsApi.admin.delete(id)
        setSelected(prev => { const s = new Set(prev); s.delete(id); return s })
        fetchData()
    }

    const handleBulkDelete = async () => {
        const ids = Array.from(selected)
        if (!ids.length) return
        if (!window.confirm(`¿Eliminar ${ids.length} notificación(es) seleccionada(s)?`)) return
        await notificationsApi.admin.bulkDelete(ids)
        setSelected(new Set())
        fetchData()
    }

    const handleCreate = async () => {
        if (!form.type || !form.title || !form.message) return
        setCreateLoading(true)
        try {
            const payload: AdminNotificationCreate = {
                type: form.type,
                title: form.title,
                message: form.message,
                send_to_all: form.send_to_all,
                send_email: form.send_email,
            }
            if (form.link) payload.link = form.link
            if (!form.send_to_all && form.user !== undefined) payload.user = form.user
            await notificationsApi.admin.create(payload)
            setCreateOpen(false)
            setForm({ type: '', title: '', message: '', link: '', send_to_all: false, send_email: false })
            fetchData()
        } catch {
            // ignore
        } finally {
            setCreateLoading(false)
        }
    }

    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

    if (!_hasHydrated || user?.user_type !== 'admin') return null

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <BellDot className="h-6 w-6 text-primary" />
                        Gestión de Notificaciones
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">Panel de administración — todas las notificaciones del sistema</p>
                </div>
                <Button onClick={() => setCreateOpen(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Crear
                </Button>
            </div>

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-muted-foreground font-medium">Total</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold">{stats.total.toLocaleString()}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-muted-foreground font-medium">No leídas</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-orange-500">{stats.unread.toLocaleString()}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-muted-foreground font-medium flex items-center gap-1">
                                <Mail className="h-3.5 w-3.5" /> Emails enviados
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-blue-500">{stats.emailed.toLocaleString()}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-muted-foreground font-medium">Por tipo</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-1 overflow-x-auto">
                            {stats.by_type.slice(0, 3).map(t => (
                                <div key={t.type} className="flex items-center justify-between text-xs gap-2">
                                    <span className="flex items-center gap-1 truncate">
                                        {getTypeIcon(t.type)}
                                        <span className="truncate">{NOTIFICATION_TYPES.find(x => x.value === t.type)?.label ?? t.type}</span>
                                    </span>
                                    <Badge variant="secondary">{t.count}</Badge>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center">
                <Select onValueChange={handleFilterType} value={filterType || 'all'}>
                    <SelectTrigger className="w-52">
                        <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos los tipos</SelectItem>
                        {NOTIFICATION_TYPES.map(t => (
                            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select onValueChange={handleFilterRead} value={filterRead || 'all'}>
                    <SelectTrigger className="w-40">
                        <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="true">Leídas</SelectItem>
                        <SelectItem value="false">No leídas</SelectItem>
                    </SelectContent>
                </Select>

                <div className="relative flex-1 min-w-48">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar usuario o título..."
                        className="pl-9"
                        value={searchInput}
                        onChange={e => setSearchInput(e.target.value)}
                    />
                </div>

                {selected.size > 0 && (
                    <Button variant="destructive" className="gap-2" onClick={handleBulkDelete}>
                        <Trash2 className="h-4 w-4" />
                        Eliminar seleccionados ({selected.size})
                    </Button>
                )}
            </div>

            {/* Table */}
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-10">
                                    <Checkbox
                                        checked={notifications.length > 0 && selected.size === notifications.length}
                                        onCheckedChange={toggleSelectAll}
                                    />
                                </TableHead>
                                <TableHead>Usuario</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Título</TableHead>
                                <TableHead>Leída</TableHead>
                                <TableHead>Fecha</TableHead>
                                <TableHead className="w-10"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                                        Cargando...
                                    </TableCell>
                                </TableRow>
                            ) : notifications.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                                        No hay notificaciones
                                    </TableCell>
                                </TableRow>
                            ) : notifications.map(n => (
                                <TableRow key={n.id} className={!n.is_read ? "bg-primary/5" : ""}>
                                    <TableCell>
                                        <Checkbox
                                            checked={selected.has(n.id)}
                                            onCheckedChange={() => toggleSelect(n.id)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium text-sm">{n.username}</p>
                                            <p className="text-xs text-muted-foreground">{n.user_email}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1.5">
                                            {getTypeIcon(n.type)}
                                            <span className="text-xs">{n.type_display}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="max-w-xs">
                                        <p className="font-medium text-sm truncate">{n.title}</p>
                                        <p className="text-xs text-muted-foreground truncate">{n.message}</p>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={n.is_read ? "secondary" : "default"}>
                                            {n.is_read ? "Leída" : "No leída"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                                        {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: es })}
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-destructive hover:text-destructive"
                                            onClick={() => handleDelete(n.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Pagination */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{total} notificaciones en total</span>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page <= 1}
                        onClick={() => setPage(p => p - 1)}
                    >
                        Anterior
                    </Button>
                    <span>Página {page} de {totalPages}</span>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page >= totalPages}
                        onClick={() => setPage(p => p + 1)}
                    >
                        Siguiente
                    </Button>
                </div>
            </div>

            {/* Create Dialog */}
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Crear Notificación</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="send_to_all"
                                checked={form.send_to_all}
                                onCheckedChange={v => setForm(f => ({ ...f, send_to_all: !!v }))}
                            />
                            <Label htmlFor="send_to_all">Enviar a todos los usuarios (broadcast)</Label>
                        </div>

                        {!form.send_to_all && (
                            <div className="space-y-1.5">
                                <Label htmlFor="user_id">ID de usuario</Label>
                                <Input
                                    id="user_id"
                                    type="number"
                                    placeholder="ID numérico del usuario"
                                    value={form.user ?? ''}
                                    onChange={e => setForm(f => ({ ...f, user: e.target.value ? Number(e.target.value) : undefined }))}
                                />
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <Label htmlFor="type">Tipo</Label>
                            <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                                <SelectTrigger id="type">
                                    <SelectValue placeholder="Selecciona un tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                    {NOTIFICATION_TYPES.map(t => (
                                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="title">Título</Label>
                            <Input
                                id="title"
                                placeholder="Título de la notificación"
                                value={form.title}
                                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="message">Mensaje</Label>
                            <Textarea
                                id="message"
                                placeholder="Contenido del mensaje"
                                rows={3}
                                value={form.message}
                                onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="link">Enlace (opcional)</Label>
                            <Input
                                id="link"
                                placeholder="https://..."
                                value={form.link ?? ''}
                                onChange={e => setForm(f => ({ ...f, link: e.target.value }))}
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="send_email"
                                checked={form.send_email}
                                onCheckedChange={v => setForm(f => ({ ...f, send_email: !!v }))}
                            />
                            <Label htmlFor="send_email">Enviar también por email</Label>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancelar</Button>
                        <Button
                            onClick={handleCreate}
                            disabled={createLoading || !form.type || !form.title || !form.message}
                        >
                            {createLoading ? 'Enviando...' : 'Enviar'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
