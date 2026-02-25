"use client"

import { AdminGuard } from "@/components/admin/admin-guard"
import { useState, useEffect, useCallback } from "react"
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core"
import {
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
    arrayMove,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { navigationApi, type NavZone, type NavItem } from "@/services/navigationApi"
import { pagesApi, type PageRecord } from "@/services/pagesApi"
import { useNavigation } from "@/context/navigation-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import {
    GripVertical,
    Plus,
    Pencil,
    Trash2,
    Eye,
    EyeOff,
    Save,
    Loader2,
    ChevronRight,
    Search,
    Link as LinkIcon,
    FileText,
    Layout,
    ChevronDown,
} from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Sortable Item ────────────────────────────────────────────────────────────

function SortableNavItem({
    item,
    onToggleVisible,
    onEdit,
    onDelete,
    isChild = false,
}: {
    item: NavItem
    onToggleVisible: (item: NavItem) => void
    onEdit: (item: NavItem) => void
    onDelete: (item: NavItem) => void
    isChild?: boolean
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({ id: item.id ?? item.label })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    }

    return (
        <div ref={setNodeRef} style={style} className={cn("group", isChild && "ml-6")}>
            <div className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg border bg-card hover:bg-muted/50 transition-colors",
                isChild && "border-dashed"
            )}>
                <button
                    {...attributes}
                    {...listeners}
                    className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
                >
                    <GripVertical className="h-4 w-4" />
                </button>
                <div className="flex-1 min-w-0">
                    <span className="font-medium text-sm truncate">{item.label}</span>
                    {item.item_type === 'link' ? (
                        <span className="text-xs text-muted-foreground ml-2 truncate">{item.url}</span>
                    ) : (
                        <span className="text-xs text-blue-500 ml-2">Widget: {item.widget_type}</span>
                    )}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => onToggleVisible(item)}
                        title={item.is_visible ? "Ocultar" : "Mostrar"}
                    >
                        {item.is_visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />}
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => onEdit(item)}
                        title="Editar"
                    >
                        <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => onDelete(item)}
                        title="Eliminar"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                </div>
            </div>
        </div>
    )
}

// ─── Types ────────────────────────────────────────────────────────────────────

type ItemFormData = {
    label: string
    url: string
    open_in_new_tab: boolean
    item_type: 'link' | 'widget'
    widget_type: string
    widget_content_text: string
    is_visible: boolean
    parent_id: string
}

const emptyItemForm = (): ItemFormData => ({
    label: '',
    url: '',
    open_in_new_tab: false,
    item_type: 'link',
    widget_type: 'text',
    widget_content_text: '',
    is_visible: true,
    parent_id: '',
})

const systemPages = [
    { label: "Inicio", url: "/" },
    { label: "Biblioteca", url: "/library" },
    { label: "Blog / Noticias (Público)", url: "/blog" },
    { label: "Gestión de noticias", url: "/gestion-de-noticias" },
    { label: "Acerca de", url: "/about" },
    { label: "Precios", url: "/pricing" },
    { label: "Contacto", url: "/contact" },
    { label: "Mi Perfil", url: "/profile" },
    { label: "Mis Préstamos", url: "/my-loans" },
    { label: "Favoritos", url: "/favorites" },
    { label: "Historial de Lectura", url: "/reading-history" },
]

// ─── Main Page ────────────────────────────────────────────────────────────────

