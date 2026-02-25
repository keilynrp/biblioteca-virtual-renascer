"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { MoveLeft, Home } from "lucide-react"

export default function NotFound() {
    const t = useTranslations("NotFound")

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background px-5 py-20">
            <div className="mx-auto max-w-[500px] text-center">
                <div className="relative mx-auto mb-10 w-full max-w-[400px]">
                    <h1 className="text-[120px] font-black leading-none text-primary/10 dark:text-primary/5 sm:text-[180px]">
                        404
                    </h1>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-full w-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent opacity-50 blur-3xl" />
                    </div>
                </div>

                <div className="relative -mt-16 sm:-mt-24">
                    <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                        {t("heading")}
                    </h2>
                    <p className="mb-10 text-base font-medium text-muted-foreground">
                        {t("description")}
                    </p>

                    <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                        <Button asChild size="lg" className="rounded-full px-8 shadow-lg shadow-primary/25 transition-all hover:scale-105 active:scale-95 cursor-pointer">
                            <Link href="/">
                                <Home className="mr-2 h-4 w-4" />
                                {t("backHome")}
                            </Link>
                        </Button>
                        <Button asChild variant="outline" size="lg" className="rounded-full px-8 transition-all hover:scale-105 active:scale-95 cursor-pointer">
                            <Link href="/home">
                                <MoveLeft className="mr-2 h-4 w-4" />
                                Volver al Home
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute left-0 top-0 -z-10 h-full w-full overflow-hidden opacity-30 dark:opacity-10">
                <div className="absolute left-[-10%] top-[-10%] h-[40%] w-[40%] rounded-full bg-primary/20 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] h-[40%] w-[40%] rounded-full bg-primary/20 blur-[120px]" />
            </div>
        </div>
    )
}
