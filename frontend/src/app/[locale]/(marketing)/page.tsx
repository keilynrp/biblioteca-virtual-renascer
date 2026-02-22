import { PageRenderer } from '@/components/page-builder/page-renderer'
import { fetchPage } from '@/lib/fetch-page'
import HardcodedHomepage from './_hardcoded-homepage'

export default async function LandingPage() {
    const page = await fetchPage('homepage')

    if (page?.content?.content && page.content.content.length > 0) {
        return <PageRenderer data={page.content} />
    }

    return <HardcodedHomepage />
}
