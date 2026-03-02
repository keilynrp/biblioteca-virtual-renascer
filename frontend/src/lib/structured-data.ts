const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export function buildWebSiteSchema(siteName: string, siteUrl?: string) {
    const url = siteUrl || SITE_URL
    return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: siteName,
        url,
        potentialAction: {
            '@type': 'SearchAction',
            target: {
                '@type': 'EntryPoint',
                urlTemplate: `${url}/es/library?q={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
        },
    }
}

export function buildOrganizationSchema(
    name: string,
    logoUrl?: string | null,
    siteUrl?: string,
) {
    const url = siteUrl || SITE_URL
    return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name,
        url,
        ...(logoUrl ? { logo: logoUrl } : {}),
    }
}

interface BlogPostingInput {
    title: string
    description: string
    url: string
    imageUrl?: string | null
    datePublished?: string | null
    authorName?: string
}

export function buildBlogPostingSchema({
    title,
    description,
    url,
    imageUrl,
    datePublished,
    authorName,
}: BlogPostingInput) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: title,
        description,
        url: url.startsWith('http') ? url : `${SITE_URL}${url}`,
        ...(imageUrl ? { image: imageUrl } : {}),
        ...(datePublished ? { datePublished } : {}),
        ...(authorName
            ? {
                  author: {
                      '@type': 'Person',
                      name: authorName,
                  },
              }
            : {}),
    }
}

interface BreadcrumbItem {
    name: string
    url: string
}

export function buildBreadcrumbSchema(items: BreadcrumbItem[]) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
        })),
    }
}
