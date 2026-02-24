import api from '@/lib/api'
import type { BillingProfile, StoredPaymentMethod, Invoice, InvoiceSummary, SetupIntentResponse, RefundRequest } from '@/types/billing'
import { useAuthStore } from '@/store/authStore'

export const billingApi = {
    getProfile(): Promise<BillingProfile> {
        return api.get('/billing/profile/').then(r => r.data)
    },

    updateProfile(data: Partial<BillingProfile>): Promise<BillingProfile> {
        return api.put('/billing/profile/', data).then(r => r.data)
    },

    createSetupIntent(): Promise<SetupIntentResponse> {
        return api.post('/billing/setup-intent/').then(r => r.data)
    },

    getPaymentMethods(): Promise<StoredPaymentMethod[]> {
        return api.get('/billing/payment-methods/').then(r => r.data)
    },

    deletePaymentMethod(id: string): Promise<void> {
        return api.delete(`/billing/payment-methods/${id}/`).then(() => undefined)
    },

    setDefaultPaymentMethod(id: string): Promise<StoredPaymentMethod> {
        return api.post(`/billing/payment-methods/${id}/set-default/`).then(r => r.data)
    },

    getInvoices(params?: { status?: string; search?: string }): Promise<Invoice[]> {
        return api.get('/billing/invoices/', { params }).then(r => r.data)
    },

    getInvoiceSummary(): Promise<InvoiceSummary> {
        return api.get('/billing/invoices/summary/').then(r => r.data)
    },

    getInvoiceDownloadUrl(id: string): string {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
        const { accessToken } = useAuthStore.getState()
        return `${baseUrl}/billing/invoices/${id}/download/?token=${accessToken}`
    },

    refundInvoice(id: string, data: RefundRequest): Promise<Invoice> {
        return api.post(`/billing/invoices/${id}/refund/`, data).then(r => r.data)
    },
}
