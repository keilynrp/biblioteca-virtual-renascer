'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { clubsApi, ReadingClub, Thread } from '@/services/clubsApi'
import { userToast } from '@/lib/toast-utils'
import { DiscussionBoard } from '@/components/clubs/discussion-board'
import { Users, Lock, Unlock, Calendar, ArrowLeft } from 'lucide-react'
import Image from 'next/image'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default function ClubDetailPage() {
    const params = useParams()
    const router = useRouter()
    const { toast } = useToast()
    const slug = params.slug as string

    const [club, setClub] = useState<ReadingClub | null>(null)
    const [threads, setThreads] = useState<Thread[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const fetchData = async () => {
        setIsLoading(true)
        try {
            const clubData = await clubsApi.getClubBySlug(slug)
            setClub(clubData)

            const threadsData = await clubsApi.getThreads(clubData.id)
            setThreads(threadsData)
        } catch (error) {
            console.error(error)
            toast({
                title: "Error",
                description: "No se pudo cargar la información del club.",
                variant: "destructive",
            })
            router.push('/clubs')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (slug) fetchData()
    }, [slug])

    const handleJoinLeave = async () => {
        if (!club) return

        try {
            if (club.is_member) {
                await clubsApi.leaveClub(club.slug)
                toast({ title: "Has salido del club", variant: "success" })
            } else {
                await clubsApi.joinClub(club.slug)
                toast({ title: "¡Te has unido al club!", variant: "success" })
            }
            fetchData()
        } catch (error) {
            toast({
                title: "Error",
                description: "No se pudo completar la acción.",
                variant: "destructive",
            })
        }
    }

    if (isLoading) {
        return <div className="p-8 animate-pulse space-y-4">
            <div className="h-8 w-64 bg-muted rounded" />
            <div className="h-64 w-full bg-muted rounded-xl" />
        </div>
    }

    if (!club) return null

    return (
        <div className="space-y-6">
            <Button
                variant="ghost"
                onClick={() => router.back()}
                className="mb-2"
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver a Clubes
            </Button>

            <div className="relative h-64 w-full rounded-2xl overflow-hidden bg-muted group">
                {club.cover_image ? (
                    <Image
                        src={club.cover_image}
                        alt={club.name}
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground bg-gradient-to-br from-primary/10 to-primary-dark/20">
                        <Users className="h-20 w-20 opacity-20" />
                    </div>
                )}
                <div className="absolute inset-0 bg-black/40 flex items-end p-8">
                    <div className="text-white space-y-2">
                        <div className="flex items-center gap-2">
                            <Badge variant={club.is_private ? "destructive" : "secondary"} className="bg-white/20 backdrop-blur-md text-white border-white/30">
                                {club.is_private ? <Lock className="h-3 w-3 mr-1" /> : <Unlock className="h-3 w-3 mr-1" />}
                                {club.is_private ? 'Privado' : 'Público'}
                            </Badge>
                        </div>
                        <h1 className="text-4xl font-bold">{club.name}</h1>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <Tabs defaultValue="discussion" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="discussion">Discusiones</TabsTrigger>
                            <TabsTrigger value="about">Información</TabsTrigger>
                        </TabsList>
                        <TabsContent value="discussion" className="mt-6">
                            <DiscussionBoard
                                clubId={club.id}
                                threads={threads}
                                isMember={club.is_member}
                                onRefresh={fetchData}
                            />
                        </TabsContent>
                        <TabsContent value="about" className="mt-6 space-y-4">
                            <div className="bg-card p-6 rounded-xl border border-border">
                                <h3 className="text-lg font-semibold mb-2">Sobre este club</h3>
                                <p className="text-muted-foreground whitespace-pre-wrap">
                                    {club.description}
                                </p>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

                <div className="space-y-6">
                    <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-6">
                        <div className="space-y-2">
                            <h3 className="font-semibold text-lg">Membresía</h3>
                            <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                <Users className="h-4 w-4" />
                                <span>{club.members_count} miembros activos</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                <Calendar className="h-4 w-4" />
                                <span>Creado el {format(new Date(club.created_at), 'PPP', { locale: es })}</span>
                            </div>
                        </div>

                        <Button
                            className="w-full"
                            variant={club.is_member ? "outline" : "default"}
                            onClick={handleJoinLeave}
                        >
                            {club.is_member ? 'Salir del Club' : 'Unirse al Club'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
