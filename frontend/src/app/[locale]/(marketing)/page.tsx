"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, Users, Clock, Shield, GraduationCap, Library, Search, Sparkles } from "lucide-react"

export default function LandingPage() {
    const [offsetY, setOffsetY] = useState(0)

    useEffect(() => {
        const handleScroll = () => {
            const scroll = window.scrollY
            if (scroll > 100) {
                setOffsetY((scroll - 100) * 0.2) // Subtle parallax effect
            } else {
                setOffsetY(0)
            }
        }
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    return (
        <div className="bg-white">
            {/* Hero Section */}
            <section className="relative min-h-[90vh] flex items-center pt-32 pb-20 px-4 overflow-hidden">
                {/* Background Image with Parallax */}
                <div
                    className="absolute inset-0 z-0 transition-transform duration-75 ease-out scale-110"
                    style={{ transform: `translateY(${offsetY}px)` }}
                >
                    <Image
                        src="/hero-image.jpg"
                        alt="Background"
                        fill
                        priority
                        className="object-cover"
                    />
                    {/* Dark Overlay for Readability */}
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-[2px]"></div>
                </div>

                <div className="container mx-auto max-w-6xl relative z-10 flex justify-end">
                    <div className="max-w-3xl space-y-8 text-right">
                        <div className="inline-block ml-auto">
                            <span className="bg-cyan-500/20 text-cyan-100 border border-cyan-400/30 px-4 py-2 rounded-full text-sm font-medium backdrop-blur-md">
                                ✨ Plataforma de Conocimiento Digital
                            </span>
                        </div>
                        <h1 className="text-[3.85rem] font-bold text-white leading-tight">
                            Aumenta tu
                            <span className="text-cyan-400"> desempeño educacional</span>
                        </h1>
                        <p className="text-[1.55rem] text-gray-200 leading-relaxed max-w-2xl ml-auto">
                            Accede a miles de libros digitales, recursos académicos y contenido premium.
                            Disponible 24/7 para tu institución educativa.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-end">
                            <Link href="/register">
                                <Button size="lg" className="bg-[#00576F] hover:bg-[#004558] text-white px-8 py-7 text-xl rounded-full shadow-xl shadow-cyan-900/20">
                                    Comenzar Ahora
                                    <Sparkles className="ml-2 h-6 w-6" />
                                </Button>
                            </Link>
                            <Link href="/library">
                                <Button size="lg" variant="outline" className="px-8 py-7 text-xl rounded-full border-2 border-white bg-white text-[#000000] hover:bg-[#00576F] hover:text-[#ffffff] hover:border-[#00576F] transition-all">
                                    Explorar Biblioteca
                                    <Search className="ml-2 h-6 w-6" />
                                </Button>
                            </Link>
                        </div>

                        <div className="flex items-center gap-12 pt-8 justify-end">
                            <div className="text-white text-right">
                                <p className="text-4xl font-bold text-cyan-400">10,000+</p>
                                <p className="text-sm text-gray-300">Libros Digitales</p>
                            </div>
                            <div className="text-white text-right">
                                <p className="text-4xl font-bold text-cyan-400">500+</p>
                                <p className="text-sm text-gray-300">Instituciones</p>
                            </div>
                            <div className="text-white text-right">
                                <p className="text-4xl font-bold text-cyan-400">24/7</p>
                                <p className="text-sm text-gray-300">Acceso Total</p>
                            </div>
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
                                    Personaliza tu colección según las necesidades específicas de tu institution
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
                        <Link href="/pricing">
                            <Button size="lg" variant="outline" className="!bg-transparent border-2 border-white !text-white hover:!bg-white/10 hover:!text-white px-8 py-6 text-lg rounded-full">
                                Ver Planes
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    )
}
