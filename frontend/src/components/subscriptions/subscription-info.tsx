"use client"

import { useEffect, useState } from "react"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import Link from "next/link"
import { toast } from "@/hooks/use-toast"
import { CreditCard } from "lucide-react"

export function SubscriptionInfo() {
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
            // Ignore 404 - user has no subscription
        } finally {
            setLoading(false)
        }
    }

    async function handleCancelSubscription() {
        setCanceling(true)
        try {
            await api.post('/subscriptions/cancel/')
            toast({
                title: "Success",
                description: "Subscription cancelled successfully.",
            })
            setShowCancelDialog(false)
            fetchSubscription()
        } catch {
            toast({
                title: "Error",
                description: "Failed to cancel subscription. Please try again.",
                variant: "destructive",
            })
        } finally {
            setCanceling(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
            </div>
        )
    }

    if (!subscription) {
        return (
            <div className="text-center py-8 space-y-4">
                <div className="mx-auto h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <CreditCard className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                    <p className="font-medium text-gray-900 dark:text-white mb-1">No Active Subscription</p>
                    <p className="text-sm text-muted-foreground mb-4">
                        Subscribe to a plan to access premium features
                    </p>
                </div>
                <Button asChild>
                    <Link href="/plans">View Available Plans</Link>
                </Button>
            </div>
        )
    }

    return (
        <>
            <div className="space-y-4">
                <div className="rounded-lg border border-border bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 p-6">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {subscription.plan_detail.name}
                                </h4>
                                <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/30 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:text-green-400">
                                    Active
                                </span>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    <span className="font-medium">Expires:</span>{" "}
                                    {new Date(subscription.end_date).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                                {subscription.plan_detail.description && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {subscription.plan_detail.description}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
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
            </div>

            <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cancel Subscription</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowCancelDialog(false)}
                            disabled={canceling}
                        >
                            Keep Subscription
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleCancelSubscription}
                            disabled={canceling}
                        >
                            {canceling ? "Canceling..." : "Yes, Cancel"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
