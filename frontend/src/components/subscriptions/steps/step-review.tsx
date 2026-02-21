"use client"

import { PlanData } from "../types"
import { Card, CardContent } from "@/components/ui/card"
import { Check, User, Building2 } from "lucide-react"
import { useCurrency } from "@/context/currency-context"

interface StepReviewProps {
    data: PlanData
}

export function StepReview({ data }: StepReviewProps) {
    const { symbol } = useCurrency()
    return (
        <div className="space-y-6">
            <div className="bg-muted p-4 rounded-lg flex items-start gap-4">
                <div className="bg-background p-2 rounded-md shadow-sm">
                    {data.plan_type === 'INDIVIDUAL' ? (
                        <User className="h-6 w-6 text-primary" />
                    ) : (
                        <Building2 className="h-6 w-6 text-primary" />
                    )}
                </div>
                <div>
                    <h3 className="font-semibold text-lg">{data.name}</h3>
                    <p className="text-muted-foreground text-sm">{data.description}</p>
                    <div className="mt-2 flex items-baseline gap-1">
                        <span className="text-2xl font-bold">{symbol}{data.price}</span>
                        <span className="text-sm text-muted-foreground">/ {data.duration_days} days</span>
                    </div>
                </div>
            </div>

            <div>
                <h4 className="font-medium mb-3">Included Features</h4>
                <div className="grid gap-2">
                    {data.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 border rounded bg-background">
                            <Check className="h-4 w-4 text-green-500" />
                            <span className="text-sm">{feature}</span>
                        </div>
                    ))}
                    {data.features.length === 0 && (
                        <p className="text-sm text-muted-foreground italic">No features listed.</p>
                    )}
                </div>
            </div>
        </div>
    )
}
