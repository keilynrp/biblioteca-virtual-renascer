import { Navbar } from "@/components/marketing/navbar"
import { Footer } from "@/components/marketing/footer"
import { BackToTop } from "@/components/marketing/back-to-top"
import { CurrencyProvider } from "@/context/currency-context"

export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow">
                <CurrencyProvider>
                    {children}
                </CurrencyProvider>
            </main>
            <BackToTop />
            <Footer />
        </div>
    )
}
