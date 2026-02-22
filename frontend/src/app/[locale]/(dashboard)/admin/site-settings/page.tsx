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
    useEffect(() => {
        if (!_hasHydrated || user?.user_type !== 'admin') return
        siteSettingsApi.get().then(data => {
            setSiteName(data.site_name)
            setTagline(data.tagline)
            setLogoPreview(data.logo_url)
            setFaviconPreview(data.favicon_url)
        }).catch(() => {}).finally(() => setLoading(false))
    }, [_hasHydrated, user])

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
