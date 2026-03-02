'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { CaptchaProvider } from '@/types/form'

interface CaptchaWidgetProps {
    provider: CaptchaProvider
    siteKey: string
    onVerify: (data: CaptchaResult) => void
}

export interface CaptchaResult {
    captcha_token?: string
    captcha_answer?: string
    captcha_expected?: string
    form_loaded_at?: number
}

// ── Cloudflare Turnstile ──────────────────────────────────────────────

function TurnstileWidget({ siteKey, onVerify }: { siteKey: string; onVerify: (token: string) => void }) {
    const containerRef = useRef<HTMLDivElement>(null)
    const widgetIdRef = useRef<string | null>(null)

    useEffect(() => {
        const renderWidget = () => {
            if (!containerRef.current || !window.turnstile) return
            if (widgetIdRef.current) {
                window.turnstile.remove(widgetIdRef.current)
            }
            widgetIdRef.current = window.turnstile.render(containerRef.current, {
                sitekey: siteKey,
                callback: (token: string) => onVerify(token),
                theme: 'light',
            })
        }

        // Load the Turnstile script if not already loaded
        if (!window.turnstile) {
            const existing = document.querySelector('script[src*="turnstile"]')
            if (!existing) {
                const script = document.createElement('script')
                script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
                script.async = true
                script.onload = () => renderWidget()
                document.head.appendChild(script)
            } else {
                existing.addEventListener('load', () => renderWidget())
            }
        } else {
            renderWidget()
        }

        return () => {
            if (widgetIdRef.current && window.turnstile) {
                window.turnstile.remove(widgetIdRef.current)
            }
        }
    }, [siteKey, onVerify])

    return <div ref={containerRef} className="flex justify-center" />
}

// ── Google reCAPTCHA v3 ───────────────────────────────────────────────

function RecaptchaV3Widget({ siteKey, onVerify }: { siteKey: string; onVerify: (token: string) => void }) {
    useEffect(() => {
        const loadAndExecute = () => {
            if (!window.grecaptcha) return
            window.grecaptcha.ready(() => {
                window.grecaptcha.execute(siteKey, { action: 'submit' }).then((token: string) => {
                    onVerify(token)
                })
            })
        }

        if (!window.grecaptcha) {
            const existing = document.querySelector('script[src*="recaptcha"]')
            if (!existing) {
                const script = document.createElement('script')
                script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`
                script.async = true
                script.onload = () => loadAndExecute()
                document.head.appendChild(script)
            } else {
                existing.addEventListener('load', () => loadAndExecute())
            }
        } else {
            loadAndExecute()
        }
    }, [siteKey, onVerify])

    // reCAPTCHA v3 is invisible — no UI needed
    return (
        <p className="text-xs text-muted-foreground text-center">
            Protegido por reCAPTCHA
        </p>
    )
}

// ── Numeric CAPTCHA ───────────────────────────────────────────────────

function generateMathChallenge(): { question: string; answer: number } {
    const a = Math.floor(Math.random() * 20) + 1
    const b = Math.floor(Math.random() * 20) + 1
    return { question: `${a} + ${b}`, answer: a + b }
}

function NumericCaptchaWidget({ onVerify }: { onVerify: (answer: string, expected: string) => void }) {
    const [challenge, setChallenge] = useState(() => generateMathChallenge())
    const [userAnswer, setUserAnswer] = useState('')

    function refresh() {
        const c = generateMathChallenge()
        setChallenge(c)
        setUserAnswer('')
    }

    useEffect(() => {
        if (userAnswer) {
            onVerify(userAnswer, String(challenge.answer))
        }
    }, [userAnswer, challenge.answer, onVerify])

    return (
        <div className="space-y-2">
            <Label className="flex items-center gap-2">
                Verificación: ¿Cuánto es {challenge.question}?
                <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={refresh}>
                    <RefreshCw className="h-3 w-3" />
                </Button>
            </Label>
            <Input
                type="number"
                value={userAnswer}
                onChange={e => setUserAnswer(e.target.value)}
                placeholder="Tu respuesta"
                required
            />
        </div>
    )
}

// ── Main Widget ───────────────────────────────────────────────────────

export function CaptchaWidget({ provider, siteKey, onVerify }: CaptchaWidgetProps) {
    const handleTurnstileVerify = useCallback(
        (token: string) => onVerify({ captcha_token: token }),
        [onVerify],
    )

    const handleRecaptchaVerify = useCallback(
        (token: string) => onVerify({ captcha_token: token }),
        [onVerify],
    )

    const handleNumericVerify = useCallback(
        (answer: string, expected: string) =>
            onVerify({ captcha_answer: answer, captcha_expected: expected }),
        [onVerify],
    )

    switch (provider) {
        case 'turnstile':
            return <TurnstileWidget siteKey={siteKey} onVerify={handleTurnstileVerify} />
        case 'recaptcha_v3':
            return <RecaptchaV3Widget siteKey={siteKey} onVerify={handleRecaptchaVerify} />
        case 'numeric':
            return <NumericCaptchaWidget onVerify={handleNumericVerify} />
        case 'time_based':
        case 'none':
        default:
            return null
    }
}

// ── Global type declarations for external scripts ─────────────────────

declare global {
    interface Window {
        turnstile?: {
            render: (container: HTMLElement, options: Record<string, unknown>) => string
            remove: (widgetId: string) => void
        }
        grecaptcha?: {
            ready: (cb: () => void) => void
            execute: (siteKey: string, options: { action: string }) => Promise<string>
        }
    }
}
