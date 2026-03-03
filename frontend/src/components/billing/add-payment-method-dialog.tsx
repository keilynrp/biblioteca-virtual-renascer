"use client"

import { useState } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { billingApi } from "@/services/billingApi"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { userToast } from '@/lib/toast-utils'
import { AlertCircle, CreditCard, Loader2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

const STRIPE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
const IS_STRIPE_PLACEHOLDER = STRIPE_KEY === '' || STRIPE_KEY.includes('your_real_publishable_key')

const stripePromise = loadStripe(STRIPE_KEY)

const CARD_ELEMENT_OPTIONS = {
    style: {
        base: {
            fontSize: '16px',
            color: '#424770',
            '::placeholder': { color: '#aab7c4' },
            fontFamily: 'system-ui, -apple-system, sans-serif',
        },
        invalid: { color: '#9e2146' },
    },
}

function CardSetupForm({
    clientSecret,
    onSuccess,
    onClose,
}: {
    clientSecret: string
    onSuccess: () => void
    onClose: () => void
}) {
    const stripe = useStripe()
    const elements = useElements()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!stripe || !elements) return

        setLoading(true)
        setError(null)

        const cardElement = elements.getElement(CardElement)
        if (!cardElement) return

        const { error: stripeError } = await stripe.confirmCardSetup(clientSecret, {
            payment_method: { card: cardElement },
        })

        if (stripeError) {
            setError(stripeError.message || "Failed to save card")
            setLoading(false)
            return
        }

        userToast.success("Your payment method was added successfully.", "Card saved")
        onSuccess()
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <label className="text-sm font-medium">Card Details</label>
                <div className="border rounded-md p-3 bg-white dark:bg-card">
                    <CardElement options={CARD_ELEMENT_OPTIONS} />
                </div>
            </div>

            {error && (
                <div className="flex items-start gap-2 p-3 rounded-md bg-destructive/10 border border-destructive/20">
                    <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-destructive">{error}</p>
                </div>
            )}

            <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                    Cancel
                </Button>
                <Button type="submit" disabled={!stripe || loading}>
                    {loading ? "Saving..." : "Save Card"}
                </Button>
            </div>

            <p className="text-xs text-muted-foreground">
                Test card: <code className="bg-muted px-1 rounded">4242 4242 4242 4242</code>, any future date, any CVC
            </p>
        </form>
    )
}

interface AddPaymentMethodDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onAdded: () => void
}

export function AddPaymentMethodDialog({ open, onOpenChange, onAdded }: AddPaymentMethodDialogProps) {
    const [clientSecret, setClientSecret] = useState<string | null>(null)
    const [loadingIntent, setLoadingIntent] = useState(false)

    async function handleOpen(isOpen: boolean) {
        onOpenChange(isOpen)
        if (isOpen && !clientSecret) {
            setLoadingIntent(true)
            try {
                const { client_secret } = await billingApi.createSetupIntent()
                setClientSecret(client_secret)
            } catch (err: any) {
                const detail = err?.response?.data?.detail || "Could not initialize card setup."
                toast({ title: "Error", description: detail, variant: "destructive" })
                onOpenChange(false)
            } finally {
                setLoadingIntent(false)
            }
        }
    }

    function handleSuccess() {
        setClientSecret(null)
        onOpenChange(false)
        // Small delay to let webhook process StoredPaymentMethod
        setTimeout(onAdded, 1500)
    }

    return (
        <Dialog open={open} onOpenChange={handleOpen}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Add Payment Method</DialogTitle>
                    <DialogDescription>
                        Add a credit or debit card to your account
                    </DialogDescription>
                </DialogHeader>

                {loadingIntent ? (
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-12 w-full rounded-md" />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Skeleton className="h-10 w-24" />
                            <Skeleton className="h-10 w-24" />
                        </div>
                    </div>
                ) : IS_STRIPE_PLACEHOLDER ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
                        <div className="h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                            <AlertCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-500" />
                        </div>
                        <div className="space-y-1">
                            <p className="font-semibold text-sm">Configuración incompleta</p>
                            <p className="text-xs text-muted-foreground px-4">
                                La clave pública de Stripe no está configurada correctamente. 
                                Por favor, contacta al administrador.
                            </p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                            Cerrar
                        </Button>
                    </div>
                ) : clientSecret ? (
                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                        <CardSetupForm
                            clientSecret={clientSecret}
                            onSuccess={handleSuccess}
                            onClose={() => onOpenChange(false)}
                        />
                    </Elements>
                ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
                        <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                            <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-500" />
                        </div>
                        <p className="text-sm font-medium">Error al inicializar</p>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {
                                setClientSecret(null)
                                handleOpen(true)
                            }}
                        >
                            Reintentar
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
