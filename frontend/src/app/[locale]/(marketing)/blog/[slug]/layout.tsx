import type { Metadata } from 'next'
import { fetchSiteSettings } from '@/lib/fetch-site-settings'
import { fetchBlogPost } from '@/lib/fetch-blog-post'
import { buildMetadata } from '@/lib/metadata'
import { buildBlogPostingSchema, buildBreadcrumbSchema } from '@/lib/structured-data'
import { JsonLd } from '@/components/json-ld'

interface Props {
    params: Promise<{ locale: string; slug: string }>
    children: React.ReactNode
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug, locale } = await params
    const [post, settings] = await Promise.all([
        fetchBlogPost(slug),
        fetchSiteSettings(),
    ])

    if (!post) return {}

    const authorName = post.author
        ? `${post.author.first_name} ${post.author.last_name}`.trim()
        : post.author_name

    return buildMetadata({
        title: post.title,
        description: post.description || post.title,
        url: `/${locale}/blog/${slug}`,
        locale,
        siteName: settings?.site_name,
        ogImage: post.featured_image || settings?.og_image_url,
        twitterHandle: settings?.twitter_handle,
        type: 'article',
        article: {
            publishedTime: post.published_at || post.created_at,
            authors: authorName ? [authorName] : undefined,
        },
    })
}

export default async function BlogPostLayout({ params, children }: Props) {
    const { slug, locale } = await params
    const [post, settings] = await Promise.all([
        fetchBlogPost(slug),
        fetchSiteSettings(),
    ])

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    const structuredData = []

    if (post) {
        const authorName = post.author
            ? `${post.author.first_name} ${post.author.last_name}`.trim()
            : post.author_name

        structuredData.push(
            buildBlogPostingSchema({
                title: post.title,
                description: post.description,
                url: `${siteUrl}/${locale}/blog/${slug}`,
                imageUrl: post.featured_image,
                datePublished: post.published_at || post.created_at,
                authorName,
            })
        )

        structuredData.push(
            buildBreadcrumbSchema([
                { name: 'Inicio', url: `/${locale}` },
                { name: 'Blog', url: `/${locale}/blog` },
                { name: post.title, url: `/${locale}/blog/${slug}` },
            ])
        )
    }

    return (
        <>
            {structuredData.length > 0 && <JsonLd data={structuredData} />}
            {children}
        </>
    )
}
