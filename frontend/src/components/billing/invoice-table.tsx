"use client"

import { useEffect, useState } from "react"
import { billingApi } from "@/services/billingApi"
import type { Invoice } from "@/types/billing"
import { useAuthStore } from "@/store/authStore"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { Download, FileText, RotateCcw } from "lucide-react"
import { RefundDialog } from "./refund-dialog"

function StatusBadge({ status }: { status: Invoice['status'] }) {
    if (status === 'PAID') {
        return <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Paid</Badge>
    }
    if (status === 'REFUNDED') {
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">Refunded</Badge>
    }
    return <Badge variant="secondary" className="bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400">Void</Badge>
}

export function InvoiceTable() {
    const [invoices, setInvoices] = useState<Invoice[]>([])
    const [loading, setLoading] = useState(true)
    const [refundTarget, setRefundTarget] = useState<Invoice | null>(null)
    const { user } = useAuthStore()
    const isAdmin = user?.user_type === 'admin'

    useEffect(() => {
        fetchInvoices()
    }, [])

    async function fetchInvoices() {
        try {
            const data = await billingApi.getInvoices()
            setInvoices(data)
        } catch {
            toast({ title: "Error", description: "Failed to load invoices.", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    function handleDownload(invoice: Invoice) {
        const url = billingApi.getInvoiceDownloadUrl(invoice.id)
        window.open(url, '_blank')
    }

    return (
        <>
            <Card className="border-border/50">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                            <FileText className="h-5 w-5 text-amber-500" />
                        </div>
                        <div>
                            <CardTitle>Invoice History</CardTitle>
                            <CardDescription>Your billing records and receipts</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                        </div>
                    ) : invoices.length === 0 ? (
                        <div className="text-center py-10 space-y-3">
                            <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                                <FileText className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <p className="text-sm text-muted-foreground">No invoices yet</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border text-left">
                                        <th className="pb-3 font-medium text-muted-foreground">Invoice #</th>
                                        <th className="pb-3 font-medium text-muted-foreground">Description</th>
                                        <th className="pb-3 font-medium text-muted-foreground">Date</th>
                                        <th className="pb-3 font-medium text-muted-foreground">Amount</th>
                                        <th className="pb-3 font-medium text-muted-foreground">Status</th>
                                        <th className="pb-3 font-medium text-muted-foreground text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/50">
                                    {invoices.map(invoice => (
                                        <tr key={invoice.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="py-3 font-mono text-xs font-medium">
                                                {invoice.invoice_number}
                                            </td>
                                            <td className="py-3 max-w-[180px] truncate text-muted-foreground">
                                                {invoice.description || 'Subscription'}
                                            </td>
                                            <td className="py-3 text-muted-foreground whitespace-nowrap">
                                                {new Date(invoice.issued_at).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                })}
                                            </td>
                                            <td className="py-3 font-semibold whitespace-nowrap">
                                                {invoice.currency} {parseFloat(invoice.amount).toFixed(2)}
                                            </td>
                                            <td className="py-3">
                                                <StatusBadge status={invoice.status} />
                                            </td>
                                            <td className="py-3">
                                                <div className="flex items-center gap-1 justify-end">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        title="Download PDF"
                                                        onClick={() => handleDownload(invoice)}
                                                    >
                                                        <Download className="h-4 w-4" />
                                                    </Button>
                                                    {isAdmin && invoice.status === 'PAID' && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            title="Issue Refund"
                                                            className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-950/20"
                                                            onClick={() => setRefundTarget(invoice)}
                                                        >
                                                            <RotateCcw className="h-4 w-4" />
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
                </CardContent>
            </Card>

            {refundTarget && (
                <RefundDialog
                    invoice={refundTarget}
                    open={!!refundTarget}
                    onOpenChange={(open) => !open && setRefundTarget(null)}
                    onRefunded={fetchInvoices}
                />
            )}
        </>
    )
}
