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
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Settings2, Upload, Loader2, Shield, Cookie, Share2 } from "lucide-react"
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
    const [logoSmallFile, setLogoSmallFile] = useState<File | null>(null)
    const [faviconFile, setFaviconFile] = useState<File | null>(null)
    const [logoPreview, setLogoPreview] = useState<string | null>(null)
    const [logoSmallPreview, setLogoSmallPreview] = useState<string | null>(null)
    const [faviconPreview, setFaviconPreview] = useState<string | null>(null)
    const [gaId, setGaId] = useState('')
    const [gtmId, setGtmId] = useState('')
    const [gscId, setGscId] = useState('')

    // Favicon variants (read-only, auto-generated)
    const [faviconVariants, setFaviconVariants] = useState<{
        favicon_16_url: string | null
        favicon_32_url: string | null
        apple_touch_icon_url: string | null
        android_chrome_192_url: string | null
        android_chrome_512_url: string | null
    }>({ favicon_16_url: null, favicon_32_url: null, apple_touch_icon_url: null, android_chrome_192_url: null, android_chrome_512_url: null })

    // Theme colors
    const [safariPinnedTabColor, setSafariPinnedTabColor] = useState('#3b82f6')
    const [msTileColor, setMsTileColor] = useState('#3b82f6')
    const [themeColor, setThemeColor] = useState('#3b82f6')

    // Cookie & Privacy
    const [cookieConsentEnabled, setCookieConsentEnabled] = useState(false)
    const [privacyPolicyUrl, setPrivacyPolicyUrl] = useState('')
    const [termsOfServiceUrl, setTermsOfServiceUrl] = useState('')
    const [cookiePolicyUrl, setCookiePolicyUrl] = useState('')
    const [cookiesAnalytics, setCookiesAnalytics] = useState(true)
    const [cookiesMarketing, setCookiesMarketing] = useState(false)
    const [cookiesFunctional, setCookiesFunctional] = useState(true)
    const [complianceGdpr, setComplianceGdpr] = useState(false)
    const [complianceLgpd, setComplianceLgpd] = useState(false)
    const [complianceHipaa, setComplianceHipaa] = useState(false)
    const [complianceCcpa, setComplianceCcpa] = useState(false)
    const [cookieBannerTitle, setCookieBannerTitle] = useState('')
    const [cookieBannerDescription, setCookieBannerDescription] = useState('')

    // OG / Social
    const [ogImageFile, setOgImageFile] = useState<File | null>(null)
    const [ogImagePreview, setOgImagePreview] = useState<string | null>(null)
    const [ogDescription, setOgDescription] = useState('')
    const [twitterHandle, setTwitterHandle] = useState('')

    const logoInputRef = useRef<HTMLInputElement>(null)
    const logoSmallInputRef = useRef<HTMLInputElement>(null)
    const faviconInputRef = useRef<HTMLInputElement>(null)
    const ogImageInputRef = useRef<HTMLInputElement>(null)

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
            setLogoSmallPreview(data.logo_small_url)
            setFaviconPreview(data.favicon_url)
            setGaId(data.ga_id || '')
            setGtmId(data.gtm_id || '')
            setGscId(data.gsc_id || '')
            setFaviconVariants({
                favicon_16_url: data.favicon_16_url,
                favicon_32_url: data.favicon_32_url,
                apple_touch_icon_url: data.apple_touch_icon_url,
                android_chrome_192_url: data.android_chrome_192_url,
                android_chrome_512_url: data.android_chrome_512_url,
            })
            setSafariPinnedTabColor(data.safari_pinned_tab_color || '#3b82f6')
            setMsTileColor(data.ms_tile_color || '#3b82f6')
            setThemeColor(data.theme_color || '#3b82f6')
            setCookieConsentEnabled(data.cookie_consent_enabled ?? false)
            setPrivacyPolicyUrl(data.privacy_policy_url || '')
            setTermsOfServiceUrl(data.terms_of_service_url || '')
            setCookiePolicyUrl(data.cookie_policy_url || '')
            setCookiesAnalytics(data.cookies_analytics_enabled ?? true)
            setCookiesMarketing(data.cookies_marketing_enabled ?? false)
            setCookiesFunctional(data.cookies_functional_enabled ?? true)
            setComplianceGdpr(data.compliance_gdpr ?? false)
            setComplianceLgpd(data.compliance_lgpd ?? false)
            setComplianceHipaa(data.compliance_hipaa ?? false)
            setComplianceCcpa(data.compliance_ccpa ?? false)
            setCookieBannerTitle(data.cookie_banner_title || '')
            setCookieBannerDescription(data.cookie_banner_description || '')
            setOgImagePreview(data.og_image_url || null)
            setOgDescription(data.og_description || '')
            setTwitterHandle(data.twitter_handle || '')
        }).catch(() => { }).finally(() => setLoading(false))
    }, [_hasHydrated, isAdmin])

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setLogoFile(file)
        setLogoPreview(URL.createObjectURL(file))
    }

    const handleLogoSmallChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setLogoSmallFile(file)
        setLogoSmallPreview(URL.createObjectURL(file))
    }

    const handleFaviconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setFaviconFile(file)
        setFaviconPreview(URL.createObjectURL(file))
    }

    const handleOgImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setOgImageFile(file)
        setOgImagePreview(URL.createObjectURL(file))
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            const formData = new FormData()
            formData.append('site_name', siteName)
            formData.append('tagline', tagline)
            if (logoFile) formData.append('logo', logoFile)
            if (logoSmallFile) formData.append('logo_small', logoSmallFile)
            if (faviconFile) formData.append('favicon', faviconFile)
            if (ogImageFile) formData.append('og_image', ogImageFile)
            formData.append('og_description', ogDescription)
            formData.append('twitter_handle', twitterHandle)
            formData.append('safari_pinned_tab_color', safariPinnedTabColor)
            formData.append('ms_tile_color', msTileColor)
            formData.append('theme_color', themeColor)
            formData.append('ga_id', gaId)
            formData.append('gtm_id', gtmId)
            formData.append('gsc_id', gscId)
            formData.append('cookie_consent_enabled', String(cookieConsentEnabled))
            formData.append('privacy_policy_url', privacyPolicyUrl)
            formData.append('terms_of_service_url', termsOfServiceUrl)
            formData.append('cookie_policy_url', cookiePolicyUrl)
            formData.append('cookies_analytics_enabled', String(cookiesAnalytics))
            formData.append('cookies_marketing_enabled', String(cookiesMarketing))
            formData.append('cookies_functional_enabled', String(cookiesFunctional))
            formData.append('compliance_gdpr', String(complianceGdpr))
            formData.append('compliance_lgpd', String(complianceLgpd))
            formData.append('compliance_hipaa', String(complianceHipaa))
            formData.append('compliance_ccpa', String(complianceCcpa))
            formData.append('cookie_banner_title', cookieBannerTitle)
            formData.append('cookie_banner_description', cookieBannerDescription)

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

            {/* Logo, Logo Small & Favicon */}
            <div className="grid md:grid-cols-3 gap-6">
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

                {/* Logo Small */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Logo Reducido</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-center h-20 border rounded-lg bg-muted/30 overflow-hidden">
                            {logoSmallPreview ? (
                                <img
                                    src={logoSmallPreview}
                                    alt="Logo small preview"
                                    className="h-10 w-10 object-contain"
                                />
                            ) : (
                                <span className="text-sm text-muted-foreground text-center px-2">Sin logo reducido</span>
                            )}
                        </div>
                        <input
                            ref={logoSmallInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleLogoSmallChange}
                        />
                        <Button
                            variant="outline"
                            className="w-full gap-2"
                            onClick={() => logoSmallInputRef.current?.click()}
                        >
                            <Upload className="h-4 w-4" />
                            Subir imagen
                        </Button>
                        <p className="text-[10px] text-muted-foreground">
                            Se muestra en el navbar al hacer scroll. Ideal: icono o versión compacta del logo.
                        </p>
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

                        {/* Generated variants preview */}
                        {faviconVariants.favicon_16_url && (
                            <div className="space-y-2 border-t pt-3">
                                <p className="text-xs text-muted-foreground font-medium">Variantes generadas</p>
                                <div className="flex items-end gap-3">
                                    {faviconVariants.favicon_16_url && (
                                        <div className="text-center">
                                            <img src={faviconVariants.favicon_16_url} alt="16x16" className="h-4 w-4 mx-auto" />
                                            <span className="text-[10px] text-muted-foreground">16px</span>
                                        </div>
                                    )}
                                    {faviconVariants.favicon_32_url && (
                                        <div className="text-center">
                                            <img src={faviconVariants.favicon_32_url} alt="32x32" className="h-8 w-8 mx-auto" />
                                            <span className="text-[10px] text-muted-foreground">32px</span>
                                        </div>
                                    )}
                                    {faviconVariants.apple_touch_icon_url && (
                                        <div className="text-center">
                                            <img src={faviconVariants.apple_touch_icon_url} alt="180x180" className="h-10 w-10 mx-auto rounded-lg" />
                                            <span className="text-[10px] text-muted-foreground">Apple</span>
                                        </div>
                                    )}
                                </div>
                                <p className="text-[10px] text-muted-foreground">
                                    Se generan 5 variantes (16, 32, 180, 192, 512px) al subir un favicon.
                                </p>
                            </div>
                        )}

                        {/* Browser tab preview */}
                        {faviconPreview && (
                            <div className="border rounded-lg p-2 bg-muted/20">
                                <p className="text-[10px] text-muted-foreground mb-1">Vista previa en pestaña</p>
                                <div className="flex items-center gap-2 bg-background rounded px-2 py-1 border text-sm">
                                    <img src={faviconVariants.favicon_16_url || faviconPreview} alt="" className="h-4 w-4 shrink-0" />
                                    <span className="truncate text-xs">{siteName || 'BVS'}</span>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Theme Colors */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Colores del Tema</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="theme_color">Theme Color</Label>
                            <div className="flex gap-2">
                                <input
                                    type="color"
                                    id="theme_color"
                                    value={themeColor}
                                    onChange={e => setThemeColor(e.target.value)}
                                    className="h-9 w-9 rounded border cursor-pointer"
                                />
                                <Input
                                    value={themeColor}
                                    onChange={e => setThemeColor(e.target.value)}
                                    className="font-mono text-xs"
                                    maxLength={7}
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="ms_tile_color">MS Tile Color</Label>
                            <div className="flex gap-2">
                                <input
                                    type="color"
                                    id="ms_tile_color"
                                    value={msTileColor}
                                    onChange={e => setMsTileColor(e.target.value)}
                                    className="h-9 w-9 rounded border cursor-pointer"
                                />
                                <Input
                                    value={msTileColor}
                                    onChange={e => setMsTileColor(e.target.value)}
                                    className="font-mono text-xs"
                                    maxLength={7}
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="safari_pinned_tab_color">Safari Pinned Tab</Label>
                            <div className="flex gap-2">
                                <input
                                    type="color"
                                    id="safari_pinned_tab_color"
                                    value={safariPinnedTabColor}
                                    onChange={e => setSafariPinnedTabColor(e.target.value)}
                                    className="h-9 w-9 rounded border cursor-pointer"
                                />
                                <Input
                                    value={safariPinnedTabColor}
                                    onChange={e => setSafariPinnedTabColor(e.target.value)}
                                    className="font-mono text-xs"
                                    maxLength={7}
                                />
                            </div>
                        </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                        Estos colores se usan en el manifiesto PWA, tiles de Windows y pestañas fijadas de Safari.
                    </p>
                </CardContent>
            </Card>

            {/* Open Graph / Social */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Share2 className="h-4 w-4 text-primary" />
                        Open Graph / Redes Sociales
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-1.5">
                        <Label>Imagen OG</Label>
                        <div className="flex items-center justify-center h-32 border rounded-lg bg-muted/30 overflow-hidden">
                            {ogImagePreview ? (
                                <img
                                    src={ogImagePreview}
                                    alt="OG image preview"
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <span className="text-sm text-muted-foreground">Sin imagen OG</span>
                            )}
                        </div>
                        <input
                            ref={ogImageInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleOgImageChange}
                        />
                        <Button
                            variant="outline"
                            className="w-full gap-2"
                            onClick={() => ogImageInputRef.current?.click()}
                        >
                            <Upload className="h-4 w-4" />
                            Subir imagen (1200x630 recomendado)
                        </Button>
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="og_description">Descripción para redes sociales</Label>
                        <Textarea
                            id="og_description"
                            value={ogDescription}
                            onChange={e => setOgDescription(e.target.value)}
                            placeholder="Descripción que aparece al compartir el sitio en redes sociales..."
                            rows={3}
                        />
                        <p className="text-[10px] text-muted-foreground">Se usa como descripción por defecto en Open Graph y Twitter Cards.</p>
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="twitter_handle">Handle de Twitter/X</Label>
                        <Input
                            id="twitter_handle"
                            value={twitterHandle}
                            onChange={e => setTwitterHandle(e.target.value)}
                            placeholder="@usuario"
                        />
                        <p className="text-[10px] text-muted-foreground">Se usa en la meta tag twitter:site y twitter:creator.</p>
                    </div>

                    {/* Share preview */}
                    {(ogImagePreview || ogDescription || siteName) && (
                        <div className="border rounded-lg overflow-hidden bg-white">
                            <p className="text-[10px] text-muted-foreground px-3 pt-2">Vista previa al compartir</p>
                            {ogImagePreview && (
                                <div className="h-36 overflow-hidden">
                                    <img src={ogImagePreview} alt="" className="w-full h-full object-cover" />
                                </div>
                            )}
                            <div className="px-3 py-2 space-y-0.5">
                                <p className="text-xs text-muted-foreground uppercase tracking-wide">{typeof window !== 'undefined' ? window.location.hostname : 'tu-sitio.com'}</p>
                                <p className="text-sm font-semibold truncate">{siteName || 'BVS'}</p>
                                <p className="text-xs text-muted-foreground line-clamp-2">{ogDescription || 'Sin descripción'}</p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

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

            {/* Privacy Policies */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Shield className="h-4 w-4 text-primary" />
                        Políticas de Privacidad
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="privacy_policy_url">URL Política de Privacidad</Label>
                        <Input
                            id="privacy_policy_url"
                            type="url"
                            value={privacyPolicyUrl}
                            onChange={e => setPrivacyPolicyUrl(e.target.value)}
                            placeholder="https://..."
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="terms_of_service_url">URL Términos de Servicio</Label>
                        <Input
                            id="terms_of_service_url"
                            type="url"
                            value={termsOfServiceUrl}
                            onChange={e => setTermsOfServiceUrl(e.target.value)}
                            placeholder="https://..."
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="cookie_policy_url">URL Política de Cookies</Label>
                        <Input
                            id="cookie_policy_url"
                            type="url"
                            value={cookiePolicyUrl}
                            onChange={e => setCookiePolicyUrl(e.target.value)}
                            placeholder="https://..."
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Cookies & Compliance */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Cookie className="h-4 w-4 text-primary" />
                        Cookies y Compliance
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Master switch */}
                    <div className="flex items-center gap-3">
                        <Checkbox
                            id="cookie_consent_enabled"
                            checked={cookieConsentEnabled}
                            onCheckedChange={(v) => setCookieConsentEnabled(v === true)}
                        />
                        <Label htmlFor="cookie_consent_enabled" className="font-medium">
                            Habilitar banner de consentimiento de cookies
                        </Label>
                    </div>

                    {cookieConsentEnabled && (
                        <>
                            {/* Categories */}
                            <div className="space-y-3">
                                <p className="text-sm font-medium text-muted-foreground">Categorías de Cookies</p>
                                <div className="flex items-center gap-3">
                                    <Checkbox id="cookies_essential" checked={true} disabled />
                                    <Label htmlFor="cookies_essential" className="text-sm">
                                        Esenciales <span className="text-xs text-muted-foreground">(siempre activas)</span>
                                    </Label>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Checkbox
                                        id="cookies_analytics"
                                        checked={cookiesAnalytics}
                                        onCheckedChange={(v) => setCookiesAnalytics(v === true)}
                                    />
                                    <Label htmlFor="cookies_analytics" className="text-sm">Analítica</Label>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Checkbox
                                        id="cookies_marketing"
                                        checked={cookiesMarketing}
                                        onCheckedChange={(v) => setCookiesMarketing(v === true)}
                                    />
                                    <Label htmlFor="cookies_marketing" className="text-sm">Marketing</Label>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Checkbox
                                        id="cookies_functional"
                                        checked={cookiesFunctional}
                                        onCheckedChange={(v) => setCookiesFunctional(v === true)}
                                    />
                                    <Label htmlFor="cookies_functional" className="text-sm">Funcional</Label>
                                </div>
                            </div>

                            {/* Compliance */}
                            <div className="space-y-3">
                                <p className="text-sm font-medium text-muted-foreground">Marcos de Compliance</p>
                                <div className="flex items-center gap-3">
                                    <Checkbox
                                        id="compliance_gdpr"
                                        checked={complianceGdpr}
                                        onCheckedChange={(v) => setComplianceGdpr(v === true)}
                                    />
                                    <Label htmlFor="compliance_gdpr" className="text-sm">GDPR (Unión Europea)</Label>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Checkbox
                                        id="compliance_lgpd"
                                        checked={complianceLgpd}
                                        onCheckedChange={(v) => setComplianceLgpd(v === true)}
                                    />
                                    <Label htmlFor="compliance_lgpd" className="text-sm">LGPD (Brasil)</Label>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Checkbox
                                        id="compliance_hipaa"
                                        checked={complianceHipaa}
                                        onCheckedChange={(v) => setComplianceHipaa(v === true)}
                                    />
                                    <Label htmlFor="compliance_hipaa" className="text-sm">HIPAA (Salud - EE.UU.)</Label>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Checkbox
                                        id="compliance_ccpa"
                                        checked={complianceCcpa}
                                        onCheckedChange={(v) => setComplianceCcpa(v === true)}
                                    />
                                    <Label htmlFor="compliance_ccpa" className="text-sm">CCPA (California - EE.UU.)</Label>
                                </div>
                            </div>

                            {/* Banner customization */}
                            <div className="space-y-4 border-t pt-4">
                                <p className="text-sm font-medium text-muted-foreground">Personalización del Banner</p>
                                <div className="space-y-1.5">
                                    <Label htmlFor="cookie_banner_title">Título del banner</Label>
                                    <Input
                                        id="cookie_banner_title"
                                        value={cookieBannerTitle}
                                        onChange={e => setCookieBannerTitle(e.target.value)}
                                        placeholder="Utilizamos cookies"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="cookie_banner_description">Descripción del banner</Label>
                                    <Textarea
                                        id="cookie_banner_description"
                                        value={cookieBannerDescription}
                                        onChange={e => setCookieBannerDescription(e.target.value)}
                                        placeholder="Este sitio utiliza cookies..."
                                        rows={3}
                                    />
                                </div>
                            </div>
                        </>
                    )}
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
