"use client"

import { useState, Suspense } from "react"
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
import api, { getErrorMessage } from "@/lib/api"
import { useSearchParams } from "next/navigation"
import { Eye, EyeOff, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react"
import { calculatePasswordStrength } from "@/lib/password-strength"
import { cn } from "@/lib/utils"

const formSchema = z.object({
    newPassword: z.string().min(6, {
        message: "La contraseña debe tener al menos 6 caracteres.",
    }),
    confirmPassword: z.string().min(6, {
        message: "La contraseña debe tener al menos 6 caracteres.",
    }),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
})

function ResetPasswordForm() {
    const searchParams = useSearchParams()
    const uid = searchParams.get("uid")
    const token = searchParams.get("token")

    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            newPassword: "",
            confirmPassword: "",
        },
    })

    const passwordValue = form.watch("newPassword")
    const strength = calculatePasswordStrength(passwordValue)

    const hasValidParams = uid && token

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            setIsLoading(true)
            setError(null)
            await api.post("/auth/password/reset/confirm/", {
                uid,
                token,
                new_password: values.newPassword,
                confirm_password: values.confirmPassword,
            })
            setIsSuccess(true)
        } catch (err) {
            const msg = getErrorMessage(err)
            setError(msg || "El enlace es inválido o ha expirado. Solicita uno nuevo.")
        } finally {
            setIsLoading(false)
        }
    }

    // Success state
    if (isSuccess) {
        return (
            <div className="text-center space-y-6">
                <div className="flex justify-center">
                    <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle2 className="h-8 w-8 text-green-600" />
                    </div>
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">
                        Contraseña restablecida
                    </h2>
                    <p className="text-slate-500">
                        Tu contraseña ha sido actualizada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.
                    </p>
                </div>
                <div className="pt-4">
                    <Link
                        href="/login"
                        className="inline-flex items-center justify-center w-full rounded-lg border border-primary bg-primary py-3 text-white transition hover:bg-opacity-90 font-medium"
                    >
                        Iniciar sesión
                    </Link>
                </div>
            </div>
        )
    }

    // Invalid/missing params state
    if (!hasValidParams) {
        return (
            <div className="text-center space-y-6">
                <div className="flex justify-center">
                    <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
                        <AlertCircle className="h-8 w-8 text-red-600" />
                    </div>
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">
                        Enlace inválido
                    </h2>
                    <p className="text-slate-500">
                        El enlace de recuperación es inválido o está incompleto. Solicita uno nuevo.
                    </p>
                </div>
                <div className="pt-4">
                    <Link
                        href="/forgot-password"
                        className="inline-flex items-center justify-center w-full rounded-lg border border-primary bg-primary py-3 text-white transition hover:bg-opacity-90 font-medium"
                    >
                        Solicitar nuevo enlace
                    </Link>
                </div>
            </div>
        )
    }

    // Form state
    return (
        <>
            <span className="mb-1.5 block font-medium text-slate-500">Crea tu nueva contraseña</span>
            <h2 className="mb-3 text-2xl font-bold text-slate-900 sm:text-title-xl2">
                Restablecer contraseña
            </h2>
            <p className="mb-9 text-slate-500">
                Ingresa tu nueva contraseña. Asegúrate de que sea segura.
            </p>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                        control={form.control}
                        name="newPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="mb-2.5 block font-medium text-slate-900">Nueva contraseña</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Ingresa tu nueva contraseña"
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
                                <FormLabel className="mb-2.5 block font-medium text-slate-900">Confirmar contraseña</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Input
                                            type={showConfirmPassword ? "text" : "password"}
                                            placeholder="Confirma tu nueva contraseña"
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
                            {isLoading ? "Restableciendo..." : "Restablecer contraseña"}
                        </Button>
                    </div>
                </form>
            </Form>

            <div className="mt-6 text-center">
                <Link
                    href="/login"
                    className="inline-flex items-center gap-2 font-medium text-slate-500 hover:text-primary transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Volver al inicio de sesión
                </Link>
            </div>
        </>
    )
}

export default function ResetPasswordPage() {
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
                            Estás a un paso de recuperar el acceso a tu cuenta.
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
                        <Suspense fallback={<div className="text-center py-12 text-slate-500">Cargando...</div>}>
                            <ResetPasswordForm />
                        </Suspense>
                    </div>
                </div>
            </div>
        </div>
    )
}
