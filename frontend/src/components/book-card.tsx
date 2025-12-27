
"use client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { Crown, BookOpen } from "lucide-react"

interface Book {
    id: number
    title: string
    slug: string
    description: string
    author: { name: string }
    category: { name: string }
    cover_image: string | null
    is_premium: boolean
}

interface BookCardProps {
    book: Book
}

export function BookCard({ book }: BookCardProps) {
    return (
        <Card className="group flex flex-col h-full overflow-hidden border-border hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1">
            <div className="relative w-full h-48 bg-gradient-to-br from-muted to-muted/50 overflow-hidden">
                {book.cover_image ? (
                    <Image
                        src={book.cover_image}
                        alt={book.title}
                        fill
                        style={{ objectFit: "cover" }}
                        className="group-hover:scale-110 transition-transform duration-300"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <BookOpen className="h-16 w-16 text-muted-foreground/30" />
                    </div>
                )}
                {book.is_premium && (
                    <div className="absolute top-3 right-3 bg-gradient-to-r from-warning to-warning/80 text-white text-xs px-3 py-1.5 rounded-full font-bold shadow-lg flex items-center space-x-1">
                        <Crown className="h-3 w-3" />
                        <span>Premium</span>
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <CardHeader className="p-5">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                        {book.category?.name || "Sin categoría"}
                    </span>
                </div>
                <CardTitle className="leading-tight text-lg font-bold line-clamp-2 group-hover:text-primary transition-colors">
                    {book.title}
                </CardTitle>
                <div className="text-sm text-muted-foreground mt-2">
                    por <span className="font-medium text-foreground">{book.author?.name}</span>
                </div>
            </CardHeader>
            <CardContent className="p-5 pt-0 flex-grow">
                <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                    {book.description}
                </p>
            </CardContent>
            <CardFooter className="p-5 pt-0">
                <Button asChild className="w-full bg-gradient-to-r from-primary to-primary-dark hover:shadow-lg hover:shadow-primary/30 transition-all">
                    <Link href={`/library/${book.slug}`}>
                        <BookOpen className="mr-2 h-4 w-4" />
                        Leer Más
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    )
}
