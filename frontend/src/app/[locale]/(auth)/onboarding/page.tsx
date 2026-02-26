"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/authStore"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
} from "lucide-react"
import { toast } from "sonner"
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
        <div className="flex items-center justify-center gap-2 mb-8">
            {Array.from({ length: total }).map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                    <div
                        className={cn(
                            "h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300",
                            i < current
                                ? "bg-primary text-white shadow-lg shadow-primary/30"
                                : i === current
                                    ? "bg-primary text-white shadow-lg shadow-primary/30 scale-110"
                                    : "bg-muted text-muted-foreground"
                        )}
                    >
                        {i < current ? <Check className="h-5 w-5" /> : i + 1}
                    </div>
                    {i < total - 1 && (
                        <div
                            className={cn(
                                "w-12 h-1 rounded-full transition-all duration-300",
                                i < current ? "bg-primary" : "bg-muted"
                            )}
                        />
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
            })
            .catch(() => toast.error("Error al cargar opciones"))
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
            toast.success("Perfil completado correctamente")
            router.push("/home")
        } catch {
            toast.error("Error al guardar tu perfil")
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
            <div className="flex flex-col items-center justify-center min-h-[80vh] gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-muted-foreground font-medium">Preparando tu experiencia...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
            <div className="w-full max-w-2xl">
                {/* Header */}
                <div className="text-center mb-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                        <Sparkles className="h-4 w-4" />
                        Personaliza tu experiencia
                    </div>
                    <h1 className="text-3xl font-black tracking-tight">
                        {step === 0 && "Cuéntanos sobre ti"}
                        {step === 1 && "Tu rango de edad"}
                        {step === 2 && "Tu institución"}
                        {step === 3 && "Temas que te interesan"}
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        {step === 0 && "Estos datos nos ayudan a personalizar tu biblioteca"}
                        {step === 1 && "Nos permite recomendar contenido adecuado para ti"}
                        {step === 2 && "Selecciona tu institución si perteneces a alguna"}
                        {step === 3 && "Selecciona las categorías de libros que más te gustan"}
                    </p>
                </div>

                <StepIndicator current={step} total={TOTAL_STEPS} />

                <Card className="rounded-2xl border-none shadow-2xl shadow-primary/5 bg-card/80 backdrop-blur-sm">
                    <CardContent className="p-8">
                        {/* ── Step 0: Personal info + Role ────────────────── */}
                        {step === 0 && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-bold">Nombre</Label>
                                        <Input
                                            value={firstName}
                                            onChange={e => setFirstName(e.target.value)}
                                            placeholder="Tu nombre"
                                            className="h-12 rounded-xl"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-bold">Apellido</Label>
                                        <Input
                                            value={lastName}
                                            onChange={e => setLastName(e.target.value)}
                                            placeholder="Tu apellido"
                                            className="h-12 rounded-xl"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-sm font-bold flex items-center gap-2">
                                        <GraduationCap className="h-4 w-4 text-primary" />
                                        ¿Cuál es tu perfil?
                                    </Label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {options.user_types.map(type => (
                                            <button
                                                key={type.value}
                                                onClick={() => setUserType(type.value)}
                                                className={cn(
                                                    "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all cursor-pointer",
                                                    userType === type.value
                                                        ? "border-primary bg-primary/5 shadow-md shadow-primary/10 scale-[1.02]"
                                                        : "border-border/50 hover:border-primary/30 hover:bg-muted/30"
                                                )}
                                            >
                                                <span className="text-2xl">
                                                    {ROLE_ICONS[type.value] || "👤"}
                                                </span>
                                                <span className="text-sm font-medium text-center">
                                                    {type.label}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── Step 1: Age range ──────────────────────────── */}
                        {step === 1 && (
                            <div className="space-y-4">
                                <Label className="text-sm font-bold flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-primary" />
                                    Selecciona tu rango de edad
                                </Label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {options.age_ranges.map(range => (
                                        <button
                                            key={range.value}
                                            onClick={() => setAgeRange(range.value)}
                                            className={cn(
                                                "p-4 rounded-xl border-2 text-center transition-all cursor-pointer",
                                                ageRange === range.value
                                                    ? "border-primary bg-primary/5 shadow-md shadow-primary/10 scale-[1.02]"
                                                    : "border-border/50 hover:border-primary/30 hover:bg-muted/30"
                                            )}
                                        >
                                            <span className="text-sm font-bold">{range.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ── Step 2: Institution ────────────────────────── */}
                        {step === 2 && (
                            <div className="space-y-4">
                                <Label className="text-sm font-bold flex items-center gap-2">
                                    <Building2 className="h-4 w-4 text-primary" />
                                    ¿Perteneces a alguna institución?
                                </Label>
                                <Input
                                    placeholder="Buscar institución..."
                                    value={institutionSearch}
                                    onChange={e => setInstitutionSearch(e.target.value)}
                                    className="h-12 rounded-xl"
                                />
                                <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                                    <button
                                        onClick={() => setInstitutionId(null)}
                                        className={cn(
                                            "w-full text-left p-3 rounded-xl border-2 transition-all cursor-pointer",
                                            institutionId === null
                                                ? "border-primary bg-primary/5"
                                                : "border-border/50 hover:border-primary/30"
                                        )}
                                    >
                                        <span className="text-sm font-medium">Ninguna / Independiente</span>
                                    </button>
                                    {filteredInstitutions.map(inst => (
                                        <button
                                            key={inst.id}
                                            onClick={() => setInstitutionId(inst.id)}
                                            className={cn(
                                                "w-full text-left p-3 rounded-xl border-2 transition-all cursor-pointer",
                                                institutionId === inst.id
                                                    ? "border-primary bg-primary/5"
                                                    : "border-border/50 hover:border-primary/30"
                                            )}
                                        >
                                            <span className="text-sm font-medium">{inst.name}</span>
                                            <span className="text-xs text-muted-foreground ml-2">({inst.code})</span>
                                        </button>
                                    ))}
                                    {filteredInstitutions.length === 0 && institutionSearch && (
                                        <p className="text-sm text-muted-foreground text-center py-4">
                                            No se encontraron instituciones
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ── Step 3: Book categories ────────────────────── */}
                        {step === 3 && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm font-bold flex items-center gap-2">
                                        <BookOpen className="h-4 w-4 text-primary" />
                                        ¿Qué temas te interesan?
                                    </Label>
                                    <span className="text-xs text-muted-foreground">
                                        {selectedCategories.length} seleccionada{selectedCategories.length !== 1 ? "s" : ""}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-80 overflow-y-auto pr-1">
                                    {options.categories.map(cat => (
                                        <button
                                            key={cat.id}
                                            onClick={() => toggleCategory(cat.id)}
                                            className={cn(
                                                "relative p-4 rounded-xl border-2 text-left transition-all cursor-pointer group",
                                                selectedCategories.includes(cat.id)
                                                    ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                                                    : "border-border/50 hover:border-primary/30 hover:bg-muted/30"
                                            )}
                                        >
                                            {selectedCategories.includes(cat.id) && (
                                                <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                                                    <Check className="h-3 w-3 text-white" />
                                                </div>
                                            )}
                                            <p className="text-sm font-bold pr-6">{cat.name}</p>
                                            {cat.description && (
                                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                                    {cat.description}
                                                </p>
                                            )}
                                        </button>
                                    ))}
                                </div>
                                {options.categories.length === 0 && (
                                    <p className="text-sm text-muted-foreground text-center py-8">
                                        No hay categorías disponibles aún
                                    </p>
                                )}
                            </div>
                        )}

                        {/* ── Navigation buttons ─────────────────────────── */}
                        <div className="flex items-center justify-between mt-8 pt-6 border-t border-border/30">
                            <div>
                                {step > 0 ? (
                                    <Button
                                        variant="ghost"
                                        onClick={() => setStep(s => s - 1)}
                                        className="gap-2 rounded-xl"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        Atrás
                                    </Button>
                                ) : (
                                    <Button
                                        variant="ghost"
                                        onClick={() => router.push("/home")}
                                        className="rounded-xl text-muted-foreground"
                                    >
                                        Omitir por ahora
                                    </Button>
                                )}
                            </div>

                            {step < TOTAL_STEPS - 1 ? (
                                <Button
                                    onClick={() => setStep(s => s + 1)}
                                    disabled={!canAdvance()}
                                    className="gap-2 rounded-xl px-8 shadow-lg shadow-primary/20"
                                >
                                    Continuar
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleFinish}
                                    disabled={saving || !canAdvance()}
                                    className="gap-2 rounded-xl px-8 shadow-lg shadow-primary/20"
                                >
                                    {saving ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Check className="h-4 w-4" />
                                    )}
                                    Finalizar
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Skip link */}
                <p className="text-center mt-4 text-xs text-muted-foreground">
                    Puedes actualizar esta información desde tu perfil en cualquier momento
                </p>
            </div>
        </div>
    )
}
