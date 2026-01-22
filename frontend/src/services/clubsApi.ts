import api from '@/lib/api'

export interface ReadingClub {
    id: number
    name: string
    slug: string
    description: string
    cover_image: string | null
    is_private: boolean
    members_count: number
    created_at: string
    is_member: boolean
}

export interface CreateClubData {
    name: string
    description: string
    is_private: boolean
    cover_image?: File
}

export interface Thread {
    id: number
    title: string
    club: number
    author: { username: string; avatar?: string }
    is_pinned: boolean
    is_locked: boolean
    posts_count: number
    created_at: string
    last_reply?: { author: string; created_at: string }
    posts?: Post[]
}

export interface Post {
    id: number
    thread: number
    author: { username: string; avatar?: string }
    content: string
    created_at: string
    updated_at: string
    likes_count: number
    is_liked: boolean
}

export const clubsApi = {
    getClubs: async (search?: string) => {
        const params = new URLSearchParams()
        if (search) params.append('search', search)

        const response = await api.get<ReadingClub[]>('/communities/clubs/', { params })
        return response.data
    },

    getClubBySlug: async (slug: string) => {
        const response = await api.get<ReadingClub>(`/communities/clubs/${slug}/`)
        return response.data
    },

    createClub: async (data: CreateClubData) => {
        const formData = new FormData()
        formData.append('name', data.name)
        formData.append('description', data.description)
        formData.append('is_private', String(data.is_private))
        if (data.cover_image) {
            formData.append('cover_image', data.cover_image)
        }

        const response = await api.post<ReadingClub>('/communities/clubs/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
        return response.data
    },

    joinClub: async (slug: string) => {
        const response = await api.post(`/communities/clubs/${slug}/join/`)
        return response.data
    },

    leaveClub: async (slug: string) => {
        const response = await api.post(`/communities/clubs/${slug}/leave/`)
        return response.data
    },

    // Thread methods
    getThreads: async (clubId: number) => {
        const response = await api.get<Thread[]>('/communities/threads/', {
            params: { club: clubId }
        })
        return response.data
    },

    getThread: async (id: number) => {
        const response = await api.get<Thread>(`/communities/threads/${id}/`)
        return response.data
    },

    createThread: async (data: { club: number; title: string; content: string }) => {
        // The backend handle thread creation and the first post
        const response = await api.post<Thread>('/communities/threads/', {
            club: data.club,
            title: data.title,
            content: data.content // Assuming the viewset handles initial post or I need to handle it separate
        })
        return response.data
    },

    // Post methods
    createPost: async (threadId: number, content: string) => {
        const response = await api.post<Post>('/communities/posts/', {
            thread: threadId,
            content
        })
        return response.data
    },

    likePost: async (postId: number) => {
        const response = await api.post<{ likes_count: number; detail: string }>(`/communities/posts/${postId}/like/`)
        return response.data
    }
}
