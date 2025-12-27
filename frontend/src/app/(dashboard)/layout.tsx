
"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuthStore } from "@/store/authStore"
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
    FolderOpen
} from "lucide-react"
import { useState, useEffect } from "react"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const router = useRouter()
    const { user, logout } = useAuthStore()
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [isDarkMode, setIsDarkMode] = useState(false)

    // Redirect if not authenticated
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

    useEffect(() => {
        // Check both zustand store and localStorage for authentication
        const hasToken = typeof window !== 'undefined' && localStorage.getItem('accessToken')

        if (!isAuthenticated && !hasToken) {
            router.push('/login')
        }
    }, [isAuthenticated, router])

    const handleLogout = () => {
        logout()
        router.push("/login")
    }

    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode)
        document.documentElement.classList.toggle('dark')
    }

    const navItems = [
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/library", label: "Biblioteca", icon: Library },
        { href: "/admin/books", label: "Administrar Libros", icon: FileEdit },
        { href: "/admin/authors", label: "Administrar Autores", icon: Users },
        { href: "/admin/categories", label: "Administrar Categorías", icon: FolderOpen },
        { href: "/plans", label: "Planes", icon: CreditCard },
        { href: "/profile", label: "Perfil", icon: User },
    ]

    return (
        <div className="flex h-screen overflow-hidden bg-muted/30" suppressHydrationWarning>
            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-72 transform bg-card shadow-xl transition-transform duration-300 ease-in-out md:static md:translate-x-0
                ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
                border-r border-border
            `} suppressHydrationWarning>
                {/* Sidebar Header */}
                <div className="flex h-16 items-center justify-between px-6 border-b border-border bg-gradient-to-r from-primary/10 to-primary/5">
                    <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
                            <BookOpen className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-lg font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                            Biblioteca Virtual
                        </span>
                    </div>
                    <button 
                        onClick={() => setIsSidebarOpen(false)} 
                        className="md:hidden hover:bg-muted rounded-lg p-1 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="p-4 space-y-1">
                    <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                        Menú Principal
                    </p>
                    {navItems.map((item) => {
                        const Icon = item.icon
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsSidebarOpen(false)}
                                className={`
                                    flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group
                                    ${isActive
                                        ? "bg-gradient-to-r from-primary to-primary-dark text-white shadow-lg shadow-primary/30"
                                        : "text-foreground hover:bg-muted hover:text-primary"
                                    }
                                `}
                            >
                                <Icon className={`h-5 w-5 ${isActive ? "" : "group-hover:scale-110 transition-transform"}`} />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        )
                    })}
                </nav>

                {/* Sidebar Footer */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border bg-gradient-to-t from-muted/50">
                    <Link
                        href="/settings"
                        className="flex items-center space-x-3 px-4 py-3 rounded-lg text-foreground hover:bg-muted transition-colors"
                    >
                        <Settings className="h-5 w-5" />
                        <span className="font-medium">Configuración</span>
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="flex items-center justify-between h-16 px-6 bg-card shadow-sm border-b border-border">
                    {/* Mobile Menu Button */}
                    <button 
                        onClick={() => setIsSidebarOpen(true)} 
                        className="md:hidden hover:bg-muted rounded-lg p-2 transition-colors"
                    >
                        <Menu className="h-6 w-6" />
                    </button>

                    {/* Search Bar */}
                    <div className="hidden md:flex flex-1 max-w-md ml-4">
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Buscar libros, autores..."
                                className="w-full pl-10 pr-4 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            />
                        </div>
                    </div>

                    {/* Header Actions */}
                    <div className="ml-auto flex items-center space-x-3">
                        {/* Dark Mode Toggle */}
                        <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={toggleDarkMode}
                            className="rounded-lg hover:bg-muted"
                        >
                            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                        </Button>

                        {/* Notifications */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="relative rounded-lg hover:bg-muted">
                                    <Bell className="h-5 w-5" />
                                    <span className="absolute top-1 right-1 h-2 w-2 bg-danger rounded-full"></span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-80">
                                <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <div className="p-4 text-sm text-muted-foreground text-center">
                                    No tienes notificaciones nuevas
                                </div>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* User Menu */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="flex items-center space-x-2 rounded-lg hover:bg-muted px-3">
                                    <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                                        <AvatarImage src={user?.avatar} alt={user?.username} />
                                        <AvatarFallback className="bg-gradient-to-br from-primary to-primary-dark text-white">
                                            {user?.username?.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="hidden md:block text-left">
                                        <p className="text-sm font-medium">{user?.username}</p>
                                        <p className="text-xs text-muted-foreground">Usuario</p>
                                    </div>
                                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">{user?.username}</p>
                                        <p className="text-xs leading-none text-muted-foreground">
                                            {user?.email}
                                        </p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/profile" className="cursor-pointer">
                                        <User className="mr-2 h-4 w-4" />
                                        <span>Mi Perfil</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/settings" className="cursor-pointer">
                                        <Settings className="mr-2 h-4 w-4" />
                                        <span>Configuración</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleLogout} className="text-danger cursor-pointer">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Cerrar Sesión</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-auto bg-muted/30">
                    <div className="p-6">
                        {children}
                    </div>
                </main>
            </div>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
        </div>
    )
}
