"use client"

import { useState } from "react"
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
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react"

const formSchema = z.object({
    email: z.string().email({
        message: "Ingresa un correo electrónico válido.",
    }),
})

export default function ForgotPasswordPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            setIsLoading(true)
            await api.post("/auth/password/reset/", { email: values.email })
            setIsSubmitted(true)
        } catch {
            // Always show success to prevent email enumeration
            setIsSubmitted(true)
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
                            No te preocupes, te ayudaremos a recuperar el acceso a tu cuenta.
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
                        {isSubmitted ? (
                            <div className="text-center space-y-6">
                                <div className="flex justify-center">
                                    <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                                        <CheckCircle2 className="h-8 w-8 text-green-600" />
                                    </div>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900 mb-2">
                                        Revisa tu correo
                                    </h2>
                                    <p className="text-slate-500">
                                        Si el correo está registrado en nuestro sistema, recibirás un enlace para restablecer tu contraseña.
                                    </p>
                                </div>
                                <div className="pt-4">
                                    <Link
                                        href="/login"
                                        className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                        Volver al inicio de sesión
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <>
                                <span className="mb-1.5 block font-medium text-slate-500">Recupera tu cuenta</span>
                                <h2 className="mb-3 text-2xl font-bold text-slate-900 sm:text-title-xl2">
                                    ¿Olvidaste tu contraseña?
                                </h2>
                                <p className="mb-9 text-slate-500">
                                    Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
                                </p>

                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                        <FormField
                                            control={form.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="mb-2.5 block font-medium text-slate-900">Correo electrónico</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Input
                                                                placeholder="tucorreo@ejemplo.com"
                                                                className="w-full rounded-lg border border-slate-200 bg-transparent py-6 pl-6 pr-10 text-slate-900 outline-none focus:border-primary focus-visible:shadow-none"
                                                                {...field}
                                                            />
                                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                                                                <Mail className="h-5 w-5" />
                                                            </span>
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <div className="mb-5">
                                            <Button
                                                type="submit"
                                                className="w-full cursor-pointer rounded-lg border border-primary bg-primary py-6 text-white transition hover:bg-opacity-90"
                                                disabled={isLoading}
                                            >
                                                {isLoading ? "Enviando..." : "Enviar enlace de recuperación"}
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
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
