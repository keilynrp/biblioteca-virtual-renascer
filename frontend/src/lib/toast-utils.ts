import { toast } from 'sonner'

export const userToast = {
    success: (message: string, title = 'Éxito') =>
        toast.success(title, { description: message }),
    error: (message: string, title = 'Error') =>
        toast.error(title, { description: message }),
    warning: (message: string, title = 'Advertencia') =>
        toast.warning(title, { description: message }),
    info: (message: string, title = 'Info') =>
        toast.info(title, { description: message }),
}
