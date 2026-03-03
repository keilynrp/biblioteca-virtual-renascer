"use client"

import { useState, useEffect, useCallback } from "react"
import { billingApi } from "@/services/billingApi"
import type { AdminInvoice, AdminInvoiceSummary } from "@/types/billing"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
    DollarSign,
    FileText,
    Search,
    Download,
    MoreHorizontal,
    RefreshCcw,
    ChevronLeft,
    ChevronRight,
    ArrowUpDown,
    RotateCcw,
    Ban,
    TrendingUp,
    Receipt,
    CircleCheck,
    Loader2,
} from "lucide-react"
import { userToast } from '@/lib/toast-utils'

const STATUS_OPTIONS = [
    { value: "all", label: "Todas las facturas" },
    { value: "PAID", label: "Pagadas" },
    { value: "REFUNDED", label: "Reembolsadas" },
    { value: "VOID", label: "Anuladas" },
]

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; className: string }> = {
    PAID: {
        label: "Pagada",
        variant: "default",
        className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    },
    REFUNDED: {
        label: "Reembolsada",
        variant: "secondary",
        className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800",
    },
    VOID: {
        label: "Anulada",
        variant: "outline",
        className: "bg-gray-100 text-gray-600 dark:bg-gray-800/50 dark:text-gray-400 border-gray-200 dark:border-gray-700",
    },
}

function formatCurrency(amount: string, currency: string = "USD") {
    return new Intl.NumberFormat("es", {
        style: "currency",
        currency,
    }).format(parseFloat(amount))
}

