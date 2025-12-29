"use client"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { Crown, BookOpen, Star } from "lucide-react"

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
        <div className="group flex flex-col h-full">
            {/* Book Cover - OpenLibrary Style */}
            <Link href={`/library/${book.slug}`} className="relative block mb-3">
                <div className="relative w-full aspect-[2/3] bg-gray-100 rounded-sm overflow-hidden shadow-book hover:shadow-book-hover transition-all duration-300 group-hover:-translate-y-1">
                    {book.cover_image ? (
                        <>
                            <Image
                                src={book.cover_image}
                                alt={book.title}
                                fill
                                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                                style={{ objectFit: "cover" }}
                                className="transition-transform duration-300 group-hover:scale-105"
                            />
                            {/* Subtle overlay for better readability */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-200 to-gray-300">
                            <BookOpen className="h-20 w-20 text-gray-400" />
                        </div>
                    )}

                    {/* Premium Badge - Top Right */}
                    {book.is_premium && (
                        <div className="absolute top-2 right-2 bg-amber-500 text-white text-[10px] px-2 py-1 rounded-sm font-bold shadow-md flex items-center gap-1 z-10">
                            <Crown className="h-3 w-3" />
                            <span>PREMIUM</span>
                        </div>
                    )}

                    {/* Book spine effect */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-r from-black/10 to-transparent" />
                </div>

                {/* Shelf shadow effect */}
                <div className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-b from-black/5 to-transparent rounded-full" />
            </Link>

            {/* Book Info */}
            <div className="flex-grow flex flex-col">
                {/* Title */}
                <Link href={`/library/${book.slug}`}>
                    <h3 className="text-sm font-semibold text-foreground line-clamp-2 leading-tight mb-1 group-hover:text-primary transition-colors">
                        {book.title}
                    </h3>
                </Link>

                {/* Author */}
                <p className="text-xs text-muted-foreground mb-2">
                    by <span className="hover:underline cursor-pointer">{book.author?.name}</span>
                </p>

                {/* Category Badge */}
                <div className="mb-3">
                    <span className="inline-block text-[10px] font-medium text-primary/80 bg-primary/5 px-2 py-0.5 rounded uppercase tracking-wide">
                        {book.category?.name || "General"}
                    </span>
                </div>

                {/* Action Button - Compact */}
                <div className="mt-auto">
                    <Button
                        asChild
                        size="sm"
                        variant="outline"
                        className="w-full text-xs h-8 border-primary/20 hover:bg-primary hover:text-white hover:border-primary transition-all"
                    >
                        <Link href={`/library/${book.slug}`}>
                            View Details
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}
