"use client"

import { useEffect, useState } from "react"
import api from "@/lib/api"
import { PlanCard } from "@/components/plan-card"
import { useRouter } from "next/navigation"
import { Sparkles, Shield, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

interface Plan {
    id: number
    name: string
    description: string
    price: string
    duration_days: number
    features: string[]
    plan_type?: string
}

export default function PricingPage() {
    const [plans, setPlans] = useState<Plan[]>([])
    const [loading, setLoading] = useState(true)
    const [subscribing, setSubscribing] = useState<number | null>(null)
    const [isAnnual, setIsAnnual] = useState(false)
    const router = useRouter()

    useEffect(() => {
        async function fetchPlans() {
            try {
                const response = await api.get('/subscriptions/plans/')
                const plansData = response.data?.results || response.data || []
                setPlans(Array.isArray(plansData) ? plansData : [])
            } catch (error) {
                console.error("Failed to fetch plans", error)
            } finally {
                setLoading(false)
            }
        }
        fetchPlans()
    }, [])

    const handleSubscribe = (planId: number) => {
        router.push(`/checkout?planId=${planId}`)
    }

    return (
        <div className="pt-24 pb-20 space-y-12">
            <div className="text-center max-w-3xl mx-auto space-y-4 px-4">
                <div className="inline-flex items-center gap-2 bg-[#00576F]/10 text-[#00576F]
                                px-4 py-2 rounded-full text-sm font-medium mb-4">
                    <Sparkles className="h-4 w-4" />
                    Planes de Suscripción
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
                    Elige el plan perfecto para ti
                </h1>
                <p className="text-lg text-gray-600 leading-relaxed">
                    Accede a miles de libros y recursos educativos. Cancela cuando quieras.
                </p>

                {/* Billing Toggle */}
                <div className="flex items-center justify-center gap-4 pt-6">
                    <div className="relative inline-flex rounded-full border border-gray-200 bg-gray-50 p-1 shadow-inner">
                        <span
                            className={cn(
                                "absolute z-0 flex h-11 w-[120px] rounded-full bg-white shadow-sm transition-transform duration-200 ease-linear",
                                !isAnnual ? "translate-x-0" : "translate-x-full"
                            )}
                            style={{ top: '4px' }}
                            aria-hidden="true"
                        />
                        <button
                            onClick={() => setIsAnnual(false)}
                            className={cn(
                                "relative z-10 flex h-11 w-[120px] items-center justify-center rounded-full text-base font-medium transition-colors duration-200",
                                !isAnnual
                                    ? "text-[#00576F]"
                                    : "text-gray-500 hover:text-gray-700"
                            )}
                        >
                            Mensual
                        </button>
                        <button
                            onClick={() => setIsAnnual(true)}
                            className={cn(
                                "relative z-10 flex h-11 w-[120px] items-center justify-center rounded-full text-base font-medium transition-colors duration-200",
                                isAnnual
                                    ? "text-[#00576F]"
                                    : "text-gray-500 hover:text-gray-700"
                            )}
                        >
                            Anual
                        </button>
                    </div>
                    {isAnnual && (
                        <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">
                            Ahorra 17%
                        </span>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-[40vh]">
                    <div className="w-10 h-10 border-4 border-[#00576F]/20 border-t-[#00576F] rounded-full animate-spin" />
                </div>
            ) : (
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto px-4">
                    {plans.map((plan) => (
                        <PlanCard
                            key={plan.id}
                            plan={plan}
                            onSubscribe={handleSubscribe}
                            isLoading={subscribing === plan.id}
                            isAnnual={isAnnual}
                        />
                    ))}
                </div>
            )}

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-8 pt-8 border-t border-gray-100 mx-auto max-w-4xl px-4">
                <div className="flex items-center gap-2 text-gray-500">
                    <Shield className="h-5 w-5 text-green-600" />
                    <span className="text-sm">Pago seguro SSL</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                    <Zap className="h-5 w-5 text-yellow-500" />
                    <span className="text-sm">Activación instantánea</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                    <Sparkles className="h-5 w-5 text-[#00576F]" />
                    <span className="text-sm">Cancela cuando quieras</span>
                </div>
            </div>
        </div>
    )
}
