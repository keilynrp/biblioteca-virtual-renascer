"use client"

import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BookOpen, Users, Clock, Shield, GraduationCap, Library, Search, Sparkles, User, LogOut, ChevronDown, Settings } from "lucide-react"
import { useAuthStore } from "@/store/authStore"

export default function LandingPage() {
    const router = useRouter()
    const { user, logout, isAuthenticated } = useAuthStore()

    const handleLogout = () => {
        logout()
        router.push("/login")
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-cyan-50/30">
            {/* Navigation */}
            <nav className="border-b bg-white/80 backdrop-blur-sm fixed top-0 w-full z-50">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Image src="/Logo_renascerdosaber.png" alt="Logo Renascer Saber" width={172} height={62} className="object-contain" priority />
                    </div>
                    <div className="flex items-center space-x-4">
                        {isAuthenticated ? (
                            /* User Menu - Authenticated */
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
                            /* Login/Register Buttons - Not Authenticated */
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

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4">
                <div className="container mx-auto max-w-6xl">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <div className="inline-block">
                                <span className="bg-cyan-100 text-[#00576F] px-4 py-2 rounded-full text-sm font-medium">
                                    ✨ Plataforma de Conocimiento Digital
                                </span>
                            </div>
                            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                                Aumenta tu
                                <span className="text-[#00576F]"> desempeño educacional</span>
                            </h1>
                            <p className="text-xl text-gray-600 leading-relaxed">
                                Accede a miles de libros digitales, recursos académicos y contenido premium.
                                Disponible 24/7 para tu institución educativa.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <Link href="/register">
                                    <Button size="lg" className="bg-[#00576F] hover:bg-[#004558] text-white px-8 py-6 text-lg rounded-full">
                                        Comenzar Ahora
                                        <Sparkles className="ml-2 h-5 w-5" />
                                    </Button>
                                </Link>
                                <Link href="/library">
                                    <Button size="lg" variant="outline" className="px-8 py-6 text-lg rounded-full border-2 text-gray-900 hover:text-gray-900">
                                        Explorar Biblioteca
                                        <Search className="ml-2 h-5 w-5" />
                                    </Button>
                                </Link>
                            </div>
                            <div className="flex items-center gap-8 pt-4">
                                <div>
                                    <p className="text-3xl font-bold text-[#00576F]">10,000+</p>
                                    <p className="text-sm text-gray-600">Libros Digitales</p>
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-[#00576F]">500+</p>
                                    <p className="text-sm text-gray-600">Instituciones</p>
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-[#00576F]">24/7</p>
                                    <p className="text-sm text-gray-600">Acceso Total</p>
                                </div>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-[#00576F]/20 to-purple-500/20 rounded-3xl blur-3xl"></div>
                            <Card className="relative shadow-2xl border-0">
                                <CardContent className="p-8">
                                    <div className="bg-gradient-to-br from-[#00576F] to-[#003d4d] rounded-2xl p-8 text-white">
                                        <GraduationCap className="h-16 w-16 mb-4" />
                                        <h3 className="text-2xl font-bold mb-3">Educación sin límites</h3>
                                        <p className="text-cyan-100 mb-6">
                                            Accede a contenido académico de calidad, donde quieras, cuando quieras.
                                        </p>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3 bg-white/10 rounded-lg p-3">
                                                <BookOpen className="h-5 w-5" />
                                                <span>Libros digitales ilimitados</span>
                                            </div>
                                            <div className="flex items-center gap-3 bg-white/10 rounded-lg p-3">
                                                <Users className="h-5 w-5" />
                                                <span>Colaboración institucional</span>
                                            </div>
                                            <div className="flex items-center gap-3 bg-white/10 rounded-lg p-3">
                                                <Shield className="h-5 w-5" />
                                                <span>Contenido verificado</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-white">
                <div className="container mx-auto max-w-6xl px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Todo lo que necesitas en una plataforma
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Diseñada para instituciones educativas que buscan excelencia académica
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <Card className="border-2 hover:border-[#00576F] transition-all hover:shadow-lg">
                            <CardContent className="p-6">
                                <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mb-4">
                                    <Library className="h-6 w-6 text-[#00576F]" />
                                </div>
                                <h3 className="text-xl font-semibold mb-3 text-gray-900">Biblioteca Personalizable</h3>
                                <p className="text-gray-600">
                                    Personaliza tu colección según las necesidades específicas de tu institución
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-2 hover:border-[#00576F] transition-all hover:shadow-lg">
                            <CardContent className="p-6">
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                                    <BookOpen className="h-6 w-6 text-green-600" />
                                </div>
                                <h3 className="text-xl font-semibold mb-3 text-gray-900">Precios por Libro</h3>
                                <p className="text-gray-600">
                                    Modelo de pago flexible, solo por el contenido que realmente utilizas
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-2 hover:border-[#00576F] transition-all hover:shadow-lg">
                            <CardContent className="p-6">
                                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                                    <Shield className="h-6 w-6 text-purple-600" />
                                </div>
                                <h3 className="text-xl font-semibold mb-3 text-gray-900">Acreditación Institucional</h3>
                                <p className="text-gray-600">
                                    Soporte completo para procesos de acreditación y certificación
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-2 hover:border-[#00576F] transition-all hover:shadow-lg">
                            <CardContent className="p-6">
                                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                                    <Clock className="h-6 w-6 text-orange-600" />
                                </div>
                                <h3 className="text-xl font-semibold mb-3 text-gray-900">Acceso 24/7</h3>
                                <p className="text-gray-600">
                                    Disponibilidad completa desde cualquier dispositivo, en cualquier momento
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-2 hover:border-[#00576F] transition-all hover:shadow-lg">
                            <CardContent className="p-6">
                                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                                    <Users className="h-6 w-6 text-red-600" />
                                </div>
                                <h3 className="text-xl font-semibold mb-3 text-gray-900">Multi-usuario</h3>
                                <p className="text-gray-600">
                                    Gestiona múltiples usuarios y permisos desde un solo panel
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-2 hover:border-[#00576F] transition-all hover:shadow-lg">
                            <CardContent className="p-6">
                                <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mb-4">
                                    <Search className="h-6 w-6 text-cyan-600" />
                                </div>
                                <h3 className="text-xl font-semibold mb-3 text-gray-900">Búsqueda Avanzada</h3>
                                <p className="text-gray-600">
                                    Motor de búsqueda inteligente para encontrar el contenido que necesitas
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-br from-[#00576F] to-[#003d4d]">
                <div className="container mx-auto max-w-4xl px-4 text-center">
                    <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                        ¿Listo para transformar tu biblioteca?
                    </h2>
                    <p className="text-xl text-cyan-100 mb-8 max-w-2xl mx-auto">
                        Únete a cientos de instituciones que ya están mejorando su desempeño educacional
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/register">
                            <Button size="lg" className="bg-white text-[#00576F] hover:bg-gray-100 px-8 py-6 text-lg rounded-full">
                                Comenzar Gratis
                            </Button>
                        </Link>
                        <Link href="/plans">
                            <Button size="lg" variant="outline" className="!bg-transparent border-2 border-white !text-white hover:!bg-white/10 hover:!text-white px-8 py-6 text-lg rounded-full">
                                Ver Planes
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-300 py-12">
                <div className="container mx-auto max-w-6xl px-4">
                    <div className="grid md:grid-cols-4 gap-8">
                        <div className="col-span-2">
                            <div className="mb-4">
                                <Image src="/Logo_renascerdosaber.png" alt="Logo Renascer Saber" width={172} height={62} className="object-contain" />
                            </div>
                            <p className="text-sm text-gray-400 max-w-sm">
                                Plataforma digital de conocimiento para instituciones educativas.
                                Acceso ilimitado a contenido académico de calidad.
                            </p>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-4">Plataforma</h4>
                            <ul className="space-y-2 text-sm">
                                <li><Link href="/library" className="hover:text-[#00576F]">Biblioteca</Link></li>
                                <li><Link href="/plans" className="hover:text-[#00576F]">Planes</Link></li>
                                <li><Link href="/login" className="hover:text-[#00576F]">Iniciar Sesión</Link></li>
                                <li><Link href="/register" className="hover:text-[#00576F]">Registrarse</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-4">Soporte</h4>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#" className="hover:text-[#00576F]">Centro de Ayuda</a></li>
                                <li><a href="#" className="hover:text-[#00576F]">Contacto</a></li>
                                <li><a href="#" className="hover:text-[#00576F]">Términos</a></li>
                                <li><a href="#" className="hover:text-[#00576F]">Privacidad</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
                        <p>&copy; 2025 Biblioteca Virtual Renascer Saber. Todos los derechos reservados.</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}
