import { toast as sonnerToast } from 'sonner'

type ToastVariant = 'default' | 'destructive' | 'success' | 'error' | 'warning' | 'info'

type ToastProps = {
    title?: string
    description?: string
    variant?: ToastVariant
}

function toast({ title, description, variant }: ToastProps) {
    const message = title || ''
    const opts = description ? { description } : {}

    switch (variant) {
        case 'destructive':
        case 'error':
            return sonnerToast.error(message, opts)
        case 'success':
            return sonnerToast.success(message, opts)
        case 'warning':
            return sonnerToast.warning(message, opts)
        case 'info':
            return sonnerToast.info(message, opts)
        default:
            return sonnerToast(message, opts)
    }
}

function useToast() {
    return { toast }
}

export { useToast, toast }
