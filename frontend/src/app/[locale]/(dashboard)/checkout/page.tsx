
"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Lock, CreditCard, AlertCircle } from "lucide-react"

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '')

// Card element styling
const CARD_ELEMENT_OPTIONS = {
    style: {
        base: {
            fontSize: '16px',
            color: '#424770',
            '::placeholder': {
                color: '#aab7c4',
            },
            fontFamily: 'system-ui, -apple-system, sans-serif',
        },
        invalid: {
            color: '#9e2146',
        },
    },
}

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { BankDetailsPanel } from "@/components/billing/bank-details-panel"

function CheckoutForm({ planId }: { planId: string }) {
    const router = useRouter()
    const stripe = useStripe()
    const elements = useElements()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [clientSecret, setClientSecret] = useState<string>('')
    const [transactionId, setTransactionId] = useState<string>('')
    const [paymentMethod, setPaymentMethod] = useState<'CREDIT_CARD' | 'PAYPAL' | 'MANUAL_TRANSFER'>('CREDIT_CARD')
    const [orderReference, setOrderReference] = useState('')

    useEffect(() => {
        // Create Transaction on mount or when payment method changes
        async function initializeCheckout() {
            setLoading(true)
            setError(null)
            try {
                const response = await api.post('/payments/checkout/', {
                    plan_id: planId,
                    payment_method: paymentMethod,
                    order_reference: paymentMethod === 'MANUAL_TRANSFER' ? orderReference : ''
                })

                if (paymentMethod === 'CREDIT_CARD') {
                    setClientSecret(response.data.client_secret)
                }
                setTransactionId(response.data.transaction_id)

                if (paymentMethod === 'MANUAL_TRANSFER' && response.data.status === 'PENDING_APPROVAL') {
                    router.push('/profile?payment=pending')
                }
            } catch (err: unknown) {
                const error = err as { response?: { data?: { detail?: string } } }
                setError(error.response?.data?.detail || "Failed to initialize payment")
            } finally {
                setLoading(false)
            }
        }

        if (planId && (paymentMethod !== 'MANUAL_TRANSFER' || orderReference)) {
            initializeCheckout()
        }
    }, [planId, paymentMethod, orderReference, router])

    async function handleStripeSubmit(event: React.FormEvent) {
        event.preventDefault()
        if (!stripe || !elements || !clientSecret) return

        setLoading(true)
        setError(null)

        try {
            const cardElement = elements.getElement(CardElement)
            if (!cardElement) throw new Error("Card element not found")

            const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
                clientSecret,
                { payment_method: { card: cardElement } }
            )

            if (stripeError) {
                setError(stripeError.message || "Payment failed")
                return
            }

            if (paymentIntent.status === 'succeeded') {
                await api.post('/payments/confirm/', {
                    transaction_id: transactionId,
                    payment_method: 'CREDIT_CARD'
                })
                router.push('/profile?payment=success')
            }
        } catch (err: unknown) {
            console.error("Payment error:", err)
            setError("Payment failed. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!orderReference) {
            setError("Please enter your transfer reference")
            return
        }
        // The useEffect will trigger initializeCheckout
    }

    return (
        <div className="space-y-6">
            <Tabs defaultValue="CREDIT_CARD" onValueChange={(v) => setPaymentMethod(v as any)}>
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="CREDIT_CARD" className="text-xs">Tarjeta</TabsTrigger>
                    <TabsTrigger value="PAYPAL" className="text-xs">PayPal</TabsTrigger>
                    <TabsTrigger value="MANUAL_TRANSFER" className="text-xs">Manual</TabsTrigger>
                </TabsList>

                <TabsContent value="CREDIT_CARD" className="space-y-4 pt-4">
                    <form onSubmit={handleStripeSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Detalles de Tarjeta</label>
                            <div className="border rounded-md p-3 bg-white">
                                <CardElement options={CARD_ELEMENT_OPTIONS} />
                            </div>
                        </div>
                        <Button type="submit" className="w-full" disabled={!stripe || loading || !clientSecret}>
                            {loading ? "Procesando..." : "Pagar con Tarjeta"}
                        </Button>
                    </form>
                </TabsContent>

                <TabsContent value="PAYPAL" className="space-y-4 pt-4 text-center">
                    <div className="bg-muted p-8 rounded-md border border-dashed flex flex-col items-center justify-center space-y-4">
                        <div className="text-blue-600 font-bold text-xl italic">PayPal</div>
                        <p className="text-sm text-muted-foreground">Serás redirigido a PayPal para completar tu pago de forma segura.</p>
                        <Button variant="outline" className="w-full" onClick={() => {/* PayPal Integration Logic */ }} disabled={loading}>
                            Pagar con PayPal
                        </Button>
                    </div>
                </TabsContent>

                <TabsContent value="MANUAL_TRANSFER" className="space-y-4 pt-4">
                    <BankDetailsPanel />
                    <form onSubmit={handleManualSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Referencia de Transferencia</label>
                            <Input
                                placeholder="Ej: TRANS-12345"
                                value={orderReference}
                                onChange={(e) => setOrderReference(e.target.value)}
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            Registrar Pago
                        </Button>
                    </form>
                </TabsContent>
            </Tabs>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-start space-x-2">
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    <p className="text-sm text-red-600">{error}</p>
                </div>
            )}

            <div className="flex items-center justify-center space-x-4 opacity-50 grayscale scale-90">
                <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" className="h-5" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-5" />
                <Lock className="h-4 w-4" />
            </div>
        </div>
    )
}

function CheckoutPageContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const planId = searchParams.get('planId')

    // Prevent direct access without planId
    useEffect(() => {
        if (!planId) {
            router.push('/plans')
        }
    }, [planId, router])

    if (!planId) {
        return null
    }

    return (
        <div className="flex justify-center items-center min-h-[80vh] py-5">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Lock className="h-5 w-5 text-green-600" />
                        <span>Secure Checkout</span>
                    </CardTitle>
                    <CardDescription>
                        Enter your payment details to complete subscription.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Elements stripe={stripePromise}>
                        <CheckoutForm planId={planId} />
                    </Elements>
                </CardContent>
            </Card>
        </div>
    )
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center min-h-[80vh]">Loading...</div>}>
            <CheckoutPageContent />
        </Suspense>
    )
}
