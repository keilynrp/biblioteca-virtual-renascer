"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { User, Save, Loader2, Check, Building2, BookOpen, Calendar, GraduationCap, X, Plus } from 'lucide-react'
import api from '@/lib/api'
import { userToast } from '@/lib/toast-utils'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'

interface OnboardingOptions {
    categories: { id: number; name: string; slug: string; description: string }[]
    institutions: { id: number; name: string; code: string; abbreviation?: string }[]
    user_types: { value: string; label: string }[]
    age_ranges: { value: string; label: string }[]
}

interface UserProfile {
    first_name: string
    last_name: string
    user_type: string
    age_range: string
    institution: number | null
    preferences: { preferred_categories?: number[]; custom_interests?: string[] }
}

const USER_TYPE_META: Record<string, { icon: string; description: string }> = {
    student:   { icon: "🎓", description: "Para estudios académicos, tareas o formación" },
    professor: { icon: "👨‍🏫", description: "Para preparar clases o materiales educativos" },
    teacher:   { icon: "👨‍🏫", description: "Para preparar clases o materiales educativos" },
    librarian: { icon: "📚", description: "Para gestionar y recomendar recursos bibliográficos" },
    employee:  { icon: "💼", description: "Para mantenerse actualizado en el ámbito laboral" },
    other:     { icon: "👤", description: "Mi perfil no encaja exactamente en las categorías anteriores" },
}

