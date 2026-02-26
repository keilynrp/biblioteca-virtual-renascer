"use client"

import { useEffect, useState } from "react"
import { billingApi } from "@/services/billingApi"
import api from "@/lib/api"
import type { StoredPaymentMethod } from "@/types/billing"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "@/hooks/use-toast"
import {
    CreditCard,
    Plus,
    Star,
    Trash2,
    Building2,
    Copy,
    Check,
    Info,
    Loader2,
    CircleDollarSign,
    Wallet,
} from "lucide-react"
import { AddPaymentMethodDialog } from "./add-payment-method-dialog"

// ── Brand label mapping ─────────────────────────────────────────────

const BRAND_ICONS: Record<string, string> = {
    visa: "VISA",
    mastercard: "MC",
    amex: "AMEX",
    discover: "DISC",
    jcb: "JCB",
    unionpay: "UP",
}

// ── Bank details type ───────────────────────────────────────────────

interface BankDetails {
    bankName: string
    accountName: string
    accountNumber: string
    pixKey?: string
    iban?: string
    swift?: string
}

// ── PayPal SVG icon ─────────────────────────────────────────────────

function PayPalIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor">
            <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 2.002A.859.859 0 0 1 5.79 1.28h5.765c2.09 0 3.61.467 4.518 1.39.855.867 1.186 2.142.984 3.788l-.013.09v.733l.57.323c.467.247.838.538 1.117.876.345.418.567.926.658 1.51.094.601.063 1.317-.091 2.126-.178.936-.466 1.753-.856 2.427-.36.623-.822 1.137-1.373 1.527a5.348 5.348 0 0 1-1.773.827c-.636.181-1.373.271-2.189.271h-.52a1.574 1.574 0 0 0-1.555 1.329l-.04.22-.663 4.2-.03.155a.135.135 0 0 1-.134.115H7.076z" />
        </svg>
    )
}

// ── Main component ──────────────────────────────────────────────────

