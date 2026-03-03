"use client"

import { useState, useEffect } from 'react'
import { BookOpen, Clock, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLoans } from '@/hooks/use-loans'
import { userToast } from '@/lib/toast-utils'

interface BorrowBookButtonProps {
    bookId: number
    bookTitle: string
    className?: string
}

export function BorrowBookButton({ bookId, bookTitle, className }: BorrowBookButtonProps) {
    const { borrowBook, checkCanBorrow, joinQueue } = useLoans()
    const { toast } = useToast()
    const [canBorrow, setCanBorrow] = useState<boolean | null>(null)
    const [reason, setReason] = useState('')
    const [queueAvailable, setQueueAvailable] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isChecking, setIsChecking] = useState(true)

    useEffect(() => {
        async function check() {
            setIsChecking(true)
            const result = await checkCanBorrow(bookId)
            setCanBorrow(result.can_borrow)
            setReason(result.reason)
            setQueueAvailable(result.queue_available || false)
            setIsChecking(false)
        }
        check()
    }, [bookId, checkCanBorrow])

    const handleBorrow = async () => {
        setIsLoading(true)
        const result = await borrowBook(bookId)

        if (result.success) {
            toast({
                title: '¡Préstamo confirmado!',
                description: `Has tomado prestado "${bookTitle}". Revisa tus préstamos activos.`,
            })
            setCanBorrow(false)
        } else {
            toast({
                title: 'Error al solicitar préstamo',
                description: result.error,
                variant: 'destructive'
            })
        }
        setIsLoading(false)
    }

    const handleJoinQueue = async () => {
        setIsLoading(true)
        const result = await joinQueue(bookId)

        if (result.success) {
            toast({
                title: 'Unido a la cola de espera',
                description: `Te notificaremos cuando "${bookTitle}" esté disponible. Posición: ${result.queueEntry?.position}`,
            })
            setQueueAvailable(false)
        } else {
            toast({
                title: 'Error al unirse a la cola',
                description: result.error,
                variant: 'destructive'
            })
        }
        setIsLoading(false)
    }

    if (isChecking) {
        return (
            <Button disabled className={className}>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Verificando...
            </Button>
        )
    }

    if (canBorrow) {
        return (
            <Button
                onClick={handleBorrow}
                disabled={isLoading}
                className={className}
            >
                <BookOpen className="h-4 w-4 mr-2" />
                {isLoading ? 'Procesando...' : 'Pedir Prestado'}
            </Button>
        )
    }

    if (queueAvailable) {
        return (
            <Button
                onClick={handleJoinQueue}
                disabled={isLoading}
                variant="secondary"
                className={className}
            >
                <Clock className="h-4 w-4 mr-2" />
                {isLoading ? 'Procesando...' : 'Unirse a Cola de Espera'}
            </Button>
        )
    }

    return (
        <Button
            disabled
            variant="outline"
            className={className}
        >
            <AlertCircle className="h-4 w-4 mr-2" />
            {reason || 'No disponible'}
        </Button>
    )
}
