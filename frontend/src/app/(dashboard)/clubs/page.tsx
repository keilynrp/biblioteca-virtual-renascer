'use client'

import { useEffect, useState } from 'react'
import { PageHeader } from '@/components/page-header'
import { ClubCard } from '@/components/clubs/club-card'
import { CreateClubModal } from '@/components/clubs/create-club-modal'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { clubsApi, ReadingClub } from '@/services/clubsApi'
import { useToast } from '@/hooks/use-toast'
import { useDebounce } from '@/hooks/use-debounce' // Assuming this hook exists or I should create it/use timeout

export default function ClubsPage() {
    const [clubs, setClubs] = useState<ReadingClub[]>([])
    const [search, setSearch] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const { toast } = useToast()

    const fetchClubs = async (searchTerm?: string) => {
        setIsLoading(true)
        try {
            const data = await clubsApi.getClubs(searchTerm)
            setClubs(data)
        } catch (error) {
            console.error(error)
            toast({
                title: "Error",
                description: "No se pudieron cargar los clubes.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        // Initial load
        fetchClubs()
    }, [])

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value)
        // Simple debounce could be added here
        // For now, fetch on Enter or simple delay if I had useDebounce
    }

    // Effect for search debounce manually implemented for simplicity since I don't know if useDebounce exists
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchClubs(search)
        }, 500)
        return () => clearTimeout(timer)
    }, [search])

    const handleJoin = async (slug: string) => {
        try {
            await clubsApi.joinClub(slug)
            toast({
                title: "¡Bienvenido!",
                description: "Te has unido al club.",
                variant: "success",
            })
            // Refresh list to update membership status
            fetchClubs(search)
        } catch (error) {
            toast({
                title: "Error",
                description: "No se pudo unir al club.",
                variant: "destructive",
            })
        }
    }

    return (
        <div className="py-5 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <PageHeader
                    title="Clubes de Lectura"
                    description="Únete a comunidades, comparte opiniones y descubre nuevas lecturas con otros usuarios."
                />
                <CreateClubModal />
            </div>

            <div className="flex items-center space-x-2 max-w-md">
                <div className="relative w-full">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar clubes..."
                        value={search}
                        onChange={handleSearch}
                        className="pl-8"
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-64 rounded-xl bg-muted animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {clubs.length > 0 ? (
                        clubs.map((club) => (
                            <ClubCard
                                key={club.id}
                                club={club}
                                onJoin={handleJoin}
                            />
                        ))
                    ) : (
                        <div className="col-span-full text-center py-12 text-muted-foreground">
                            No se encontraron clubes. ¡Sé el primero en crear uno!
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