function NavigationAdminPageContent() {
    const { zones: ctxZones, refresh } = useNavigation()
    const [zones, setZones] = useState<NavZone[]>([])
    const [selectedZoneId, setSelectedZoneId] = useState<number | null>(null)
    const [localItems, setLocalItems] = useState<NavItem[]>([])
    const [saving, setSaving] = useState(false)

    // Dialogs
    const [newZoneOpen, setNewZoneOpen] = useState(false)
    const [newZoneLabel, setNewZoneLabel] = useState('')
    const [newZoneLocation, setNewZoneLocation] = useState<NavZone['location']>('header')
    const [creatingZone, setCreatingZone] = useState(false)

    const [addItemOpen, setAddItemOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<NavItem | null>(null)
    const [itemForm, setItemForm] = useState<ItemFormData>(emptyItemForm())

    const [renameOpen, setRenameOpen] = useState(false)
    const [renameLabel, setRenameLabel] = useState('')

    // Available pages
    const [customPages, setCustomPages] = useState<PageRecord[]>([])
    const [loadingPages, setLoadingPages] = useState(false)
    const [selectedResources, setSelectedResources] = useState<string[]>([])
    const [openSection, setOpenSection] = useState<'system' | 'custom' | 'link' | null>('system')

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    )

    // Fetch custom pages
    useEffect(() => {
        setLoadingPages(true)
        pagesApi.listPages()
            .then(setCustomPages)
            .finally(() => setLoadingPages(false))
    }, [])

    // Keep local zones in sync with context
    useEffect(() => {
        setZones(ctxZones)
        if (ctxZones.length > 0 && selectedZoneId === null) {
            setSelectedZoneId(ctxZones[0].id)
        }
    }, [ctxZones])

    // Sync local items when selected zone changes
    useEffect(() => {
        const zone = zones.find(z => z.id === selectedZoneId)
        if (zone) {
            setLocalItems(JSON.parse(JSON.stringify(zone.items)))
        }
    }, [selectedZoneId, zones])

    const selectedZone = zones.find(z => z.id === selectedZoneId)

    // ── Drag & Drop handlers ──────────────────────────────────────────────────

    function handleTopLevelDragEnd(event: DragEndEvent) {
        const { active, over } = event
        if (!over || active.id === over.id) return
        const oldIdx = localItems.findIndex(i => (i.id ?? i.label) === active.id)
        const newIdx = localItems.findIndex(i => (i.id ?? i.label) === over.id)
        if (oldIdx === -1 || newIdx === -1) return
        setLocalItems(prev => arrayMove(prev, oldIdx, newIdx))
    }

    function handleChildDragEnd(parentIdx: number, event: DragEndEvent) {
        const { active, over } = event
        if (!over || active.id === over.id) return
        const parent = localItems[parentIdx]
        const children = parent.children ?? []
        const oldIdx = children.findIndex(c => (c.id ?? c.label) === active.id)
        const newIdx = children.findIndex(c => (c.id ?? c.label) === over.id)
        if (oldIdx === -1 || newIdx === -1) return
        const newChildren = arrayMove(children, oldIdx, newIdx)
        setLocalItems(prev => {
            const next = [...prev]
            next[parentIdx] = { ...parent, children: newChildren }
            return next
        })
    }

    // ── Item mutations (local state only) ────────────────────────────────────

    function toggleVisible(item: NavItem) {
        setLocalItems(prev => prev.map(i => {
            if (i === item || (i.id && i.id === item.id)) {
                return { ...i, is_visible: !i.is_visible }
            }
            return {
                ...i,
                children: (i.children ?? []).map(c =>
                    c === item || (c.id && c.id === item.id) ? { ...c, is_visible: !c.is_visible } : c
                )
            }
        }))
    }

    function deleteItem(item: NavItem) {
        setLocalItems(prev => {
            const filtered = prev.filter(i => i !== item && i.id !== item.id)
            return filtered.map(i => ({
                ...i,
                children: (i.children ?? []).filter(c => c !== item && c.id !== item.id)
            }))
        })
    }

    function openAddItem() {
        setEditingItem(null)
        setItemForm(emptyItemForm())
        setAddItemOpen(true)
    }

    function openEditItem(item: NavItem) {
        setEditingItem(item)
        setItemForm({
            label: item.label,
            url: item.url,
            open_in_new_tab: item.open_in_new_tab,
            item_type: item.item_type,
            widget_type: item.widget_type || 'text',
            widget_content_text: typeof item.widget_content?.content === 'string'
                ? item.widget_content.content as string : '',
            is_visible: item.is_visible,
            parent_id: '',
        })
        setAddItemOpen(true)
    }

    function handleSaveItem() {
        const newItem: NavItem = {
            id: editingItem?.id,
            label: itemForm.label,
            url: itemForm.url,
            open_in_new_tab: itemForm.open_in_new_tab,
            item_type: itemForm.item_type,
            widget_type: itemForm.widget_type,
            widget_content: itemForm.item_type === 'widget'
                ? { content: itemForm.widget_content_text } : {},
            order: 0,
            is_visible: itemForm.is_visible,
            children: editingItem?.children ?? [],
        }

        if (editingItem) {
            // Update existing
            setLocalItems(prev => prev.map(i => {
                if (i === editingItem || (i.id && i.id === editingItem.id)) {
                    return { ...newItem, children: i.children }
                }
                return {
                    ...i,
                    children: (i.children ?? []).map(c =>
                        c === editingItem || (c.id && c.id === editingItem.id)
                            ? { ...newItem, children: [] }
                            : c
                    )
                }
            }))
        } else {
            // Add new
            if (itemForm.parent_id) {
                const parentId = parseInt(itemForm.parent_id)
                setLocalItems(prev => prev.map(i => {
                    if (i.id === parentId) {
                        return {
                            ...i,
                            children: [...(i.children ?? []), { ...newItem, order: (i.children ?? []).length }]
                        }
                    }
                    return i
                }))
            } else {
                setLocalItems(prev => [...prev, { ...newItem, order: prev.length }])
            }
        }

        setAddItemOpen(false)
        setEditingItem(null)
        setItemForm(emptyItemForm())
    }

    function addSelectedToMenu() {
        if (selectedResources.length === 0) return

        const itemsToAdd: NavItem[] = []

        selectedResources.forEach(resId => {
            // Check system pages
            const sysPage = systemPages.find(p => p.url === resId)
            if (sysPage) {
                itemsToAdd.push({
                    label: sysPage.label,
                    url: sysPage.url,
                    open_in_new_tab: false,
                    item_type: 'link',
                    widget_type: 'text',
                    widget_content: {},
                    order: 0,
                    is_visible: true,
                    children: []
                })
            } else {
                // Check custom pages
                const cusPage = customPages.find(p => p.slug === resId)
                if (cusPage) {
                    itemsToAdd.push({
                        label: cusPage.title,
                        url: `/p/${cusPage.slug}`,
                        open_in_new_tab: false,
                        item_type: 'link',
                        widget_type: 'text',
                        widget_content: {},
                        order: 0,
                        is_visible: true,
                        children: []
                    })
                }
            }
        })

        if (itemsToAdd.length > 0) {
            setLocalItems(prev => [
                ...prev,
                ...itemsToAdd.map((it, idx) => ({ ...it, order: prev.length + idx }))
            ])
            setSelectedResources([])
            toast.success(`${itemsToAdd.length} ítem(s) añadido(s)`)
        }
    }

    // ── Save to backend ───────────────────────────────────────────────────────

    async function handleSave() {
        if (!selectedZoneId) return
        setSaving(true)
        try {
            const itemsWithOrder: NavItem[] = localItems.map((item, idx) => ({
                ...item,
                order: idx,
                children: (item.children ?? []).map((c, cidx) => ({ ...c, order: cidx }))
            }))
            await navigationApi.saveItems(selectedZoneId, itemsWithOrder)
            await refresh()
            toast.success("Navegación guardada correctamente")
        } catch {
            toast.error("Error al guardar la navegación")
        } finally {
            setSaving(false)
        }
    }

    // ── Zone management ───────────────────────────────────────────────────────

    async function handleCreateZone() {
        if (!newZoneLabel.trim()) return
        setCreatingZone(true)
        try {
            const zone = await navigationApi.createZone({
                label: newZoneLabel.trim(),
                location: newZoneLocation,
                order: zones.filter(z => z.location === newZoneLocation).length,
            })
            await refresh()
            setSelectedZoneId(zone.id)
            setNewZoneOpen(false)
            setNewZoneLabel('')
            toast.success("Zona creada")
        } catch {
            toast.error("Error al crear la zona")
        } finally {
            setCreatingZone(false)
        }
    }

    async function handleRenameZone() {
        if (!selectedZoneId || !renameLabel.trim()) return
        try {
            await navigationApi.updateZone(selectedZoneId, { label: renameLabel.trim() })
            await refresh()
            setRenameOpen(false)
            toast.success("Zona renombrada")
        } catch {
            toast.error("Error al renombrar la zona")
        }
    }

    async function handleDeleteZone() {
        if (!selectedZoneId) return
        if (!confirm("¿Eliminar esta zona y todos sus ítems?")) return
        try {
            await navigationApi.deleteZone(selectedZoneId)
            await refresh()
            setSelectedZoneId(zones.find(z => z.id !== selectedZoneId)?.id ?? null)
            toast.success("Zona eliminada")
        } catch {
            toast.error("Error al eliminar la zona")
        }
    }

    // ── Group zones by location for sidebar display ───────────────────────────

    const locationLabels: Record<NavZone['location'], string> = {
        header: 'Header',
        footer: 'Footer',
        sidebar_left: 'Sidebar Izquierdo',
        sidebar_right: 'Sidebar Derecho',
    }

    const groupedZones = zones.reduce((acc, zone) => {
        if (!acc[zone.location]) acc[zone.location] = []
        acc[zone.location].push(zone)
        return acc
    }, {} as Record<string, NavZone[]>)

    return (
        <div className="flex h-full min-h-[calc(100vh-4rem)]">
            {/* ── Left Panel: Zones ── */}
            <aside className="w-64 border-r bg-card flex-shrink-0 flex flex-col">
                <div className="flex items-center justify-between px-4 py-3 border-b">
                    <h2 className="font-semibold text-sm">Zonas</h2>
                    <Button
                        size="sm"
                        variant="outline"
                        className="h-7 px-2 text-xs"
                        onClick={() => setNewZoneOpen(true)}
                    >
                        <Plus className="h-3 w-3 mr-1" /> Nueva
                    </Button>
                </div>
                <nav className="flex-1 overflow-y-auto p-2 space-y-4">
                    {Object.entries(groupedZones).map(([loc, locZones]) => (
                        <div key={loc}>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-2 mb-1">
                                {locationLabels[loc as NavZone['location']]}
                            </p>
                            {locZones.map(zone => (
                                <button
                                    key={zone.id}
                                    onClick={() => setSelectedZoneId(zone.id)}
                                    className={cn(
                                        "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors cursor-pointer",
                                        selectedZoneId === zone.id
                                            ? "bg-primary text-primary-foreground"
                                            : "hover:bg-muted text-foreground"
                                    )}
                                >
                                    <ChevronRight className={cn(
                                        "h-3 w-3 flex-shrink-0 transition-transform",
                                        selectedZoneId === zone.id && "rotate-90"
                                    )} />
                                    <span className="truncate">{zone.label}</span>
                                </button>
                            ))}
                        </div>
                    ))}
                </nav>

                <div className="p-4 border-t space-y-4">
                    <h2 className="font-semibold text-sm flex items-center gap-2">
                        <Layout className="h-4 w-4" /> Páginas y Enlaces
                    </h2>

                    <div className="space-y-1">
                        {/* System Pages Section */}
                        <div className="border rounded-md overflow-hidden">
                            <button
                                onClick={() => setOpenSection(openSection === 'system' ? null : 'system')}
                                className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium hover:bg-muted transition-colors"
                            >
                                Páginas del Sistema
                                <ChevronDown className={cn("h-3 w-3 transition-transform", openSection === 'system' && "rotate-180")} />
                            </button>
                            {openSection === 'system' && (
                                <div className="p-3 pt-0 space-y-2 max-h-40 overflow-y-auto">
                                    {systemPages.map(page => (
                                        <div key={page.url} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`sys-${page.url}`}
                                                checked={selectedResources.includes(page.url)}
                                                onCheckedChange={(checked) => {
                                                    setSelectedResources(prev =>
                                                        checked ? [...prev, page.url] : prev.filter(p => p !== page.url)
                                                    )
                                                }}
                                            />
                                            <label htmlFor={`sys-${page.url}`} className="text-[11px] cursor-pointer truncate">
                                                {page.label}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Custom Pages Section */}
                        <div className="border rounded-md overflow-hidden">
                            <button
                                onClick={() => setOpenSection(openSection === 'custom' ? null : 'custom')}
                                className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium hover:bg-muted transition-colors"
                            >
                                Páginas Personalizadas
                                <ChevronDown className={cn("h-3 w-3 transition-transform", openSection === 'custom' && "rotate-180")} />
                            </button>
                            {openSection === 'custom' && (
                                <div className="p-3 pt-0 space-y-2 max-h-40 overflow-y-auto">
                                    {loadingPages ? (
                                        <div className="flex items-center justify-center py-2">
                                            <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                                        </div>
                                    ) : customPages.length === 0 ? (
                                        <p className="text-[10px] text-muted-foreground text-center py-2">No hay páginas.</p>
                                    ) : (
                                        customPages.map(page => (
                                            <div key={page.slug} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`cus-${page.slug}`}
                                                    checked={selectedResources.includes(page.slug)}
                                                    onCheckedChange={(checked) => {
                                                        setSelectedResources(prev =>
                                                            checked ? [...prev, page.slug] : prev.filter(p => p !== page.slug)
                                                        )
                                                    }}
                                                />
                                                <label htmlFor={`cus-${page.slug}`} className="text-[11px] cursor-pointer truncate">
                                                    {page.title}
                                                </label>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Custom Link Section */}
                        <div className="border rounded-md overflow-hidden">
                            <button
                                onClick={() => setOpenSection(openSection === 'link' ? null : 'link')}
                                className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium hover:bg-muted transition-colors"
                            >
                                Enlace Personalizado
                                <ChevronDown className={cn("h-3 w-3 transition-transform", openSection === 'link' && "rotate-180")} />
                            </button>
                            {openSection === 'link' && (
                                <div className="p-3 space-y-3">
                                    <div className="space-y-1">
                                        <Label className="text-[10px]">URL</Label>
                                        <Input
                                            className="h-8 text-xs"
                                            placeholder="https://..."
                                            id="custom-url"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    const url = (e.target as HTMLInputElement).value
                                                    const label = (document.getElementById('custom-label') as HTMLInputElement).value
                                                    if (url && label) {
                                                        setLocalItems(prev => [...prev, {
                                                            label,
                                                            url,
                                                            open_in_new_tab: false,
                                                            item_type: 'link',
                                                            widget_type: 'text',
                                                            widget_content: {},
                                                            order: prev.length,
                                                            is_visible: true,
                                                            children: []
                                                        }])
                                                        toast.success("Enlace añadido")
                                                            ; (e.target as HTMLInputElement).value = ''
                                                            ; (document.getElementById('custom-label') as HTMLInputElement).value = ''
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px]">Etiqueta</Label>
                                        <Input
                                            className="h-8 text-xs"
                                            placeholder="Mi Enlace"
                                            id="custom-label"
                                        />
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="w-full h-8 text-xs"
                                        onClick={() => {
                                            const url = (document.getElementById('custom-url') as HTMLInputElement).value
                                            const label = (document.getElementById('custom-label') as HTMLInputElement).value
                                            if (url && label) {
                                                setLocalItems(prev => [...prev, {
                                                    label,
                                                    url,
                                                    open_in_new_tab: false,
                                                    item_type: 'link',
                                                    widget_type: 'text',
                                                    widget_content: {},
                                                    order: prev.length,
                                                    is_visible: true,
                                                    children: []
                                                }])
                                                toast.success("Enlace añadido")
                                                    ; (document.getElementById('custom-url') as HTMLInputElement).value = ''
                                                    ; (document.getElementById('custom-label') as HTMLInputElement).value = ''
                                            }
                                        }}
                                    >
                                        Añadir al Menú
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    <Button
                        size="sm"
                        className="w-full text-xs"
                        disabled={selectedResources.length === 0 || !selectedZoneId}
                        onClick={addSelectedToMenu}
                    >
                        Añadir Seleccionados
                    </Button>
                </div>
            </aside>

            {/* ── Right Panel: Items ── */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {selectedZone ? (
                    <>
                        {/* Zone header */}
                        <div className="flex items-center justify-between px-6 py-3 border-b bg-card">
                            <div>
                                <h1 className="font-semibold">{selectedZone.label}</h1>
                                <p className="text-xs text-muted-foreground">
                                    {locationLabels[selectedZone.location]}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setRenameLabel(selectedZone.label)
                                        setRenameOpen(true)
                                    }}
                                >
                                    <Pencil className="h-3.5 w-3.5 mr-1" /> Renombrar
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-destructive border-destructive/30 hover:bg-destructive/10"
                                    onClick={handleDeleteZone}
                                >
                                    <Trash2 className="h-3.5 w-3.5 mr-1" /> Eliminar
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="bg-primary text-primary-foreground"
                                >
                                    {saving ? (
                                        <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                                    ) : (
                                        <Save className="h-3.5 w-3.5 mr-1" />
                                    )}
                                    Guardar
                                </Button>
                            </div>
                        </div>

                        {/* Items list */}
                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-sm text-muted-foreground">
                                    {localItems.length} ítem(s)
                                </p>
                                <Button size="sm" variant="outline" onClick={openAddItem}>
                                    <Plus className="h-3.5 w-3.5 mr-1" /> Añadir Ítem
                                </Button>
                            </div>

                            {localItems.length === 0 ? (
                                <div className="text-center py-16 text-muted-foreground">
                                    <p className="text-sm">No hay ítems. Añade el primero.</p>
                                </div>
                            ) : (
                                <DndContext
                                    sensors={sensors}
                                    collisionDetection={closestCenter}
                                    onDragEnd={handleTopLevelDragEnd}
                                >
                                    <SortableContext
                                        items={localItems.map(i => i.id ?? i.label)}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        <div className="space-y-2">
                                            {localItems.map((item, idx) => (
                                                <div key={item.id ?? item.label + idx}>
                                                    <SortableNavItem
                                                        item={item}
                                                        onToggleVisible={toggleVisible}
                                                        onEdit={openEditItem}
                                                        onDelete={deleteItem}
                                                    />
                                                    {/* Children */}
                                                    {item.children && item.children.length > 0 && (
                                                        <DndContext
                                                            sensors={sensors}
                                                            collisionDetection={closestCenter}
                                                            onDragEnd={(e) => handleChildDragEnd(idx, e)}
                                                        >
                                                            <SortableContext
                                                                items={(item.children ?? []).map(c => c.id ?? c.label)}
                                                                strategy={verticalListSortingStrategy}
                                                            >
                                                                <div className="mt-1 space-y-1">
                                                                    {item.children.map((child, cidx) => (
                                                                        <SortableNavItem
                                                                            key={child.id ?? child.label + cidx}
                                                                            item={child}
                                                                            onToggleVisible={toggleVisible}
                                                                            onEdit={openEditItem}
                                                                            onDelete={deleteItem}
                                                                            isChild
                                                                        />
                                                                    ))}
                                                                </div>
                                                            </SortableContext>
                                                        </DndContext>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </SortableContext>
                                </DndContext>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-muted-foreground">
                        <p className="text-sm">Selecciona o crea una zona de navegación</p>
                    </div>
                )}
            </main>

            {/* ── Dialog: New Zone ── */}
            <Dialog open={newZoneOpen} onOpenChange={setNewZoneOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Nueva Zona de Navegación</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label>Nombre</Label>
                            <Input
                                placeholder="Ej: Menú Principal"
                                value={newZoneLabel}
                                onChange={e => setNewZoneLabel(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Ubicación</Label>
                            <Select
                                value={newZoneLocation}
                                onValueChange={v => setNewZoneLocation(v as NavZone['location'])}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="header">Header</SelectItem>
                                    <SelectItem value="footer">Footer</SelectItem>
                                    <SelectItem value="sidebar_left">Sidebar Izquierdo</SelectItem>
                                    <SelectItem value="sidebar_right">Sidebar Derecho</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setNewZoneOpen(false)}>Cancelar</Button>
                        <Button onClick={handleCreateZone} disabled={creatingZone || !newZoneLabel.trim()}>
                            {creatingZone && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Crear
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Dialog: Rename Zone ── */}
            <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Renombrar Zona</DialogTitle>
                    </DialogHeader>
                    <div className="py-2">
                        <Input
                            value={renameLabel}
                            onChange={e => setRenameLabel(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRenameOpen(false)}>Cancelar</Button>
                        <Button onClick={handleRenameZone} disabled={!renameLabel.trim()}>
                            Guardar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Dialog: Add / Edit Item ── */}
            <Dialog open={addItemOpen} onOpenChange={setAddItemOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{editingItem ? "Editar Ítem" : "Añadir Ítem"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label>Tipo</Label>
                            <Select
                                value={itemForm.item_type}
                                onValueChange={v => setItemForm(f => ({ ...f, item_type: v as 'link' | 'widget' }))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="link">Enlace</SelectItem>
                                    <SelectItem value="widget">Widget</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Etiqueta</Label>
                            <Input
                                placeholder="Ej: Acerca de"
                                value={itemForm.label}
                                onChange={e => setItemForm(f => ({ ...f, label: e.target.value }))}
                            />
                        </div>
                        {itemForm.item_type === 'link' && (
                            <>
                                <div className="space-y-2">
                                    <Label>URL</Label>
                                    <Input
                                        placeholder="/about o https://..."
                                        value={itemForm.url}
                                        onChange={e => setItemForm(f => ({ ...f, url: e.target.value }))}
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="new_tab"
                                        checked={itemForm.open_in_new_tab}
                                        onChange={e => setItemForm(f => ({ ...f, open_in_new_tab: e.target.checked }))}
                                        className="rounded"
                                    />
                                    <Label htmlFor="new_tab" className="font-normal cursor-pointer">
                                        Abrir en nueva pestaña
                                    </Label>
                                </div>
                                {!editingItem && localItems.length > 0 && (
                                    <div className="space-y-2">
                                        <Label>Sub-ítem de (opcional)</Label>
                                        <Select
                                            value={itemForm.parent_id}
                                            onValueChange={v => setItemForm(f => ({ ...f, parent_id: v }))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Ninguno (ítem raíz)" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="">Ninguno (ítem raíz)</SelectItem>
                                                {localItems.map(i => (
                                                    <SelectItem key={i.id ?? i.label} value={String(i.id ?? '')}>
                                                        {i.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                            </>
                        )}
                        {itemForm.item_type === 'widget' && (
                            <>
                                <div className="space-y-2">
                                    <Label>Tipo de Widget</Label>
                                    <Select
                                        value={itemForm.widget_type}
                                        onValueChange={v => setItemForm(f => ({ ...f, widget_type: v }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="text">Texto</SelectItem>
                                            <SelectItem value="html">HTML</SelectItem>
                                            <SelectItem value="image">Imagen</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Contenido</Label>
                                    <textarea
                                        className="w-full min-h-[100px] px-3 py-2 text-sm rounded-md border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                                        placeholder={itemForm.widget_type === 'image' ? 'URL de la imagen' : 'Contenido del widget'}
                                        value={itemForm.widget_content_text}
                                        onChange={e => setItemForm(f => ({ ...f, widget_content_text: e.target.value }))}
                                    />
                                </div>
                            </>
                        )}
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="is_visible"
                                checked={itemForm.is_visible}
                                onChange={e => setItemForm(f => ({ ...f, is_visible: e.target.checked }))}
                                className="rounded"
                            />
                            <Label htmlFor="is_visible" className="font-normal cursor-pointer">
                                Visible
                            </Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAddItemOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSaveItem} disabled={!itemForm.label.trim()}>
                            {editingItem ? "Actualizar" : "Añadir"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default function NavigationAdminPage() {
    return <AdminGuard><NavigationAdminPageContent /></AdminGuard>
}
