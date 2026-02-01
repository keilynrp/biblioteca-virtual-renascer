"use client"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { User, Building2, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface StepTypeProps {
    value: 'INDIVIDUAL' | 'INSTITUTIONAL'
    onChange: (value: 'INDIVIDUAL' | 'INSTITUTIONAL') => void
}

export function StepType({ value, onChange }: StepTypeProps) {
    return (
        <RadioGroup value={value} onValueChange={(val) => onChange(val as 'INDIVIDUAL' | 'INSTITUTIONAL')} className="grid grid-cols-2 gap-4">
            <div className="relative">
                <RadioGroupItem value="INDIVIDUAL" id="individual" className="peer sr-only" />
                <Label
                    htmlFor="individual"
                    className={cn(
                        "flex flex-col items-center justify-between rounded-md border-2 bg-popover p-6 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-all relative",
                        value === "INDIVIDUAL"
                            ? "border-primary bg-primary/5"
                            : "border-muted"
                    )}
                >
                    {value === "INDIVIDUAL" && (
                        <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                            <Check className="h-3 w-3 text-primary-foreground" />
                        </div>
                    )}
                    <User className="mb-3 h-8 w-8" />
                    <span className="font-medium">Individual</span>
                </Label>
            </div>
            <div className="relative">
                <RadioGroupItem value="INSTITUTIONAL" id="institutional" className="peer sr-only" />
                <Label
                    htmlFor="institutional"
                    className={cn(
                        "flex flex-col items-center justify-between rounded-md border-2 bg-popover p-6 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-all relative",
                        value === "INSTITUTIONAL"
                            ? "border-primary bg-primary/5"
                            : "border-muted"
                    )}
                >
                    {value === "INSTITUTIONAL" && (
                        <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                            <Check className="h-3 w-3 text-primary-foreground" />
                        </div>
                    )}
                    <Building2 className="mb-3 h-8 w-8" />
                    <span className="font-medium">Institutional</span>
                </Label>
            </div>
        </RadioGroup>
    )
}
