"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/authStore"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { motion, AnimatePresence } from "framer-motion"
import {
    User,
    GraduationCap,
    BookOpen,
    ChevronRight,
    ChevronLeft,
    Check,
    Loader2,
    Sparkles,
    Building2,
    Calendar,
    ArrowRight,
} from "lucide-react"
import { userToast } from '@/lib/toast-utils'
import { cn } from "@/lib/utils"

// ── Types ───────────────────────────────────────────────────────────

interface OnboardingOptions {
    categories: { id: number; name: string; slug: string; description: string }[]
    institutions: { id: number; name: string; code: string }[]
    user_types: { value: string; label: string }[]
    age_ranges: { value: string; label: string }[]
}

// ── Step indicator ──────────────────────────────────────────────────

function StepIndicator({ current, total }: { current: number; total: number }) {
    return (
        <div className="flex items-center justify-center gap-3 mb-12">
            {Array.from({ length: total }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                    <motion.div
                        initial={false}
                        animate={{
                            backgroundColor: i <= current ? "var(--color-primary)" : "var(--color-muted)",
                            scale: i === current ? 1.2 : 1,
                            boxShadow: i === current ? "0 0 20px rgba(var(--primary-rgb), 0.4)" : "none"
                        }}
                        className={cn(
                            "h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500",
                            i < current ? "text-white" : i === current ? "text-white" : "text-muted-foreground"
                        )}
                    >
                        {i < current ? <Check className="h-5 w-5" /> : i + 1}
                    </motion.div>
                    {i < total - 1 && (
                        <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden relative">
                            <motion.div
                                initial={{ width: "0%" }}
                                animate={{ width: i < current ? "100%" : "0%" }}
                                transition={{ duration: 0.5, ease: "easeInOut" }}
                                className="absolute inset-0 bg-primary"
                            />
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}

// ── Role icon mapping ───────────────────────────────────────────────

const ROLE_ICONS: Record<string, string> = {
    student: "🎓",
    teacher: "👨‍🏫",
    librarian: "📚",
    employee: "💼",
    other: "👤",
}

// ── Main Component ──────────────────────────────────────────────────

export default function OnboardingPage() {
    const router = useRouter()
    const { user, updateUser, isAuthenticated, _hasHydrated } = useAuthStore()

    const [step, setStep] = useState(0)
    const [options, setOptions] = useState<OnboardingOptions | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    // Form data
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [userType, setUserType] = useState("")
    const [ageRange, setAgeRange] = useState("")
    const [institutionId, setInstitutionId] = useState<number | null>(null)
    const [institutionSearch, setInstitutionSearch] = useState("")
    const [selectedCategories, setSelectedCategories] = useState<number[]>([])

    const TOTAL_STEPS = 4

    // Auth guard
    useEffect(() => {
        if (!_hasHydrated) return
        if (!isAuthenticated) {
            router.push("/login")
        }
    }, [_hasHydrated, isAuthenticated, router])

    // Load options
    useEffect(() => {
        if (!isAuthenticated) return
        api.get("/auth/onboarding/options/")
            .then(res => {
                setOptions(res.data)
                // Pre-fill from existing user data
                if (user?.first_name) setFirstName(user.first_name)
                if (user?.last_name) setLastName(user.last_name)
                if (user?.user_type) setUserType(user.user_type)
                if (user?.age_range) setAgeRange(user.age_range)
            })
            .catch(() => userToast.error("Error al cargar opciones"))
            .finally(() => setLoading(false))
    }, [isAuthenticated, user])

    const filteredInstitutions = options?.institutions.filter(inst =>
        inst.name.toLowerCase().includes(institutionSearch.toLowerCase()) ||
        inst.code.toLowerCase().includes(institutionSearch.toLowerCase())
    ) || []

    function toggleCategory(id: number) {
        setSelectedCategories(prev =>
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        )
    }

    async function handleSkip() {
        setSaving(true)
        try {
            const res = await api.post("/auth/onboarding/", {})
            updateUser(res.data)
            userToast.info("Puedes completar tu perfil en Configuración")
            router.push("/home")
        } catch {
            userToast.error("Error al omitir el onboarding")
        } finally {
            setSaving(false)
        }
    }

    async function handleFinish() {
        setSaving(true)
        try {
            const res = await api.post("/auth/onboarding/", {
                first_name: firstName,
                last_name: lastName,
                user_type: userType,
                age_range: ageRange,
                institution_id: institutionId,
                preferred_categories: selectedCategories,
            })
            updateUser(res.data)
            userToast.success("Perfil completado correctamente")
            router.push("/home")
        } catch {
            userToast.error("Error al guardar tu perfil")
        } finally {
            setSaving(false)
        }
    }

    function canAdvance() {
        switch (step) {
            case 0: return firstName.trim() && lastName.trim() && userType
            case 1: return ageRange
            case 2: return true // institution is optional
            case 3: return selectedCategories.length > 0
            default: return true
        }
    }

    if (loading || !options) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                >
                    <Loader2 className="h-12 w-12 text-primary" />
                </motion.div>
                <p className="text-muted-foreground font-medium animate-pulse text-lg">Preparando tu experiencia personalizada...</p>
            </div>
        )
    }

    const stepVariants = {
        initial: { opacity: 0, x: 20 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -20 }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <div className="w-full max-w-3xl">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-10"
                >
                    <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-primary/10 text-primary text-sm font-bold mb-6 border border-primary/20 shadow-sm shadow-primary/10">
                        <Sparkles className="h-4 w-4" />
                        Paso {step + 1} de {TOTAL_STEPS}
                    </div>
                    <h1 className="text-4xl font-black tracking-tight mb-4 text-slate-900">
                        {step === 0 && "Personaliza tu Perfil"}
                        {step === 1 && "¿Cuál es tu Rango de Edad?"}
                        {step === 2 && "Vincular Institución"}
                        {step === 3 && "Tus Intereses de Lectura"}
                    </h1>
                    <p className="text-slate-500 max-w-lg mx-auto text-lg">
                        {step === 0 && "Queremos conocerte mejor para brindarte el mejor contenido académico y literario."}
                        {step === 1 && "Esto nos ayuda a recomendarte libros y materiales acordes a tu etapa de aprendizaje."}
                        {step === 2 && "Si perteneces a una institución asociada, tendrás acceso a contenidos exclusivos."}
                        {step === 3 && "Selecciona al menos un tema que te apasione para entrenar a tu motor de recomendaciones."}
                    </p>
                </motion.div>

                <StepIndicator current={step} total={TOTAL_STEPS} />

                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        variants={stepVariants}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                    >
                        <Card className="rounded-2xl border border-slate-200 shadow-lg bg-white">
                            <CardContent className="p-10">
                                {/* ── Step 0: Personal info + Role ────────────────── */}
                                {step === 0 && (
                                    <div className="space-y-8">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            <div className="space-y-2.5">
                                                <Label className="text-sm font-bold ml-1">Nombre</Label>
                                                <Input
                                                    value={firstName}
                                                    onChange={e => setFirstName(e.target.value)}
                                                    placeholder="Tu nombre completo"
                                                    className="h-14 rounded-2xl border-2 border-slate-200 focus:border-primary transition-all text-lg px-6"
                                                />
                                            </div>
                                            <div className="space-y-2.5">
                                                <Label className="text-sm font-bold ml-1">Apellido</Label>
                                                <Input
                                                    value={lastName}
                                                    onChange={e => setLastName(e.target.value)}
                                                    placeholder="Tus apellidos"
                                                    className="h-14 rounded-2xl border-2 border-slate-200 focus:border-primary transition-all text-lg px-6"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <Label className="text-sm font-bold flex items-center gap-2 ml-1">
                                                <GraduationCap className="h-5 w-5 text-primary" />
                                                ¿Cuál es tu rol principal?
                                            </Label>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                                {options.user_types.map(type => (
                                                    <motion.button
                                                        key={type.value}
                                                        whileHover={{ scale: 1.03, y: -2 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        onClick={() => setUserType(type.value)}
                                                        className={cn(
                                                            "flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all cursor-pointer relative",
                                                            userType === type.value
                                                                ? "border-primary bg-primary/5 shadow-lg shadow-primary/10 ring-2 ring-primary/20"
                                                                : "border-slate-200 hover:border-primary/30 hover:bg-muted/30"
                                                        )}
                                                    >
                                                        {userType === type.value && (
                                                            <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-primary flex items-center justify-center shadow-lg">
                                                                <Check className="h-3.5 w-3.5 text-white" />
                                                            </div>
                                                        )}
                                                        <span className="text-4xl">
                                                            {ROLE_ICONS[type.value] || "👤"}
                                                        </span>
                                                        <span className="text-sm font-black uppercase tracking-wider text-slate-700">
                                                            {type.label}
                                                        </span>
                                                    </motion.button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* ── Step 1: Age range ──────────────────────────── */}
                                {step === 1 && (
                                    <div className="space-y-6">
                                        <Label className="text-sm font-bold flex items-center gap-2 mb-2">
                                            <Calendar className="h-5 w-5 text-primary" />
                                            Selecciona tu rango de edad para filtrar contenido
                                        </Label>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                            {options.age_ranges.map(range => (
                                                <motion.button
                                                    key={range.value}
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => setAgeRange(range.value)}
                                                    className={cn(
                                                        "p-6 rounded-2xl border-2 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1",
                                                        ageRange === range.value
                                                            ? "border-primary bg-primary text-primary-foreground shadow-xl shadow-primary/20 scale-105"
                                                            : "border-slate-200 hover:border-primary/30 hover:bg-muted/40"
                                                    )}
                                                >
                                                    <span className="text-lg font-black tracking-tight">{range.label}</span>
                                                </motion.button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* ── Step 2: Institution ────────────────────────── */}
                                {step === 2 && (
                                    <div className="space-y-6">
                                        <Label className="text-sm font-bold flex items-center gap-2 mb-1">
                                            <Building2 className="h-5 w-5 text-primary" />
                                            Encuentra tu centro de formación
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                placeholder="Escribe el nombre o código de tu institución..."
                                                value={institutionSearch}
                                                onChange={e => setInstitutionSearch(e.target.value)}
                                                className="h-14 rounded-2xl border-2 border-slate-200 focus:border-primary transition-all text-lg pl-12"
                                            />
                                            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                        </div>
                                        <div className="max-h-72 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-primary/20">
                                            <motion.button
                                                whileHover={{ x: 5 }}
                                                onClick={() => setInstitutionId(null)}
                                                className={cn(
                                                    "w-full text-left p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between",
                                                    institutionId === null
                                                        ? "border-primary bg-primary/5 shadow-md"
                                                        : "border-slate-200 hover:border-primary/30"
                                                )}
                                            >
                                                <div className="font-bold">Lector Independiente</div>
                                                {institutionId === null && <Check className="h-5 w-5 text-primary" />}
                                            </motion.button>
                                            {filteredInstitutions.map(inst => (
                                                <motion.button
                                                    key={inst.id}
                                                    whileHover={{ x: 5 }}
                                                    onClick={() => setInstitutionId(inst.id)}
                                                    className={cn(
                                                        "w-full text-left p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between",
                                                        institutionId === inst.id
                                                            ? "border-primary bg-primary/5 shadow-md"
                                                            : "border-slate-200 hover:border-primary/30"
                                                    )}
                                                >
                                                    <div>
                                                        <span className="font-bold text-slate-800">{inst.name}</span>
                                                        <span className="text-xs font-mono ml-2 px-2 py-0.5 rounded bg-muted text-muted-foreground">ID: {inst.code}</span>
                                                    </div>
                                                    {institutionId === inst.id && <Check className="h-5 w-5 text-primary" />}
                                                </motion.button>
                                            ))}
                                            {filteredInstitutions.length === 0 && institutionSearch && (
                                                <div className="text-center py-10">
                                                    <p className="text-muted-foreground italic">No encontramos esa institución</p>
                                                    <Button variant="link" size="sm" onClick={() => setInstitutionSearch('')}>Ver todas</Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* ── Step 3: Book categories ────────────────────── */}
                                {step === 3 && (
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between mb-2">
                                            <Label className="text-sm font-bold flex items-center gap-2">
                                                <BookOpen className="h-5 w-5 text-primary" />
                                                ¿Cuáles son tus pasiones?
                                            </Label>
                                            <div className="px-3 py-1 bg-primary text-white text-[10px] uppercase font-black tracking-widest rounded-full shadow-sm">
                                                {selectedCategories.length} Seleccionado{selectedCategories.length !== 1 ? "s" : ""}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto pr-3 scrollbar-thin scrollbar-thumb-primary/20">
                                            {options.categories.map(cat => (
                                                <motion.button
                                                    key={cat.id}
                                                    whileHover={{ scale: 1.02, y: -2 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => toggleCategory(cat.id)}
                                                    className={cn(
                                                        "relative p-5 rounded-2xl border-2 text-left transition-all cursor-pointer overflow-hidden flex flex-col gap-1.5",
                                                        selectedCategories.includes(cat.id)
                                                            ? "border-primary bg-primary text-primary-foreground shadow-xl shadow-primary/10"
                                                            : "border-slate-200 hover:border-primary/30 hover:bg-muted/50"
                                                    )}
                                                >
                                                    {selectedCategories.includes(cat.id) && (
                                                        <motion.div
                                                            layoutId="cat-check"
                                                            className="absolute top-2 right-2 h-6 w-6 rounded-full bg-white flex items-center justify-center shadow-lg"
                                                        >
                                                            <Check className="h-4 w-4 text-primary" />
                                                        </motion.div>
                                                    )}
                                                    <p className="text-md font-black tracking-tight leading-tight pr-6">{cat.name}</p>
                                                    {cat.description && (
                                                        <p className={cn(
                                                            "text-xs line-clamp-2 transition-colors",
                                                            selectedCategories.includes(cat.id) ? "text-primary-foreground/80" : "text-muted-foreground"
                                                        )}>
                                                            {cat.description}
                                                        </p>
                                                    )}
                                                </motion.button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* ── Navigation buttons ─────────────────────────── */}
                                <div className="flex items-center justify-between mt-12 pt-8 border-t-2 border-slate-200">
                                    <div>
                                        {step > 0 ? (
                                            <Button
                                                variant="outline"
                                                onClick={() => setStep(s => s - 1)}
                                                className="gap-2 rounded-2xl h-14 px-8 border-2 font-bold hover:bg-slate-100 transition-all"
                                            >
                                                <ChevronLeft className="h-5 w-5" />
                                                Regresar
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="ghost"
                                                onClick={handleSkip}
                                                disabled={saving}
                                                className="rounded-2xl h-14 px-8 font-bold text-slate-400 hover:text-slate-600 transition-all hover:bg-slate-50"
                                            >
                                                Configurar luego
                                            </Button>
                                        )}
                                    </div>

                                    {step < TOTAL_STEPS - 1 ? (
                                        <Button
                                            onClick={() => setStep(s => s + 1)}
                                            disabled={!canAdvance()}
                                            className="gap-2 rounded-2xl h-14 px-12 font-black shadow-xl shadow-primary/30 transition-all hover:scale-[1.05] active:scale-[0.98] text-lg bg-primary hover:bg-primary/90"
                                        >
                                            Continuar
                                            <ArrowRight className="h-5 w-5" />
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={handleFinish}
                                            disabled={saving || !canAdvance()}
                                            className="gap-3 rounded-2xl h-14 px-12 font-black shadow-2xl shadow-primary/40 transition-all hover:scale-[1.05] active:scale-[0.98] text-lg bg-primary hover:bg-primary/90 group"
                                        >
                                            {saving ? (
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                            ) : (
                                                <Sparkles className="h-5 w-5 group-hover:animate-sparkle" />
                                            )}
                                            Finalizar y Explorar
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </AnimatePresence>

                {/* Footer info */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="text-center mt-8 text-sm text-slate-400 font-medium"
                >
                    Tus datos están seguros y se usan exclusivamente para mejorar tu catálogo de lectura.
                    <br />
                    Puedes modificar estas preferencias en cualquier momento desde tu Configuración.
                </motion.p>
            </div>

        </div>
    )
}
