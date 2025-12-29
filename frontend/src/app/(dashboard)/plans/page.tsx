
"use client"

import { useEffect, useState } from "react"
import api from "@/lib/api"
import { PlanCard } from "@/components/plan-card"
import { PageHeader } from "@/components/page-header"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

interface Plan {
    id: number
    name: string
    description: string
    price: string
    duration_days: number
    features: string[]
}

export default function PlansPage() {
    const [plans, setPlans] = useState<Plan[]>([])
    const [loading, setLoading] = useState(true)
    const [subscribing, setSubscribing] = useState<number | null>(null)
    const router = useRouter()

    useEffect(() => {
        async function fetchPlans() {
            try {
                const response = await api.get('/subscriptions/plans/')
                // Handle paginated responses
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
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <PageHeader
                title="Planes de Suscripción"
                description="Elige el plan que mejor se adapte a tus necesidades"
            />

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {plans.map((plan) => (
                    <PlanCard
                        key={plan.id}
                        plan={plan}
                        onSubscribe={handleSubscribe}
                        isLoading={subscribing === plan.id}
                    />
                ))}
            </div>
        </div>
    )
}
