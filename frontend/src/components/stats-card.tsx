import { LucideIcon } from "lucide-react"
import { memo, useState, useEffect } from "react"
import { TrendingUp, TrendingDown } from "lucide-react"

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

    const trendColor = trend === "up"
        ? "text-emerald-900 dark:text-emerald-300"
        : trend === "down"
            ? "text-red-900 dark:text-red-300"
            : "text-muted-foreground"
    const trendBg = trend === "up"
        ? "bg-emerald-200/80 dark:bg-emerald-900/40"
        : trend === "down"
            ? "bg-red-200/80 dark:bg-red-900/40"
            : "bg-muted"

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
                    <p className="text-sm font-medium text-muted-foreground mb-2 transition-colors group-hover:text-primary">
                        {title}
                    </p>
                    <h3 className="text-3xl font-bold text-foreground mb-2 transition-all duration-300 group-hover:scale-105">
                        {displayedValue.toLocaleString()}
                    </h3>
                    {change !== undefined && (
                        <div className="flex items-center gap-2">
                            <span className={`
                                text-xs font-semibold px-2 py-1 rounded-full
                                ${trendBg} ${trendColor}
                                flex items-center gap-1
                                transition-all duration-300
                                group-hover:scale-105
                            `}>
                                {trend === "up" ? (
                                    <TrendingUp className="h-3 w-3" />
                                ) : trend === "down" ? (
                                    <TrendingDown className="h-3 w-3" />
                                ) : null}
                                {change > 0 ? "+" : ""}{change}%
                            </span>
                            {description && (
                                <span className="text-xs text-muted-foreground">{description}</span>
                            )}
                        </div>
                    )}
                </div>
                <div className="
                    h-14 w-14 rounded-xl
                    bg-gradient-to-br from-primary to-primary-dark
                    flex items-center justify-center
                    shadow-lg shadow-primary/30
                    transition-all duration-300
                    group-hover:shadow-2xl group-hover:shadow-primary/40
                    group-hover:scale-110 group-hover:rotate-3
                ">
                    <Icon className="h-7 w-7 text-white transition-transform duration-300 group-hover:scale-110" />
                </div>
            </div>

            {/* Bottom accent line */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary-dark to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
    )
})
