import { toast } from '@/hooks/use-toast'

export const userToast = {
    success: (message: string, title = 'Éxito') =>
        toast({ variant: 'success', title, description: message }),
    error: (message: string, title = 'Error') =>
        toast({ variant: 'error', title, description: message }),
    warning: (message: string, title = 'Advertencia') =>
        toast({ variant: 'warning', title, description: message }),
    info: (message: string, title = 'Info') =>
        toast({ variant: 'info', title, description: message }),
}
