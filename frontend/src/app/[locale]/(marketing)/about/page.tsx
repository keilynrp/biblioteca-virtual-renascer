import { PageRenderer } from '@/components/page-builder/page-renderer'
import { fetchPage } from '@/lib/fetch-page'
import HardcodedAboutPage from './_hardcoded-about'

export default async function AboutPage() {
    const page = await fetchPage('about')

    if (page?.content?.content && page.content.content.length > 0) {
        return <PageRenderer data={page.content} />
    }

    return <HardcodedAboutPage />
}
