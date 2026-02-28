import api from '../api'

export interface PasswordPolicy {
    expiration_days: number
    is_enabled: boolean
    min_length: number
    require_uppercase: boolean
    require_lowercase: boolean
    require_numbers: boolean
    require_special: boolean
    updated_at: string
    updated_by: number | null
}

export interface PasswordExpirationStatus {
    is_expired: boolean
    force_change: boolean
    policy_enabled: boolean
    expiration_days: number
    password_changed_at: string | null
    is_admin: boolean
    days_until_expiration: number | null
}

export interface UserPasswordStatus {
    id: number
    username: string
    email: string
    first_name: string
    last_name: string
    password_changed_at: string | null
    force_password_change: boolean
    password_expired: boolean
    days_until_expiration: number | null
    is_staff: boolean
    is_superuser: boolean
}

export interface ForcePasswordResetRequest {
    user_ids?: number[]
    reset_all?: boolean
}

export interface ForcePasswordResetResponse {
    message: string
    affected_users: number
}

export const passwordPolicyApi = {
    /**
     * Get current password policy configuration
     */
    async getPolicy(): Promise<PasswordPolicy> {
        const response = await api.get('/auth/password-policy/')
        return response.data
    },

    /**
     * Update password policy (admin only)
     */
    async updatePolicy(data: Partial<PasswordPolicy>): Promise<PasswordPolicy> {
        const response = await api.put('/auth/password-policy/', data)
        return response.data
    },

    /**
     * Force password reset for users (admin only)
     */
    async forcePasswordReset(request: ForcePasswordResetRequest): Promise<ForcePasswordResetResponse> {
        const response = await api.post('/auth/password-policy/force-reset/', request)
        return response.data
    },

    /**
     * Get password status for all users (admin only)
     */
    async getUsersPasswordStatus(expiredOnly: boolean = false): Promise<{ users: UserPasswordStatus[], total: number }> {
        const params = expiredOnly ? '?expired_only=true' : ''
        const response = await api.get(`/auth/password-policy/users-status/${params}`)
        return response.data
    },

    /**
     * Check if current user's password is expired
     */
    async checkExpiration(): Promise<PasswordExpirationStatus> {
        const response = await api.get('/auth/password-policy/check-expiration/')
        return response.data
    }
}
