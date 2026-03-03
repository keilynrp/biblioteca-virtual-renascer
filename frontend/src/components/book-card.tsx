"use client"

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
            {/* Book Cover - Enhanced with 3D Effect & Better Contrast */}
            <Link href={`/library/${book.slug}`} className="relative block mb-3 cursor-pointer">
                <div className="relative w-full aspect-[2/3] rounded-xl overflow-hidden ring-1 ring-black/10 dark:ring-white/10 shadow-lg hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-2 group-hover:scale-[1.02]"
                    style={{
                        transform: isHovered ? 'rotateY(-4deg) rotateX(2deg) translateY(-8px) scale(1.02)' : 'rotateY(0deg) rotateX(0deg) translateY(0px) scale(1)',
                        transformStyle: 'preserve-3d',
                        transition: 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.5s ease-out'
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
                                className="transition-transform duration-700 ease-out group-hover:scale-110"
                            />

                            {/* ── Permanent gradient overlays for badge/text contrast ── */}
                            {/* Top corners: subtle vignette for badges */}
                            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/40 via-black/15 to-transparent pointer-events-none" />
                            {/* Bottom: stronger gradient for "LEER AHORA" CTA */}
                            <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/50 via-black/20 to-transparent pointer-events-none" />

                            {/* ── Hover overlay ── */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            {/* ── Quick View Pill ── */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                                <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-2.5 ring-1 ring-black/10 dark:ring-white/20">
                                    <Eye className="h-4 w-4 text-primary" />
                                    <span className="text-sm font-bold text-foreground tracking-wide">Vista Rápida</span>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full bg-gradient-to-br from-primary/10 via-primary/5 to-primary-dark/10 group-hover:from-primary/20 group-hover:to-primary-dark/20 transition-colors duration-500">
                            <BookOpen className="h-20 w-20 text-primary/30 transition-all duration-500 group-hover:scale-110 group-hover:text-primary/50" />
                        </div>
                    )}

                    {/* ── Premium Badge — Enhanced contrast ── */}
                    {book.is_premium && (
                        <div className="absolute top-2.5 right-2.5 z-10">
                            <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[10px] px-2.5 py-1.5 rounded-lg font-extrabold uppercase tracking-wider shadow-lg shadow-amber-600/40 ring-2 ring-amber-400/50 backdrop-blur-sm transform group-hover:scale-110 transition-transform duration-300"
                                style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
                            >
                                <Crown className="h-3 w-3 drop-shadow" />
                                <span>Premium</span>
                            </div>
                        </div>
                    )}

                    {/* ── Favorite Badge — Enhanced contrast ── */}
                    {book.user_has_favorited && (
                        <div className="absolute top-2.5 left-2.5 z-10">
                            <div className="bg-red-500 text-white p-2 rounded-full shadow-lg shadow-red-500/40 ring-2 ring-white/40 backdrop-blur-sm transform group-hover:scale-110 transition-transform duration-300">
                                <Heart className="h-3.5 w-3.5 fill-white drop-shadow" />
                            </div>
                        </div>
                    )}

                    {/* ── "LEER AHORA" CTA — Enhanced contrast ── */}
                    {book.file && (
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 transform opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0 transition-all duration-400">
                            <div className="flex items-center gap-2 bg-emerald-500/95 backdrop-blur-sm text-white text-xs px-4 py-2 rounded-full font-bold shadow-xl shadow-emerald-600/40 ring-1 ring-emerald-400/50 uppercase tracking-wider"
                                style={{ textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}
                            >
                                <BookOpen className="h-3.5 w-3.5 drop-shadow" />
                                <span>Leer Ahora</span>
                            </div>
                        </div>
                    )}

                    {/* ── Book spine effect ── */}
                    <div className="absolute left-0 top-0 bottom-0 w-[5px] bg-gradient-to-r from-black/25 via-black/10 to-transparent pointer-events-none" />

                    {/* ── Shine sweep on hover ── */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/15 to-transparent opacity-0 group-hover:opacity-100 pointer-events-none"
                        style={{
                            transform: isHovered ? 'translateX(100%)' : 'translateX(-100%)',
                            transition: 'transform 0.8s ease-out, opacity 0.5s ease-out'
                        }}
                    />
                </div>

                {/* ── Drop shadow beneath book ── */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4/5 h-3 bg-black/8 dark:bg-black/25 rounded-full blur-md group-hover:w-[90%] group-hover:bg-black/15 dark:group-hover:bg-black/40 transition-all duration-500" />
            </Link>

            {/* ════════════════════════════════════════════════
                Book Info — Enhanced Typography & Hierarchy
               ════════════════════════════════════════════════ */}
            <div className="flex-grow flex flex-col space-y-1.5 px-0.5">
                {/* Title */}
                <Link href={`/library/${book.slug}`} className="cursor-pointer">
                    <h3 className="text-sm md:text-[15px] font-extrabold text-foreground line-clamp-2 leading-snug tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                        {book.title}
                    </h3>
                </Link>

                {/* Author */}
                <p className="text-xs text-foreground/60 dark:text-foreground/50 flex items-center gap-1.5 font-medium">
                    <span className="w-1 h-1 rounded-full bg-primary/60 shrink-0" />
                    <span className="truncate group-hover:text-primary/80 transition-colors cursor-pointer" role="button" tabIndex={0}>
                        {book.author?.name}
                    </span>
                </p>

                {/* Category Badge */}
                <div className="flex items-center gap-2">
                    <span className="inline-flex items-center text-[10px] sm:text-[11px] font-bold text-primary bg-primary/12 dark:bg-primary/20 px-2.5 py-0.5 rounded-md border border-primary/20 dark:border-primary/30 tracking-wide uppercase">
                        {book.category?.name || "General"}
                    </span>
                </div>

                {/* Rating Stars */}
                {book.average_rating !== undefined && book.average_rating > 0 ? (
                    <div className="flex items-center gap-1.5">
                        <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    className={`h-3 w-3 ${star <= Math.round(book.average_rating!)
                                        ? 'fill-amber-400 text-amber-400'
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
                        <span className="text-[10px] text-muted-foreground italic">Sin reseñas</span>
                    </div>
                )}

                {/* Action Button */}
                <div className="mt-auto pt-2">
                    <Button
                        asChild
                        size="sm"
                        className="w-full text-xs h-9 bg-gradient-to-r from-primary to-primary-dark hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 group/btn overflow-hidden relative font-bold tracking-wide"
                    >
                        <Link href={`/library/${book.slug}`} className="flex items-center justify-center gap-1.5">
                            <span>Ver Detalles</span>
                            <ChevronRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover/btn:translate-x-1" />
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent opacity-0 group-hover/btn:opacity-100 pointer-events-none"
                                style={{
                                    transform: 'translateX(-100%)',
                                    transition: 'transform 0.7s ease-out, opacity 0.7s ease-out',
                                }} />
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}
