export interface FormFieldOption {
    label: string
    value: string
}

export type FormFieldType =
    | 'text'
    | 'email'
    | 'textarea'
    | 'select'
    | 'checkbox'
    | 'radio'
    | 'number'
    | 'date'
    | 'file'
    | 'hidden'

export interface FormFieldValidation {
    min_length?: number
    max_length?: number
    pattern?: string
    min?: number
    max?: number
    allowed_extensions?: string[]
    max_file_size_mb?: number
}

export interface FormField {
    id?: number
    label: string
    field_type: FormFieldType
    placeholder: string
    help_text: string
    is_required: boolean
    validation_rules: FormFieldValidation
    options: FormFieldOption[]
    default_value: string
    order: number
}

export interface FormNotificationRecipient {
    id?: number
    email: string
    name: string
    is_active: boolean
}

export type CaptchaProvider = 'none' | 'turnstile' | 'recaptcha_v3' | 'numeric' | 'time_based'

export interface FormRecord {
    id: number
    uuid: string
    title: string
    slug: string
    description: string
    status: 'draft' | 'published' | 'archived'
    honeypot_field_name: string
    success_message: string
    redirect_url: string
    captcha_provider: CaptchaProvider
    captcha_site_key: string
    captcha_secret_key: string
    captcha_min_seconds: number
    captcha_score_threshold: number
    version: number
    fields: FormField[]
    notification_recipients: FormNotificationRecipient[]
    submission_count: number
    unread_count?: number
    created_at: string
    updated_at: string
}

export interface FormListItem {
    id: number
    uuid: string
    title: string
    slug: string
    status: 'draft' | 'published' | 'archived'
    version: number
    submission_count: number
    unread_count: number
    created_at: string
    updated_at: string
}

export interface FormSubmission {
    id: number
    uuid: string
    form: number
    form_title: string
    form_version: number
    data: Record<string, string>
    file_uploads: Record<string, string>
    field_snapshot: FormField[]
    ip_address: string | null
    user_agent: string
    is_spam: boolean
    is_read: boolean
    created_at: string
}

export interface PublicFormData {
    uuid: string
    title: string
    description: string
    fields: FormField[]
    honeypot_field_name: string
    success_message: string
    captcha_provider: CaptchaProvider
    captcha_site_key: string
    captcha_min_seconds: number
    captcha_score_threshold: number
}

export interface FormSubmitResponse {
    success: boolean
    message: string
    redirect_url: string | null
}
