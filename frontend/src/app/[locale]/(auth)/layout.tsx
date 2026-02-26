
export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 sm:p-8 bg-slate-50 dark:bg-slate-900">
            {children}
        </div>
    )
}