function formatDate(dateStr: string) {
    return new Intl.DateTimeFormat("es", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(new Date(dateStr))
}

export default function AdminInvoicesPage() {
    const [invoices, setInvoices] = useState<AdminInvoice[]>([])
    const [summary, setSummary] = useState<AdminInvoiceSummary | null>(null)
    const [loading, setLoading] = useState(true)
    const [loadingSummary, setLoadingSummary] = useState(true)

    // Filters
    const [statusFilter, setStatusFilter] = useState("all")
    const [search, setSearch] = useState("")
    const [searchDebounced, setSearchDebounced] = useState("")
    const [ordering, setOrdering] = useState("-issued_at")

    // Pagination
    const [page, setPage] = useState(1)
    const [pageSize] = useState(10)
    const [totalCount, setTotalCount] = useState(0)

    // Refund dialog
    const [refundInvoice, setRefundInvoice] = useState<AdminInvoice | null>(null)
    const [refundAmount, setRefundAmount] = useState("")
    const [refundReason, setRefundReason] = useState("requested_by_customer")
    const [refundLoading, setRefundLoading] = useState(false)

    const totalPages = Math.ceil(totalCount / pageSize)

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => setSearchDebounced(search), 400)
        return () => clearTimeout(timer)
    }, [search])

    // Reset to page 1 on filter change
    useEffect(() => {
        setPage(1)
    }, [statusFilter, searchDebounced])

    const fetchInvoices = useCallback(async () => {
        setLoading(true)
        try {
            const params: Record<string, any> = { page, page_size: pageSize, ordering }
            if (statusFilter !== "all") params.status = statusFilter
            if (searchDebounced) params.search = searchDebounced

            const data = await billingApi.getAdminInvoices(params)
            setInvoices(data.results)
            setTotalCount(data.count)
        } catch {
            userToast.error("Error al cargar las facturas")
        } finally {
            setLoading(false)
        }
    }, [page, pageSize, statusFilter, searchDebounced, ordering])

    const fetchSummary = useCallback(async () => {
        setLoadingSummary(true)
        try {
            const data = await billingApi.getAdminInvoiceSummary()
            setSummary(data)
        } catch {
            // silent
        } finally {
            setLoadingSummary(false)
        }
    }, [])

    useEffect(() => { fetchInvoices() }, [fetchInvoices])
    useEffect(() => { fetchSummary() }, [fetchSummary])

    const handleRefund = async () => {
        if (!refundInvoice) return
        setRefundLoading(true)
        try {
            await billingApi.refundInvoice(refundInvoice.id, {
                amount: refundAmount ? parseFloat(refundAmount) : undefined,
                reason: refundReason,
            })
            userToast.success(`Factura ${refundInvoice.invoice_number} reembolsada`)
            setRefundInvoice(null)
            setRefundAmount("")
            fetchInvoices()
            fetchSummary()
        } catch (err: any) {
            const detail = err?.response?.data?.detail || "Error al procesar el reembolso"
            userToast.error(detail)
        } finally {
            setRefundLoading(false)
        }
    }

    const handleDownload = (invoice: AdminInvoice) => {
        const url = billingApi.getInvoiceDownloadUrl(invoice.id)
        window.open(url, "_blank")
    }

    const toggleOrdering = () => {
        setOrdering(prev => prev === "-issued_at" ? "issued_at" : "-issued_at")
    }

    const getPageNumbers = () => {
        const pages: number[] = []
        const maxVisible = 5
        let start = Math.max(1, page - Math.floor(maxVisible / 2))
        let end = Math.min(totalPages, start + maxVisible - 1)
        if (end - start + 1 < maxVisible) {
            start = Math.max(1, end - maxVisible + 1)
        }
        for (let i = start; i <= end; i++) pages.push(i)
        return pages
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-7xl space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight">Facturas</h1>
                    <p className="text-muted-foreground mt-1">
                        Gestión de todas las facturas de clientes
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { fetchInvoices(); fetchSummary() }}
                    className="gap-2"
                >
                    <RefreshCcw className="h-4 w-4" />
                    Actualizar
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {loadingSummary ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <Card key={i} className="rounded-2xl border-none shadow-lg">
                            <CardContent className="p-6">
                                <Skeleton className="h-4 w-24 mb-3" />
                                <Skeleton className="h-8 w-32" />
                            </CardContent>
                        </Card>
                    ))
                ) : summary ? (
                    <>
                        <Card className="rounded-2xl border-none shadow-lg shadow-emerald-500/5 bg-card/50 backdrop-blur-sm">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Total Cobrado</p>
                                        <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                                            {formatCurrency(summary.total_paid)}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {summary.paid_count} factura{summary.paid_count !== 1 ? "s" : ""}
                                        </p>
                                    </div>
                                    <div className="h-12 w-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                        <DollarSign className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="rounded-2xl border-none shadow-lg shadow-amber-500/5 bg-card/50 backdrop-blur-sm">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Total Reembolsado</p>
                                        <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
                                            {formatCurrency(summary.total_refunded)}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {summary.refunded_count} reembolso{summary.refunded_count !== 1 ? "s" : ""}
                                        </p>
                                    </div>
                                    <div className="h-12 w-12 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                                        <RotateCcw className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="rounded-2xl border-none shadow-lg shadow-primary/5 bg-card/50 backdrop-blur-sm">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Total Facturas</p>
                                        <p className="text-2xl font-black mt-1">
                                            {summary.invoice_count}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Todas las transacciones
                                        </p>
                                    </div>
                                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                                        <Receipt className="h-6 w-6 text-primary" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="rounded-2xl border-none shadow-lg shadow-blue-500/5 bg-card/50 backdrop-blur-sm">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Ingresos Netos</p>
                                        <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
                                            {formatCurrency(
                                                (parseFloat(summary.total_paid) - parseFloat(summary.total_refunded)).toFixed(2)
                                            )}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Cobrado - Reembolsado
                                        </p>
                                    </div>
                                    <div className="h-12 w-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                        <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </>
                ) : null}
            </div>

            {/* Filters & Table */}
            <Card className="rounded-2xl border-none shadow-xl shadow-primary/5 bg-card/50 backdrop-blur-sm">
                {/* Tab filters */}
                <div className="border-b border-border/50">
                    <div className="flex gap-1 px-6 pt-4">
                        {STATUS_OPTIONS.map(opt => (
                            <button
                                key={opt.value}
                                onClick={() => setStatusFilter(opt.value)}
                                className={`
                                    px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all cursor-pointer
                                    ${statusFilter === opt.value
                                        ? "bg-primary text-white shadow-md"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                    }
                                `}
                            >
                                {opt.label}
                                {opt.value !== "all" && summary && (
                                    <span className={`ml-1.5 text-xs ${statusFilter === opt.value ? "text-white/80" : "text-muted-foreground"}`}>
                                        ({opt.value === "PAID" ? summary.paid_count : opt.value === "REFUNDED" ? summary.refunded_count : summary.void_count})
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Search & Sort controls */}
                <div className="flex flex-col sm:flex-row gap-3 p-6 pb-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por factura, cliente o email..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="pl-10 rounded-xl h-11 bg-background/50"
                        />
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={toggleOrdering}
                        className="gap-2 rounded-xl h-11 px-4"
                    >
                        <ArrowUpDown className="h-4 w-4" />
                        {ordering === "-issued_at" ? "Más recientes" : "Más antiguas"}
                    </Button>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-y border-border/50 bg-muted/30">
                                <th className="text-left text-xs font-bold uppercase tracking-wider text-muted-foreground px-6 py-3">
                                    Factura
                                </th>
                                <th className="text-left text-xs font-bold uppercase tracking-wider text-muted-foreground px-6 py-3">
                                    Cliente
                                </th>
                                <th className="text-left text-xs font-bold uppercase tracking-wider text-muted-foreground px-6 py-3 hidden md:table-cell">
                                    Fecha
                                </th>
                                <th className="text-right text-xs font-bold uppercase tracking-wider text-muted-foreground px-6 py-3">
                                    Monto
                                </th>
                                <th className="text-center text-xs font-bold uppercase tracking-wider text-muted-foreground px-6 py-3">
                                    Estado
                                </th>
                                <th className="text-center text-xs font-bold uppercase tracking-wider text-muted-foreground px-6 py-3 w-16">
                                    Acción
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i}>
                                        <td className="px-6 py-4"><Skeleton className="h-5 w-32" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-5 w-40" /></td>
                                        <td className="px-6 py-4 hidden md:table-cell"><Skeleton className="h-5 w-24" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-5 w-20 ml-auto" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-6 w-24 mx-auto rounded-full" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-8 w-8 mx-auto rounded" /></td>
                                    </tr>
                                ))
                            ) : invoices.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center">
                                                <FileText className="h-8 w-8 text-muted-foreground/50" />
                                            </div>
                                            <p className="text-sm font-medium text-muted-foreground">
                                                No se encontraron facturas
                                            </p>
                                            {(search || statusFilter !== "all") && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => { setSearch(""); setStatusFilter("all") }}
                                                    className="text-primary"
                                                >
                                                    Limpiar filtros
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                invoices.map(inv => {
                                    const statusCfg = STATUS_CONFIG[inv.status] || STATUS_CONFIG.VOID
                                    return (
                                        <tr key={inv.id} className="hover:bg-muted/20 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                        <FileText className="h-5 w-5 text-primary" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold">{inv.invoice_number}</p>
                                                        <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                                                            {inv.plan_name || inv.description || "—"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-medium">{inv.customer_name}</p>
                                                <p className="text-xs text-muted-foreground">{inv.customer_email}</p>
                                            </td>
                                            <td className="px-6 py-4 hidden md:table-cell">
                                                <p className="text-sm">{formatDate(inv.issued_at)}</p>
                                                {inv.refunded_at && (
                                                    <p className="text-xs text-amber-600 dark:text-amber-400">
                                                        Reembolso: {formatDate(inv.refunded_at)}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <p className="text-sm font-bold">
                                                    {formatCurrency(inv.amount, inv.currency)}
                                                </p>
                                                <p className="text-xs text-muted-foreground uppercase">{inv.currency}</p>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <Badge
                                                    variant={statusCfg.variant}
                                                    className={`${statusCfg.className} font-semibold text-xs px-3 py-1 rounded-full border`}
                                                >
                                                    {statusCfg.label}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl">
                                                        <DropdownMenuItem
                                                            onClick={() => handleDownload(inv)}
                                                            className="gap-2 cursor-pointer"
                                                        >
                                                            <Download className="h-4 w-4" />
                                                            Descargar PDF
                                                        </DropdownMenuItem>
                                                        {inv.status === "PAID" && (
                                                            <DropdownMenuItem
                                                                onClick={() => setRefundInvoice(inv)}
                                                                className="gap-2 cursor-pointer text-amber-600 dark:text-amber-400 focus:text-amber-600"
                                                            >
                                                                <RotateCcw className="h-4 w-4" />
                                                                Emitir Reembolso
                                                            </DropdownMenuItem>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-border/50">
                        <p className="text-sm text-muted-foreground">
                            Mostrando {((page - 1) * pageSize) + 1}–{Math.min(page * pageSize, totalCount)} de {totalCount} facturas
                        </p>
                        <div className="flex items-center gap-1">
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-9 w-9 rounded-lg"
                                disabled={page === 1}
                                onClick={() => setPage(p => p - 1)}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            {getPageNumbers().map(p => (
                                <Button
                                    key={p}
                                    variant={p === page ? "default" : "outline"}
                                    size="icon"
                                    className="h-9 w-9 rounded-lg"
                                    onClick={() => setPage(p)}
                                >
                                    {p}
                                </Button>
                            ))}
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-9 w-9 rounded-lg"
                                disabled={page === totalPages}
                                onClick={() => setPage(p => p + 1)}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </Card>

            {/* Refund Dialog */}
            <Dialog open={!!refundInvoice} onOpenChange={open => { if (!open) setRefundInvoice(null) }}>
                <DialogContent className="max-w-md rounded-2xl">
                    <DialogHeader>
                        <DialogTitle>Emitir Reembolso</DialogTitle>
                        <DialogDescription>
                            Factura <span className="font-semibold text-foreground">{refundInvoice?.invoice_number}</span> por{" "}
                            <span className="font-semibold text-foreground">
                                {refundInvoice && formatCurrency(refundInvoice.amount, refundInvoice.currency)}
                            </span>
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label>Monto a reembolsar (dejar vacío para reembolso total)</Label>
                            <Input
                                type="number"
                                step="0.01"
                                min="0"
                                max={refundInvoice ? parseFloat(refundInvoice.amount) : undefined}
                                placeholder={refundInvoice ? `Máx: ${refundInvoice.amount}` : ""}
                                value={refundAmount}
                                onChange={e => setRefundAmount(e.target.value)}
                                className="rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Motivo</Label>
                            <Select value={refundReason} onValueChange={setRefundReason}>
                                <SelectTrigger className="rounded-xl">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="requested_by_customer">Solicitado por el cliente</SelectItem>
                                    <SelectItem value="duplicate">Cargo duplicado</SelectItem>
                                    <SelectItem value="fraudulent">Fraudulento</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setRefundInvoice(null)}
                            disabled={refundLoading}
                            className="rounded-xl"
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleRefund}
                            disabled={refundLoading}
                            className="rounded-xl bg-amber-600 hover:bg-amber-700 text-white gap-2"
                        >
                            {refundLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <RotateCcw className="h-4 w-4" />
                            )}
                            Confirmar Reembolso
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
