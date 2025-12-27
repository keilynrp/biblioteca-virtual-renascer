import { LucideIcon } from "lucide-react"

interface StatsCardProps {
    title: string
    value: string | number
    change?: number
    icon: LucideIcon
    trend?: "up" | "down"
    description?: string
}

export function StatsCard({ title, value, change, icon: Icon, trend, description }: StatsCardProps) {
    const trendColor = trend === "up" ? "text-success" : trend === "down" ? "text-danger" : "text-muted-foreground"
    const trendBg = trend === "up" ? "bg-success/10" : trend === "down" ? "bg-danger/10" : "bg-muted"

    return (
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
                    <h3 className="text-3xl font-bold text-foreground mb-2">{value}</h3>
                    {change !== undefined && (
                        <div className="flex items-center space-x-2">
                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${trendBg} ${trendColor}`}>
                                {change > 0 ? "+" : ""}{change}%
                            </span>
                            {description && (
                                <span className="text-xs text-muted-foreground">{description}</span>
                            )}
                        </div>
                    )}
                </div>
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-lg shadow-primary/30">
                    <Icon className="h-6 w-6 text-white" />
                </div>
            </div>
        </div>
    )
}
