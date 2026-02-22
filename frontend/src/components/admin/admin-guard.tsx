"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStoreHydrated } from "@/store/authStore"

export function AdminGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const { user, _hasHydrated } = useAuthStoreHydrated()

    useEffect(() => {
        if (!_hasHydrated) return
        if (user?.user_type !== "admin") {
            router.push("/home")
        }
    }, [_hasHydrated, user, router])

    if (!_hasHydrated || user?.user_type !== "admin") return null

    return <>{children}</>
}
