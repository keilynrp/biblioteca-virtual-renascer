"use client"

import { useState } from 'react'
import Link from 'next/link'
import { PageHeader } from '@/components/page-header'
import { LoanCard } from '@/components/loans/loan-card'
import { useLoans } from '@/hooks/use-loans'
import { userToast } from '@/lib/toast-utils'
import { useToast } from '@/hooks/use-toast'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BookOpen, Clock, CheckCircle, AlertCircle } from 'lucide-react'

export default function MyLoansPage() {
    const { activeLoans, isLoading, returnBook, renewLoan, refreshActiveLoans } = useLoans()
    const { toast } = useToast()
    const [processingLoanId, setProcessingLoanId] = useState<number | null>(null)

    const handleReturn = async (loanId: number) => {
        setProcessingLoanId(loanId)
        const result = await returnBook(loanId)

        if (result.success) {
            toast({
                title: 'Libro devuelto',
                description: 'El libro ha sido devuelto exitosamente.',
            })
            refreshActiveLoans()
        } else {
            toast({
                title: 'Error al devolver',
                description: result.error,
                variant: 'destructive'
            })
        }
        setProcessingLoanId(null)
    }

    const handleRenew = async (loanId: number) => {
        setProcessingLoanId(loanId)
        const result = await renewLoan(loanId)

        if (result.success) {
            toast({
                title: '¡Préstamo renovado!',
                description: `Nueva fecha de vencimiento: ${new Date(result.loan!.due_date).toLocaleDateString('es')}`,
            })
        } else {
            toast({
                title: 'Error al renovar',
                description: result.error,
                variant: 'destructive'
            })
        }
        setProcessingLoanId(null)
    }

    // Ensure activeLoans is always an array
    const loans = Array.isArray(activeLoans) ? activeLoans : []

    const overdueLoans = loans.filter(loan => loan.is_overdue)
    const dueSoonLoans = loans.filter(loan => {
        if (loan.is_overdue) return false
        const daysUntilDue = Math.ceil(
            (new Date(loan.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        )
        return daysUntilDue <= 3
    })
    const activeNormalLoans = loans.filter(loan => {
        if (loan.is_overdue) return false
        const daysUntilDue = Math.ceil(
            (new Date(loan.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        )
        return daysUntilDue > 3
    })

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-5">
                <PageHeader
                    title="Mis Préstamos"
                    description="Gestiona tus libros prestados"
                />
                <div className="flex items-center justify-center py-12">
                    <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-5">
            <PageHeader
                title="Mis Préstamos"
                description="Gestiona tus libros prestados"
            />

            {loans.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="rounded-full bg-muted p-6 mb-4">
                        <BookOpen className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No tienes préstamos activos</h3>
                    <p className="text-muted-foreground mb-4">
                        Explora nuestra biblioteca y solicita libros prestados
                    </p>
                    <Link
                        href="/library"
                        className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                    >
                        Ir a la Biblioteca
                    </Link>
                </div>
            ) : (
                <Tabs defaultValue="all" className="w-full">
                    <TabsList className="grid w-full grid-cols-4 mb-6">
                        <TabsTrigger value="all" className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4" />
                            Todos ({loans.length})
                        </TabsTrigger>
                        <TabsTrigger value="overdue" className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            Vencidos ({overdueLoans.length})
                        </TabsTrigger>
                        <TabsTrigger value="due-soon" className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Por Vencer ({dueSoonLoans.length})
                        </TabsTrigger>
                        <TabsTrigger value="active" className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            Activos ({activeNormalLoans.length})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="all" className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {loans.map(loan => (
                                <LoanCard
                                    key={loan.id}
                                    loan={loan}
                                    onReturn={handleReturn}
                                    onRenew={handleRenew}
                                />
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="overdue" className="space-y-4">
                        {overdueLoans.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                No tienes préstamos vencidos
                            </div>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {overdueLoans.map(loan => (
                                    <LoanCard
                                        key={loan.id}
                                        loan={loan}
                                        onReturn={handleReturn}
                                        onRenew={handleRenew}
                                    />
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="due-soon" className="space-y-4">
                        {dueSoonLoans.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                No tienes préstamos próximos a vencer
                            </div>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {dueSoonLoans.map(loan => (
                                    <LoanCard
                                        key={loan.id}
                                        loan={loan}
                                        onReturn={handleReturn}
                                        onRenew={handleRenew}
                                    />
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="active" className="space-y-4">
                        {activeNormalLoans.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                No tienes otros préstamos activos
                            </div>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {activeNormalLoans.map(loan => (
                                    <LoanCard
                                        key={loan.id}
                                        loan={loan}
                                        onReturn={handleReturn}
                                        onRenew={handleRenew}
                                    />
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            )}
        </div>
    )
}
