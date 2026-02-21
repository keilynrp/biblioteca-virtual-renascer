"use client"

import { useEffect } from "react"
import { useRouter } from "@/i18n/routing"
import { PageHeader } from "@/components/page-header"
import { PlanWizard } from "@/components/subscriptions/plan-wizard"
import { useAuthStoreHydrated } from "@/store/authStore"

export default function PlanBuilderPage() {
    const router = useRouter()
    const { user } = useAuthStoreHydrated()

    useEffect(() => {
        if (user !== undefined && user?.user_type !== 'admin') {
            router.push('/plans')
        }
    }, [user, router])

    if (user === undefined || user?.user_type !== 'admin') {
        return null
    }

    return (
        <div className="py-5 space-y-8">
            <PageHeader
                title="Crear Plan"
                description="Diseña un nuevo plan de suscripción para individuos o instituciones"
            />
            <PlanWizard />
        </div>
    )
}
