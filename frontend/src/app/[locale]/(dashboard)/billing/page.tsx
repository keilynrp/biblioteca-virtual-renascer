"use client"

import { BillingTabs } from "@/components/billing/billing-tabs"
import { Receipt } from "lucide-react"

export default function BillingPage() {
    return (
        <div className="px-6 py-6 space-y-6 max-w-5xl mx-auto">
            {/* Page Header */}
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Receipt className="h-5 w-5 text-primary" />
                </div>
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Billing</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Manage your subscription, payment methods, and invoices
                    </p>
                </div>
            </div>

            <BillingTabs />
        </div>
    )
}
