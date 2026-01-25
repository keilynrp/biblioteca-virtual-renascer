"use client"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { Crown, BookOpen, Star, Heart, Eye, ChevronRight } from "lucide-react"
import { useState } from "react"

interface Book {
    id: number
    title: string
    slug: string
    description: string
    author: { name: string }
    category: { name: string }
    cover_image: string | null
    file?: string | null
    is_premium: boolean
    average_rating?: number
    review_count?: number
    user_has_favorited?: boolean
}

interface BookCardProps {
    book: Book
    index?: number
}

export function BookCard({ book, index = 0 }: BookCardProps) {
    const [isHovered, setIsHovered] = useState(false)

    return (
        <div
            className="group flex flex-col h-full"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                animation: `fadeInUp 0.4s ease-out ${index * 0.05}s both`
            }}
        >
            {/* Book Cover - Enhanced with 3D Effect */}
            <Link href={`/library/${book.slug}`} className="relative block mb-3 cursor-pointer">
                <div className="relative w-full aspect-[2/3] bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-2 group-hover:scale-[1.02] transform perspective-1000"
                    style={{
                        transform: isHovered ? 'rotateY(-5deg) rotateX(2deg)' : 'rotateY(0deg) rotateX(0deg)',
                        transformStyle: 'preserve-3d',
                        transition: 'transform 0.5s ease-out, box-shadow 0.5s ease-out'
                    }}
                >
                    {book.cover_image ? (
                        <>
                            <Image
                                src={book.cover_image}
                                alt={book.title}
                                fill
                                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                                style={{ objectFit: "cover" }}
                                className="transition-transform duration-500 group-hover:scale-110"
                            />
                            {/* Enhanced overlay with gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            {/* Quick View Overlay */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                                <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-xl flex items-center gap-2 border border-primary/30">
                                    <Eye className="h-4 w-4 text-primary" />
                                    <span className="text-sm font-semibold text-foreground">Vista Rápida</span>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full bg-gradient-to-br from-primary/10 to-primary-dark/10 group-hover:from-primary/20 group-hover:to-primary-dark/20 transition-colors duration-500">
                            <BookOpen className="h-20 w-20 text-primary/40 transition-all duration-500 group-hover:scale-110 group-hover:text-primary/60" />
                        </div>
                    )}

                    {/* Premium Badge - Top Right with Animation */}
                    {book.is_premium && (
                        <div className="absolute top-3 right-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[10px] px-2.5 py-1.5 rounded-lg font-bold shadow-lg shadow-amber-500/30 flex items-center gap-1 z-10 transform group-hover:scale-110 transition-transform duration-300">
                            <Crown className="h-3.5 w-3.5" />
                            <span>PREMIUM</span>
                        </div>
                    )}

                    {/* Favorite Badge - Top Left */}
                    {book.user_has_favorited && (
                        <div className="absolute top-3 left-3 bg-red-500/90 backdrop-blur-sm text-white p-2 rounded-full shadow-lg z-10 transform group-hover:scale-110 transition-transform duration-300">
                            <Heart className="h-3.5 w-3.5 fill-white" />
                        </div>
                    )}

                    {/* Read Badge - Bottom Center (only if has PDF) */}
                    {book.file && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs px-4 py-2 rounded-full font-bold shadow-xl shadow-emerald-500/40 flex items-center gap-2 z-10 transform opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-2 transition-all duration-300">
                            <BookOpen className="h-4 w-4" />
                            <span>LEER AHORA</span>
                        </div>
                    )}

                    {/* Book spine effect - Enhanced */}
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-r from-black/20 to-transparent" />

                    {/* Shine effect on hover */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 transform -translate-x-full group-hover:translate-x-full"
                         style={{ transition: 'transform 0.7s ease-out, opacity 0.7s ease-out' }} />
                </div>

                {/* Enhanced shadow effect */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4/5 h-2 bg-black/10 dark:bg-black/30 rounded-full blur-sm group-hover:w-full group-hover:bg-black/20 dark:group-hover:bg-black/40 transition-all duration-500" />
            </Link>

            {/* Book Info - Enhanced */}
            <div className="flex-grow flex flex-col space-y-2">
                {/* Title with Better Typography */}
                <Link href={`/library/${book.slug}`} className="cursor-pointer">
                    <h3 className="text-sm font-bold text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors duration-300">
                        {book.title}
                    </h3>
                </Link>

                {/* Author with Icon */}
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-muted-foreground/60" />
                    <span className="hover:text-primary transition-colors cursor-pointer" role="button" tabIndex={0}>{book.author?.name}</span>
                </p>

                {/* Category Badge - Enhanced */}
                <div className="flex items-center gap-2">
                    <span className="inline-flex items-center text-[10px] font-semibold text-primary bg-gradient-to-r from-primary/15 to-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
                        {book.category?.name || "General"}
                    </span>
                </div>

                {/* Rating with Stars */}
                {book.average_rating !== undefined && book.average_rating > 0 ? (
                    <div className="flex items-center gap-1.5">
                        <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    className={`h-3 w-3 ${
                                        star <= Math.round(book.average_rating!)
                                            ? 'fill-yellow-400 text-yellow-400'
                                            : 'fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700'
                                    }`}
                                />
                            ))}
                        </div>
                        <span className="text-xs font-bold text-foreground">
                            {book.average_rating.toFixed(1)}
                        </span>
                        {book.review_count !== undefined && book.review_count > 0 && (
                            <span className="text-[10px] text-muted-foreground">
                                ({book.review_count})
                            </span>
                        )}
                    </div>
                ) : (
                    <div className="flex items-center gap-1">
                        <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    className="h-3 w-3 fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700"
                                />
                            ))}
                        </div>
                        <span className="text-xs text-muted-foreground">Sin reseñas</span>
                    </div>
                )}

                {/* Action Button - Enhanced with Icon */}
                <div className="mt-auto pt-2">
                    <Button
                        asChild
                        size="sm"
                        className="w-full text-xs h-9 bg-gradient-to-r from-primary to-primary-dark hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 group/btn overflow-hidden relative"
                    >
                        <Link href={`/library/${book.slug}`} className="flex items-center justify-center gap-1.5">
                            <span>Ver Detalles</span>
                            <ChevronRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover/btn:translate-x-1" />
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500 transform -translate-x-full group-hover/btn:translate-x-full"
                                 style={{ transition: 'transform 0.7s ease-out, opacity 0.7s ease-out' }} />
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}
