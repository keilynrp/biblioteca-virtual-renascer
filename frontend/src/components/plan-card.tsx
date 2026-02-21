"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Check, Crown, Sparkles, Zap, Star, Plus, X, Save, Trash2, RotateCcw, User, Building2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useCurrency } from "@/context/currency-context"

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
    isEditMode?: boolean
    onSave?: (id: number, data: Partial<Plan>) => Promise<void>
    onDelete?: (id: number) => Promise<void>
}

export function PlanCard({
    plan,
    onSubscribe,
    isLoading,
    isCurrent,
    isAnnual,
    isEditMode = false,
    onSave,
    onDelete,
}: PlanCardProps) {
    const isPopular = plan.name.toLowerCase().includes("premium") ||
                      plan.name.toLowerCase().includes("pro") ||
                      plan.plan_type === "premium"

    const isEnterprise = plan.name.toLowerCase().includes("enterprise") ||
                         plan.name.toLowerCase().includes("institucional") ||
                         plan.plan_type === "institutional"

    const isFree = plan.name.toLowerCase().includes("free") ||
                   plan.name.toLowerCase().includes("básico") ||
                   parseFloat(plan.price) === 0

    // Calculate annual price with discount (17% off = pay for 10 months, get 12)
    const monthlyPrice = parseFloat(plan.price)
    const annualFullPrice = monthlyPrice * 12
    const annualDiscountedPrice = monthlyPrice * 10 // 17% discount
    const displayPrice = isAnnual ? annualDiscountedPrice.toFixed(2) : plan.price
    const savedAmount = isAnnual ? (annualFullPrice - annualDiscountedPrice).toFixed(2) : null

    // Edit state
    const [isEditing, setIsEditing] = useState(false)
    const [draft, setDraft] = useState<Plan>({ ...plan })
    const [isSaving, setIsSaving] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [confirmDelete, setConfirmDelete] = useState(false)
    const confirmTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    // Reset editing state when edit mode is turned off globally
    useEffect(() => {
        if (!isEditMode) {
            setIsEditing(false)
            setDraft({ ...plan })
            setConfirmDelete(false)
            if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current)
        }
    }, [isEditMode])

    // Keep draft in sync when plan data changes externally (after save)
    useEffect(() => {
        if (!isEditing) {
            setDraft({ ...plan })
        }
    }, [plan, isEditing])

    const handleCardClick = () => {
        if (isEditMode && !isEditing) {
            setIsEditing(true)
        }
    }

    const handleSave = async () => {
        if (!onSave) return
        setIsSaving(true)
        try {
            await onSave(plan.id, draft)
            setIsEditing(false)
        } finally {
            setIsSaving(false)
        }
    }

    const handleCancel = () => {
        setDraft({ ...plan })
        setIsEditing(false)
    }

    const handleDeleteClick = () => {
        if (!onDelete) return
        if (confirmDelete) {
            // Second click — execute delete
            if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current)
            setIsDeleting(true)
            onDelete(plan.id).finally(() => setIsDeleting(false))
        } else {
            setConfirmDelete(true)
            confirmTimerRef.current = setTimeout(() => setConfirmDelete(false), 3000)
        }
    }

    const updateFeature = (index: number, value: string) => {
        setDraft(prev => {
            const features = [...prev.features]
            features[index] = value
            return { ...prev, features }
        })
    }

    const addFeature = () => {
        setDraft(prev => ({ ...prev, features: [...prev.features, ""] }))
    }

    const removeFeature = (index: number) => {
        setDraft(prev => ({
            ...prev,
            features: prev.features.filter((_, i) => i !== index),
        }))
    }

    const { symbol } = useCurrency()

    const editingCardPrice = isEditing ? draft.price : displayPrice

    return (
        <div
            className={cn(
                "group relative flex flex-col rounded-2xl transition-all duration-500",
                "bg-card border border-border/50",
                // Normal mode hover
                !isEditMode && "cursor-pointer hover:border-primary/30 hover:-translate-y-2 hover:shadow-2xl",
                // Popular / current styles (only in view mode)
                !isEditMode && isPopular && !isCurrent && [
                    "border-primary/50 shadow-xl shadow-primary/10",
                    "bg-gradient-to-b from-primary/[0.03] to-transparent",
                    "scale-[1.02] z-10"
                ],
                !isEditMode && isCurrent && "border-success/50 shadow-lg shadow-success/10",
                !isEditMode && isEnterprise && "border-chart-4/30",
                // Edit mode styles
                isEditMode && !isEditing && "cursor-pointer hover:border-primary/40",
                isEditMode && isEditing && "border-primary ring-2 ring-primary/20 cursor-default",
            )}
            onClick={handleCardClick}
        >
            {/* Click-to-edit overlay (edit mode, not yet editing) */}
            {isEditMode && !isEditing && (
                <div className="absolute inset-0 rounded-2xl z-10 flex items-center justify-center
                                bg-background/60 backdrop-blur-[1px] opacity-0 hover:opacity-100
                                transition-opacity duration-200 pointer-events-none">
                    <span className="text-sm font-medium text-primary bg-primary/10 px-4 py-2 rounded-full">
                        Haz clic para editar
                    </span>
                </div>
            )}

            {/* Popular Badge (view mode only) */}
            {!isEditMode && isPopular && !isCurrent && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                    <div className="flex items-center gap-1.5 bg-gradient-to-r from-primary to-primary-dark
                                    text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg
                                    shadow-primary/30 animate-pulse">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Recomendado</span>
                    </div>
                </div>
            )}

            {/* Current Plan Badge (view mode only) */}
            {!isEditMode && isCurrent && (
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
                !isEditMode && (isPopular || isCurrent) && "pt-10"
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

                {/* Plan Type Badge (view mode only) */}
                {!isEditMode && plan.plan_type && (
                    <div className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium mb-3",
                        plan.plan_type === 'INSTITUTIONAL'
                            ? "bg-chart-4/10 text-chart-4"
                            : "bg-primary/10 text-primary"
                    )}>
                        {plan.plan_type === 'INSTITUTIONAL' ? (
                            <Building2 className="h-3.5 w-3.5" />
                        ) : (
                            <User className="h-3.5 w-3.5" />
                        )}
                        {plan.plan_type === 'INSTITUTIONAL' ? 'Institucional' : 'Individual'}
                    </div>
                )}

                {/* Plan Name */}
                {isEditing ? (
                    <input
                        type="text"
                        value={draft.name}
                        onChange={e => setDraft(prev => ({ ...prev, name: e.target.value }))}
                        onClick={e => e.stopPropagation()}
                        className="w-full text-xl font-bold text-foreground mb-2 bg-muted/50
                                   border border-border rounded-lg px-3 py-1.5 focus:outline-none
                                   focus:ring-2 focus:ring-primary/40"
                    />
                ) : (
                    <h3 className="text-xl font-bold text-foreground mb-2">{plan.name}</h3>
                )}

                {/* Description */}
                {isEditing ? (
                    <textarea
                        value={draft.description}
                        onChange={e => setDraft(prev => ({ ...prev, description: e.target.value }))}
                        onClick={e => e.stopPropagation()}
                        rows={2}
                        className="w-full text-sm text-muted-foreground leading-relaxed bg-muted/50
                                   border border-border rounded-lg px-3 py-1.5 resize-none
                                   focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                ) : (
                    <p className="text-muted-foreground text-sm leading-relaxed">{plan.description}</p>
                )}
            </div>

            {/* Pricing */}
            <div className="p-8 pt-6">
                <div className="flex items-end gap-2 mb-1">
                    {isEditing ? (
                        <div className="flex items-end gap-2">
                            <div className="flex items-end gap-1">
                                <span className="text-4xl font-bold text-foreground">{symbol}</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={draft.price}
                                    onChange={e => setDraft(prev => ({ ...prev, price: e.target.value }))}
                                    onClick={e => e.stopPropagation()}
                                    className="w-32 text-3xl font-bold text-foreground bg-muted/50
                                               border border-border rounded-lg px-3 py-1 focus:outline-none
                                               focus:ring-2 focus:ring-primary/40"
                                />
                            </div>
                            <span className="text-muted-foreground text-sm mb-2">/mes</span>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-end gap-1">
                                <span className={cn(
                                    "text-4xl font-bold",
                                    isPopular ? "text-primary" : "text-foreground"
                                )}>
                                    {symbol}
                                </span>
                                <span className={cn(
                                    "text-5xl font-bold tracking-tight",
                                    isPopular ? "text-primary" : "text-foreground"
                                )}>
                                    {editingCardPrice}
                                </span>
                            </div>
                            <span className="text-muted-foreground text-sm mb-2">
                                {isAnnual ? "/año" : "/mes"}
                            </span>
                        </>
                    )}
                </div>

                {/* Duration (edit mode) */}
                {isEditing && (
                    <div className="flex items-center gap-2 mt-3">
                        <label className="text-xs text-muted-foreground">Duración (días):</label>
                        <input
                            type="number"
                            min="1"
                            value={draft.duration_days}
                            onChange={e => setDraft(prev => ({ ...prev, duration_days: Number(e.target.value) }))}
                            onClick={e => e.stopPropagation()}
                            className="w-24 text-sm bg-muted/50 border border-border rounded-lg
                                       px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary/40"
                        />
                    </div>
                )}

                {/* Savings Badge (view mode) */}
                {!isEditing && isAnnual && savedAmount && parseFloat(savedAmount) > 0 && (
                    <div className="inline-flex items-center gap-1 text-xs font-medium text-success
                                    bg-success/10 px-2.5 py-1 rounded-full mt-2">
                        <Zap className="h-3 w-3" />
                        Ahorras {symbol}{savedAmount}
                    </div>
                )}

                {/* Divider */}
                <div className="h-px bg-border my-6" />

                {/* Features List */}
                <div className="space-y-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Incluye:
                    </p>

                    {isEditing ? (
                        <ul className="space-y-2">
                            {draft.features.map((feature, index) => (
                                <li key={index} className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={feature}
                                        onChange={e => updateFeature(index, e.target.value)}
                                        onClick={e => e.stopPropagation()}
                                        className="flex-1 text-sm bg-muted/50 border border-border rounded-lg
                                                   px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary/40"
                                    />
                                    <button
                                        onClick={e => { e.stopPropagation(); removeFeature(index) }}
                                        className="flex-shrink-0 h-6 w-6 flex items-center justify-center
                                                   rounded-full text-destructive hover:bg-destructive/10
                                                   transition-colors"
                                        aria-label="Eliminar feature"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                </li>
                            ))}
                            <li>
                                <button
                                    onClick={e => { e.stopPropagation(); addFeature() }}
                                    className="flex items-center gap-1.5 text-xs text-primary
                                               hover:text-primary/80 transition-colors mt-1"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                    Añadir feature
                                </button>
                            </li>
                        </ul>
                    ) : (
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
                    )}
                </div>
            </div>

            {/* CTA / Edit Actions */}
            <div className="p-8 pt-0 mt-auto">
                {isEditing ? (
                    <div className="flex flex-col gap-2">
                        {/* Save */}
                        <Button
                            className="w-full h-10 font-semibold rounded-xl gap-2"
                            onClick={e => { e.stopPropagation(); handleSave() }}
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <Save className="h-4 w-4" />
                            )}
                            {isSaving ? "Guardando..." : "Guardar"}
                        </Button>

                        {/* Cancel */}
                        <Button
                            variant="outline"
                            className="w-full h-10 font-semibold rounded-xl gap-2"
                            onClick={e => { e.stopPropagation(); handleCancel() }}
                            disabled={isSaving}
                        >
                            <RotateCcw className="h-4 w-4" />
                            Cancelar
                        </Button>

                        {/* Delete (double-confirm) */}
                        <Button
                            variant="destructive"
                            className="w-full h-10 font-semibold rounded-xl gap-2"
                            onClick={e => { e.stopPropagation(); handleDeleteClick() }}
                            disabled={isDeleting}
                        >
                            {isDeleting ? (
                                <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <Trash2 className="h-4 w-4" />
                            )}
                            {isDeleting ? "Eliminando..." : confirmDelete ? "¿Confirmar?" : "Eliminar"}
                        </Button>
                    </div>
                ) : (
                    <>
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
                            onClick={() => !isEditMode && onSubscribe(plan.id)}
                            disabled={isLoading || isCurrent || isEditMode}
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
                            ) : isEnterprise || plan.plan_type === 'INSTITUTIONAL' ? (
                                "Para Instituciones"
                            ) : (
                                "Comenzar Ahora"
                            )}
                        </Button>

                        {/* Secondary Action */}
                        {!isCurrent && !isFree && !isEditMode && (
                            <p className="text-center text-xs text-muted-foreground mt-3">
                                Prueba gratis por 7 días
                            </p>
                        )}
                    </>
                )}
            </div>

            {/* Decorative Elements for Popular Plan (view mode only) */}
            {!isEditMode && isPopular && (
                <>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -z-10" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -z-10" />
                </>
            )}
        </div>
    )
}
