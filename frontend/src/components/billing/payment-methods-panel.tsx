"use client"

import { useEffect, useState } from "react"
import { billingApi } from "@/services/billingApi"
import type { StoredPaymentMethod } from "@/types/billing"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "@/hooks/use-toast"
import { CreditCard, Plus, Star, Trash2 } from "lucide-react"
import { AddPaymentMethodDialog } from "./add-payment-method-dialog"

const BRAND_ICONS: Record<string, string> = {
    visa: 'VISA',
    mastercard: 'MC',
    amex: 'AMEX',
    discover: 'DISC',
    jcb: 'JCB',
    unionpay: 'UP',
}

export function PaymentMethodsPanel() {
    const [methods, setMethods] = useState<StoredPaymentMethod[]>([])
    const [loading, setLoading] = useState(true)
    const [showAddDialog, setShowAddDialog] = useState(false)
    const [actionLoading, setActionLoading] = useState<string | null>(null)

    useEffect(() => {
        fetchMethods()
    }, [])

    async function fetchMethods() {
        try {
            const data = await billingApi.getPaymentMethods()
            setMethods(data)
        } catch {
            toast({ title: "Error", description: "Failed to load payment methods.", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    async function handleDelete(id: string) {
        setActionLoading(id)
        try {
            await billingApi.deletePaymentMethod(id)
            setMethods(prev => prev.filter(m => m.id !== id))
            toast({ title: "Removed", description: "Payment method removed." })
        } catch {
            toast({ title: "Error", description: "Failed to remove payment method.", variant: "destructive" })
        } finally {
            setActionLoading(null)
        }
    }

    async function handleSetDefault(id: string) {
        setActionLoading(id)
        try {
            await billingApi.setDefaultPaymentMethod(id)
            setMethods(prev => prev.map(m => ({ ...m, is_default: m.id === id })))
            toast({ title: "Updated", description: "Default payment method updated." })
        } catch {
            toast({ title: "Error", description: "Failed to set default.", variant: "destructive" })
        } finally {
            setActionLoading(null)
        }
    }

    return (
        <>
            <Card className="border-border/50">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                                <CreditCard className="h-5 w-5 text-purple-500" />
                            </div>
                            <div>
                                <CardTitle>Payment Methods</CardTitle>
                                <CardDescription>Manage your saved cards</CardDescription>
                            </div>
                        </div>
                        <Button
                            size="sm"
                            onClick={() => setShowAddDialog(true)}
                            className="gap-1.5"
                        >
                            <Plus className="h-4 w-4" />
                            Add Card
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                        </div>
                    ) : methods.length === 0 ? (
                        <div className="text-center py-8 space-y-3">
                            <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                                <CreditCard className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <p className="text-sm text-muted-foreground">No payment methods saved</p>
                            <Button variant="outline" size="sm" onClick={() => setShowAddDialog(true)}>
                                <Plus className="h-4 w-4 mr-1.5" />
                                Add Payment Method
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {methods.map(method => (
                                <div
                                    key={method.id}
                                    className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-muted/20"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-14 rounded bg-slate-800 text-white flex items-center justify-center text-xs font-bold tracking-wider">
                                            {BRAND_ICONS[method.brand?.toLowerCase()] || method.brand?.toUpperCase() || '??'}
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">
                                                •••• {method.last4}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Expires {method.exp_month?.toString().padStart(2, '0')}/{method.exp_year}
                                            </p>
                                        </div>
                                        {method.is_default && (
                                            <Badge variant="secondary" className="text-xs">
                                                <Star className="h-3 w-3 mr-1 fill-current" />
                                                Default
                                            </Badge>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {!method.is_default && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleSetDefault(method.id)}
                                                disabled={actionLoading === method.id}
                                            >
                                                Set Default
                                            </Button>
                                        )}
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                    disabled={actionLoading === method.id}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Remove Card</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Remove card ending in {method.last4}? This action cannot be undone.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => handleDelete(method.id)}
                                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                    >
                                                        Remove
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <AddPaymentMethodDialog
                open={showAddDialog}
                onOpenChange={setShowAddDialog}
                onAdded={fetchMethods}
            />
        </>
    )
}
