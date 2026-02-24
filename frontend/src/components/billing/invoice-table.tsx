"use client"

import { useEffect, useState, useMemo } from "react"
import { billingApi } from "@/services/billingApi"
import type { Invoice } from "@/types/billing"
import { useAuthStore } from "@/store/authStore"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { Download, FileText, RotateCcw, Search, ChevronLeft, ChevronRight } from "lucide-react"
import { RefundDialog } from "./refund-dialog"
import { InvoiceStatsCards } from "./invoice-stats-cards"

const PAGE_SIZE = 10

// ── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: Invoice["status"] }) {
    const cfg = {
        PAID: {
            dot: "bg-emerald-500",
            cls: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
            label: "Paid",
        },
        REFUNDED: {
            dot: "bg-orange-500",
            cls: "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
            label: "Refunded",
        },
        VOID: {
            dot: "bg-gray-400",
            cls: "bg-gray-100 text-gray-600 dark:bg-gray-800/60 dark:text-gray-400",
            label: "Void",
        },
    }[status]

    return (
        <Badge
            variant="secondary"
            className={`inline-flex items-center gap-1.5 font-medium ${cfg.cls}`}
        >
            <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
        </Badge>
    )
}

// ── Main component ────────────────────────────────────────────────────────────
export function InvoiceTable() {
    const [invoices, setInvoices] = useState<Invoice[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("ALL")
    const [page, setPage] = useState(1)
    const [refundTarget, setRefundTarget] = useState<Invoice | null>(null)

    const { user } = useAuthStore()
    const isAdmin = user?.user_type === "admin"

    // Derive currency from first invoice (fallback USD)
    const currency = invoices[0]?.currency ?? "USD"

    useEffect(() => {
        fetchInvoices()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    async function fetchInvoices() {
        setLoading(true)
        try {
            const data = await billingApi.getInvoices()
            // Guard against DRF paginated responses ({ count, results: [] })
            const list = Array.isArray(data) ? data : (data as any).results ?? []
            setInvoices(list)
        } catch {
            toast({ title: "Error", description: "Failed to load invoices.", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    // ── Client-side filter + pagination ──────────────────────────────────────
    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase()
        return invoices.filter(inv => {
            const matchesStatus =
                statusFilter === "ALL" || inv.status === statusFilter
            const matchesSearch =
                !q ||
                inv.invoice_number.toLowerCase().includes(q) ||
                (inv.description ?? "").toLowerCase().includes(q) ||
                (inv.billing_name ?? "").toLowerCase().includes(q) ||
                (inv.plan_name ?? "").toLowerCase().includes(q)
            return matchesStatus && matchesSearch
        })
    }, [invoices, search, statusFilter])

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
    const currentPage = Math.min(page, totalPages)
    const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

    // Reset to page 1 when filters change
    useEffect(() => { setPage(1) }, [search, statusFilter])

    function handleDownload(invoice: Invoice) {
        const url = billingApi.getInvoiceDownloadUrl(invoice.id)
        window.open(url, "_blank")
    }

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <>
            {/* Summary stat cards */}
            <InvoiceStatsCards currency={currency} />

            {/* Table card */}
            <div className="rounded-xl border border-border/50 bg-card shadow-sm overflow-hidden mt-6">
                {/* Card header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-border/50">
                    <div className="flex items-center gap-2">
                        <div className="h-9 w-9 rounded-lg bg-amber-500/10 flex items-center justify-center">
                            <FileText className="h-4 w-4 text-amber-500" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-foreground">Invoice History</p>
                            <p className="text-xs text-muted-foreground">Your billing records and receipts</p>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                            <Input
                                placeholder="Search invoices…"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="pl-8 h-8 text-sm w-44"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="h-8 text-sm w-32">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Status</SelectItem>
                                <SelectItem value="PAID">Paid</SelectItem>
                                <SelectItem value="REFUNDED">Refunded</SelectItem>
                                <SelectItem value="VOID">Void</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Table body */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-14 gap-3 text-center">
                        <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center">
                            <FileText className="h-7 w-7 text-muted-foreground" />
                        </div>
                        <p className="text-sm font-medium text-foreground">No invoices found</p>
                        <p className="text-xs text-muted-foreground max-w-xs">
                            {invoices.length === 0
                                ? "Your invoices will appear here after your first payment."
                                : "Try adjusting your search or filter."}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border/50 bg-muted/30">
                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                        Invoice #
                                    </th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                        Plan
                                    </th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground hidden md:table-cell">
                                        Date
                                    </th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                        Amount
                                    </th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                        Status
                                    </th>
                                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/40">
                                {paginated.map(invoice => (
                                    <tr
                                        key={invoice.id}
                                        className="group hover:bg-muted/20 transition-colors"
                                    >
                                        {/* Invoice # */}
                                        <td className="px-5 py-3.5">
                                            <span className="font-mono text-xs font-semibold text-foreground">
                                                {invoice.invoice_number}
                                            </span>
                                            {invoice.description && (
                                                <p className="text-xs text-muted-foreground truncate max-w-[150px] mt-0.5">
                                                    {invoice.description}
                                                </p>
                                            )}
                                        </td>

                                        {/* Plan */}
                                        <td className="px-5 py-3.5 text-sm text-muted-foreground whitespace-nowrap">
                                            {invoice.plan_name ?? "—"}
                                        </td>

                                        {/* Date */}
                                        <td className="px-5 py-3.5 text-sm text-muted-foreground whitespace-nowrap hidden md:table-cell">
                                            {new Date(invoice.issued_at).toLocaleDateString("en-US", {
                                                year: "numeric",
                                                month: "short",
                                                day: "numeric",
                                            })}
                                        </td>

                                        {/* Amount */}
                                        <td className="px-5 py-3.5 font-semibold whitespace-nowrap text-foreground">
                                            {invoice.currency}{" "}
                                            {parseFloat(invoice.amount).toFixed(2)}
                                        </td>

                                        {/* Status */}
                                        <td className="px-5 py-3.5">
                                            <StatusBadge status={invoice.status} />
                                        </td>

                                        {/* Actions */}
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-1 justify-end">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 opacity-60 group-hover:opacity-100 transition-opacity"
                                                    title="Download PDF"
                                                    onClick={() => handleDownload(invoice)}
                                                >
                                                    <Download className="h-3.5 w-3.5" />
                                                </Button>
                                                {isAdmin && invoice.status === "PAID" && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-950/20 opacity-60 group-hover:opacity-100 transition-opacity"
                                                        title="Issue Refund"
                                                        onClick={() => setRefundTarget(invoice)}
                                                    >
                                                        <RotateCcw className="h-3.5 w-3.5" />
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-5 py-3 border-t border-border/50 bg-muted/20">
                        <p className="text-xs text-muted-foreground">
                            Showing {(currentPage - 1) * PAGE_SIZE + 1}–
                            {Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length}
                        </p>
                        <div className="flex items-center gap-1">
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7"
                                disabled={currentPage === 1}
                                onClick={() => setPage(p => p - 1)}
                            >
                                <ChevronLeft className="h-3.5 w-3.5" />
                            </Button>
                            <span className="text-xs px-2 text-muted-foreground">
                                {currentPage} / {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7"
                                disabled={currentPage === totalPages}
                                onClick={() => setPage(p => p + 1)}
                            >
                                <ChevronRight className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Refund Dialog */}
            {refundTarget && (
                <RefundDialog
                    invoice={refundTarget}
                    open={!!refundTarget}
                    onOpenChange={open => !open && setRefundTarget(null)}
                    onRefunded={fetchInvoices}
                />
            )}
        </>
    )
}
