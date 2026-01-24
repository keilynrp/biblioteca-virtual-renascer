"use client"

import { Button } from "@/components/ui/button"
import { Check, Crown, Sparkles, Zap, Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface Plan {
    id: number
    name: string
    description: string
    price: string
    duration_days: number
    features: string[]
    plan_type?: string
}

interface PlanCardProps {
    plan: Plan
    onSubscribe: (planId: number) => void
    isLoading?: boolean
    isCurrent?: boolean
    isAnnual?: boolean
}

export function PlanCard({ plan, onSubscribe, isLoading, isCurrent, isAnnual }: PlanCardProps) {
    const isPopular = plan.name.toLowerCase().includes("premium") ||
                      plan.name.toLowerCase().includes("pro") ||
                      plan.plan_type === "premium"

    const isEnterprise = plan.name.toLowerCase().includes("enterprise") ||
                         plan.name.toLowerCase().includes("institucional") ||
                         plan.plan_type === "institutional"

    const isFree = plan.name.toLowerCase().includes("free") ||
                   plan.name.toLowerCase().includes("básico") ||
                   parseFloat(plan.price) === 0

    // Calculate annual price with discount
    const monthlyPrice = parseFloat(plan.price)
    const displayPrice = isAnnual ? (monthlyPrice * 10).toFixed(2) : plan.price
    const savedAmount = isAnnual ? (monthlyPrice * 2).toFixed(2) : null

    return (
        <div className={cn(
            "group relative flex flex-col rounded-2xl transition-all duration-500",
            "bg-card border border-border/50",
            "hover:border-primary/30 hover:-translate-y-2 hover:shadow-2xl",
            isPopular && !isCurrent && [
                "border-primary/50 shadow-xl shadow-primary/10",
                "bg-gradient-to-b from-primary/[0.03] to-transparent",
                "scale-[1.02] z-10"
            ],
            isCurrent && "border-success/50 shadow-lg shadow-success/10",
            isEnterprise && "border-chart-4/30"
        )}>
            {/* Popular Badge */}
            {isPopular && !isCurrent && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                    <div className="flex items-center gap-1.5 bg-gradient-to-r from-primary to-primary-dark
                                    text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg
                                    shadow-primary/30 animate-pulse">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Recomendado</span>
                    </div>
                </div>
            )}

            {/* Current Plan Badge */}
            {isCurrent && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                    <div className="flex items-center gap-1.5 bg-gradient-to-r from-success to-success-dark
                                    text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg">
                        <Check className="h-3.5 w-3.5" />
                        <span>Plan Actual</span>
                    </div>
                </div>
            )}

            {/* Card Header */}
            <div className={cn(
                "p-8 pb-0",
                (isPopular || isCurrent) && "pt-10"
            )}>
                {/* Plan Icon */}
                <div className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center mb-5",
                    "transition-transform duration-300 group-hover:scale-110",
                    isFree && "bg-muted",
                    isPopular && "bg-gradient-to-br from-primary to-primary-dark shadow-lg shadow-primary/20",
                    isEnterprise && "bg-gradient-to-br from-chart-4 to-chart-4/80 shadow-lg shadow-chart-4/20",
                    !isFree && !isPopular && !isEnterprise && "bg-gradient-to-br from-primary/80 to-primary"
                )}>
                    {isFree ? (
                        <Zap className="h-7 w-7 text-muted-foreground" />
                    ) : isPopular ? (
                        <Crown className="h-7 w-7 text-white" />
                    ) : isEnterprise ? (
                        <Star className="h-7 w-7 text-white" />
                    ) : (
                        <Sparkles className="h-7 w-7 text-white" />
                    )}
                </div>

                {/* Plan Name & Description */}
                <h3 className="text-xl font-bold text-foreground mb-2">{plan.name}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{plan.description}</p>
            </div>

            {/* Pricing */}
            <div className="p-8 pt-6">
                <div className="flex items-end gap-2 mb-1">
                    <span className={cn(
                        "text-5xl font-bold tracking-tight",
                        isPopular ? "text-primary" : "text-foreground"
                    )}>
                        ${displayPrice}
                    </span>
                    <span className="text-muted-foreground text-sm mb-2">
                        {isAnnual ? "/año" : `/${plan.duration_days} días`}
                    </span>
                </div>

                {/* Savings Badge */}
                {isAnnual && savedAmount && parseFloat(savedAmount) > 0 && (
                    <div className="inline-flex items-center gap-1 text-xs font-medium text-success
                                    bg-success/10 px-2.5 py-1 rounded-full mt-2">
                        <Zap className="h-3 w-3" />
                        Ahorras ${savedAmount}
                    </div>
                )}

                {/* Divider */}
                <div className="h-px bg-border my-6" />

                {/* Features List */}
                <div className="space-y-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Incluye:
                    </p>
                    <ul className="space-y-3">
                        {plan.features.map((feature, index) => (
                            <li key={index} className="flex items-start gap-3 group/item">
                                <div className={cn(
                                    "mt-0.5 h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0",
                                    "transition-all duration-300",
                                    isPopular
                                        ? "bg-primary/10 group-hover/item:bg-primary/20"
                                        : "bg-success/10 group-hover/item:bg-success/20"
                                )}>
                                    <Check className={cn(
                                        "h-3 w-3",
                                        isPopular ? "text-primary" : "text-success"
                                    )} />
                                </div>
                                <span className="text-sm text-foreground/80 leading-relaxed
                                               group-hover/item:text-foreground transition-colors">
                                    {feature}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* CTA Button */}
            <div className="p-8 pt-0 mt-auto">
                <Button
                    className={cn(
                        "w-full h-12 text-base font-semibold rounded-xl transition-all duration-300",
                        isPopular && !isCurrent && [
                            "bg-gradient-to-r from-primary to-primary-dark",
                            "hover:shadow-lg hover:shadow-primary/30 hover:scale-[1.02]",
                            "text-white"
                        ],
                        isEnterprise && !isCurrent && [
                            "bg-gradient-to-r from-chart-4 to-chart-4/80",
                            "hover:shadow-lg hover:shadow-chart-4/30",
                            "text-white"
                        ],
                        isCurrent && "bg-success/10 text-success hover:bg-success/20"
                    )}
                    onClick={() => onSubscribe(plan.id)}
                    disabled={isLoading || isCurrent}
                    variant={isCurrent ? "ghost" : isPopular || isEnterprise ? "default" : "outline"}
                    size="lg"
                >
                    {isCurrent ? (
                        <span className="flex items-center gap-2">
                            <Check className="h-4 w-4" />
                            Plan Actual
                        </span>
                    ) : isLoading ? (
                        <span className="flex items-center gap-2">
                            <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            Procesando...
                        </span>
                    ) : isEnterprise ? (
                        "Contactar Ventas"
                    ) : (
                        "Comenzar Ahora"
                    )}
                </Button>

                {/* Secondary Action */}
                {!isCurrent && !isFree && (
                    <p className="text-center text-xs text-muted-foreground mt-3">
                        Prueba gratis por 7 días
                    </p>
                )}
            </div>

            {/* Decorative Elements for Popular Plan */}
            {isPopular && (
                <>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -z-10" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -z-10" />
                </>
            )}
        </div>
    )
}
