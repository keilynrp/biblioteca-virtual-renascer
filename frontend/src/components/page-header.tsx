import { ReactNode } from "react"

interface PageHeaderProps {
    title: string
    description?: string
    actions?: ReactNode
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
    return (
        <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
                <h1 className="text-3xl font-bold text-foreground">{title}</h1>
                {actions && <div className="flex items-center space-x-3">{actions}</div>}
            </div>
            {description && (
                <p className="text-muted-foreground">{description}</p>
            )}
        </div>
    )
}