export function PaymentMethodsPanel() {
    const [methods, setMethods] = useState<StoredPaymentMethod[]>([])
    const [loading, setLoading] = useState(true)
    const [showAddDialog, setShowAddDialog] = useState(false)
    const [actionLoading, setActionLoading] = useState<string | null>(null)

    // Bank details
    const [bankDetails, setBankDetails] = useState<BankDetails | null>(null)
    const [bankLoading, setBankLoading] = useState(true)

    useEffect(() => {
        fetchMethods()
        fetchBankDetails()
    }, [])

    async function fetchMethods() {
        try {
            const data = await billingApi.getPaymentMethods()
            setMethods(data)
        } catch {
            toast({ title: "Error", description: "No se pudieron cargar los métodos de pago.", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    async function fetchBankDetails() {
        try {
            const res = await api.get("/payments/bank-details/")
            setBankDetails(res.data)
        } catch {
            // Bank details not configured — hide section silently
        } finally {
            setBankLoading(false)
        }
    }

    async function handleDelete(id: string) {
        setActionLoading(id)
        try {
            await billingApi.deletePaymentMethod(id)
            setMethods(prev => prev.filter(m => m.id !== id))
            toast({ title: "Eliminada", description: "Tarjeta eliminada correctamente." })
        } catch {
            toast({ title: "Error", description: "No se pudo eliminar la tarjeta.", variant: "destructive" })
        } finally {
            setActionLoading(null)
        }
    }

    async function handleSetDefault(id: string) {
        setActionLoading(id)
        try {
            await billingApi.setDefaultPaymentMethod(id)
            setMethods(prev => prev.map(m => ({ ...m, is_default: m.id === id })))
            toast({ title: "Actualizada", description: "Tarjeta predeterminada actualizada." })
        } catch {
            toast({ title: "Error", description: "No se pudo establecer como predeterminada.", variant: "destructive" })
        } finally {
            setActionLoading(null)
        }
    }

    return (
        <div className="space-y-6">
            {/* ── Section 1: Credit / Debit Cards (Stripe) ─────────── */}
            <Card className="border-border/50">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center">
                                <CreditCard className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <CardTitle className="text-base">Tarjetas de Crédito / Débito</CardTitle>
                                <CardDescription>Gestiona tus tarjetas guardadas con Stripe</CardDescription>
                            </div>
                        </div>
                        <Button
                            size="sm"
                            onClick={() => setShowAddDialog(true)}
                            className="gap-1.5 rounded-xl"
                        >
                            <Plus className="h-4 w-4" />
                            Agregar Tarjeta
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : methods.length === 0 ? (
                        <div className="text-center py-8 space-y-3">
                            <div className="mx-auto h-14 w-14 rounded-2xl bg-muted/50 flex items-center justify-center">
                                <CreditCard className="h-7 w-7 text-muted-foreground/50" />
                            </div>
                            <p className="text-sm text-muted-foreground">No hay tarjetas guardadas</p>
                            <Button variant="outline" size="sm" onClick={() => setShowAddDialog(true)} className="rounded-xl">
                                <Plus className="h-4 w-4 mr-1.5" />
                                Agregar Método de Pago
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {methods.map(method => (
                                <div
                                    key={method.id}
                                    className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-muted/20 hover:bg-muted/30 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-14 rounded-lg bg-slate-800 text-white flex items-center justify-center text-xs font-bold tracking-wider">
                                            {BRAND_ICONS[method.brand?.toLowerCase()] || method.brand?.toUpperCase() || "??"}
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">
                                                •••• {method.last4}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Expira {method.exp_month?.toString().padStart(2, "0")}/{method.exp_year}
                                            </p>
                                        </div>
                                        {method.is_default && (
                                            <Badge variant="secondary" className="text-xs">
                                                <Star className="h-3 w-3 mr-1 fill-current" />
                                                Predeterminada
                                            </Badge>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {!method.is_default && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleSetDefault(method.id)}
                                                disabled={actionLoading === method.id}
                                                className="text-xs"
                                            >
                                                Predeterminar
                                            </Button>
                                        )}
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                    disabled={actionLoading === method.id}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Eliminar Tarjeta</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        ¿Eliminar la tarjeta terminada en {method.last4}? Esta acción no se puede deshacer.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => handleDelete(method.id)}
                                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                    >
                                                        Eliminar
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* ── Section 2: PayPal ───────────────────────────────── */}
            <Card className="border-border/50">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-sky-500/20 flex items-center justify-center">
                                <PayPalIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <CardTitle className="text-base">PayPal</CardTitle>
                                <CardDescription>Paga directamente con tu cuenta de PayPal</CardDescription>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-start gap-4 p-4 rounded-xl border border-border/50 bg-muted/20">
                        <div className="h-12 w-12 rounded-xl bg-[#003087]/10 dark:bg-[#009cde]/10 flex items-center justify-center flex-shrink-0">
                            <PayPalIcon className="h-6 w-6 text-[#003087] dark:text-[#009cde]" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium mb-1">Pago con PayPal</p>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Al momento de suscribirte o realizar un pago, podrás seleccionar PayPal como método de pago.
                                Serás redirigido a PayPal para completar la transacción de forma segura.
                            </p>
                        </div>
                        <Badge variant="outline" className="text-xs flex-shrink-0 bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800">
                            Disponible
                        </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1.5">
                        <Info className="h-3.5 w-3.5" />
                        PayPal se selecciona al momento del checkout. No requiere configuración previa.
                    </p>
                </CardContent>
            </Card>

            {/* ── Section 3: Bank Transfer ────────────────────────── */}
            <Card className="border-border/50">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 flex items-center justify-center">
                                <Building2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                                <CardTitle className="text-base">Transferencia Bancaria</CardTitle>
                                <CardDescription>Pago manual mediante depósito o transferencia</CardDescription>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {bankLoading ? (
                        <div className="flex justify-center py-6">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : bankDetails ? (
                        <div className="space-y-4">
                            <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-200/50 dark:border-emerald-800/30">
                                <p className="text-xs leading-relaxed text-emerald-800 dark:text-emerald-300">
                                    Realiza la transferencia por el monto exacto de tu suscripción.
                                    Guarda el comprobante e ingresa el número de referencia durante el checkout para validar tu pago.
                                </p>
                            </div>

                            <div className="rounded-xl border border-border/50 overflow-hidden divide-y divide-border/30">
                                <BankField label="Banco" value={bankDetails.bankName} />
                                <BankField label="Titular" value={bankDetails.accountName} />
                                <BankField label="N.° de Cuenta" value={bankDetails.accountNumber} />
                                {bankDetails.pixKey && (
                                    <BankField label="Clave PIX" value={bankDetails.pixKey} />
                                )}
                                {bankDetails.iban && (
                                    <BankField label="IBAN" value={bankDetails.iban} />
                                )}
                                {bankDetails.swift && (
                                    <BankField label="SWIFT/BIC" value={bankDetails.swift} />
                                )}
                            </div>

                            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                                <Info className="h-3.5 w-3.5" />
                                La activación del servicio puede tardar hasta 24 horas hábiles tras verificar el pago.
                            </p>
                        </div>
                    ) : (
                        <div className="text-center py-6 space-y-2">
                            <div className="mx-auto h-12 w-12 rounded-2xl bg-muted/50 flex items-center justify-center">
                                <Building2 className="h-6 w-6 text-muted-foreground/50" />
                            </div>
                            <p className="text-sm text-muted-foreground">
                                La información bancaria no está configurada.
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Contacta al administrador para habilitar este método de pago.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Stripe card dialog */}
            <AddPaymentMethodDialog
                open={showAddDialog}
                onOpenChange={setShowAddDialog}
                onAdded={fetchMethods}
            />
        </div>
    )
}

// ── Bank field row component ────────────────────────────────────────

function BankField({ label, value }: { label: string; value: string }) {
    const [copied, setCopied] = useState(false)

    function handleCopy() {
        navigator.clipboard.writeText(value)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="flex items-center justify-between px-4 py-3 bg-muted/10 hover:bg-muted/20 transition-colors">
            <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">{label}</p>
                <p className="text-sm font-mono font-medium mt-0.5">{value}</p>
            </div>
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={handleCopy}
            >
                {copied ? (
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                    <Copy className="h-3.5 w-3.5" />
                )}
            </Button>
        </div>
    )
}
