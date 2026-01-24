"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus, X, Check } from "lucide-react"

interface StepFeaturesProps {
    features: string[]
    onChange: (features: string[]) => void
}

export function StepFeatures({ features, onChange }: StepFeaturesProps) {
    const [newFeature, setNewFeature] = useState("")

    const addFeature = () => {
        if (newFeature.trim()) {
            onChange([...features, newFeature.trim()])
            setNewFeature("")
        }
    }

    const removeFeature = (index: number) => {
        const newFeatures = [...features]
        newFeatures.splice(index, 1)
        onChange(newFeatures)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            addFeature()
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex gap-2">
                <Input
                    placeholder="Add a feature (e.g. 'Unlimited Access')"
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
                <Button onClick={addFeature} variant="secondary">
                    <Plus className="h-4 w-4" />
                </Button>
            </div>

            <div className="space-y-2">
                {features.length === 0 && (
                    <p className="text-center text-sm text-muted-foreground py-4">
                        No features added yet.
                    </p>
                )}
                {features.map((feature, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-md group">
                        <div className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            <span>{feature}</span>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFeature(index)}
                            className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    )
}
