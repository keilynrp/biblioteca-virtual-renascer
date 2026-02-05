import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, Users, Shield, GraduationCap, Globe, Mail } from "lucide-react"

export default function AboutPage() {
    return (
        <div className="pt-24 pb-20">
            {/* Hero Section */}
            <section className="bg-gradient-to-b from-cyan-50 to-white py-20 px-4">
                <div className="container mx-auto max-w-6xl text-center">
                    <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                        Nuestra Misión: <span className="text-[#00576F]">Conocimiento sin Límites</span>
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                        En Biblioteca Virtual Renascer saber, creemos que el acceso a la educación de calidad
                        debe ser universal, instantáneo y gratificante. Estamos transformando la forma en que
                        las instituciones y los estudiantes interactúan con el conocimiento.
                    </p>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-20 px-4">
                <div className="container mx-auto max-w-6xl">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold text-gray-900">¿Quiénes somos?</h2>
                            <p className="text-lg text-gray-600">
                                Somos una plataforma digital líder diseñada específicamente para satisfacer las
                                necesidades de instituciones educativas modernas. Nuestro ecosistema integra
                                tecnología de vanguardia con una vasta colección de recursos académicos.
                            </p>
                            <div className="space-y-4">
                                <div className="flex gap-4">
                                    <div className="flex-shrink-0 w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center">
                                        <Shield className="h-6 w-6 text-[#00576F]" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">Calidad Garantizada</h3>
                                        <p className="text-gray-600">Trabajamos con las mejores editoriales y autores para ofrecer contenido verificado.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                        <Globe className="h-6 w-6 text-purple-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">Acceso Global</h3>
                                        <p className="text-gray-600">Donde quiera que estés, tu biblioteca te acompaña en cualquier dispositivo.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 bg-[#00576F]/10 rounded-3xl -rotate-3"></div>
                            <img
                                src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&q=80&w=1000"
                                alt="Biblioteca Moderna"
                                className="relative rounded-3xl shadow-2xl object-cover h-[400px] w-full"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats/Values Section */}
            <section className="py-20 bg-gray-50 px-4">
                <div className="container mx-auto max-w-6xl">
                    <div className="grid md:grid-cols-3 gap-8 text-center">
                        <div className="space-y-4">
                            <div className="mx-auto w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center">
                                <BookOpen className="h-8 w-8 text-[#00576F]" />
                            </div>
                            <h3 className="text-4xl font-bold text-gray-900">10k+</h3>
                            <p className="text-gray-600 font-medium">Libros Digitales</p>
                        </div>
                        <div className="space-y-4">
                            <div className="mx-auto w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center">
                                <Users className="h-8 w-8 text-[#00576F]" />
                            </div>
                            <h3 className="text-4xl font-bold text-gray-900">500+</h3>
                            <p className="text-gray-600 font-medium">Instituciones Activas</p>
                        </div>
                        <div className="space-y-4">
                            <div className="mx-auto w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center">
                                <GraduationCap className="h-8 w-8 text-[#00576F]" />
                            </div>
                            <h3 className="text-4xl font-bold text-gray-900">50k+</h3>
                            <p className="text-gray-600 font-medium">Estudiantes Empoderados</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
