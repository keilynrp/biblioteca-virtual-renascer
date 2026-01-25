"use client"

import { useEffect, useState } from "react"
import api from "@/lib/api"
import { PlanCard } from "@/components/plan-card"
import { useRouter } from "next/navigation"
import { Loader2, Sparkles, Shield, Zap } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
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

export default function PlansPage() {
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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-primary/20 rounded-full" />
                        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                    <p className="text-muted-foreground text-sm">Cargando planes...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="py-5 space-y-12">
            {/* Hero Section */}
            <div className="text-center max-w-3xl mx-auto space-y-4">
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary
                                px-4 py-2 rounded-full text-sm font-medium mb-4">
                    <Sparkles className="h-4 w-4" />
                    Planes de Suscripción
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">
                    Elige el plan perfecto para ti
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed">
                    Accede a miles de libros y recursos educativos. Cancela cuando quieras.
                </p>

                {/* Billing Toggle */}
                <div className="flex items-center justify-center gap-4 pt-6">
                    <div className="relative inline-flex rounded-full border border-border bg-muted/50 p-1">
                        {/* Sliding background */}
                        <span
                            className={cn(
                                "absolute top-1/2 z-0 flex h-11 w-[120px] -translate-y-1/2 rounded-full bg-background shadow-sm transition-transform duration-200 ease-linear",
                                !isAnnual ? "translate-x-0" : "translate-x-full"
                            )}
                            aria-hidden="true"
                        />
                        {/* Monthly button */}
                        <button
                            onClick={() => setIsAnnual(false)}
                            className={cn(
                                "relative z-10 flex h-11 w-[120px] items-center justify-center rounded-full text-base font-medium transition-colors duration-200",
                                !isAnnual
                                    ? "text-foreground"
                                    : "text-muted-foreground hover:text-foreground/80"
                            )}
                        >
                            Mensual
                        </button>
                        {/* Annual button */}
                        <button
                            onClick={() => setIsAnnual(true)}
                            className={cn(
                                "relative z-10 flex h-11 w-[120px] items-center justify-center rounded-full text-base font-medium transition-colors duration-200",
                                isAnnual
                                    ? "text-foreground"
                                    : "text-muted-foreground hover:text-foreground/80"
                            )}
                        >
                            Anual
                        </button>
                    </div>
                    {isAnnual && (
                        <span className="bg-success/10 text-success text-xs font-bold px-3 py-1 rounded-full">
                            Ahorra 17%
                        </span>
                    )}
                </div>
            </div>

            {/* Plans Grid */}
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

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-8 pt-8 border-t border-border/50">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Shield className="h-5 w-5 text-success" />
                    <span className="text-sm">Pago seguro SSL</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Zap className="h-5 w-5 text-warning" />
                    <span className="text-sm">Activación instantánea</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <span className="text-sm">Cancela cuando quieras</span>
                </div>
            </div>

            {/* Custom Plan CTA */}
            <div className="text-center pt-4">
                <p className="text-muted-foreground mb-4">
                    ¿Necesitas un plan personalizado para tu institución?
                </p>
                <Link href="/plans/builder">
                    <Button variant="outline" size="lg" className="rounded-xl">
                        Crear Plan Personalizado
                    </Button>
                </Link>
            </div>
        </div>
    )
}
