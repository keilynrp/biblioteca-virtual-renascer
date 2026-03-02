'use client'

import { useState, useCallback, useEffect } from 'react'
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from '@dnd-kit/core'
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    arrayMove,
} from '@dnd-kit/sortable'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Save, Loader2, Trash2, Send, Archive } from 'lucide-react'
import { toast } from 'sonner'

import { formsApi } from '@/services/formsApi'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

import type { FormRecord, FormField, FormNotificationRecipient, FormFieldType, CaptchaProvider } from '@/types/form'
import { FormFieldCard } from './FormFieldCard'
import { FieldEditDialog } from './FieldEditDialog'
import { FieldTypeSelector } from './FieldTypeSelector'

interface FormEditorProps {
    initialData?: FormRecord
    onSaved?: (form: FormRecord) => void
}

export function FormEditor({ initialData, onSaved }: FormEditorProps) {
    const isNew = !initialData

    // Form metadata
    const [title, setTitle] = useState(initialData?.title ?? '')
    const [slug, setSlug] = useState(initialData?.slug ?? '')
    const [description, setDescription] = useState(initialData?.description ?? '')
    const [successMessage, setSuccessMessage] = useState(
        initialData?.success_message ?? 'Formulario enviado exitosamente.',
    )
    const [redirectUrl, setRedirectUrl] = useState(initialData?.redirect_url ?? '')
    const [honeypotFieldName, setHoneypotFieldName] = useState(
        initialData?.honeypot_field_name ?? 'website_url',
    )

    // Captcha
    const [captchaProvider, setCaptchaProvider] = useState<CaptchaProvider>(
        initialData?.captcha_provider ?? 'none',
    )
    const [captchaSiteKey, setCaptchaSiteKey] = useState(initialData?.captcha_site_key ?? '')
    const [captchaSecretKey, setCaptchaSecretKey] = useState(initialData?.captcha_secret_key ?? '')
    const [captchaMinSeconds, setCaptchaMinSeconds] = useState(initialData?.captcha_min_seconds ?? 3)
    const [captchaScoreThreshold, setCaptchaScoreThreshold] = useState(
        initialData?.captcha_score_threshold ?? 0.5,
    )

    // Fields
    const [fields, setFields] = useState<FormField[]>(initialData?.fields ?? [])

    // Recipients
    const [recipients, setRecipients] = useState<FormNotificationRecipient[]>(
        initialData?.notification_recipients ?? [],
    )
    const [newRecipientEmail, setNewRecipientEmail] = useState('')
    const [newRecipientName, setNewRecipientName] = useState('')

    // UI state
    const [saving, setSaving] = useState(false)
    const [publishing, setPublishing] = useState(false)
    const [archiving, setArchiving] = useState(false)
    const [typePickerOpen, setTypePickerOpen] = useState(false)
    const [editingField, setEditingField] = useState<FormField | null>(null)
    const [editDialogOpen, setEditDialogOpen] = useState(false)

    // DnD
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    )

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event
        if (!over || active.id === over.id) return

        const oldIdx = fields.findIndex(f => (f.id ?? `new-${f.order}`) === active.id)
        const newIdx = fields.findIndex(f => (f.id ?? `new-${f.order}`) === over.id)
        if (oldIdx === -1 || newIdx === -1) return

        setFields(prev => {
            const reordered = arrayMove(prev, oldIdx, newIdx)
            return reordered.map((f, i) => ({ ...f, order: i }))
        })
    }

    // ── Field operations ──

    function handleAddFieldType(type: FormFieldType) {
        setTypePickerOpen(false)
        const newField: FormField = {
            label: '',
            field_type: type,
            placeholder: '',
            help_text: '',
            is_required: false,
            validation_rules: {},
            options: [],
            default_value: '',
            order: fields.length,
        }
        setEditingField(newField)
        setEditDialogOpen(true)
    }

    function handleSaveField(field: FormField) {
        if (field.id) {
            // Update existing
            setFields(prev => prev.map(f => f.id === field.id ? { ...field } : f))
        } else if (editingField && fields.includes(editingField)) {
            // Update existing field without id (editing in-place)
            setFields(prev => prev.map(f => f === editingField ? { ...field } : f))
        } else {
            // Add new
            setFields(prev => [...prev, { ...field, order: prev.length }])
        }
    }

    function handleDeleteField(index: number) {
        setFields(prev => {
            const updated = prev.filter((_, i) => i !== index)
            return updated.map((f, i) => ({ ...f, order: i }))
        })
    }

    function handleEditField(field: FormField) {
        setEditingField(field)
        setEditDialogOpen(true)
    }

    // ── Recipient operations ──

    function addRecipient() {
        if (!newRecipientEmail.trim()) return
        if (recipients.some(r => r.email === newRecipientEmail.trim())) {
            toast.error('Este email ya fue agregado')
            return
        }
        setRecipients(prev => [
            ...prev,
            { email: newRecipientEmail.trim(), name: newRecipientName.trim(), is_active: true },
        ])
        setNewRecipientEmail('')
        setNewRecipientName('')
    }

    function removeRecipient(index: number) {
        setRecipients(prev => prev.filter((_, i) => i !== index))
    }

    // ── Save ──

    async function handleSave() {
        if (!title.trim()) {
            toast.error('El título es requerido')
            return
        }
        setSaving(true)
        try {
            const payload: Partial<FormRecord> = {
                title,
                slug: slug || undefined,
                description,
                success_message: successMessage,
                redirect_url: redirectUrl,
                honeypot_field_name: honeypotFieldName,
                captcha_provider: captchaProvider,
                captcha_site_key: captchaSiteKey,
                captcha_secret_key: captchaSecretKey,
                captcha_min_seconds: captchaMinSeconds,
                captcha_score_threshold: captchaScoreThreshold,
                fields: fields.map((f, i) => ({ ...f, order: i })),
                notification_recipients: recipients,
            } as Partial<FormRecord>

            let saved: FormRecord
            if (isNew) {
                saved = await formsApi.createForm(payload)
            } else {
                saved = await formsApi.updateForm(initialData.slug, payload)
            }

            toast.success('Formulario guardado')
            onSaved?.(saved)
        } catch {
            toast.error('Error al guardar el formulario')
        } finally {
            setSaving(false)
        }
    }

    async function handlePublish() {
        if (!initialData?.slug) return
        setPublishing(true)
        try {
            const result = await formsApi.publishForm(initialData.slug)
            toast.success('Formulario publicado')
            onSaved?.(result)
        } catch {
            toast.error('Error al publicar. Asegúrate de tener al menos un campo.')
        } finally {
            setPublishing(false)
        }
    }

    async function handleArchive() {
        if (!initialData?.slug) return
        setArchiving(true)
        try {
            const result = await formsApi.archiveForm(initialData.slug)
            toast.success('Formulario archivado')
            onSaved?.(result)
        } catch {
            toast.error('Error al archivar')
        } finally {
            setArchiving(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Header with actions */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">
                    {isNew ? 'Nuevo formulario' : `Editar: ${initialData.title}`}
                </h1>
                <div className="flex items-center gap-2">
                    {!isNew && initialData.status !== 'published' && (
                        <Button
                            variant="outline"
                            onClick={handlePublish}
                            disabled={publishing || fields.length === 0}
                        >
                            {publishing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                            Publicar
                        </Button>
                    )}
                    {!isNew && initialData.status === 'published' && (
                        <Button variant="outline" onClick={handleArchive} disabled={archiving}>
                            {archiving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Archive className="h-4 w-4 mr-2" />}
                            Archivar
                        </Button>
                    )}
                    <Button onClick={handleSave} disabled={saving}>
                        {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                        Guardar
                    </Button>
                </div>
            </div>

            {/* UUID info */}
            {!isNew && (
                <div className="text-xs text-muted-foreground bg-muted/50 rounded px-3 py-2">
                    UUID: <code className="select-all">{initialData.uuid}</code>
                    {' '} | Versión: {initialData.version}
                    {' '} | Estado: {initialData.status}
                </div>
            )}

            <Tabs defaultValue="fields">
                <TabsList>
                    <TabsTrigger value="fields">Campos ({fields.length})</TabsTrigger>
                    <TabsTrigger value="config">Configuración</TabsTrigger>
                    <TabsTrigger value="notifications">
                        Notificaciones ({recipients.length})
                    </TabsTrigger>
                </TabsList>

                {/* ── Tab: Fields ── */}
                <TabsContent value="fields" className="space-y-4 mt-4">
                    {fields.length > 0 ? (
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={fields.map(f => f.id ?? `new-${f.order}`)}
                                strategy={verticalListSortingStrategy}
                            >
                                <div className="space-y-2">
                                    {fields.map((field, index) => (
                                        <FormFieldCard
                                            key={field.id ?? `new-${field.order}`}
                                            field={field}
                                            onEdit={() => handleEditField(field)}
                                            onDelete={() => handleDeleteField(index)}
                                        />
                                    ))}
                                </div>
                            </SortableContext>
                        </DndContext>
                    ) : (
                        <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                            <p className="text-lg mb-2">Sin campos todavía</p>
                            <p className="text-sm">Agrega campos para construir tu formulario</p>
                        </div>
                    )}

                    <Button
                        variant="outline"
                        onClick={() => setTypePickerOpen(true)}
                        className="w-full"
                    >
                        <Plus className="h-4 w-4 mr-2" /> Agregar campo
                    </Button>
                </TabsContent>

                {/* ── Tab: Config ── */}
                <TabsContent value="config" className="space-y-4 mt-4">
                    <div className="grid gap-4 max-w-xl">
                        <div className="space-y-2">
                            <Label>Título *</Label>
                            <Input value={title} onChange={e => setTitle(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Slug</Label>
                            <Input
                                value={slug}
                                onChange={e => setSlug(e.target.value)}
                                placeholder="Se genera automáticamente del título"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Descripción</Label>
                            <Textarea
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                rows={3}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Mensaje de éxito</Label>
                            <Textarea
                                value={successMessage}
                                onChange={e => setSuccessMessage(e.target.value)}
                                rows={2}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>URL de redirección (opcional)</Label>
                            <Input
                                value={redirectUrl}
                                onChange={e => setRedirectUrl(e.target.value)}
                                placeholder="https://..."
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Nombre del campo honeypot</Label>
                            <Input
                                value={honeypotFieldName}
                                onChange={e => setHoneypotFieldName(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                Campo oculto para detección de spam
                            </p>
                        </div>

                        {/* ── Captcha config ── */}
                        <div className="border-t pt-4 mt-2">
                            <h3 className="font-semibold text-sm mb-3">Protección anti-spam</h3>
                        </div>

                        <div className="space-y-2">
                            <Label>Proveedor de CAPTCHA</Label>
                            <Select
                                value={captchaProvider}
                                onValueChange={v => setCaptchaProvider(v as CaptchaProvider)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Ninguno (solo honeypot)</SelectItem>
                                    <SelectItem value="turnstile">Cloudflare Turnstile</SelectItem>
                                    <SelectItem value="recaptcha_v3">Google reCAPTCHA v3</SelectItem>
                                    <SelectItem value="numeric">CAPTCHA numérico</SelectItem>
                                    <SelectItem value="time_based">Validación por tiempo</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {(captchaProvider === 'turnstile' || captchaProvider === 'recaptcha_v3') && (
                            <>
                                <div className="space-y-2">
                                    <Label>Site Key</Label>
                                    <Input
                                        value={captchaSiteKey}
                                        onChange={e => setCaptchaSiteKey(e.target.value)}
                                        placeholder={captchaProvider === 'turnstile' ? '0x...' : '6L...'}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Secret Key</Label>
                                    <Input
                                        type="password"
                                        value={captchaSecretKey}
                                        onChange={e => setCaptchaSecretKey(e.target.value)}
                                        placeholder="Se almacena de forma segura en el servidor"
                                    />
                                </div>
                            </>
                        )}

                        {captchaProvider === 'recaptcha_v3' && (
                            <div className="space-y-2">
                                <Label>Umbral de puntuación (0.0 - 1.0)</Label>
                                <Input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    max="1"
                                    value={captchaScoreThreshold}
                                    onChange={e => setCaptchaScoreThreshold(parseFloat(e.target.value) || 0.5)}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Valores más altos son más estrictos. Recomendado: 0.5
                                </p>
                            </div>
                        )}

                        {captchaProvider === 'time_based' && (
                            <div className="space-y-2">
                                <Label>Segundos mínimos antes de enviar</Label>
                                <Input
                                    type="number"
                                    min="1"
                                    max="60"
                                    value={captchaMinSeconds}
                                    onChange={e => setCaptchaMinSeconds(parseInt(e.target.value) || 3)}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Rechaza envíos más rápidos que este tiempo (bots). Recomendado: 3
                                </p>
                            </div>
                        )}
                    </div>
                </TabsContent>

                {/* ── Tab: Notifications ── */}
                <TabsContent value="notifications" className="space-y-4 mt-4">
                    <p className="text-sm text-muted-foreground">
                        Los destinatarios recibirán un email cada vez que alguien envíe este formulario.
                    </p>

                    {recipients.length > 0 && (
                        <div className="space-y-2">
                            {recipients.map((r, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 bg-card border rounded-lg">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm">{r.email}</p>
                                        {r.name && <p className="text-xs text-muted-foreground">{r.name}</p>}
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => removeRecipient(i)}
                                    >
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex items-end gap-3 max-w-xl">
                        <div className="flex-1 space-y-2">
                            <Label>Email</Label>
                            <Input
                                type="email"
                                value={newRecipientEmail}
                                onChange={e => setNewRecipientEmail(e.target.value)}
                                placeholder="admin@ejemplo.com"
                                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addRecipient())}
                            />
                        </div>
                        <div className="flex-1 space-y-2">
                            <Label>Nombre (opcional)</Label>
                            <Input
                                value={newRecipientName}
                                onChange={e => setNewRecipientName(e.target.value)}
                                placeholder="Admin"
                                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addRecipient())}
                            />
                        </div>
                        <Button variant="outline" onClick={addRecipient}>
                            <Plus className="h-4 w-4 mr-1" /> Agregar
                        </Button>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Dialogs */}
            <Dialog open={typePickerOpen} onOpenChange={setTypePickerOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Tipo de campo</DialogTitle>
                    </DialogHeader>
                    <FieldTypeSelector onSelect={handleAddFieldType} />
                </DialogContent>
            </Dialog>

            <FieldEditDialog
                open={editDialogOpen}
                onOpenChange={setEditDialogOpen}
                field={editingField}
                onSave={handleSaveField}
            />
        </div>
    )
}
