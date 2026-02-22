"use client"

import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
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
import { BookOpen, User, LogOut, ChevronDown, Settings } from "lucide-react"
import { useAuthStore } from "@/store/authStore"

export function Navbar() {
    const router = useRouter()
    const { user, logout, isAuthenticated } = useAuthStore()

    const handleLogout = () => {
        logout()
        router.push("/login")
    }

    return (
        <nav className="border-b bg-white/80 backdrop-blur-sm fixed top-0 w-full z-50">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                <Link href="/" className="flex items-center space-x-3 cursor-pointer">
                    <Image src="/Logo_renascerdosaber.png" alt="Logo Renascer Saber" width={172} height={62} className="object-contain" priority />
                </Link>
                <div className="hidden md:flex items-center space-x-8">
                    <Link href="/about" className="text-base font-medium text-gray-600 hover:text-[#00576F] transition-colors">
                        Acerca de
                    </Link>
                    <Link href="/pricing" className="text-base font-medium text-gray-600 hover:text-[#00576F] transition-colors">
                        Precios
                    </Link>
                    <Link href="/contact" className="text-base font-medium text-gray-600 hover:text-[#00576F] transition-colors">
                        Contacto
                    </Link>
                </div>
                <div className="flex items-center space-x-4">
                    {isAuthenticated ? (
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
                                        <p className="text-xs text-gray-500">Usuario</p>
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
                                        <span>Dashboard</span>
                                    </Link>
                                </DropdownMenuItem>
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
                                <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Cerrar Sesión</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <>
                            <Link href="/login">
                                <Button variant="ghost">Iniciar Sesión</Button>
                            </Link>
                            <Link href="/register">
                                <Button className="bg-[#00576F] hover:bg-[#004558] text-white">
                                    Registrarse
                                </Button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    )
}
