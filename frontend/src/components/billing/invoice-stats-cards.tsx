"use client"

import { useEffect, useState } from "react"
import { billingApi } from "@/services/billingApi"
import type { InvoiceSummary } from "@/types/billing"
import { DollarSign, RotateCcw, FileText, TrendingUp } from "lucide-react"

function StatCard({
    label,
    value,
    sub,
    icon: Icon,
    color,
}: {
    label: string
    value: string
    sub?: string
    icon: React.ElementType
    color: string
}) {
    return (
        <div className="rounded-xl border border-border/50 bg-card p-5 flex items-center gap-4 shadow-sm">
            <div className={`h-12 w-12 shrink-0 rounded-xl flex items-center justify-center ${color}`}>
                <Icon className="h-6 w-6" />
            </div>
            <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
                <p className="mt-0.5 text-2xl font-bold text-foreground truncate">{value}</p>
                {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
            </div>
        </div>
    )
}

interface InvoiceStatsCardsProps {
    currency?: string
}

export function InvoiceStatsCards({ currency = "USD" }: InvoiceStatsCardsProps) {
    const [stats, setStats] = useState<InvoiceSummary | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        billingApi.getInvoiceSummary()
            .then(setStats)
            .catch(() => { /* silently fail */ })
            .finally(() => setLoading(false))
    }, [])

    const fmt = (val: string) =>
        `${currency} ${parseFloat(val || "0").toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[0, 1, 2].map(i => (
                    <div key={i} className="rounded-xl border border-border/50 bg-card p-5 h-24 animate-pulse" />
                ))}
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
                label="Total Paid"
                value={fmt(stats?.total_paid ?? "0")}
                sub="Lifetime payments"
                icon={TrendingUp}
                color="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            />
            <StatCard
                label="Total Refunded"
                value={fmt(stats?.total_refunded ?? "0")}
                sub="Across all invoices"
                icon={RotateCcw}
                color="bg-orange-500/10 text-orange-600 dark:text-orange-400"
            />
            <StatCard
                label="Total Invoices"
                value={String(stats?.invoice_count ?? 0)}
                sub="All time"
                icon={FileText}
                color="bg-primary/10 text-primary"
            />
        </div>
    )
}
