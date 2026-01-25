"use client"

import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { BookOpen, Calendar, RotateCcw, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Loan } from '@/types/loan'
import Image from 'next/image'

interface LoanCardProps {
    loan: Loan
    onReturn: (loanId: number) => Promise<void>
    onRenew: (loanId: number) => Promise<void>
}

export function LoanCard({ loan, onReturn, onRenew }: LoanCardProps) {
    const daysUntilDue = Math.ceil(
        (new Date(loan.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    )

    const getStatusColor = () => {
        if (loan.is_overdue) return 'destructive'
        if (daysUntilDue <= 3) return 'warning'
        return 'default'
    }

    const getStatusText = () => {
        if (loan.is_overdue) return `Vencido hace ${loan.days_overdue} día(s)`
        if (daysUntilDue === 0) return 'Vence hoy'
        if (daysUntilDue === 1) return 'Vence mañana'
        return `Vence en ${daysUntilDue} días`
    }

    return (
        <Card className={cn(
            "overflow-hidden transition-all hover:shadow-lg cursor-pointer",
            loan.is_overdue && "border-destructive/50"
        )}>
            <CardHeader className="p-4 pb-2">
                <div className="flex gap-4">
                    {/* Book Cover */}
                    <div className="relative h-24 w-16 flex-shrink-0 rounded overflow-hidden bg-muted">
                        {loan.book_detail.cover_image ? (
                            <Image
                                src={loan.book_detail.cover_image}
                                alt={loan.book_detail.title}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="flex h-full items-center justify-center">
                                <BookOpen className="h-8 w-8 text-muted-foreground" />
                            </div>
                        )}
                    </div>

                    {/* Book Info */}
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg line-clamp-2 mb-1">
                            {loan.book_detail.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            {loan.book_detail.author.name}
                        </p>

                        {/* Status Badge */}
                        <Badge
                            variant={getStatusColor() as any}
                            className="mt-2"
                        >
                            {loan.is_overdue ? (
                                <AlertCircle className="h-3 w-3 mr-1" />
                            ) : (
                                <Calendar className="h-3 w-3 mr-1" />
                            )}
                            {getStatusText()}
                        </Badge>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-4 pt-2 space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                    <span>Prestado:</span>
                    <span>{formatDistanceToNow(new Date(loan.borrowed_at), { addSuffix: true, locale: es })}</span>
                </div>

                <div className="flex justify-between text-muted-foreground">
                    <span>Vence:</span>
                    <span className={cn(
                        "font-medium",
                        loan.is_overdue && "text-destructive",
                        daysUntilDue <= 3 && !loan.is_overdue && "text-orange-600"
                    )}>
                        {new Date(loan.due_date).toLocaleDateString('es', {
                            day: 'numeric',
                            month: 'short'
                        })}
                    </span>
                </div>

                {loan.renewals_count > 0 && (
                    <div className="flex justify-between text-muted-foreground">
                        <span>Renovaciones:</span>
                        <span>{loan.renewals_count} / {loan.max_renewals}</span>
                    </div>
                )}

                {loan.book_copy_detail && (
                    <div className="flex justify-between text-muted-foreground text-xs">
                        <span>Ejemplar:</span>
                        <span>Copia #{loan.book_copy_detail.copy_number}</span>
                    </div>
                )}
            </CardContent>

            <CardFooter className="p-4 pt-0 flex gap-2">
                <Button
                    onClick={() => onReturn(loan.id)}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Devolver
                </Button>

                {loan.can_renew && (
                    <Button
                        onClick={() => onRenew(loan.id)}
                        variant="secondary"
                        size="sm"
                        className="flex-1"
                    >
                        <RotateCcw className="h-4 w-4 mr-1" />
                        Renovar
                    </Button>
                )}
            </CardFooter>
        </Card>
    )
}
