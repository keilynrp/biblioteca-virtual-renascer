"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"

export function BackToTop() {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const toggleVisibility = () => {
            // Show button when page is scrolled more than 1 viewport height
            if (window.scrollY > window.innerHeight) {
                setIsVisible(true)
            } else {
                setIsVisible(false)
            }
        }

        window.addEventListener("scroll", toggleVisibility)
        return () => window.removeEventListener("scroll", toggleVisibility)
    }, [])

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        })
    }

    return (
        <Button
            variant="outline"
            size="icon"
            className={cn(
                "fixed bottom-8 right-8 z-[100] rounded-full shadow-lg transition-all duration-300 bg-white/90 backdrop-blur-sm border-[#00576F]/20 hover:border-[#00576F] hover:bg-[#00576F] hover:text-white group",
                isVisible
                    ? "translate-y-0 opacity-100 scale-100"
                    : "translate-y-16 opacity-0 scale-50 pointer-events-none"
            )}
            onClick={scrollToTop}
            aria-label="Volver arriba"
        >
            <ChevronUp className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-1" />
        </Button>
    )
}
