import { notFound } from 'next/navigation'
import { PageRenderer } from '@/components/page-builder/page-renderer'
import { fetchPage } from '@/lib/fetch-page'

interface Props {
    params: Promise<{ locale: string; slug: string }>
}

export default async function CustomLandingPage({ params }: Props) {
    const { slug } = await params
    const page = await fetchPage(slug)

    if (!page || !page.is_published || !page.content?.content?.length) {
        notFound()
    }

    return <PageRenderer data={page.content} />
}

export async function generateMetadata({ params }: Props) {
    const { slug } = await params
    try {
        const page = await fetchPage(slug)
        if (page?.title) return { title: page.title }
    } catch {}
    return {}
}
