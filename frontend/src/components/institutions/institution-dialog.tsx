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
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { Institution } from "@/lib/api/institutions"

const institutionSchema = z.object({
    name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    code: z.string().min(2, "El código debe tener al menos 2 caracteres"),
    website: z.string().url("Debe ser una URL válida").optional().or(z.literal("")),
    address: z.string().optional(),
})

type InstitutionFormData = z.infer<typeof institutionSchema>

interface InstitutionDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    institution?: Institution
    onSubmit: (data: InstitutionFormData) => Promise<void>
}

export function InstitutionDialog({
    open,
    onOpenChange,
    institution,
    onSubmit,
}: InstitutionDialogProps) {
    const [isLoading, setIsLoading] = useState(false)
    const isEditing = !!institution

    const form = useForm<InstitutionFormData>({
        resolver: zodResolver(institutionSchema),
        defaultValues: {
            name: "",
            code: "",
            website: "",
            address: "",
        },
    })

    useEffect(() => {
        if (institution) {
            form.reset({
                name: institution.name,
                code: institution.code,
                website: institution.website || "",
                address: institution.address || "",
            })
        } else {
            form.reset({
                name: "",
                code: "",
                website: "",
                address: "",
            })
        }
    }, [institution, form])

    const handleSubmit = async (data: InstitutionFormData) => {
        setIsLoading(true)
        try {
            await onSubmit(data)
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
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? "Editar Institución" : "Nueva Institución"}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? "Actualiza la información de la institución"
                            : "Completa los datos para crear una nueva institución"}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Universidad Central" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="code"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Código *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="U-CEN" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="website"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Sitio Web</FormLabel>
                                    <FormControl>
                                        <Input placeholder="https://universidad.edu" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Dirección</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Av. Principal 123" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

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
