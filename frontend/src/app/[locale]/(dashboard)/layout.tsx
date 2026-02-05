"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuthStore, useAuthStoreHydrated } from "@/store/authStore"
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
import {
    BookOpen,
    LogOut,
    User,
    Menu,
    X,
    LayoutDashboard,
    Library,
    CreditCard,
    Search,
    Bell,
    Settings,
    ChevronDown,
    Moon,
    Sun,
    FileEdit,
    Users,
    FolderOpen,
    ChevronLeft,
    ChevronRight,
    Heart,
    BookMarked,
    Shield,
    BookUp,
    Building2, // Icon for Institutions
} from "lucide-react"
import { useState, useEffect } from "react"
import { SearchBar } from "@/components/search-bar"
import { useTranslations } from "next-intl"
import { LanguageSwitcher } from "@/components/language-switcher"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { NotificationBellComponent } from "@/components/notifications/notification-bell-component"
import { getAvatarUrl } from "@/lib/utils"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const router = useRouter()
    // Usar el hook hidratado para prevenir errores de hidratación
    const t = useTranslations("Navigation")
    const { user, logout, isAuthenticated, _hasHydrated } = useAuthStoreHydrated()
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
    const [isDarkMode, setIsDarkMode] = useState(false)

    // Redirect if not authenticated (solo después de hidratar)
    useEffect(() => {
        if (!_hasHydrated) return

        if (!isAuthenticated) {
            router.push('/login')
        }
    }, [isAuthenticated, router, _hasHydrated])

    // Load sidebar collapsed state from localStorage (solo después de hidratar)
    useEffect(() => {
        if (!_hasHydrated) return

        const savedState = localStorage.getItem('sidebarCollapsed')
        if (savedState !== null) {
            setIsSidebarCollapsed(savedState === 'true')
        }
    }, [_hasHydrated])

    // Save sidebar state to localStorage
    const toggleSidebarCollapse = () => {
        const newState = !isSidebarCollapsed
        setIsSidebarCollapsed(newState)
        localStorage.setItem('sidebarCollapsed', String(newState))
    }

    const handleLogout = () => {
        logout()
        router.push("/login")
    }

    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode)
        document.documentElement.classList.toggle('dark')
    }

    const navItems = [
        { href: "/home", label: t("dashboard"), icon: LayoutDashboard },
        { href: "/library", label: t("library"), icon: Library },
        { href: "/my-loans", label: t("loans"), icon: BookUp },
        { href: "/notifications", label: t("notifications"), icon: Bell },
        { href: "/favorites", label: t("favorites"), icon: Heart },
        { href: "/reading-history", label: t("history"), icon: BookMarked },
        { href: "/admin", label: t("admin"), icon: Shield, adminOnly: true },
        { href: "/admin/books", label: "Administrar Libros", icon: FileEdit },
        { href: "/admin/authors", label: "Administrar Autores", icon: Users },
        { href: "/admin/categories", label: "Administrar Categorías", icon: FolderOpen },
        { href: "/plans", label: "Planes", icon: CreditCard },
        { href: "/institutions", label: "Instituciones", icon: Building2, adminOnly: true },
        { href: "/users", label: "Usuarios", icon: Users, adminOnly: true },
        { href: "/profile", label: "Perfil", icon: User },
    ]

    return (
        <div className="flex h-screen overflow-hidden bg-muted/30">
            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 transform bg-card shadow-2xl transition-all duration-300 ease-in-out
                ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
                md:static md:translate-x-0
                ${isSidebarCollapsed ? "md:w-20" : "md:w-72"}
                w-72
                border-r border-border/50
                backdrop-blur-xl bg-card/95
                flex flex-col h-full
            `}>
                {/* Decorative gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-primary-dark/5 pointer-events-none" />

                {/* Sidebar Header */}
                <div className="relative flex h-16 items-center justify-between px-6 border-b border-border/50 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
                    <Link
                        href="/"
                        className={`flex items-center space-x-3 transition-all duration-300 cursor-pointer group ${isSidebarCollapsed ? "md:opacity-0 md:scale-90 md:hidden" : "opacity-100 scale-100"}`}
                        onClick={() => setIsSidebarOpen(false)}
                    >
                        <div className="relative h-10 w-10 rounded-xl bg-gradient-to-br from-primary via-primary-dark to-primary shadow-lg shadow-primary/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <BookOpen className="h-6 w-6 text-white" />
                            <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-lg font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                                BVS
                            </span>
                            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                                Biblioteca
                            </span>
                        </div>
                    </Link>

                    {/* Collapsed state logo */}
                    <Link
                        href="/"
                        className={`flex items-center justify-center w-full transition-all duration-300 cursor-pointer ${isSidebarCollapsed ? "md:opacity-100 md:scale-100" : "md:opacity-0 md:scale-90 md:hidden"}`}
                        onClick={() => setIsSidebarOpen(false)}
                    >
                        <div className="relative h-10 w-10 rounded-xl bg-gradient-to-br from-primary via-primary-dark to-primary shadow-lg shadow-primary/30 flex items-center justify-center hover:scale-110 transition-transform">
                            <BookOpen className="h-6 w-6 text-white" />
                        </div>
                    </Link>

                    {/* Mobile close button */}
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="md:hidden hover:bg-muted/50 rounded-lg p-2 transition-all hover:scale-110 cursor-pointer"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="relative p-4 space-y-1 overflow-y-auto flex-1">
                    <div className={`px-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4 transition-all duration-300 ${isSidebarCollapsed ? "md:opacity-0 md:hidden" : "opacity-100"}`}>
                        <span className="inline-flex items-center gap-2">
                            <span className="h-px w-3 bg-primary/30 block" />
                            Menú Principal
                        </span>
                    </div>
                    {navItems.map((item, index) => {
                        const Icon = item.icon
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsSidebarOpen(false)}
                                className={`
                                    flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 group relative
                                    overflow-hidden cursor-pointer
                                    ${isActive
                                        ? "bg-gradient-to-r from-primary to-primary-dark text-white shadow-lg shadow-primary/30 scale-[1.02]"
                                        : "text-foreground hover:bg-gradient-to-r hover:from-muted/80 hover:to-muted/40 hover:text-primary hover:scale-[1.02]"
                                    }
                                    ${isSidebarCollapsed ? "md:justify-center md:px-3" : ""}
                                `}
                                style={{
                                    animation: `fadeInUp 0.3s ease-out ${index * 0.05}s both`
                                }}
                                title={isSidebarCollapsed ? item.label : undefined}
                            >
                                {/* Active indicator */}
                                {isActive && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full" />
                                )}

                                {/* Icon container */}
                                <div className={`
                                    relative flex items-center justify-center
                                    ${isActive ? "" : "group-hover:scale-110 group-hover:rotate-3"}
                                    transition-all duration-300
                                `}>
                                    <Icon className="h-5 w-5 flex-shrink-0 relative z-10" />

                                    {/* Icon glow effect */}
                                    {isActive && (
                                        <div className="absolute inset-0 blur-md bg-white/30 rounded-full" />
                                    )}
                                </div>

                                {/* Label */}
                                <span className={`
                                    font-medium whitespace-nowrap transition-all duration-300
                                    ${isSidebarCollapsed ? "md:opacity-0 md:absolute md:invisible" : "opacity-100"}
                                    ${isActive ? "font-semibold" : ""}
                                `}>
                                    {item.label}
                                </span>

                                {/* Hover shine effect */}
                                {!isActive && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                                )}

                                {/* Tooltip for collapsed state */}
                                {isSidebarCollapsed && (
                                    <span className="
                                        hidden md:block absolute left-full ml-3 px-3 py-2
                                        bg-popover text-popover-foreground text-sm rounded-lg
                                        shadow-xl border border-border/50
                                        opacity-0 group-hover:opacity-100
                                        scale-95 group-hover:scale-100
                                        transition-all duration-200
                                        whitespace-nowrap pointer-events-none z-50
                                        backdrop-blur-sm bg-popover/95
                                    ">
                                        {item.label}
                                        <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-popover/95" />
                                    </span>
                                )}
                            </Link>
                        )
                    })}
                </nav>

                {/* Sidebar Footer */}
                <div className="p-4 border-t border-border bg-gradient-to-t from-muted/50 space-y-2">
                    {/* Settings Link */}
                    <Link
                        href="/settings"
                        className={`
                            flex items-center space-x-3 px-4 py-3 rounded-lg text-foreground hover:bg-muted transition-all group relative cursor-pointer
                            ${isSidebarCollapsed ? "md:justify-center md:px-2" : ""}
                        `}
                        title={isSidebarCollapsed ? "Configuración" : undefined}
                    >
                        <Settings className="h-5 w-5 flex-shrink-0 group-hover:rotate-90 transition-transform duration-300" />
                        <span className={`font-medium whitespace-nowrap transition-opacity duration-200 ${isSidebarCollapsed ? "md:opacity-0 md:absolute md:invisible" : "opacity-100"}`}>
                            {t("settings")}
                        </span>

                        {/* Tooltip for collapsed state */}
                        {isSidebarCollapsed && (
                            <span className="hidden md:block absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                                Configuración
                            </span>
                        )}
                    </Link>

                    {/* Toggle Collapse Button (Desktop only) */}
                    <button
                        onClick={toggleSidebarCollapse}
                        className={`
                            hidden md:flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-foreground hover:bg-muted transition-all group cursor-pointer
                            ${isSidebarCollapsed ? "justify-center px-2" : ""}
                        `}
                        title={isSidebarCollapsed ? "Expandir sidebar" : "Contraer sidebar"}
                    >
                        {isSidebarCollapsed ? (
                            <ChevronRight className="h-5 w-5 flex-shrink-0" />
                        ) : (
                            <>
                                <ChevronLeft className="h-5 w-5 flex-shrink-0" />
                                <span className="font-medium text-sm">Contraer</span>
                            </>
                        )}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="relative z-30 flex items-center justify-between h-16 px-6 bg-card/80 backdrop-blur-xl shadow-lg border-b border-border/50">
                    {/* Decorative gradient */}
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary-dark/5 pointer-events-none" />

                    <div className="relative flex items-center gap-4 w-full">
                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="md:hidden hover:bg-muted/80 rounded-xl p-2.5 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                        >
                            <Menu className="h-6 w-6" />
                        </button>

                        {/* Search Bar */}
                        <div className="hidden md:flex flex-1 max-w-2xl">
                            <SearchBar />
                        </div>

                        {/* Header Actions */}
                        <div className="ml-auto flex items-center gap-2">
                            {/* Language Switcher */}
                            <LanguageSwitcher />

                            {/* Theme Switcher */}
                            <ThemeSwitcher />

                            {/* Dark Mode Toggle */}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={toggleDarkMode}
                                className="
                                    relative rounded-xl hover:bg-muted/80
                                    transition-all duration-300
                                    hover:scale-110 active:scale-95
                                    group overflow-hidden
                                "
                            >
                                <div className="relative z-10">
                                    {isDarkMode ? (
                                        <Sun className="h-5 w-5 text-amber-500 group-hover:rotate-90 transition-transform duration-300" />
                                    ) : (
                                        <Moon className="h-5 w-5 text-primary group-hover:-rotate-12 transition-transform duration-300" />
                                    )}
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-amber-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Button>

                            {/* Notifications */}
                            <NotificationBellComponent />

                            {/* User Menu */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className="
                                        flex items-center gap-3 rounded-xl hover:bg-muted/80 px-3 py-2
                                        transition-all duration-300
                                        hover:scale-105 active:scale-95
                                        group border border-transparent hover:border-border/50
                                    "
                                    >
                                        <Avatar className="h-9 w-9 ring-2 ring-primary/30 group-hover:ring-primary/50 transition-all">
                                            <AvatarImage src={getAvatarUrl(user?.avatar)} alt={user?.username} />
                                            <AvatarFallback className="bg-gradient-to-br from-primary via-primary-dark to-primary text-white font-bold text-sm">
                                                {user?.username?.charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="hidden md:block text-left">
                                            <p className="text-sm font-semibold leading-none mb-1">{user?.username}</p>
                                            <p className="text-[10px] text-muted-foreground leading-none uppercase tracking-wide">Usuario</p>
                                        </div>
                                        <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-all group-hover:translate-y-0.5" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    className="w-64 border-border/50 shadow-xl backdrop-blur-xl bg-card/95"
                                    align="end"
                                    forceMount
                                >
                                    <DropdownMenuLabel className="font-normal p-4">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-12 w-12 ring-2 ring-primary/30">
                                                <AvatarImage src={getAvatarUrl(user?.avatar)} alt={user?.username} />
                                                <AvatarFallback className="bg-gradient-to-br from-primary via-primary-dark to-primary text-white font-bold">
                                                    {user?.username?.charAt(0).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <p className="text-sm font-semibold leading-none mb-1.5">{user?.username}</p>
                                                <p className="text-xs leading-none text-muted-foreground truncate max-w-[150px]">
                                                    {user?.email || 'usuario@biblioteca.com'}
                                                </p>
                                            </div>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator className="bg-border/50" />
                                    <DropdownMenuItem asChild className="cursor-pointer hover:bg-muted/80 transition-colors">
                                        <Link href="/profile" className="flex items-center px-3 py-2.5">
                                            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center mr-3">
                                                <User className="h-4 w-4 text-primary" />
                                            </div>
                                            <span className="font-medium">Mi Perfil</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild className="cursor-pointer hover:bg-muted/80 transition-colors">
                                        <Link href="/settings" className="flex items-center px-3 py-2.5">
                                            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center mr-3">
                                                <Settings className="h-4 w-4 text-primary" />
                                            </div>
                                            <span className="font-medium">Configuración</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-border/50" />
                                    <DropdownMenuItem
                                        onClick={handleLogout}
                                        className="cursor-pointer hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400 transition-colors"
                                    >
                                        <div className="h-8 w-8 rounded-lg bg-red-100 dark:bg-red-950/30 flex items-center justify-center mr-3">
                                            <LogOut className="h-4 w-4" />
                                        </div>
                                        <span className="font-medium">Cerrar Sesión</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto overflow-x-hidden bg-muted/30">
                    {children}
                </main>
            </div>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden cursor-pointer"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
        </div>
    )
}
