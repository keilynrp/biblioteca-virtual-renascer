"use client"

import { useLocale, useTranslations } from "next-intl"
import { routing, usePathname, useRouter } from "@/i18n/routing"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Languages } from "lucide-react"

export function LanguageSwitcher() {
    const locale = useLocale()
    const router = useRouter()
    const pathname = usePathname()

    function onSelectChange(nextLocale: string) {
        router.replace(pathname, { locale: nextLocale as any })
    }

    const languages = {
        en: "English",
        es: "Español",
        pt: "Português",
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative rounded-xl hover:bg-muted/80 transition-all duration-300 hover:scale-110 active:scale-95 group overflow-hidden"
                >
                    <Languages className="h-5 w-5 text-primary" />
                    <span className="sr-only">Cambiar idioma</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 border-border/50 shadow-xl backdrop-blur-xl bg-card/95">
                {routing.locales.map((cur) => (
                    <DropdownMenuItem
                        key={cur}
                        onClick={() => onSelectChange(cur)}
                        className={`cursor-pointer transition-colors ${locale === cur ? "bg-primary/10 text-primary font-bold" : ""}`}
                    >
                        {languages[cur as keyof typeof languages]}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