export function ProfileSection() {
    const { updateUser } = useAuthStore()
    const [options, setOptions] = useState<OnboardingOptions | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [userType, setUserType] = useState("")
    const [ageRange, setAgeRange] = useState("")
    const [institutionId, setInstitutionId] = useState<number | null>(null)
    const [institutionSearch, setInstitutionSearch] = useState("")
    const [selectedCategories, setSelectedCategories] = useState<number[]>([])
    const [customInterests, setCustomInterests] = useState<string[]>([])
    const [interestInput, setInterestInput] = useState("")

    useEffect(() => {
        Promise.all([
            api.get<UserProfile>("/auth/user/"),
            api.get<OnboardingOptions>("/auth/onboarding/options/"),
        ])
            .then(([userRes, optionsRes]) => {
                const u = userRes.data
                setFirstName(u.first_name || "")
                setLastName(u.last_name || "")
                setUserType(u.user_type || "")
                setAgeRange(u.age_range || "")
                setInstitutionId(u.institution ?? null)
                setSelectedCategories(u.preferences?.preferred_categories || [])
                setCustomInterests(u.preferences?.custom_interests || [])
                setOptions(optionsRes.data)
            })
            .catch(() => userToast.error("Error al cargar los datos de perfil"))
            .finally(() => setLoading(false))
    }, [])

    const filteredInstitutions = options?.institutions.filter(inst =>
        inst.name.toLowerCase().includes(institutionSearch.toLowerCase()) ||
        (inst.abbreviation || inst.code).toLowerCase().includes(institutionSearch.toLowerCase())
    ) ?? []

    function toggleCategory(id: number) {
        setSelectedCategories(prev =>
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        )
    }

    function addCustomInterest() {
        const trimmed = interestInput.trim()
        if (trimmed && !customInterests.includes(trimmed) && customInterests.length < 20) {
            setCustomInterests(prev => [...prev, trimmed])
        }
        setInterestInput("")
    }

    function handleInterestKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault()
            addCustomInterest()
        }
    }

    async function handleSave() {
        setSaving(true)
        try {
            const res = await api.patch("/auth/user/update/", {
                first_name: firstName,
                last_name: lastName,
                user_type: userType,
                age_range: ageRange,
                institution: institutionId,
                preferences: {
                    preferred_categories: selectedCategories,
                    custom_interests: customInterests,
                },
            })
            updateUser(res.data)
            userToast.success("Perfil actualizado correctamente")
        } catch {
            userToast.error("Error al guardar los cambios")
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-16">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </CardContent>
            </Card>
        )
    }

    if (!options) return null

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Perfil Personal
                </CardTitle>
                <CardDescription>
                    Actualiza tu nombre, rol, institución e intereses de lectura
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">

                {/* Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Nombre</Label>
                        <Input
                            value={firstName}
                            onChange={e => setFirstName(e.target.value)}
                            placeholder="Tu nombre"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Apellido</Label>
                        <Input
                            value={lastName}
                            onChange={e => setLastName(e.target.value)}
                            placeholder="Tus apellidos"
                        />
                    </div>
                </div>

                <Separator />

                {/* Role — survey style */}
                <div className="space-y-3">
                    <Label className="flex items-center gap-2 font-semibold">
                        <GraduationCap className="h-4 w-4 text-primary" />
                        ¿Cómo describes tu perfil de lector?
                    </Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {options.user_types.map(type => {
                            const meta = USER_TYPE_META[type.value] ?? { icon: "👤", description: "" }
                            const selected = userType === type.value
                            return (
                                <button
                                    key={type.value}
                                    type="button"
                                    onClick={() => setUserType(type.value)}
                                    className={cn(
                                        "flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all",
                                        selected
                                            ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                                            : "border-slate-200 hover:border-primary/30 hover:bg-muted/30"
                                    )}
                                >
                                    <div className={cn(
                                        "mt-0.5 h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                                        selected ? "border-primary bg-primary" : "border-slate-300"
                                    )}>
                                        {selected && <Check className="h-3 w-3 text-white" />}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm flex items-center gap-2">
                                            <span>{meta.icon}</span>
                                            {type.label}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-0.5">{meta.description}</p>
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                </div>

                <Separator />

                {/* Age range */}
                <div className="space-y-3">
                    <Label className="flex items-center gap-2 font-semibold">
                        <Calendar className="h-4 w-4 text-primary" />
                        Rango de Edad
                    </Label>
                    <div className="flex flex-wrap gap-2">
                        {options.age_ranges.map(range => (
                            <button
                                key={range.value}
                                type="button"
                                onClick={() => setAgeRange(range.value)}
                                className={cn(
                                    "px-4 py-2 rounded-full border-2 text-sm font-semibold transition-all",
                                    ageRange === range.value
                                        ? "border-primary bg-primary text-white shadow-sm"
                                        : "border-slate-200 hover:border-primary/30"
                                )}
                            >
                                {range.label}
                            </button>
                        ))}
                    </div>
                </div>

                <Separator />

                {/* Institution */}
                <div className="space-y-3">
                    <Label className="flex items-center gap-2 font-semibold">
                        <Building2 className="h-4 w-4 text-primary" />
                        Institución (opcional)
                    </Label>
                    <div className="relative">
                        <Input
                            placeholder="Buscar por nombre o código..."
                            value={institutionSearch}
                            onChange={e => setInstitutionSearch(e.target.value)}
                            className="pl-10"
                        />
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                        <button
                            type="button"
                            onClick={() => setInstitutionId(null)}
                            className={cn(
                                "w-full text-left px-4 py-3 rounded-xl border-2 text-sm transition-all flex items-center justify-between",
                                institutionId === null
                                    ? "border-primary bg-primary/5"
                                    : "border-slate-200 hover:border-primary/30"
                            )}
                        >
                            <span className="font-medium">Lector Independiente</span>
                            {institutionId === null && <Check className="h-4 w-4 text-primary" />}
                        </button>
                        {filteredInstitutions.map(inst => (
                            <button
                                key={inst.id}
                                type="button"
                                onClick={() => setInstitutionId(inst.id)}
                                className={cn(
                                    "w-full text-left px-4 py-3 rounded-xl border-2 text-sm transition-all flex items-center justify-between",
                                    institutionId === inst.id
                                        ? "border-primary bg-primary/5"
                                        : "border-slate-200 hover:border-primary/30"
                                )}
                            >
                                <div>
                                    <span className="font-medium">{inst.name}</span>
                                    <span className="text-xs font-mono ml-2 px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                                        {inst.abbreviation || inst.code}
                                    </span>
                                </div>
                                {institutionId === inst.id && <Check className="h-4 w-4 text-primary" />}
                            </button>
                        ))}
                        {filteredInstitutions.length === 0 && institutionSearch && (
                            <p className="text-center py-6 text-sm text-muted-foreground italic">
                                No se encontró ninguna institución con ese nombre
                            </p>
                        )}
                    </div>
                </div>

                <Separator />

                {/* Reading interests */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label className="flex items-center gap-2 font-semibold">
                            <BookOpen className="h-4 w-4 text-primary" />
                            Intereses de Lectura
                        </Label>
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                            {selectedCategories.length + customInterests.length} seleccionado{(selectedCategories.length + customInterests.length) !== 1 ? "s" : ""}
                        </span>
                    </div>

                    {/* Predefined categories */}
                    <div>
                        <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">Temas del catálogo</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                            {options.categories.map(cat => (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => toggleCategory(cat.id)}
                                    className={cn(
                                        "px-3 py-2.5 rounded-lg border-2 text-sm text-left font-medium transition-all",
                                        selectedCategories.includes(cat.id)
                                            ? "border-primary bg-primary text-white"
                                            : "border-slate-200 hover:border-primary/30 hover:bg-muted/30"
                                    )}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Custom free-text interests */}
                    <div className="space-y-2">
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                            Otros intereses (escribe los tuyos)
                        </p>
                        {customInterests.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {customInterests.map(interest => (
                                    <span
                                        key={interest}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-medium"
                                    >
                                        {interest}
                                        <button
                                            type="button"
                                            onClick={() => setCustomInterests(prev => prev.filter(i => i !== interest))}
                                            className="hover:text-destructive transition-colors"
                                            aria-label={`Eliminar ${interest}`}
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                        <div className="flex gap-2">
                            <Input
                                value={interestInput}
                                onChange={e => setInterestInput(e.target.value)}
                                onKeyDown={handleInterestKeyDown}
                                placeholder='Ej: "Historia medieval", "Ciencia ficción"... Enter para agregar'
                                className="flex-1"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={addCustomInterest}
                                disabled={!interestInput.trim() || customInterests.length >= 20}
                                className="shrink-0"
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Presiona <kbd className="px-1 py-0.5 rounded bg-muted text-xs font-mono">Enter</kbd> o la coma para agregar cada interés. Máximo 20.
                        </p>
                    </div>
                </div>

                {/* Save button */}
                <div className="flex justify-end pt-2 border-t">
                    <Button onClick={handleSave} disabled={saving} className="gap-2">
                        {saving ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Save className="h-4 w-4" />
                        )}
                        Guardar Cambios
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
