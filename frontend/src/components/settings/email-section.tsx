"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { DataTable } from '@/components/ui/data-table'
import { Mail, Loader2, RefreshCw, Send } from 'lucide-react'
import api from '@/lib/api'
import { useToast } from '@/hooks/use-toast'

type SMTPConfig = {
    id: number
    host: string
    port: number
    use_tls: boolean
    use_ssl: boolean
    username: string
    from_email: string
    from_name: string
    is_active: boolean
    password_is_set: boolean
    updated_at: string
}

type EmailLog = {
    id: string
    recipient: string
    subject: string
    template_key: string
    status: 'sent' | 'failed'
    error_message: string
    sent_at: string
}

type EmailTemplate = {
    id: number
    key: string
    key_display: string
    subject: string
    body_html: string
    body_text: string
    is_active: boolean
    updated_at: string
}

interface EmailSectionProps {
    isAdmin: boolean
}

export function EmailSection({ isAdmin }: EmailSectionProps) {
    const { toast } = useToast()

    // Config state
    const [config, setConfig] = useState<SMTPConfig | null>(null)
    const [configForm, setConfigForm] = useState({
        host: '',
        port: 587,
        use_tls: true,
        use_ssl: false,
        username: '',
        password: '',
        from_email: '',
        from_name: '',
        is_active: false,
    })
    const [savingConfig, setSavingConfig] = useState(false)
    const [loadingConfig, setLoadingConfig] = useState(true)

    // Test email state
    const [testTo, setTestTo] = useState('')
    const [sendingTest, setSendingTest] = useState(false)

    // Logs state
    const [logs, setLogs] = useState<EmailLog[]>([])
    const [loadingLogs, setLoadingLogs] = useState(false)

    // Templates state
    const [templates, setTemplates] = useState<EmailTemplate[]>([])
    const [selectedTemplateKey, setSelectedTemplateKey] = useState('')
    const [templateForm, setTemplateForm] = useState({ subject: '', body_text: '', body_html: '' })
    const [savingTemplate, setSavingTemplate] = useState(false)
    const [loadingTemplates, setLoadingTemplates] = useState(false)

    useEffect(() => {
        if (isAdmin) {
            fetchConfig()
            fetchLogs()
            fetchTemplates()
        }
    }, [isAdmin])

    // Sync form when selected template changes
    useEffect(() => {
        const tpl = templates.find(t => t.key === selectedTemplateKey)
        if (tpl) {
            setTemplateForm({ subject: tpl.subject, body_text: tpl.body_text, body_html: tpl.body_html })
        }
    }, [selectedTemplateKey, templates])

    const fetchConfig = async () => {
        setLoadingConfig(true)
        try {
            const res = await api.get('/mailer/config/')
            const data: SMTPConfig = res.data
            setConfig(data)
            setConfigForm({
                host: data.host,
                port: data.port,
                use_tls: data.use_tls,
                use_ssl: data.use_ssl,
                username: data.username,
                password: '',
                from_email: data.from_email,
                from_name: data.from_name,
                is_active: data.is_active,
            })
        } catch {
            toast({ title: 'Error', description: 'No se pudo cargar la configuración SMTP', variant: 'destructive' })
        } finally {
            setLoadingConfig(false)
        }
    }

    const fetchLogs = async () => {
        setLoadingLogs(true)
        try {
            const res = await api.get('/mailer/logs/')
            setLogs(Array.isArray(res.data) ? res.data : (res.data.results ?? []))
        } catch {
            toast({ title: 'Error', description: 'No se pudieron cargar los registros', variant: 'destructive' })
        } finally {
            setLoadingLogs(false)
        }
    }

    const fetchTemplates = async () => {
        setLoadingTemplates(true)
        try {
            const res = await api.get('/mailer/templates/')
            const data: EmailTemplate[] = Array.isArray(res.data) ? res.data : (res.data.results ?? [])
            setTemplates(data)
            if (data.length > 0 && !selectedTemplateKey) {
                setSelectedTemplateKey(data[0].key)
            }
        } catch {
            toast({ title: 'Error', description: 'No se pudieron cargar las plantillas', variant: 'destructive' })
        } finally {
            setLoadingTemplates(false)
        }
    }

    const handleSaveConfig = async () => {
        setSavingConfig(true)
        try {
            await api.put('/mailer/config/', configForm)
            toast({ title: 'Configuración guardada', description: 'Los ajustes SMTP han sido actualizados.' })
            fetchConfig()
        } catch {
            toast({ title: 'Error', description: 'No se pudo guardar la configuración', variant: 'destructive' })
        } finally {
            setSavingConfig(false)
        }
    }

    const handleSendTest = async () => {
        if (!testTo.trim()) {
            toast({ title: 'Campo requerido', description: 'Ingresa un destinatario', variant: 'destructive' })
            return
        }
        setSendingTest(true)
        try {
            await api.post('/mailer/config/test/', { to: testTo })
            toast({ title: 'Correo enviado', description: `Correo de prueba enviado a ${testTo}` })
        } catch (err: any) {
            const detail = err?.response?.data?.detail ?? 'Error al enviar el correo de prueba'
            toast({ title: 'Error', description: detail, variant: 'destructive' })
        } finally {
            setSendingTest(false)
        }
    }

    const handleSaveTemplate = async () => {
        if (!selectedTemplateKey) return
        setSavingTemplate(true)
        try {
            await api.put(`/mailer/templates/${selectedTemplateKey}/`, templateForm)
            toast({ title: 'Plantilla guardada', description: 'La plantilla ha sido actualizada correctamente.' })
            fetchTemplates()
        } catch {
            toast({ title: 'Error', description: 'No se pudo guardar la plantilla', variant: 'destructive' })
        } finally {
            setSavingTemplate(false)
        }
    }

    if (!isAdmin) return null

    if (loadingConfig) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                </CardContent>
            </Card>
        )
    }

    const logColumns = [
        { header: 'Destinatario', accessorKey: 'recipient' as keyof EmailLog },
        { header: 'Asunto', accessorKey: 'subject' as keyof EmailLog },
        {
            header: 'Plantilla',
            cell: (l: EmailLog) => l.template_key
                ? <Badge variant="outline">{l.template_key}</Badge>
                : <span className="text-muted-foreground text-xs">—</span>,
        },
        {
            header: 'Estado',
            cell: (l: EmailLog) => (
                <Badge className={l.status === 'sent'
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }>
                    {l.status === 'sent' ? 'Enviado' : 'Fallido'}
                </Badge>
            ),
        },
        {
            header: 'Fecha',
            cell: (l: EmailLog) => new Date(l.sent_at).toLocaleString('es'),
        },
    ]

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2">
                <Mail className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">Correo Electrónico</h2>
            </div>

            <Tabs defaultValue="config">
                <TabsList>
                    <TabsTrigger value="config">Configuración</TabsTrigger>
                    <TabsTrigger value="test">Prueba</TabsTrigger>
                    <TabsTrigger value="logs">Registros</TabsTrigger>
                    <TabsTrigger value="templates">Plantillas</TabsTrigger>
                </TabsList>

                {/* Tab Configuración */}
                <TabsContent value="config" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Configuración SMTP</CardTitle>
                            <CardDescription>Ajusta el servidor de correo saliente</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="smtp-host">Host</Label>
                                    <Input
                                        id="smtp-host"
                                        placeholder="smtp.gmail.com"
                                        value={configForm.host}
                                        onChange={e => setConfigForm(prev => ({ ...prev, host: e.target.value }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="smtp-port">Puerto</Label>
                                    <Input
                                        id="smtp-port"
                                        type="number"
                                        placeholder="587"
                                        value={configForm.port}
                                        onChange={e => setConfigForm(prev => ({ ...prev, port: Number(e.target.value) }))}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="smtp-user">Usuario</Label>
                                    <Input
                                        id="smtp-user"
                                        placeholder="tu@email.com"
                                        value={configForm.username}
                                        onChange={e => setConfigForm(prev => ({ ...prev, username: e.target.value }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="smtp-pass">
                                        Contraseña
                                        {config?.password_is_set && (
                                            <span className="ml-2 text-xs text-muted-foreground">(guardada)</span>
                                        )}
                                    </Label>
                                    <Input
                                        id="smtp-pass"
                                        type="password"
                                        placeholder={config?.password_is_set ? '••••••••' : 'Nueva contraseña'}
                                        value={configForm.password}
                                        onChange={e => setConfigForm(prev => ({ ...prev, password: e.target.value }))}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="smtp-from-email">From Email</Label>
                                    <Input
                                        id="smtp-from-email"
                                        type="email"
                                        placeholder="noreply@bvs.com"
                                        value={configForm.from_email}
                                        onChange={e => setConfigForm(prev => ({ ...prev, from_email: e.target.value }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="smtp-from-name">From Name</Label>
                                    <Input
                                        id="smtp-from-name"
                                        placeholder="BVS"
                                        value={configForm.from_name}
                                        onChange={e => setConfigForm(prev => ({ ...prev, from_name: e.target.value }))}
                                    />
                                </div>
                            </div>

                            <Separator />

                            <div className="flex flex-wrap gap-4">
                                <div className="flex items-center justify-between gap-4 flex-1 min-w-[200px]">
                                    <div>
                                        <Label className="text-base">TLS</Label>
                                        <p className="text-sm text-muted-foreground">Usar STARTTLS (recomendado, puerto 587)</p>
                                    </div>
                                    <Button
                                        variant={configForm.use_tls ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setConfigForm(prev => ({ ...prev, use_tls: !prev.use_tls }))}
                                    >
                                        {configForm.use_tls ? 'Activado' : 'Desactivado'}
                                    </Button>
                                </div>
                                <div className="flex items-center justify-between gap-4 flex-1 min-w-[200px]">
                                    <div>
                                        <Label className="text-base">SSL</Label>
                                        <p className="text-sm text-muted-foreground">Usar SSL/TLS directo (puerto 465)</p>
                                    </div>
                                    <Button
                                        variant={configForm.use_ssl ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setConfigForm(prev => ({ ...prev, use_ssl: !prev.use_ssl }))}
                                    >
                                        {configForm.use_ssl ? 'Activado' : 'Desactivado'}
                                    </Button>
                                </div>
                            </div>

                            <Separator />

                            <div className="flex items-center justify-between">
                                <div>
                                    <Label className="text-base">Configuración activa</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Si está activo, se usará esta configuración para enviar correos
                                    </p>
                                </div>
                                <Button
                                    variant={configForm.is_active ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setConfigForm(prev => ({ ...prev, is_active: !prev.is_active }))}
                                >
                                    {configForm.is_active ? 'Activo' : 'Inactivo'}
                                </Button>
                            </div>

                            <div className="flex justify-end pt-2">
                                <Button onClick={handleSaveConfig} disabled={savingConfig}>
                                    {savingConfig && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Guardar configuración
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tab Prueba */}
                <TabsContent value="test" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Correo de Prueba</CardTitle>
                            <CardDescription>
                                Envía un correo de prueba para verificar la configuración SMTP
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {!config?.is_active && (
                                <div className="rounded-md border border-orange-200 bg-orange-50 p-3 text-sm text-orange-800 dark:border-orange-900 dark:bg-orange-950 dark:text-orange-200">
                                    La configuración SMTP no está activa. Actívala en la pestaña Configuración antes de enviar.
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="test-to">Destinatario</Label>
                                <Input
                                    id="test-to"
                                    type="email"
                                    placeholder="destinatario@ejemplo.com"
                                    value={testTo}
                                    onChange={e => setTestTo(e.target.value)}
                                />
                            </div>
                            <Button
                                onClick={handleSendTest}
                                disabled={sendingTest || !config?.is_active}
                            >
                                {sendingTest
                                    ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    : <Send className="mr-2 h-4 w-4" />
                                }
                                Enviar correo de prueba
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tab Registros */}
                <TabsContent value="logs" className="mt-4">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Registros de Envío</CardTitle>
                                    <CardDescription>Historial de correos enviados (últimos 200)</CardDescription>
                                </div>
                                <Button variant="outline" size="sm" onClick={fetchLogs} disabled={loadingLogs}>
                                    {loadingLogs
                                        ? <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                        : <RefreshCw className="h-4 w-4 mr-1" />
                                    }
                                    Recargar
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {loadingLogs ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                </div>
                            ) : (
                                <DataTable data={logs} columns={logColumns} />
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tab Plantillas */}
                <TabsContent value="templates" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Plantillas de Correo</CardTitle>
                            <CardDescription>Edita las plantillas utilizadas en los correos automáticos</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {loadingTemplates ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                </div>
                            ) : templates.length === 0 ? (
                                <p className="text-sm text-muted-foreground py-4 text-center">
                                    No hay plantillas. Se crearán automáticamente cuando se usen por primera vez.
                                </p>
                            ) : (
                                <>
                                    <div className="space-y-2">
                                        <Label>Plantilla</Label>
                                        <Select value={selectedTemplateKey} onValueChange={setSelectedTemplateKey}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona una plantilla" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {templates.map(t => (
                                                    <SelectItem key={t.key} value={t.key}>
                                                        {t.key_display}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {selectedTemplateKey && (
                                        <>
                                            <div className="space-y-2">
                                                <Label htmlFor="tpl-subject">Asunto</Label>
                                                <Input
                                                    id="tpl-subject"
                                                    value={templateForm.subject}
                                                    onChange={e => setTemplateForm(prev => ({ ...prev, subject: e.target.value }))}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="tpl-text">Cuerpo (texto plano)</Label>
                                                <Textarea
                                                    id="tpl-text"
                                                    rows={5}
                                                    value={templateForm.body_text}
                                                    onChange={e => setTemplateForm(prev => ({ ...prev, body_text: e.target.value }))}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="tpl-html">Cuerpo (HTML)</Label>
                                                <Textarea
                                                    id="tpl-html"
                                                    rows={8}
                                                    className="font-mono text-sm"
                                                    value={templateForm.body_html}
                                                    onChange={e => setTemplateForm(prev => ({ ...prev, body_html: e.target.value }))}
                                                />
                                            </div>
                                            <div className="flex justify-end">
                                                <Button onClick={handleSaveTemplate} disabled={savingTemplate}>
                                                    {savingTemplate && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                    Guardar plantilla
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
