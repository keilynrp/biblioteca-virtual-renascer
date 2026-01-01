
"use client"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Check, Crown, Sparkles } from "lucide-react"

interface Plan {
    id: number
    name: string
    description: string
    price: string
    duration_days: number
    features: string[]
}

interface PlanCardProps {
    plan: Plan
    onSubscribe: (planId: number) => void
    isLoading?: boolean
    isCurrent?: boolean
}

export function PlanCard({ plan, onSubscribe, isLoading, isCurrent }: PlanCardProps) {
    const isPopular = plan.name.toLowerCase().includes("premium") || plan.name.toLowerCase().includes("pro")

    return (
        <Card className={`
            relative overflow-hidden transition-all duration-300 hover:-translate-y-2
            ${isCurrent
                ? "border-success border-2 shadow-lg shadow-success/20"
                : isPopular
                    ? "border-primary border-2 shadow-xl shadow-primary/20"
                    : "border-border hover:shadow-lg"
            }
        `}>
            {isPopular && !isCurrent && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-primary to-primary-dark text-white text-xs px-4 py-1.5 rounded-bl-lg font-bold flex items-center space-x-1 shadow-lg">
                    <Sparkles className="h-3 w-3" />
                    <span>Más Popular</span>
                </div>
            )}

            {isCurrent && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-success to-success/80 text-white text-xs px-4 py-1.5 rounded-bl-lg font-bold flex items-center space-x-1 shadow-lg">
                    <Check className="h-3 w-3" />
                    <span>Plan Actual</span>
                </div>
            )}

            <CardHeader className={`pb-8 pt-8 ${isPopular ? "bg-gradient-to-br from-primary/5 to-primary-dark/5" : ""}`}>
                <div className="flex items-center space-x-2 mb-2">
                    {plan.name.toLowerCase().includes("premium") && (
                        <Crown className="h-5 w-5 text-warning" />
                    )}
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                </div>
                <CardDescription className="text-base">{plan.description}</CardDescription>
            </CardHeader>

            <CardContent className="grid gap-6 px-6">
                <div className="flex items-baseline space-x-2">
                    <span className="text-5xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                        ${plan.price}
                    </span>
                    <span className="text-sm font-medium text-muted-foreground">
                        / {plan.duration_days} días
                    </span>
                </div>

                <div className="grid gap-3">
                    {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-start space-x-3">
                            <div className="mt-0.5 h-5 w-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                                <Check className="h-3 w-3 text-emerald-700 dark:text-emerald-400" />
                            </div>
                            <span className="text-sm text-foreground leading-relaxed">
                                {feature}
                            </span>
                        </div>
                    ))}
                </div>
            </CardContent>

            <CardFooter className="px-6 pb-6 pt-4">
                <Button
                    className={`w-full ${isPopular && !isCurrent
                            ? "bg-gradient-to-r from-primary to-primary-dark hover:shadow-lg hover:shadow-primary/30"
                            : ""
                        }`}
                    onClick={() => onSubscribe(plan.id)}
                    disabled={isLoading || isCurrent}
                    variant={isCurrent ? "secondary" : "default"}
                    size="lg"
                >
                    {isCurrent ? "Plan Actual" : (isLoading ? "Procesando..." : "Suscribirse")}
                </Button>
            </CardFooter>
        </Card>
    )
}
