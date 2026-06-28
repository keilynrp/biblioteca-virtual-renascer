"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStoreHydrated } from "@/store/authStore"

function hasAdminAccess(user: { user_type?: string; is_staff?: boolean; is_superuser?: boolean } | null | undefined) {
    return user?.user_type === "admin" || user?.is_staff === true || user?.is_superuser === true
}

export function AdminGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const { user, _hasHydrated } = useAuthStoreHydrated()

    useEffect(() => {
        if (!_hasHydrated) return
        if (!hasAdminAccess(user)) {
            router.push("/home")
        }
    }, [_hasHydrated, user, router])

    if (!_hasHydrated || !hasAdminAccess(user)) return null

    return <>{children}</>
}
