"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuthStoreHydrated } from "@/store/authStore"
import { siteSettingsApi, type SiteSettings } from "@/services/siteSettingsApi"
import { useSiteSettings } from "@/context/site-settings-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Settings2, Upload, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function SiteSettingsPage() {
    const router = useRouter()
    const { user, _hasHydrated } = useAuthStoreHydrated()
    const { refresh } = useSiteSettings()
    const { toast } = useToast()

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    const [siteName, setSiteName] = useState('')
    const [tagline, setTagline] = useState('')
    const [logoFile, setLogoFile] = useState<File | null>(null)
    const [faviconFile, setFaviconFile] = useState<File | null>(null)
    const [logoPreview, setLogoPreview] = useState<string | null>(null)
    const [faviconPreview, setFaviconPreview] = useState<string | null>(null)
    const [gaId, setGaId] = useState('')
    const [gtmId, setGtmId] = useState('')
    const [gscId, setGscId] = useState('')

    const logoInputRef = useRef<HTMLInputElement>(null)
    const faviconInputRef = useRef<HTMLInputElement>(null)

    // Auth check
    useEffect(() => {
        if (!_hasHydrated) return
        if (user?.user_type !== 'admin') {
            router.push('/home')
        }
    }, [_hasHydrated, user, router])

    // Load current settings
    const isAdmin = user?.user_type === 'admin'
    useEffect(() => {
        if (!_hasHydrated || !isAdmin) return
        siteSettingsApi.get().then(data => {
            setSiteName(data.site_name)
            setTagline(data.tagline)
            setLogoPreview(data.logo_url)
            setFaviconPreview(data.favicon_url)
            setGaId(data.ga_id || '')
            setGtmId(data.gtm_id || '')
            setGscId(data.gsc_id || '')
        }).catch(() => { }).finally(() => setLoading(false))
    }, [_hasHydrated, isAdmin])

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setLogoFile(file)
        setLogoPreview(URL.createObjectURL(file))
    }

    const handleFaviconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setFaviconFile(file)
        setFaviconPreview(URL.createObjectURL(file))
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            const formData = new FormData()
            formData.append('site_name', siteName)
            formData.append('tagline', tagline)
            if (logoFile) formData.append('logo', logoFile)
            if (faviconFile) formData.append('favicon', faviconFile)
            formData.append('ga_id', gaId)
            formData.append('gtm_id', gtmId)
            formData.append('gsc_id', gscId)

            await siteSettingsApi.update(formData)
            refresh()
            toast({ title: 'Ajustes guardados', description: 'Los cambios se han aplicado correctamente.' })
        } catch {
            toast({ title: 'Error', description: 'No se pudieron guardar los ajustes.', variant: 'destructive' })
        } finally {
            setSaving(false)
        }
    }

    if (!_hasHydrated || user?.user_type !== 'admin') return null

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6 max-w-3xl">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Settings2 className="h-6 w-6 text-primary" />
                    Ajustes del Sitio
                </h1>
                <p className="text-muted-foreground text-sm mt-1">
                    Gestiona el logo, favicon y nombre de la plataforma
                </p>
            </div>

            {/* Logo & Favicon */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Logo */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Logo</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-center h-20 border rounded-lg bg-muted/30 overflow-hidden">
                            {logoPreview ? (
                                <img
                                    src={logoPreview}
                                    alt="Logo preview"
                                    className="h-full w-full object-contain p-2"
                                />
                            ) : (
                                <span className="text-sm text-muted-foreground">Sin logo</span>
                            )}
                        </div>
                        <input
                            ref={logoInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleLogoChange}
                        />
                        <Button
                            variant="outline"
                            className="w-full gap-2"
                            onClick={() => logoInputRef.current?.click()}
                        >
                            <Upload className="h-4 w-4" />
                            Subir imagen
                        </Button>
                    </CardContent>
                </Card>

                {/* Favicon */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Favicon</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-center h-20 border rounded-lg bg-muted/30">
                            {faviconPreview ? (
                                <img
                                    src={faviconPreview}
                                    alt="Favicon preview"
                                    className="h-12 w-12 object-contain"
                                />
                            ) : (
                                <span className="text-sm text-muted-foreground">Sin favicon</span>
                            )}
                        </div>
                        <input
                            ref={faviconInputRef}
                            type="file"
                            accept="image/x-icon,image/png,image/svg+xml"
                            className="hidden"
                            onChange={handleFaviconChange}
                        />
                        <Button
                            variant="outline"
                            className="w-full gap-2"
                            onClick={() => faviconInputRef.current?.click()}
                        >
                            <Upload className="h-4 w-4" />
                            Subir .ico/.png
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Text fields */}
            <Card>
                <CardContent className="pt-6 space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="site_name">Nombre del sitio</Label>
                        <Input
                            id="site_name"
                            value={siteName}
                            onChange={e => setSiteName(e.target.value)}
                            placeholder="BVS"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="tagline">Tagline</Label>
                        <Input
                            id="tagline"
                            value={tagline}
                            onChange={e => setTagline(e.target.value)}
                            placeholder="Plataforma digital de conocimiento"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Google Services */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12.48 10.92v3.28h4.74c-.2 1.06-.9 1.95-1.82 2.56l2.94 2.28c1.71-1.58 2.71-3.9 2.71-6.7 0-.58-.05-1.15-.16-1.71h-8.41v.29z" fill="#4285F4" /><path d="M12.48 24c2.37 0 4.34-.79 5.8-2.12l-2.94-2.28c-.81.54-1.85.86-2.86.86-2.2 0-4.06-1.48-4.73-3.48l-3.04 2.35C6.18 22.04 9.07 24 12.48 24z" fill="#34A853" /><path d="M7.75 17c-.17-.52-.27-1.07-.27-1.63 0-.56.1-1.11.27-1.63l-3.05-2.35C4.24 12.44 4 13.69 4 15c0 1.31.24 2.56.7 3.65l3.05-2.65z" fill="#FBBC05" /><path d="M12.48 6.02c1.29 0 2.45.44 3.36 1.31l2.51-2.51C16.82 3.4 14.82 2.5 12.48 2.5a8.55 8.55 0 0 0-7.78 4.85l3.04 2.35c.67-2 2.53-3.48 4.74-3.48z" fill="#EA4335" />
                        </svg>
                        Servicios de Google
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="ga_id">Google Analytics ID</Label>
                        <Input
                            id="ga_id"
                            value={gaId}
                            onChange={e => setGaId(e.target.value)}
                            placeholder="G-XXXXXXXXXX"
                        />
                        <p className="text-[10px] text-muted-foreground">ID de medición de Google Analytics 4.</p>
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="gtm_id">Google Tag Manager ID</Label>
                        <Input
                            id="gtm_id"
                            value={gtmId}
                            onChange={e => setGtmId(e.target.value)}
                            placeholder="GTM-XXXXXXX"
                        />
                        <p className="text-[10px] text-muted-foreground">ID de contenedor de Google Tag Manager.</p>
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="gsc_id">Google Search Console</Label>
                        <Input
                            id="gsc_id"
                            value={gscId}
                            onChange={e => setGscId(e.target.value)}
                            placeholder="Código de verificación meta..."
                        />
                        <p className="text-[10px] text-muted-foreground">Código de la etiqueta meta de verificación. Solo la parte del contenido.</p>
                    </div>
                </CardContent>
            </Card>

            {/* Save */}
            <div className="flex justify-end">
                <Button onClick={handleSave} disabled={saving} className="gap-2">
                    {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                    Guardar cambios
                </Button>
            </div>
        </div>
    )
}
