"use client"

import { useState, useEffect, useCallback } from "react"
import { useTranslations } from "next-intl"
import { useSiteSettings } from "@/context/site-settings-context"
import { Button } from "@/components/ui/button"
import { Cookie, X, ChevronDown, ChevronUp, ExternalLink } from "lucide-react"

const CONSENT_KEY = "cookie-consent"

export interface CookiePreferences {
    essential: boolean
    analytics: boolean
    marketing: boolean
    functional: boolean
    timestamp: string
}

function getStoredConsent(): CookiePreferences | null {
    if (typeof window === "undefined") return null
    try {
        const stored = localStorage.getItem(CONSENT_KEY)
        if (!stored) return null
        return JSON.parse(stored)
    } catch {
        return null
    }
}

export function getCookieConsent(): CookiePreferences | null {
    return getStoredConsent()
}

export function CookieConsentBanner() {
    const t = useTranslations("CookieConsent")
    const settings = useSiteSettings()
    const [visible, setVisible] = useState(false)
    const [showCustomize, setShowCustomize] = useState(false)
    const [preferences, setPreferences] = useState<CookiePreferences>({
        essential: true,
        analytics: true,
        marketing: true,
        functional: true,
        timestamp: "",
    })

    useEffect(() => {
        if (!settings.cookie_consent_enabled) return
        const stored = getStoredConsent()
        if (!stored) {
            setVisible(true)
        }
    }, [settings.cookie_consent_enabled])

    const savePreferences = useCallback((prefs: CookiePreferences) => {
        const toSave = { ...prefs, timestamp: new Date().toISOString() }
        localStorage.setItem(CONSENT_KEY, JSON.stringify(toSave))
        setVisible(false)
        window.dispatchEvent(new Event("cookie-consent-updated"))
    }, [])

    const handleAcceptAll = () => {
        savePreferences({
            essential: true,
            analytics: settings.cookies_analytics_enabled,
            marketing: settings.cookies_marketing_enabled,
            functional: settings.cookies_functional_enabled,
            timestamp: "",
        })
    }

    const handleRejectOptional = () => {
        savePreferences({
            essential: true,
            analytics: false,
            marketing: false,
            functional: false,
            timestamp: "",
        })
    }

    const handleSaveCustom = () => {
        savePreferences(preferences)
    }

    if (!settings.cookie_consent_enabled || !visible) return null

    const policyLinks = [
        { url: settings.privacy_policy_url, label: t("privacyPolicy") },
        { url: settings.cookie_policy_url, label: t("cookiePolicy") },
        { url: settings.terms_of_service_url, label: t("termsOfService") },
    ].filter(link => link.url)

    return (
        <div className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-6">
            <div className="mx-auto max-w-2xl rounded-xl border bg-background/95 backdrop-blur-md shadow-2xl">
                <div className="p-4 sm:p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <Cookie className="h-5 w-5 text-primary shrink-0" />
                            <h3 className="font-semibold text-sm sm:text-base">
                                {settings.cookie_banner_title || t("defaultTitle")}
                            </h3>
                        </div>
                        <button
                            onClick={handleRejectOptional}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                            aria-label={t("close")}
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Description */}
                    <p className="text-muted-foreground text-xs sm:text-sm mt-2 leading-relaxed">
                        {settings.cookie_banner_description || t("defaultDescription")}
                    </p>

                    {/* Policy links */}
                    {policyLinks.length > 0 && (
                        <div className="flex flex-wrap gap-3 mt-3">
                            {policyLinks.map(link => (
                                <a
                                    key={link.url}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                                >
                                    {link.label}
                                    <ExternalLink className="h-3 w-3" />
                                </a>
                            ))}
                        </div>
                    )}

                    {/* Customize panel */}
                    {showCustomize && (
                        <div className="mt-4 space-y-3 border-t pt-4">
                            {/* Essential - always on */}
                            <CategoryToggle
                                label={t("categoryEssential")}
                                description={t("categoryEssentialDesc")}
                                checked={true}
                                disabled={true}
                                onChange={() => {}}
                            />
                            {settings.cookies_analytics_enabled && (
                                <CategoryToggle
                                    label={t("categoryAnalytics")}
                                    description={t("categoryAnalyticsDesc")}
                                    checked={preferences.analytics}
                                    onChange={(v) => setPreferences(p => ({ ...p, analytics: v }))}
                                />
                            )}
                            {settings.cookies_marketing_enabled && (
                                <CategoryToggle
                                    label={t("categoryMarketing")}
                                    description={t("categoryMarketingDesc")}
                                    checked={preferences.marketing}
                                    onChange={(v) => setPreferences(p => ({ ...p, marketing: v }))}
                                />
                            )}
                            {settings.cookies_functional_enabled && (
                                <CategoryToggle
                                    label={t("categoryFunctional")}
                                    description={t("categoryFunctionalDesc")}
                                    checked={preferences.functional}
                                    onChange={(v) => setPreferences(p => ({ ...p, functional: v }))}
                                />
                            )}
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-4">
                        <Button onClick={handleAcceptAll} size="sm" className="flex-1 sm:flex-none">
                            {t("acceptAll")}
                        </Button>
                        <Button onClick={handleRejectOptional} variant="outline" size="sm" className="flex-1 sm:flex-none">
                            {t("rejectOptional")}
                        </Button>
                        {!showCustomize ? (
                            <Button
                                onClick={() => setShowCustomize(true)}
                                variant="ghost"
                                size="sm"
                                className="flex-1 sm:flex-none gap-1"
                            >
                                {t("customize")}
                                <ChevronDown className="h-3 w-3" />
                            </Button>
                        ) : (
                            <Button
                                onClick={handleSaveCustom}
                                variant="secondary"
                                size="sm"
                                className="flex-1 sm:flex-none"
                            >
                                {t("savePreferences")}
                            </Button>
                        )}
                        {showCustomize && (
                            <Button
                                onClick={() => setShowCustomize(false)}
                                variant="ghost"
                                size="sm"
                                className="flex-1 sm:flex-none gap-1"
                            >
                                <ChevronUp className="h-3 w-3" />
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

function CategoryToggle({
    label,
    description,
    checked,
    disabled,
    onChange,
}: {
    label: string
    description: string
    checked: boolean
    disabled?: boolean
    onChange: (value: boolean) => void
}) {
    return (
        <label className={`flex items-start gap-3 ${disabled ? "opacity-70" : "cursor-pointer"}`}>
            <div className="pt-0.5">
                <button
                    type="button"
                    role="switch"
                    aria-checked={checked}
                    disabled={disabled}
                    onClick={() => !disabled && onChange(!checked)}
                    className={`
                        relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent
                        transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                        ${checked ? "bg-primary" : "bg-muted"}
                        ${disabled ? "cursor-not-allowed" : "cursor-pointer"}
                    `}
                >
                    <span
                        className={`
                            pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0
                            transition-transform ${checked ? "translate-x-4" : "translate-x-0"}
                        `}
                    />
                </button>
            </div>
            <div className="space-y-0.5">
                <span className="text-sm font-medium">{label}</span>
                <p className="text-xs text-muted-foreground">{description}</p>
            </div>
        </label>
    )
}
