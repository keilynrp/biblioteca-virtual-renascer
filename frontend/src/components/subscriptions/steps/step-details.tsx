"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { PlanData } from "../types"

interface StepDetailsProps {
    data: PlanData
    onChange: (data: Partial<PlanData>) => void
}

export function StepDetails({ data, onChange }: StepDetailsProps) {
    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Plan Name</Label>
                <Input
                    id="name"
                    placeholder="e.g. Premium Plan"
                    value={data.name}
                    onChange={(e) => onChange({ name: e.target.value })}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    placeholder="Brief description of the plan..."
                    value={data.description}
                    onChange={(e) => onChange({ description: e.target.value })}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="price">Price ($)</Label>
                    <Input
                        id="price"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={data.price}
                        onChange={(e) => onChange({ price: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="duration">Duration (Days)</Label>
                    <Input
                        id="duration"
                        type="number"
                        min="1"
                        placeholder="30"
                        value={data.duration_days}
                        onChange={(e) => onChange({ duration_days: parseInt(e.target.value) || 0 })}
                    />
                </div>
            </div>
        </div>
    )
}
