"use client"

import { useEffect, useState } from "react"
import api from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { CreditCard, CalendarDays, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { userToast } from '@/lib/toast-utils'

export function PlanSummaryCard() {
    const [subscription, setSubscription] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [showCancelDialog, setShowCancelDialog] = useState(false)
    const [canceling, setCanceling] = useState(false)

    useEffect(() => {
        fetchSubscription()
    }, [])

    async function fetchSubscription() {
        try {
            const response = await api.get('/subscriptions/my-subscription/')
            setSubscription(response.data)
        } catch {
            // No subscription
        } finally {
            setLoading(false)
        }
    }

    async function handleCancelSubscription() {
        setCanceling(true)
        try {
            await api.post('/subscriptions/cancel/')
            userToast.success("Subscription cancelled successfully.", "Cancelled")
            setShowCancelDialog(false)
            fetchSubscription()
        } catch {
            toast({ title: "Error", description: "Failed to cancel subscription.", variant: "destructive" })
        } finally {
            setCanceling(false)
        }
    }

    if (loading) {
        return (
            <Card className="border-border/50">
                <CardContent className="flex items-center justify-center py-12">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </CardContent>
            </Card>
        )
    }

    if (!subscription) {
        return (
            <Card className="border-border/50">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <CreditCard className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <CardTitle>Current Plan</CardTitle>
                            <CardDescription>Your active subscription</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="text-center py-8 space-y-4">
                    <p className="text-muted-foreground">No active subscription</p>
                    <Button asChild>
                        <Link href="/plans">View Available Plans</Link>
                    </Button>
                </CardContent>
            </Card>
        )
    }

    const startDate = new Date(subscription.start_date)
    const endDate = new Date(subscription.end_date)
    const today = new Date()
    const totalDays = Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)))
    const daysRemaining = Math.max(0, Math.round((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)))
    const progress = Math.min(100, Math.round((daysRemaining / totalDays) * 100))

    return (
        <>
            <Card className="border-border/50">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <CreditCard className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <CardTitle>Current Plan</CardTitle>
                            <CardDescription>Your active subscription</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="rounded-lg border bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 p-5">
                        <div className="flex items-start justify-between gap-4 mb-4">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-lg font-semibold">{subscription.plan_detail?.name}</h3>
                                    <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                        <CheckCircle2 className="h-3 w-3 mr-1" />
                                        Active
                                    </Badge>
                                </div>
                                {subscription.plan_detail?.description && (
                                    <p className="text-sm text-muted-foreground">{subscription.plan_detail.description}</p>
                                )}
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-primary">
                                    {subscription.plan_detail?.currency || 'USD'} {subscription.plan_detail?.price}
                                </p>
                                <p className="text-xs text-muted-foreground">per period</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="flex items-center gap-1.5 text-muted-foreground">
                                    <CalendarDays className="h-4 w-4" />
                                    Days remaining
                                </span>
                                <span className="font-semibold">{daysRemaining} / {totalDays} days</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                            <p className="text-xs text-muted-foreground">
                                Expires {endDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Button variant="outline" asChild className="flex-1">
                            <Link href="/plans">
                                <CreditCard className="h-4 w-4 mr-2" />
                                Change Plan
                            </Link>
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => setShowCancelDialog(true)}
                            className="flex-1"
                        >
                            Cancel Subscription
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cancel Subscription</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to cancel? You will lose access to premium features at the end of your billing period.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCancelDialog(false)} disabled={canceling}>
                            Keep Subscription
                        </Button>
                        <Button variant="destructive" onClick={handleCancelSubscription} disabled={canceling}>
                            {canceling ? "Canceling..." : "Yes, Cancel"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
