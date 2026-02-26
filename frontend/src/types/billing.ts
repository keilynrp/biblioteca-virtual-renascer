export interface BillingProfile {
    id: number
    stripe_customer_id: string | null
    full_name: string
    email: string
    address_line1: string
    address_line2: string
    city: string
    state: string
    postal_code: string
    country: string
    vat_number: string
    created_at: string
    updated_at: string
}

export interface StoredPaymentMethod {
    id: string
    stripe_pm_id: string
    brand: string
    last4: string
    exp_month: number | null
    exp_year: number | null
    is_default: boolean
    created_at: string
}

export interface Invoice {
    id: string
    invoice_number: string
    status: 'PAID' | 'REFUNDED' | 'VOID'
    amount: string
    currency: string
    description: string
    billing_name: string
    billing_address: string
    stripe_refund_id: string | null
    issued_at: string
    refunded_at: string | null
    plan_name: string | null
}

export interface InvoiceSummary {
    total_paid: string
    total_refunded: string
    invoice_count: number
}

export interface SetupIntentResponse {
    client_secret: string
}

export interface RefundRequest {
    amount?: number
    reason: string
}

export interface AdminInvoice extends Invoice {
    customer_name: string
    customer_email: string
}

export interface AdminInvoiceSummary {
    total_paid: string
    total_refunded: string
    total_void: string
    invoice_count: number
    paid_count: number
    refunded_count: number
    void_count: number
}

export interface PaginatedResponse<T> {
    count: number
    next: string | null
    previous: string | null
    results: T[]
}
