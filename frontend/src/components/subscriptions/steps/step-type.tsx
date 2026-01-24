"use client"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { User, Building2 } from "lucide-react"

interface StepTypeProps {
    value: 'INDIVIDUAL' | 'INSTITUTIONAL'
    onChange: (value: 'INDIVIDUAL' | 'INSTITUTIONAL') => void
}

export function StepType({ value, onChange }: StepTypeProps) {
    return (
        <RadioGroup value={value} onValueChange={(val) => onChange(val as any)} className="grid grid-cols-2 gap-4">
            <div>
                <RadioGroupItem value="INDIVIDUAL" id="individual" className="peer sr-only" />
                <Label
                    htmlFor="individual"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                    <User className="mb-3 h-6 w-6" />
                    Individual
                </Label>
            </div>
            <div>
                <RadioGroupItem value="INSTITUTIONAL" id="institutional" className="peer sr-only" />
                <Label
                    htmlFor="institutional"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                    <Building2 className="mb-3 h-6 w-6" />
                    Institutional
                </Label>
            </div>
        </RadioGroup>
    )
}
