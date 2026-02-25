"use client"

import { useState, useEffect } from "react"
import { blogService, BlogPost, Category } from "@/lib/blog"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, User, ArrowRight, Newspaper, Loader2 } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export default function BlogPage() {
    const [posts, setPosts] = useState<BlogPost[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [activeCategory, setActiveCategory] = useState<number | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                const [postsData, categoriesData] = await Promise.all([
                    blogService.getPosts(activeCategory ? { category: activeCategory } : {}),
                    blogService.getCategories()
                ])
                setPosts(postsData)
                setCategories(categoriesData)
            } catch (error) {
                console.error("Error fetching blog data:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [activeCategory])

    return (
        <div className="container mx-auto pt-32 pb-8 px-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div className="space-y-1">
                    <h1 className="text-4xl font-extrabold tracking-tight flex items-center gap-3">
                        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                            <Newspaper className="h-7 w-7 text-primary" />
                        </div>
                        Noticias y Blog
                    </h1>
                    <p className="text-muted-foreground text-lg">Explora las últimas novedades, guías y anuncios de nuestra biblioteca.</p>
                </div>
            </div>

            {/* Categorías */}
            <div className="flex flex-wrap gap-2 mb-10">
                <Button
                    variant={activeCategory === null ? "default" : "outline"}
                    onClick={() => setActiveCategory(null)}
                    size="sm"
                    className="rounded-full px-5"
                >
                    Todas las noticias
                </Button>
                {categories.map(cat => (
                    <Button
                        key={cat.id}
                        variant={activeCategory === cat.id ? "default" : "outline"}
                        onClick={() => setActiveCategory(cat.id)}
                        size="sm"
                        className="rounded-full px-5"
                    >
                        {cat.name}
                    </Button>
                ))}
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="flex flex-col space-y-3">
                            <div className="h-52 w-full bg-muted animate-pulse rounded-2xl" />
                            <div className="h-6 w-3/4 bg-muted animate-pulse rounded-full" />
                            <div className="h-4 w-full bg-muted animate-pulse rounded-full" />
                            <div className="h-4 w-1/2 bg-muted animate-pulse rounded-full" />
                        </div>
                    ))}
                </div>
            ) : posts.length === 0 ? (
                <div className="text-center py-24 bg-card rounded-3xl border border-dashed shadow-sm">
                    <div className="h-20 w-20 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-6">
                        <Newspaper className="h-10 w-10 text-muted-foreground opacity-40" />
                    </div>
                    <h3 className="text-2xl font-semibold mb-2">No se encontraron noticias</h3>
                    <p className="text-muted-foreground max-w-sm mx-auto">Vuelve pronto o prueba seleccionando otra categoría para encontrar contenido interesante.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {posts.map(post => (
                        <Card key={post.id} className="group overflow-hidden border-none bg-card shadow-md hover:shadow-2xl transition-all duration-300 rounded-2xl flex flex-col">
                            <div className="aspect-[16/10] relative overflow-hidden bg-muted">
                                {post.featured_image ? (
                                    <img
                                        src={post.featured_image}
                                        alt={post.title}
                                        className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/20">
                                        <Newspaper className="h-16 w-16 text-primary/20" />
                                    </div>
                                )}
                                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <Badge className="absolute top-4 right-4 bg-white/95 text-primary hover:bg-white backdrop-blur-md border-none shadow-lg px-3 py-1 text-xs font-bold uppercase tracking-wider">
                                    {post.category_name || "General"}
                                </Badge>
                            </div>

                            <CardHeader className="pb-3 space-y-3">
                                <CardTitle className="text-2xl font-bold line-clamp-2 leading-tight group-hover:text-primary transition-colors duration-300">
                                    {post.title}
                                </CardTitle>
                            </CardHeader>

                            <CardContent className="flex-grow pb-4">
                                <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed">
                                    {post.description}
                                </p>
                            </CardContent>

                            <CardFooter className="pt-4 flex flex-col items-start gap-4 border-t border-muted/50 mt-auto">
                                <div className="flex items-center justify-between w-full text-[11px] font-medium text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                                            <User className="h-3 w-3 text-primary" />
                                        </div>
                                        {post.author_name}
                                    </div>
                                    <div className="flex items-center gap-1.5 opacity-80">
                                        <Calendar className="h-3 w-3" />
                                        {post.published_at ? format(new Date(post.published_at), "d MMM, yyyy", { locale: es }) : "Borrador"}
                                    </div>
                                </div>
                                <Button asChild variant="ghost" className="w-full group/btn hover:bg-primary/5 hover:text-primary rounded-xl transition-all">
                                    <Link href={`/blog/${post.slug}`} className="flex items-center justify-between w-full px-2">
                                        <span className="font-semibold">Leer artículo</span>
                                        <ArrowRight className="h-4 w-4 transform group-hover/btn:translate-x-1 transition-transform" />
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
