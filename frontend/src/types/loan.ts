export interface BookCopy {
    id: number
    book: number
    book_title: string
    copy_number: number
    is_available: boolean
    condition: 'new' | 'good' | 'fair' | 'poor'
    barcode: string | null
    notes: string
    created_at: string
}

export interface Loan {
    id: number
    user: number
    user_username: string
    book: number
    book_detail: {
        id: number
        title: string
        slug: string
        author: {
            id: number
            name: string
        }
        category: {
            id: number
            name: string
        }
        cover_image: string | null
    }
    book_copy: number | null
    book_copy_detail: BookCopy | null
    status: 'active' | 'returned' | 'overdue'
    status_display: string
    borrowed_at: string
    due_date: string
    returned_at: string | null
    renewals_count: number
    max_renewals: number
    fine_amount: string
    is_overdue: boolean
    days_overdue: number
    can_renew: boolean
    notes: string
    created_at: string
    updated_at: string
}

export interface LoanQueue {
    id: number
    user: number
    user_username: string
    book: number
    book_detail: {
        id: number
        title: string
        slug: string
        cover_image: string | null
    }
    position: number
    notified: boolean
    notified_at: string | null
    expires_at: string | null
    created_at: string
}

export interface CanBorrowResponse {
    can_borrow: boolean
    reason: string
    queue_available?: boolean
}
