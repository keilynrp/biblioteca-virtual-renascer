"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { billingApi } from "@/services/billingApi"
import type { Invoice } from "@/types/billing"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { userToast } from '@/lib/toast-utils'

const schema = z.object({
    amount: z.string().optional(),
    reason: z.string().min(1, "Reason is required"),
})

type FormValues = z.infer<typeof schema>

const REFUND_REASONS = [
    { value: 'requested_by_customer', label: 'Requested by customer' },
    { value: 'duplicate', label: 'Duplicate payment' },
    { value: 'fraudulent', label: 'Fraudulent payment' },
]

interface RefundDialogProps {
    invoice: Invoice
    open: boolean
    onOpenChange: (open: boolean) => void
    onRefunded: () => void
}

export function RefundDialog({ invoice, open, onOpenChange, onRefunded }: RefundDialogProps) {
    const [loading, setLoading] = useState(false)

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            amount: '',
            reason: 'requested_by_customer',
        },
    })

    async function onSubmit(values: FormValues) {
        setLoading(true)
        try {
            const payload: { amount?: number; reason: string } = { reason: values.reason }
            if (values.amount && values.amount.trim() !== '') {
                payload.amount = parseFloat(values.amount)
            }
            await billingApi.refundInvoice(invoice.id, payload)
            userToast.success(`Invoice ${invoice.invoice_number} has been refunded.`, "Refund issued")
            form.reset()
            onOpenChange(false)
            onRefunded()
        } catch (err: any) {
            const detail = err?.response?.data?.detail || "Failed to process refund."
            toast({ title: "Error", description: detail, variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Issue Refund</DialogTitle>
                    <DialogDescription>
                        Refund invoice {invoice.invoice_number} — total {invoice.currency} {invoice.amount}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Amount (optional)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            min="0.01"
                                            max={parseFloat(invoice.amount)}
                                            placeholder={`Full refund (${invoice.amount})`}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Leave empty for a full refund
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="reason"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Reason</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {REFUND_REASONS.map(r => (
                                                <SelectItem key={r.value} value={r.value}>
                                                    {r.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                                Cancel
                            </Button>
                            <Button type="submit" variant="destructive" disabled={loading}>
                                {loading ? "Processing..." : "Issue Refund"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
