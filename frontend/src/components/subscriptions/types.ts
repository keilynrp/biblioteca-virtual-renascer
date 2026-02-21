export type PlanData = {
    plan_type: 'INDIVIDUAL' | 'INSTITUTIONAL'
    name: string
    description: string
    price: string
    duration_days: number
    features: string[]
}
