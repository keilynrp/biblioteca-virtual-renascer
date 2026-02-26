
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
import Link from "next/link"
import api from "@/lib/api"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/authStore"

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

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    })

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
        <Card>
            <CardHeader>
                <CardTitle>Create an account</CardTitle>
                <CardDescription>Enter your details to register</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Username</FormLabel>
                                    <FormControl>
                                        <Input placeholder="johndoe" {...field} />
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
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="m@example.com" {...field} />
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
                                        <Input type="password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Confirm Password</FormLabel>
                                    <FormControl>
                                        <Input type="password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {error && <p className="text-sm text-red-500">{error}</p>}
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? "Creando cuenta..." : "Crear cuenta"}
                        </Button>
                    </form>
                </Form>
                <div className="mt-4 text-center text-sm">
                    Already have an account? <Link href="/login" className="underline">Login</Link>
                </div>
            </CardContent>
        </Card>
    )
}
