"use client"

import { useState } from "react"
import { useRouter } from "@/i18n/routing"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { Check, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"

// Import steps
import { StepType } from "./steps/step-type"
import { StepDetails } from "./steps/step-details"
import { StepFeatures } from "./steps/step-features"
import { StepReview } from "./steps/step-review"

import type { PlanData } from "./types"

const INITIAL_DATA: PlanData = {
    plan_type: 'INDIVIDUAL',
    name: '',
    description: '',
    price: '',
    duration_days: 30,
    features: []
}

const STEPS = [
    { id: 'type', title: 'Tipo de Plan' },
    { id: 'details', title: 'Detalles y Precio' },
    { id: 'features', title: 'Características' },
    { id: 'review', title: 'Revisión' },
]

export function PlanWizard() {
    const router = useRouter()
    const [currentStep, setCurrentStep] = useState(0)
    const [data, setData] = useState<PlanData>(INITIAL_DATA)
    const [loading, setLoading] = useState(false)

    const updateData = (newData: Partial<PlanData>) => {
        setData(prev => ({ ...prev, ...newData }))
    }

    const nextStep = () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(prev => prev + 1)
        }
    }

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1)
        }
    }

    const handleSubmit = async () => {
        setLoading(true)
        try {
            await api.post('/subscriptions/plans/', data)
            toast({
                title: "Plan creado",
                description: "El plan fue creado exitosamente.",
            })
            router.push('/plans')
        } catch (error) {
            console.error("Error al crear el plan", error)
            toast({
                title: "Error",
                description: "No se pudo crear el plan. Inténtalo de nuevo.",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto">
            {/* Stepper */}
            <div className="mb-8">
                <div className="flex justify-between items-center relative">
                    <div className="absolute left-0 top-1/2 w-full h-0.5 bg-gray-200 -z-10" />
                    {STEPS.map((step, index) => {
                        const isCompleted = index < currentStep
                        const isCurrent = index === currentStep
                        return (
                            <div key={step.id} className="flex flex-col items-center bg-background px-2">
                                <div className={`
                                    w-8 h-8 rounded-full flex items-center justify-center border-2 mb-2 transition-colors
                                    ${isCompleted || isCurrent
                                        ? "border-primary bg-primary text-primary-foreground"
                                        : "border-gray-300 text-gray-400"
                                    }
                                `}>
                                    {isCompleted ? <Check className="h-4 w-4" /> : <span>{index + 1}</span>}
                                </div>
                                <span className={`text-xs font-medium ${isCurrent ? "text-primary" : "text-muted-foreground"}`}>
                                    {step.title}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{STEPS[currentStep].title}</CardTitle>
                </CardHeader>
                <CardContent>
                    {currentStep === 0 && (
                        <StepType value={data.plan_type} onChange={(val) => updateData({ plan_type: val })} />
                    )}
                    {currentStep === 1 && (
                        <StepDetails
                            data={data}
                            onChange={updateData}
                        />
                    )}
                    {currentStep === 2 && (
                        <StepFeatures
                            features={data.features}
                            onChange={(features) => updateData({ features })}
                        />
                    )}
                    {currentStep === 3 && (
                        <StepReview data={data} />
                    )}
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Button
                        variant="outline"
                        onClick={prevStep}
                        disabled={currentStep === 0 || loading}
                    >
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Atrás
                    </Button>

                    {currentStep === STEPS.length - 1 ? (
                        <Button onClick={handleSubmit} disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Crear Plan
                        </Button>
                    ) : (
                        <Button onClick={nextStep}>
                            Siguiente
                            <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    )
}
