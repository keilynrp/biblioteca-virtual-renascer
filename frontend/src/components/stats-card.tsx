import { LucideIcon } from "lucide-react"
import { memo, useState, useEffect } from "react"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"

interface StatsCardProps {
    title: string
    value: string | number
    change?: number
    icon: LucideIcon
    trend?: "up" | "down"
    description?: string
}

export const StatsCard = memo(function StatsCard({ title, value, change, icon: Icon, trend, description }: StatsCardProps) {
    const [isVisible, setIsVisible] = useState(false)
    const [displayValue, setDisplayValue] = useState(0)

    useEffect(() => {
        setIsVisible(true)

        // Animate number counting
        if (typeof value === 'number') {
            const duration = 1500
            const steps = 60
            const increment = value / steps
            let current = 0

            const timer = setInterval(() => {
                current += increment
                if (current >= value) {
                    setDisplayValue(value)
                    clearInterval(timer)
                } else {
                    setDisplayValue(Math.floor(current))
                }
            }, duration / steps)

            return () => clearInterval(timer)
        }
    }, [value])

    const displayedValue = typeof value === 'number' ? displayValue : value

    return (
        <div
            className={`
                bg-card rounded-xl border border-border p-6
                shadow-sm hover:shadow-xl hover:-translate-y-1
                transition-all duration-300 cursor-pointer
                group overflow-hidden relative
                ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
            `}
        >
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary-dark/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="relative flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="
                            h-11 w-11 rounded-full
                            bg-primary/10 dark:bg-primary/20
                            flex items-center justify-center
                            transition-all duration-300
                            group-hover:bg-primary/20 dark:group-hover:bg-primary/30
                        ">
                            <Icon className="h-5 w-5 text-primary" />
                        </div>
                    </div>

                    <h3 className="text-3xl font-bold text-foreground mb-1 transition-all duration-300 group-hover:scale-105 origin-left">
                        {displayedValue.toLocaleString()}
                    </h3>

                    <p className="text-sm font-medium text-muted-foreground mb-3 transition-colors group-hover:text-foreground/70">
                        {title}
                    </p>

                    {change !== undefined && (
                        <div className="flex items-center gap-2">
                            {/* TailAdmin-style trend badge */}
                            <span className={`
                                inline-flex items-center gap-0.5 text-sm font-medium
                                ${trend === "up"
                                    ? "text-emerald-600 dark:text-emerald-400"
                                    : trend === "down"
                                        ? "text-rose-600 dark:text-rose-400"
                                        : "text-muted-foreground"
                                }
                            `}>
                                {trend === "up" ? (
                                    <ArrowUpRight className="h-4 w-4" strokeWidth={2.5} />
                                ) : trend === "down" ? (
                                    <ArrowDownRight className="h-4 w-4" strokeWidth={2.5} />
                                ) : null}
                                {Math.abs(change)}%
                            </span>
                            {description && (
                                <span className="text-sm text-muted-foreground">{description}</span>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom accent line */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary-dark to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
    )
})

