import api from '@/lib/api'
import type { Loan, LoanQueue, CanBorrowResponse } from '@/types/loan'

const BASE_URL = '/loans'

export const loansApi = {
    /**
     * Get all loans for the current user
     */
    getMyLoans: async (params?: { page?: number; page_size?: number }) => {
        const response = await api.get<{
            count: number
            results: Loan[]
        }>(`${BASE_URL}/`, { params })
        return response.data
    },

    /**
     * Get active loans only
     */
    getActiveLoans: async () => {
        const response = await api.get<Loan[]>(`${BASE_URL}/active/`)
        return response.data
    },

    /**
     * Get loan history (returned loans)
     */
    getLoanHistory: async (params?: { page?: number; page_size?: number }) => {
        const response = await api.get<{
            count: number
            results: Loan[]
        }>(`${BASE_URL}/history/`, { params })
        return response.data
    },

    /**
     * Get overdue loans
     */
    getOverdueLoans: async () => {
        const response = await api.get<Loan[]>(`${BASE_URL}/overdue/`)
        return response.data
    },

    /**
     * Create a new loan (borrow a book)
     */
    borrowBook: async (bookId: number) => {
        const response = await api.post<Loan>(`${BASE_URL}/`, { book: bookId })
        return response.data
    },

    /**
     * Return a borrowed book
     */
    returnBook: async (loanId: number) => {
        const response = await api.patch<Loan>(`${BASE_URL}/${loanId}/return_loan/`)
        return response.data
    },

    /**
     * Renew a loan
     */
    renewLoan: async (loanId: number) => {
        const response = await api.patch<Loan>(`${BASE_URL}/${loanId}/renew/`)
        return response.data
    },

    /**
     * Check if user can borrow a specific book
     */
    canBorrow: async (bookId: number) => {
        const response = await api.get<CanBorrowResponse>(`${BASE_URL}/can_borrow/`, {
            params: { book_id: bookId }
        })
        return response.data
    },

    /**
     * Join the loan queue for a book
     */
    joinQueue: async (bookId: number) => {
        const response = await api.post<LoanQueue>(`${BASE_URL}/loan-queue/`, { book: bookId })
        return response.data
    },

    /**
     * Get my active reservations
     */
    getMyReservations: async () => {
        const response = await api.get<LoanQueue[]>(`${BASE_URL}/loan-queue/my_reservations/`)
        return response.data
    }
}
