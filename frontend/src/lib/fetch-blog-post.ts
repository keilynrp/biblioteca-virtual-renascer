export interface BlogPostSSR {
    id: number
    title: string
    slug: string
    description: string
    content: string
    featured_image: string | null
    category_name?: string
    author_name?: string
    author: {
        id: number
        first_name: string
        last_name: string
        avatar: string | null
    }
    status: 'draft' | 'published'
    published_at: string | null
    created_at: string
}

/**
 * Fetches a blog post from the Django API (server-side).
 * Uses API_INTERNAL_URL for Docker internal network, falls back to NEXT_PUBLIC_API_URL.
 * Cached for 1 minute via Next.js fetch cache.
 */
export async function fetchBlogPost(slug: string): Promise<BlogPostSSR | null> {
    const apiUrl =
        process.env.API_INTERNAL_URL ||
        process.env.NEXT_PUBLIC_API_URL ||
        'http://localhost:8000/api'

    try {
        const res = await fetch(`${apiUrl}/blog/posts/${slug}/`, {
            next: { revalidate: 60 },
        })
        if (!res.ok) return null
        return res.json()
    } catch {
        return null
    }
}
