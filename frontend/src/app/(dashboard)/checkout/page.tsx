
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

function CheckoutForm({ planId }: { planId: string }) {
    const router = useRouter()
    const stripe = useStripe()
    const elements = useElements()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [clientSecret, setClientSecret] = useState<string>('')
    const [transactionId, setTransactionId] = useState<string>('')

    useEffect(() => {
        // Create PaymentIntent on mount
        async function createPaymentIntent() {
            try {
                const response = await api.post('/payments/checkout/', {
                    plan_id: planId,
                    payment_method: 'CREDIT_CARD'
                })
                setClientSecret(response.data.client_secret)
                setTransactionId(response.data.transaction_id)
            } catch (err: any) {
                setError(err.response?.data?.detail || "Failed to initialize payment")
            }
        }
        
        if (planId) {
            createPaymentIntent()
        }
    }, [planId])

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault()
        
        if (!stripe || !elements || !clientSecret) {
            return
        }

        setLoading(true)
        setError(null)

        try {
            const cardElement = elements.getElement(CardElement)
            
            if (!cardElement) {
                throw new Error("Card element not found")
            }

            // Confirm the payment with Stripe
            const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
                clientSecret,
                {
                    payment_method: {
                        card: cardElement,
                    },
                }
            )

            if (stripeError) {
                setError(stripeError.message || "Payment failed")
                setLoading(false)
                return
            }

            if (paymentIntent.status === 'succeeded') {
                // Confirm payment on backend
                await api.post('/payments/confirm/', { 
                    transaction_id: transactionId,
                    payment_intent_id: paymentIntent.id
                })

                router.push('/profile?payment=success')
            } else {
                setError(`Payment status: ${paymentIntent.status}`)
            }
        } catch (err: any) {
            console.error("Payment error:", err)
            setError(err.response?.data?.detail || err.message || "Payment failed. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <label className="text-sm font-medium">Card Details</label>
                <div className="border rounded-md p-3 bg-white">
                    <CardElement options={CARD_ELEMENT_OPTIONS} />
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-start space-x-2">
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    <p className="text-sm text-red-600">{error}</p>
                </div>
            )}

            <Button 
                type="submit" 
                className="w-full" 
                disabled={!stripe || loading || !clientSecret}
            >
                {loading ? "Processing Payment..." : "Pay Now"}
            </Button>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <p className="text-xs text-blue-800">
                    <strong>Test Mode:</strong> Use card number <code className="bg-blue-100 px-1 rounded">4242 4242 4242 4242</code>, 
                    any future expiry date, and any 3-digit CVC.
                </p>
            </div>
        </form>
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
