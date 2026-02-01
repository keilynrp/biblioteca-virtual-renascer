/**
 * Common type for API errors from backend
 */
export interface ApiError {
    response?: {
        data?: {
            detail?: string
            error?: string
            [key: string]: string | string[] | undefined
        }
    }
    message?: string
}
