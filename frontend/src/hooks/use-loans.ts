import { useState, useEffect, useCallback } from 'react'
import { loansApi } from '@/services/loansApi'
import type { Loan, LoanQueue, CanBorrowResponse } from '@/types/loan'

export function useLoans() {
    const [loans, setLoans] = useState<Loan[]>([])
    const [activeLoans, setActiveLoans] = useState<Loan[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Fetch active loans
    const fetchActiveLoans = useCallback(async () => {
        try {
            setIsLoading(true)
            const data = await loansApi.getActiveLoans()
            // Handle both paginated and non-paginated responses
            const results = (data as any).results || data
            setActiveLoans(Array.isArray(results) ? results : [])
            setError(null)
        } catch (err: any) {
            console.error('Error fetching active loans:', err)
            setError(err.response?.data?.error || 'Error al cargar préstamos activos')
        } finally {
            setIsLoading(false)
        }
    }, [])

    // Fetch all loans
    const fetchAllLoans = useCallback(async () => {
        try {
            setIsLoading(true)
            const data = await loansApi.getMyLoans()
            setLoans(data.results)
            setError(null)
        } catch (err: any) {
            console.error('Error fetching loans:', err)
            setError(err.response?.data?.error || 'Error al cargar préstamos')
        } finally {
            setIsLoading(false)
        }
    }, [])

    // Borrow a book
    const borrowBook = useCallback(async (bookId: number) => {
        try {
            const newLoan = await loansApi.borrowBook(bookId)
            setActiveLoans(prev => [newLoan, ...prev])
            return { success: true, loan: newLoan }
        } catch (err: any) {
            const errorMsg = err.response?.data?.error || 'Error al solicitar préstamo'
            return { success: false, error: errorMsg }
        }
    }, [])

    // Return a book
    const returnBook = useCallback(async (loanId: number) => {
        try {
            await loansApi.returnBook(loanId)
            setActiveLoans(prev => prev.filter(loan => loan.id !== loanId))
            await fetchActiveLoans() // Refresh to get updated data
            return { success: true }
        } catch (err: any) {
            const errorMsg = err.response?.data?.error || 'Error al devolver libro'
            return { success: false, error: errorMsg }
        }
    }, [fetchActiveLoans])

    // Renew a loan
    const renewLoan = useCallback(async (loanId: number) => {
        try {
            const renewedLoan = await loansApi.renewLoan(loanId)
            setActiveLoans(prev =>
                prev.map(loan => loan.id === loanId ? renewedLoan : loan)
            )
            return { success: true, loan: renewedLoan }
        } catch (err: any) {
            const errorMsg = err.response?.data?.error || 'Error al renovar préstamo'
            return { success: false, error: errorMsg }
        }
    }, [])

    // Check if can borrow
    const checkCanBorrow = useCallback(async (bookId: number): Promise<CanBorrowResponse> => {
        try {
            return await loansApi.canBorrow(bookId)
        } catch (err: any) {
            return {
                can_borrow: false,
                reason: 'Error al verificar disponibilidad'
            }
        }
    }, [])

    // Join queue
    const joinQueue = useCallback(async (bookId: number) => {
        try {
            const queueEntry = await loansApi.joinQueue(bookId)
            return { success: true, queueEntry }
        } catch (err: any) {
            const errorMsg = err.response?.data?.error || 'Error al unirse a la cola'
            return { success: false, error: errorMsg }
        }
    }, [])

    // Initial fetch
    useEffect(() => {
        fetchActiveLoans()
    }, [fetchActiveLoans])

    return {
        loans,
        activeLoans,
        isLoading,
        error,
        borrowBook,
        returnBook,
        renewLoan,
        checkCanBorrow,
        joinQueue,
        refreshActiveLoans: fetchActiveLoans,
        refreshAllLoans: fetchAllLoans
    }
}
