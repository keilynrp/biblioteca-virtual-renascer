"use client"

import { useState, useEffect } from 'react'
import { useLoans } from '@/hooks/use-loans'
import { PageHeader } from '@/components/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
    BookOpen,
    AlertCircle,
    CheckCircle2,
    Clock,
    TrendingUp,
    Calendar,
    BarChart3
} from 'lucide-react'
import { LoanCard } from '@/components/loans/loan-card'
import api from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { PasswordPolicySection } from '@/components/settings/password-policy-section'
import { CurrenciesSection } from '@/components/settings/currencies-section'
import { EmailSection } from '@/components/settings/email-section'

export default function SettingsPage() {
    const { activeLoans, isLoading, returnBook, renewLoan } = useLoans()
    const { toast } = useToast()
    const [userStats, setUserStats] = useState<any>(null)
    const [subscription, setSubscription] = useState<any>(null)
    const [isAdmin, setIsAdmin] = useState(false)

    useEffect(() => {
        // Fetch user subscription
        api.get('/subscriptions/my-subscription/')
            .then(res => setSubscription(res.data))
            .catch(() => setSubscription(null))

        // Fetch user profile to check if admin
        api.get('/auth/user/')
            .then(res => {
                setIsAdmin(res.data.is_staff || res.data.is_superuser || res.data.user_type === 'admin')
            })
            .catch(() => setIsAdmin(false))
    }, [])

    const handleReturn = async (loanId: number) => {
        const result = await returnBook(loanId)
        if (result.success) {
            toast({
                title: 'Libro devuelto',
                description: 'El libro ha sido devuelto exitosamente.',
            })
        } else {
            toast({
                title: 'Error',
                description: result.error,
                variant: 'destructive'
            })
        }
    }

    const handleRenew = async (loanId: number) => {
        const result = await renewLoan(loanId)
        if (result.success) {
            toast({
                title: '¡Renovado!',
                description: `Nueva fecha: ${new Date(result.loan!.due_date).toLocaleDateString('es')}`,
            })
        } else {
            toast({
                title: 'Error',
                description: result.error,
                variant: 'destructive'
            })
        }
    }

    // Calculate loan limits based on subscription
    const isPremium = subscription?.plan?.name === 'Premium'
    const maxLoans = isPremium ? 5 : 2
    const loanDays = isPremium ? 30 : 14

    // Ensure activeLoans is always an array
    const loans = Array.isArray(activeLoans) ? activeLoans : []
    const currentLoans = loans.length
    const remainingLoans = maxLoans - currentLoans

    const overdueCount = loans.filter(l => l.is_overdue).length
    const dueSoonCount = loans.filter(l => {
        if (l.is_overdue) return false
        const days = Math.ceil((new Date(l.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        return days <= 3
    }).length

    return (
        <div className="container mx-auto px-4 py-5">
            <PageHeader
                title="Configuración"
                description="Gestiona tu cuenta y preferencias"
            />

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
                {/* Loan Limits Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Préstamos Disponibles
                        </CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {remainingLoans} / {maxLoans}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {currentLoans} préstamo{currentLoans !== 1 ? 's' : ''} activo{currentLoans !== 1 ? 's' : ''}
                        </p>
                        <Badge variant={isPremium ? "default" : "secondary"} className="mt-2">
                            {isPremium ? 'Premium' : 'Free'}
                        </Badge>
                    </CardContent>
                </Card>

                {/* Overdue Card */}
                <Card className={overdueCount > 0 ? "border-destructive" : ""}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Préstamos Vencidos
                        </CardTitle>
                        <AlertCircle className={`h-4 w-4 ${overdueCount > 0 ? 'text-destructive' : 'text-muted-foreground'}`} />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${overdueCount > 0 ? 'text-destructive' : ''}`}>
                            {overdueCount}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {overdueCount > 0 ? 'Requieren devolución urgente' : 'Todo al día'}
                        </p>
                    </CardContent>
                </Card>

                {/* Due Soon Card */}
                <Card className={dueSoonCount > 0 ? "border-orange-500/50" : ""}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Por Vencer (≤3 días)
                        </CardTitle>
                        <Clock className={`h-4 w-4 ${dueSoonCount > 0 ? 'text-orange-500' : 'text-muted-foreground'}`} />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${dueSoonCount > 0 ? 'text-orange-600' : ''}`}>
                            {dueSoonCount}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {dueSoonCount > 0 ? 'Considera renovar o devolver' : 'Ninguno próximo'}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Separator className="my-8" />

            {/* Loan Limits Information */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Información de Préstamos</h2>
                <Card>
                    <CardContent className="pt-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-muted-foreground" />
                                <span className="font-medium">Duración del Préstamo</span>
                            </div>
                            <Badge variant="outline">{loanDays} días</Badge>
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-muted-foreground" />
                                <span className="font-medium">Renovaciones Máximas</span>
                            </div>
                            <Badge variant="outline">2 veces</Badge>
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5 text-muted-foreground" />
                                <span className="font-medium">Límite de Préstamos Simultáneos</span>
                            </div>
                            <Badge variant="outline">{maxLoans} libros</Badge>
                        </div>

                        {!isPremium && (
                            <>
                                <Separator />
                                <Alert>
                                    <CheckCircle2 className="h-4 w-4" />
                                    <AlertDescription>
                                        Mejora a <strong>Premium</strong> para obtener 5 préstamos simultáneos y 30 días por préstamo.
                                        <a href="/plans" className="block mt-2 text-primary hover:underline">
                                            Ver Planes →
                                        </a>
                                    </AlertDescription>
                                </Alert>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Separator className="my-8" />

            {/* Active Loans Section */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">Tus Préstamos Activos</h2>
                    <a
                        href="/my-loans"
                        className="text-sm text-primary hover:underline"
                    >
                        Ver todos →
                    </a>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : activeLoans.length === 0 ? (
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center py-8">
                                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground">
                                    No tienes préstamos activos en este momento
                                </p>
                                <a
                                    href="/library"
                                    className="inline-block mt-4 text-sm text-primary hover:underline"
                                >
                                    Explorar Biblioteca
                                </a>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {loans.slice(0, 3).map(loan => (
                            <LoanCard
                                key={loan.id}
                                loan={loan}
                                onReturn={handleReturn}
                                onRenew={handleRenew}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Password Policy Section - Admin Only */}
            {isAdmin && (
                <>
                    <Separator className="my-8" />
                    <PasswordPolicySection isAdmin={isAdmin} />
                </>
            )}

            {/* Currencies Section - Admin Only */}
            {isAdmin && (
                <>
                    <Separator className="my-8" />
                    <CurrenciesSection isAdmin={isAdmin} />
                </>
            )}

            {/* Email Section - Admin Only */}
            {isAdmin && (
                <>
                    <Separator className="my-8" />
                    <EmailSection isAdmin={isAdmin} />
                </>
            )}
        </div>
    )
}
