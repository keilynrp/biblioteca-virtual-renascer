
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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

            // Step 2: Store tokens in Zustand FIRST (esto actualiza localStorage automáticamente)
            // Creamos un usuario temporal para poder hacer la llamada autenticada
            const tempUser = { username: values.username, email: '', user_type: '' }
            login(tempUser, access, refresh)

            // Step 3: Fetch user profile (ahora el interceptor usará el token de Zustand)
            const userResponse = await api.get("/auth/user/")

            // Step 4: Update with complete user data
            const userData = userResponse.data
            login(userData, access, refresh)

            // Step 5: Show success message
            showSuccess('Inicio de sesión exitoso')

            // Step 6: Redirect — onboarding if not completed, otherwise home
            if (!userData.onboarding_completed && !userData.is_staff) {
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
        <Card>
            <CardHeader>
                <CardTitle>Login</CardTitle>
                <CardDescription>Enter your credentials to access your account</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Username</FormLabel>
                                    <FormControl>
                                        <Input placeholder="username" {...field} />
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
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="******" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? "Iniciando sesión..." : "Login"}
                        </Button>
                    </form>
                </Form>
                <div className="mt-4 text-center text-sm">
                    Don&apos;t have an account? <Link href="/register" className="underline">Register</Link>
                </div>
            </CardContent>
        </Card>
    )
}
