import { PageRenderer } from '@/components/page-builder/page-renderer'
import { fetchPage } from '@/lib/fetch-page'
import HardcodedContactPage from './_hardcoded-contact'

export default async function ContactPage() {
    const page = await fetchPage('contact')

    if (page?.content?.content && page.content.content.length > 0) {
        return <PageRenderer data={page.content} />
    }

    return <HardcodedContactPage />
}
