"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { User } from "@/lib/api/users"
import { Institution } from "@/lib/api/institutions"

const userSchema = z.object({
    username: z.string().min(3, "El usuario debe tener al menos 3 caracteres"),
    email: z.string().email("Debe ser un email válido"),
    password: z.string().optional(),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    user_type: z.enum(["student", "teacher", "admin"]),
    institution: z.number().nullable().optional(),
}).refine((data) => {
    // Password is only required when creating a new user (no ID yet)
    // However, the UserDialog doesn't have the user ID in the schema.
    // We handle this inside handleSubmit or by passing a flag.
    return true;
}, {
    message: "La contraseña es obligatoria para nuevos usuarios",
    path: ["password"],
})

type UserFormData = z.infer<typeof userSchema>

interface UserDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    user?: User
    institutions: Institution[]
    onSubmit: (data: UserFormData) => Promise<void>
}

export function UserDialog({
    open,
    onOpenChange,
    user,
    institutions,
    onSubmit,
}: UserDialogProps) {
    const [isLoading, setIsLoading] = useState(false)
    const isEditing = !!user

    const form = useForm<UserFormData>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            username: "",
            email: "",
            password: "",
            first_name: "",
            last_name: "",
            user_type: "student",
            institution: undefined,
        },
    })

    useEffect(() => {
        if (user) {
            form.reset({
                username: user.username,
                email: user.email,
                password: "",
                first_name: user.first_name || "",
                last_name: user.last_name || "",
                user_type: user.user_type,
                institution: user.institution ?? null,
            })
        } else {
            form.reset({
                username: "",
                email: "",
                password: "",
                first_name: "",
                last_name: "",
                user_type: "student",
                institution: null,
            })
        }
    }, [user, form])

    const handleSubmit = async (data: UserFormData) => {
        setIsLoading(true)
        try {
            // Manual validation for new users
            if (!isEditing && (!data.password || data.password.length < 8)) {
                form.setError("password", {
                    type: "manual",
                    message: "La contraseña debe tener al menos 8 caracteres para nuevos usuarios"
                });
                setIsLoading(false);
                return;
            }

            // Remove password field if editing and empty
            const submitData = { ...data }
            if (isEditing && !submitData.password) {
                delete submitData.password
            }
            await onSubmit(submitData)
            onOpenChange(false)
            form.reset()
        } catch (error) {
            console.error("Error submitting form:", error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? "Editar Usuario" : "Nuevo Usuario"}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? "Actualiza la información del usuario"
                            : "Completa los datos para crear un nuevo usuario"}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="first_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nombre</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Juan" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="last_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Apellido</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Pérez" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Usuario *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="jperez" {...field} />
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
                                    <FormLabel>Email *</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="juan@example.com" {...field} />
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
                                    <FormLabel>
                                        Contraseña {isEditing ? "(dejar vacío para no cambiar)" : "*"}
                                    </FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="••••••••" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="user_type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tipo de Usuario *</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccionar tipo" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="student">Estudiante</SelectItem>
                                                <SelectItem value="teacher">Profesor</SelectItem>
                                                <SelectItem value="admin">Administrador</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="institution"
                                render={({ field }) => {
                                    const { user: currentUser } = useAuthStore.getState();
                                    const isAdmin = currentUser?.user_type === 'admin';

                                    return (
                                        <FormItem>
                                            <FormLabel>Institución</FormLabel>
                                            <Select
                                                onValueChange={(value) => field.onChange(value === "none" ? null : parseInt(value))}
                                                value={field.value?.toString() ?? "none"}
                                                disabled={!isAdmin}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Seleccionar" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="none">Sin institución</SelectItem>
                                                    {Array.isArray(institutions) && institutions.map((inst) => (
                                                        <SelectItem key={inst.id} value={inst.id.toString()}>
                                                            {inst.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    );
                                }}
                            />
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isLoading}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isEditing ? "Actualizar" : "Crear"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
