import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Lock, Unlock } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface Club {
    id: number
    name: string
    slug: string
    description: string
    cover_image: string | null
    is_private: boolean
    members_count: number
    is_member: boolean
}

interface ClubCardProps {
    club: Club
    onJoin?: (slug: string) => void
}

export function ClubCard({ club, onJoin }: ClubCardProps) {
    return (
        <Card className="overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow cursor-pointer">
            <div className="relative h-48 w-full bg-muted cursor-pointer">
                {club.cover_image ? (
                    <Image
                        src={club.cover_image}
                        alt={club.name}
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                        <Users className="h-12 w-12 opacity-50" />
                    </div>
                )}
                <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                    {club.is_private ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                    {club.is_private ? 'Privado' : 'Público'}
                </div>
            </div>

            <CardHeader>
                <CardTitle className="line-clamp-1">{club.name}</CardTitle>
                <CardDescription className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {club.members_count} miembros
                </CardDescription>
            </CardHeader>

            <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground line-clamp-3">
                    {club.description}
                </p>
            </CardContent>

            <CardFooter>
                {club.is_member ? (
                    <Button asChild className="w-full" variant="secondary">
                        <Link href={`/clubs/${club.slug}`}>
                            Acceder al Club
                        </Link>
                    </Button>
                ) : (
                    <div className="flex gap-2 w-full">
                        <Button asChild variant="outline" className="flex-1">
                            <Link href={`/clubs/${club.slug}`}>
                                Ver Detalles
                            </Link>
                        </Button>
                        <Button
                            className="flex-1"
                            onClick={() => onJoin?.(club.slug)}
                        >
                            Unirse
                        </Button>
                    </div>
                )}
            </CardFooter>
        </Card>
    )
}
