
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
import { useAuthStore } from "@/store/authStore"
import Link from "next/link"
import api, { handleApiError, showSuccess } from "@/lib/api"
import { useRouter } from "next/navigation"

const formSchema = z.object({
    username: z.string().min(2, {
        message: "Username must be at least 2 characters.",
    }),
    password: z.string().min(6, {
        message: "Password must be at least 6 characters.",
    }),
})

export default function LoginPage() {
    const router = useRouter()
    const login = useAuthStore((state) => state.login)
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            password: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            setIsLoading(true)

            // Step 1: Get tokens from login endpoint
            const loginResponse = await api.post("/auth/login/", values)
            const { access, refresh } = loginResponse.data

            // Step 2: Store tokens in Zustand FIRST
            const tempUser = { username: values.username, email: '', user_type: '' }
            login(tempUser, access, refresh)

            // Step 3: Fetch user profile
            const userResponse = await api.get("/auth/user/")

            // Step 4: Update with complete user data
            const userData = userResponse.data
            login(userData, access, refresh)

            // Step 5: Show success message
            showSuccess('Inicio de sesión exitoso')

            // Step 6: Redirect 
            if (!userData.onboarding_completed && !userData.is_staff && !userData.is_superuser) {
                router.push("/onboarding")
            } else {
                router.push("/home")
            }

        } catch (err) {
            handleApiError(err, 'Credenciales inválidas. Por favor, intenta nuevamente.')
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
                            Bienvenido a la Biblioteca Virtual Renascer. Tu portal al conocimiento sin límites.
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
                        <span className="mb-1.5 block font-medium text-slate-500">Comienza tu viaje gratis</span>
                        <h2 className="mb-9 text-2xl font-bold text-slate-900 sm:text-title-xl2">
                            Iniciar Sesión
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
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="mb-2.5 block font-medium text-slate-900">Contraseña</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input
                                                        type={showPassword ? "text" : "password"}
                                                        placeholder="*******************"
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
                                        </FormItem>
                                    )}
                                />

                                <div className="text-right">
                                    <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                                        ¿Olvidaste tu contraseña?
                                    </Link>
                                </div>

                                <div className="mb-5">
                                    <Button
                                        type="submit"
                                        className="w-full cursor-pointer rounded-lg border border-primary bg-primary py-6 text-white transition hover:bg-opacity-90"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
                                    </Button>
                                </div>
                            </form>
                        </Form>

                        <div className="mt-6 text-center">
                            <p className="font-medium text-slate-500">
                                ¿No tienes una cuenta?{" "}
                                <Link href="/register" className="text-primary hover:underline">
                                    Regístrate ahora
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
