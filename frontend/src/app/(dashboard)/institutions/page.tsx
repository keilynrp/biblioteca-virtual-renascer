"use client"

import { useState, useEffect } from "react"
import { Plus, Pencil, Trash2, Building2 } from "lucide-react"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
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
import { InstitutionDialog } from "@/components/institutions/institution-dialog"
import { institutionsApi, Institution } from "@/lib/api/institutions"
import { handleApiError, showSuccess } from "@/lib/api"

export default function InstitutionsPage() {
    const [data, setData] = useState<Institution[]>([])
    const [loading, setLoading] = useState(true)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [selectedInstitution, setSelectedInstitution] = useState<Institution | undefined>()
    const [institutionToDelete, setInstitutionToDelete] = useState<Institution | undefined>()

    const loadInstitutions = async () => {
        setLoading(true)
        try {
            const institutions = await institutionsApi.getAll()
            setData(institutions)
        } catch (error) {
            handleApiError(error, "Error al cargar instituciones")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadInstitutions()
    }, [])

    const handleCreate = () => {
        setSelectedInstitution(undefined)
        setDialogOpen(true)
    }

    const handleEdit = (institution: Institution) => {
        setSelectedInstitution(institution)
        setDialogOpen(true)
    }

    const handleDeleteClick = (institution: Institution) => {
        setInstitutionToDelete(institution)
        setDeleteDialogOpen(true)
    }

    const handleSubmit = async (formData: any) => {
        try {
            if (selectedInstitution) {
                await institutionsApi.update(selectedInstitution.id, formData)
                showSuccess("Institución actualizada correctamente")
            } else {
                await institutionsApi.create(formData)
                showSuccess("Institución creada correctamente")
            }
            await loadInstitutions()
        } catch (error) {
            handleApiError(error)
            throw error
        }
    }

    const handleConfirmDelete = async () => {
        if (!institutionToDelete) return

        try {
            await institutionsApi.delete(institutionToDelete.id)
            showSuccess("Institución eliminada correctamente")
            await loadInstitutions()
            setDeleteDialogOpen(false)
        } catch (error) {
            handleApiError(error, "Error al eliminar institución")
        }
    }

    const columns = [
        {
            header: "Logo",
            accessorKey: "logo" as keyof Institution,
            cell: (item: Institution) => (
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <Building2 className="h-5 w-5" />
                </div>
            ),
            className: "w-[80px]"
        },
        {
            header: "Nombre",
            accessorKey: "name" as keyof Institution,
            cell: (item: Institution) => <span className="font-semibold">{item.name}</span>
        },
        {
            header: "Código",
            accessorKey: "code" as keyof Institution,
            cell: (item: Institution) => <Badge variant="outline" className="font-mono">{item.code}</Badge>
        },
        {
            header: "Sitio Web",
            accessorKey: "website" as keyof Institution,
            cell: (item: Institution) => item.website ? (
                <a href={item.website.startsWith('http') ? item.website : `https://${item.website}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary hover:underline">
                    {item.website}
                </a>
            ) : <span className="text-muted-foreground">-</span>
        },
        {
            header: "Acciones",
            cell: (item: Institution) => (
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
                title="Instituciones"
                description="Gestiona las instituciones registradas en el sistema."
                actions={
                    <Button className="gap-2" onClick={handleCreate}>
                        <Plus className="h-4 w-4" />
                        Agregar Institución
                    </Button>
                }
            />

            <Card className="p-1">
                <DataTable
                    columns={columns}
                    data={data}
                    searchKey="name"
                    isLoading={loading}
                />
            </Card>

            <InstitutionDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                institution={selectedInstitution}
                onSubmit={handleSubmit}
            />

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminará permanentemente la institución{" "}
                            <strong>{institutionToDelete?.name}</strong>.
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
