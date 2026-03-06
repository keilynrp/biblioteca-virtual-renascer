"use client"

import { useTranslations } from "next-intl"
import { Link, useRouter } from "@/i18n/routing"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BookOpen, User, LogOut, ChevronDown, Settings, Menu, LogIn, UserPlus } from "lucide-react"
import { useAuthStoreHydrated } from "@/store/authStore"
import { useNavigation } from "@/context/navigation-context"
import { useSiteSettings } from "@/context/site-settings-context"
import { useState, useEffect, useCallback } from "react"
import { LanguageSwitcher } from "@/components/language-switcher"

const SCROLL_THRESHOLD = 100

export function Navbar() {
    const t = useTranslations('Navbar')
    const router = useRouter()
    const { user, logout, isAuthenticated, _hasHydrated } = useAuthStoreHydrated()
    const { getZone } = useNavigation()
    const { logo_url, logo_small_url, site_name } = useSiteSettings()

    const [scrolled, setScrolled] = useState(false)

    const headerItems = getZone('header')?.items || []

    const handleScroll = useCallback(() => {
        setScrolled(window.scrollY >= SCROLL_THRESHOLD)
    }, [])

    useEffect(() => {
        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [handleScroll])

    const handleLogout = () => {
        logout()
        router.push("/login")
    }

    const showSmallLogo = scrolled && logo_small_url
    const currentLogo = showSmallLogo ? logo_small_url : (logo_url || '/Logo_renascerdosaber.png')

    return (
        <nav className="border-b bg-white/80 backdrop-blur-sm fixed top-0 w-full z-50">
            <div className={`container mx-auto px-4 flex items-center justify-between transition-all duration-300 ${scrolled ? 'py-2' : 'py-4'}`}>
                <Link href="/" className="flex items-center space-x-3 cursor-pointer">
                    <img
                        src={currentLogo}
                        alt={site_name || 'Logo'}
                        className={`object-contain transition-all duration-300 ${showSmallLogo ? 'h-8' : 'h-[62px] max-w-[172px]'}`}
                    />
                </Link>
                <div className="hidden md:flex items-center space-x-8">
                    {headerItems.length > 0 ? (
                        headerItems.map((item) => (
                            <Link
                                key={item.id ?? item.url}
                                href={item.url as any}
                                target={item.open_in_new_tab ? "_blank" : undefined}
                                className="text-base font-medium text-gray-600 hover:text-[#00576F] transition-colors"
                            >
                                {item.label}
                            </Link>
                        ))
                    ) : (
                        <>
                            <Link href="/about" className="text-base font-medium text-gray-600 hover:text-[#00576F] transition-colors">
                                {t('about')}
                            </Link>
                            <Link href="/blog" className="text-base font-medium text-gray-600 hover:text-[#00576F] transition-colors">
                                {t('news')}
                            </Link>
                            <Link href="/pricing" className="text-base font-medium text-gray-600 hover:text-[#00576F] transition-colors">
                                {t('pricing')}
                            </Link>
                            <Link href="/contact" className="text-base font-medium text-gray-600 hover:text-[#00576F] transition-colors">
                                {t('contact')}
                            </Link>
                        </>
                    )}
                </div>

                <div className="flex items-center space-x-2 md:space-x-4">
                    <LanguageSwitcher />

                    {/* Mobile Menu Toggle */}
                    <div className="md:hidden">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-9 w-9">
                                    <Menu className="h-5 w-5 text-gray-600" />
                                    <span className="sr-only">Toggle menu</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 mt-2">
                                <DropdownMenuLabel>{t('menu')}</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {headerItems.length > 0 ? (
                                    headerItems.map((item) => (
                                        <DropdownMenuItem key={item.id ?? item.url} asChild>
                                            <Link href={item.url as any} target={item.open_in_new_tab ? "_blank" : undefined} className="w-full cursor-pointer">
                                                {item.label}
                                            </Link>
                                        </DropdownMenuItem>
                                    ))
                                ) : (
                                    <>
                                        <DropdownMenuItem asChild>
                                            <Link href="/about" className="w-full cursor-pointer">{t('about')}</Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/blog" className="w-full cursor-pointer">{t('news')}</Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/pricing" className="w-full cursor-pointer">{t('pricing')}</Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/contact" className="w-full cursor-pointer">{t('contact')}</Link>
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {!_hasHydrated ? (
                        <div className="h-10 w-32 bg-gray-100 animate-pulse rounded-lg" />
                    ) : isAuthenticated ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="flex items-center space-x-2 rounded-lg hover:bg-cyan-50 px-3">
                                    <Avatar className="h-8 w-8 ring-2 ring-[#00576F]/20">
                                        <AvatarImage src={user?.avatar} alt={user?.username} />
                                        <AvatarFallback className="bg-gradient-to-br from-[#00576F] to-[#004558] text-white">
                                            {user?.username?.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="hidden md:block text-left">
                                        <p className="text-sm font-medium">{user?.username}</p>
                                        <p className="text-xs text-gray-500">{t('userRole')}</p>
                                    </div>
                                    <ChevronDown className="h-4 w-4 text-gray-500" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">{user?.username}</p>
                                        <p className="text-xs leading-none text-gray-500">
                                            {user?.email}
                                        </p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/home" className="cursor-pointer">
                                        <BookOpen className="mr-2 h-4 w-4" />
                                        <span>{t('dashboard')}</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/profile" className="cursor-pointer">
                                        <User className="mr-2 h-4 w-4" />
                                        <span>{t('profile')}</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/settings" className="cursor-pointer">
                                        <Settings className="mr-2 h-4 w-4" />
                                        <span>{t('settings')}</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>{t('logout')}</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <>
                            <Link href="/login" aria-label={t('login')}>
                                <Button variant="ghost" className="px-2 md:px-4" aria-label={t('login')}>
                                    <LogIn className="h-4 w-4 md:mr-2" aria-hidden="true" />
                                    <span className="sr-only md:not-sr-only md:inline">{t('login')}</span>
                                </Button>
                            </Link>
                            <Link href="/register" aria-label={t('register')}>
                                <Button className="bg-[#00576F] hover:bg-[#004558] text-white px-3 md:px-4" aria-label={t('register')}>
                                    <UserPlus className="h-4 w-4 md:mr-2" aria-hidden="true" />
                                    <span className="sr-only md:not-sr-only md:inline">{t('register')}</span>
                                </Button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    )
}
