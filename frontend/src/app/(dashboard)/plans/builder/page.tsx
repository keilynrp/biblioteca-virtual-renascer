"use client"

import { PageHeader } from "@/components/page-header"
import { PlanWizard } from "@/components/subscriptions/plan-wizard"

export default function PlanBuilderPage() {
    return (
        <div className="py-5 space-y-8">
            <PageHeader
                title="Create a Plan"
                description="Design a new subscription plan for individuals or institutions"
            />
            <PlanWizard />
        </div>
    )
}
