"use client"

import { useState, useEffect } from "react"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { UserDialog } from "@/components/users/user-dialog"
import { usersApi, User } from "@/lib/api/users"
import { institutionsApi, Institution } from "@/lib/api/institutions"
import { handleApiError, showSuccess } from "@/lib/api"

export default function UsersPage() {
    const [data, setData] = useState<User[]>([])
    const [institutions, setInstitutions] = useState<Institution[]>([])
    const [loading, setLoading] = useState(true)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState<User | undefined>()
    const [userToDelete, setUserToDelete] = useState<User | undefined>()
    const [institutionFilter, setInstitutionFilter] = useState<string>("")

    const loadUsers = async (institutionId?: number) => {
        setLoading(true)
        try {
            const filters = institutionId ? { institution: institutionId } : undefined
            const users = await usersApi.getAll(filters)
            setData(users)
        } catch (error) {
            handleApiError(error, "Error al cargar usuarios")
        } finally {
            setLoading(false)
        }
    }

    const loadInstitutions = async () => {
        try {
            const insts = await institutionsApi.getAll()
            setInstitutions(insts)
        } catch (error) {
            handleApiError(error, "Error al cargar instituciones")
        }
    }

    useEffect(() => {
        loadUsers()
        loadInstitutions()
    }, [])

    const handleInstitutionFilterChange = (value: string) => {
        setInstitutionFilter(value)
        if (value === "all") {
            loadUsers()
        } else {
            loadUsers(parseInt(value))
        }
    }

    const handleCreate = () => {
        setSelectedUser(undefined)
        setDialogOpen(true)
    }

    const handleEdit = (user: User) => {
        setSelectedUser(user)
        setDialogOpen(true)
    }

    const handleDeleteClick = (user: User) => {
        setUserToDelete(user)
        setDeleteDialogOpen(true)
    }

    const handleSubmit = async (formData: any) => {
        try {
            if (selectedUser) {
                await usersApi.update(selectedUser.id, formData)
                showSuccess("Usuario actualizado correctamente")
            } else {
                await usersApi.create(formData)
                showSuccess("Usuario creado correctamente")
            }
            await loadUsers(institutionFilter && institutionFilter !== "all" ? parseInt(institutionFilter) : undefined)
        } catch (error) {
            handleApiError(error)
            throw error
        }
    }

    const handleConfirmDelete = async () => {
        if (!userToDelete) return

        try {
            await usersApi.delete(userToDelete.id)
            showSuccess("Usuario eliminado correctamente")
            await loadUsers(institutionFilter && institutionFilter !== "all" ? parseInt(institutionFilter) : undefined)
            setDeleteDialogOpen(false)
        } catch (error) {
            handleApiError(error, "Error al eliminar usuario")
        }
    }

    const getUserTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            student: "Estudiante",
            teacher: "Profesor",
            admin: "Administrador"
        }
        return labels[type] || type
    }

    const columns = [
        {
            header: "Usuario",
            accessorKey: "username" as keyof User,
            cell: (item: User) => (
                <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={item.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.email}`} />
                        <AvatarFallback>{item.username.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="font-medium text-sm">{item.username}</span>
                        <span className="text-xs text-muted-foreground">{item.email}</span>
                    </div>
                </div>
            )
        },
        {
            header: "Nombre",
            cell: (item: User) => (
                <span className="text-sm">
                    {item.first_name || item.last_name
                        ? `${item.first_name || ''} ${item.last_name || ''}`.trim()
                        : <span className="text-muted-foreground">-</span>
                    }
                </span>
            )
        },
        {
            header: "Institución",
            accessorKey: "institution_detail" as keyof User,
            cell: (item: User) => (
                <div className="flex items-center gap-2">
                    {item.institution_detail ? (
                        <Badge variant="secondary" className="font-normal">
                            {item.institution_detail.name}
                        </Badge>
                    ) : (
                        <span className="text-muted-foreground text-sm">Sin institución</span>
                    )}
                </div>
            )
        },
        {
            header: "Rol",
            accessorKey: "user_type" as keyof User,
            cell: (item: User) => {
                const variant = item.user_type === 'admin' ? 'destructive' : item.user_type === 'teacher' ? 'default' : 'outline'
                return <Badge variant={variant as any}>{getUserTypeLabel(item.user_type)}</Badge>
            }
        },
        {
            header: "Acciones",
            cell: (item: User) => (
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                        onClick={() => handleEdit(item)}
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDeleteClick(item)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ),
            className: "text-right"
        }
    ]

    return (
        <div className="p-6 space-y-6">
            <PageHeader
                title="Usuarios"
                description="Gestiona los usuarios del sistema y sus permisos."
                actions={
                    <Button className="gap-2" onClick={handleCreate}>
                        <Plus className="h-4 w-4" />
                        Agregar Usuario
                    </Button>
                }
            />

            <Card className="p-1">
                <DataTable
                    columns={columns}
                    data={data}
                    searchKey="username"
                    isLoading={loading}
                    actions={
                        <Select value={institutionFilter} onValueChange={handleInstitutionFilterChange}>
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Filtrar por institución" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas las instituciones</SelectItem>
                                {Array.isArray(institutions) && institutions.map((inst) => (
                                    <SelectItem key={inst.id} value={inst.id.toString()}>
                                        {inst.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    }
                />
            </Card>

            <UserDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                user={selectedUser}
                institutions={institutions}
                onSubmit={handleSubmit}
            />

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminará permanentemente el usuario{" "}
                            <strong>{userToDelete?.username}</strong>.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive hover:bg-destructive/90">
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
