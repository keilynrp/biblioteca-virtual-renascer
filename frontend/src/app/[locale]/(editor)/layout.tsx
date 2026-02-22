"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStoreHydrated } from "@/store/authStore"
import { Loader2 } from "lucide-react"

/**
 * Minimal layout for the full-screen Puck editor.
 * No dashboard sidebar or header — Puck fills the entire viewport.
 * Redirects non-admin users to /home.
 */
export default function EditorLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const { user, _hasHydrated } = useAuthStoreHydrated()

    useEffect(() => {
        if (!_hasHydrated) return
        if (!user || user.user_type !== 'admin') {
            router.push('/home')
        }
    }, [_hasHydrated, user, router])

    if (!_hasHydrated) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!user || user.user_type !== 'admin') return null

    return <>{children}</>
}
