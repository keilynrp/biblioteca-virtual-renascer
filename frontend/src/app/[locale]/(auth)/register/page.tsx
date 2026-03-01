
"use client"

import { useState } from "react"
import { Eye, EyeOff, ArrowLeft } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import api from "@/lib/api"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/authStore"
import { calculatePasswordStrength } from "@/lib/password-strength"
import { cn } from "@/lib/utils"

const formSchema = z.object({
    username: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    confirmPassword: z.string().min(6),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
})

export default function RegisterPage() {
    const router = useRouter()
    const login = useAuthStore((state) => state.login)
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    })

    const passwordValue = form.watch("password")
    const strength = calculatePasswordStrength(passwordValue)

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            setError(null)
            setIsLoading(true)

            // 1. Register user
            await api.post("/auth/register/", {
                username: values.username,
                email: values.email,
                password: values.password,
                confirm_password: values.confirmPassword,
                first_name: values.username,
                last_name: "",
                user_type: "student",
            })

            // 2. Auto-login
            const loginRes = await api.post("/auth/login/", {
                username: values.username,
                password: values.password,
            })
            const { access, refresh } = loginRes.data

            // 3. Fetch full user profile
            const tempUser = { username: values.username, email: values.email, user_type: "student" }
            login(tempUser, access, refresh)
            const userRes = await api.get("/auth/user/")
            login(userRes.data, access, refresh)

            // 4. Redirect to onboarding
            router.push("/onboarding")
        } catch (err: unknown) {
            console.error("Registration error:", err)
            const error = err as { response?: { data?: Record<string, string[]> } }
            if (error.response?.data) {
                const errors = error.response.data
                if (errors.username) {
                    setError(`Username: ${errors.username[0]}`)
                } else if (errors.email) {
                    setError(`Email: ${errors.email[0]}`)
                } else if (errors.password) {
                    setError(`Password: ${errors.password[0]}`)
                } else {
                    setError("Error en el registro. Verifica tu información.")
                }
            } else {
                setError("Error en el registro. Intenta de nuevo.")
            }
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="w-full max-w-screen-2xl rounded-sm border border-slate-200 bg-white shadow-default">
            <div className="flex flex-wrap items-center">
                {/* Left Column - Branding (Hidden on Mobile) */}
                <div className="hidden w-full lg:block lg:w-1/2">
                    <div className="px-10 py-17.5 text-center sm:px-12.5 xl:px-17.5">
                        <Link className="mb-5.5 inline-block" href="/">
                            <div className="flex items-center justify-center gap-2">
                                <div className="h-8 w-8 rounded bg-primary flex items-center justify-center">
                                    <span className="text-white font-bold text-xl">R</span>
                                </div>
                                <span className="text-2xl font-bold text-slate-900">Renascer</span>
                            </div>
                        </Link>
                        <p className="2xl:px-20 text-slate-500 xl:px-10 pb-10">
                            Únete hoy a la Biblioteca Virtual Renascer y expande tus horizontes.
                        </p>
                        <span className="mt-15 inline-block">
                            <svg width="350" height="350" viewBox="0 0 350 350" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="25" y="25" width="300" height="300" rx="20" fill="#F1F5F9" />
                                <path d="M125 150h100v20H125v-20zm0 40h100v20H125v-20zm0 40h60v20h-60v-20z" fill="#3C50E0" opacity="0.5" />
                                <circle cx="175" cy="110" r="30" fill="#3C50E0" />
                            </svg>
                        </span>
                    </div>
                </div>

                {/* Right Column - Form */}
                <div className="w-full border-slate-200 lg:w-1/2 lg:border-l-2">
                    <div className="w-full p-4 sm:p-12.5 xl:p-17.5">
                        <span className="mb-1.5 block font-medium text-slate-500">Crea tu cuenta</span>
                        <h2 className="mb-9 text-2xl font-bold text-slate-900 sm:text-title-xl2">
                            Registro
                        </h2>

                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="username"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="mb-2.5 block font-medium text-slate-900">Username</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input
                                                        placeholder="Ingresa tu username"
                                                        className="w-full rounded-lg border border-slate-200 bg-transparent py-6 pl-6 pr-10 text-slate-900 outline-none focus:border-primary focus-visible:shadow-none"
                                                        {...field}
                                                    />
                                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                        </svg>
                                                    </span>
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="mb-2.5 block font-medium text-slate-900">Email</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input
                                                        placeholder="tucorreo@ejemplo.com"
                                                        className="w-full rounded-lg border border-slate-200 bg-transparent py-6 pl-6 pr-10 text-slate-900 outline-none focus:border-primary focus-visible:shadow-none"
                                                        {...field}
                                                    />
                                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                        </svg>
                                                    </span>
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="mb-2.5 block font-medium text-slate-900">Contraseña</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input
                                                        type={showPassword ? "text" : "password"}
                                                        placeholder="Ingresa tu contraseña"
                                                        className="w-full rounded-lg border border-slate-200 bg-transparent py-6 pl-6 pr-10 text-slate-900 outline-none focus:border-primary focus-visible:shadow-none"
                                                        {...field}
                                                    />
                                                    <button
                                                        type="button"
                                                        tabIndex={-1}
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                                        aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                                    >
                                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                                    </button>
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                            {passwordValue && (
                                                <div className="mt-2 space-y-1">
                                                    <div className="flex gap-1">
                                                        {[1, 2, 3].map((bar) => (
                                                            <div
                                                                key={bar}
                                                                className={cn(
                                                                    "h-1.5 flex-1 rounded-full transition-colors",
                                                                    strength.level === "weak" && bar <= 1 ? "bg-red-500" :
                                                                    strength.level === "medium" && bar <= 2 ? "bg-amber-500" :
                                                                    strength.level === "strong" ? "bg-green-500" :
                                                                    "bg-slate-200"
                                                                )}
                                                            />
                                                        ))}
                                                    </div>
                                                    <p className={cn(
                                                        "text-xs",
                                                        strength.level === "weak" && "text-red-600",
                                                        strength.level === "medium" && "text-amber-600",
                                                        strength.level === "strong" && "text-green-600"
                                                    )}>
                                                        {strength.level === "weak" && "Contraseña débil"}
                                                        {strength.level === "medium" && "Contraseña moderada"}
                                                        {strength.level === "strong" && "Contraseña fuerte"}
                                                    </p>
                                                </div>
                                            )}
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="confirmPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="mb-2.5 block font-medium text-slate-900">Confirmar Contraseña</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input
                                                        type={showConfirmPassword ? "text" : "password"}
                                                        placeholder="Confirma tu contraseña"
                                                        className="w-full rounded-lg border border-slate-200 bg-transparent py-6 pl-6 pr-10 text-slate-900 outline-none focus:border-primary focus-visible:shadow-none"
                                                        {...field}
                                                    />
                                                    <button
                                                        type="button"
                                                        tabIndex={-1}
                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                                        aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                                    >
                                                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                                    </button>
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {error && <p className="text-sm font-medium text-red-500">{error}</p>}

                                <div className="mb-5">
                                    <Button
                                        type="submit"
                                        className="w-full cursor-pointer rounded-lg border border-primary bg-primary py-6 text-white transition hover:bg-opacity-90"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? "Creando cuenta..." : "Crear Cuenta"}
                                    </Button>
                                </div>
                            </form>
                        </Form>

                        <div className="mt-6 text-center">
                            <p className="font-medium text-slate-500">
                                ¿Ya tienes una cuenta?{" "}
                                <Link href="/login" className="text-primary hover:underline">
                                    Inicia Sesión
                                </Link>
                            </p>
                        </div>

                        <div className="mt-4 text-center">
                            <Link
                                href="/"
                                className="inline-flex items-center gap-2 font-medium text-slate-500 hover:text-primary transition-colors"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Volver al inicio
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
