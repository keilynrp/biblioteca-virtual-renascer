"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { blogService, BlogPost } from "@/lib/blog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, ChevronLeft, User, Share2, Clock, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { getAvatarUrl } from "@/lib/utils"

export default function BlogPostDetail() {
    const params = useParams()
    const router = useRouter()
    const [post, setPost] = useState<BlogPost | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const data = await blogService.getPost(params.slug as string)
                setPost(data)
            } catch (error) {
                console.error("Error fetching post:", error)
            } finally {
                setLoading(false)
            }
        }
        if (params.slug) fetchPost()
    }, [params.slug])

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse font-medium">Cargando artículo...</p>
            </div>
        )
    }

    if (!post) {
        return (
            <div className="container mx-auto py-32 px-4 text-center">
                <div className="h-20 w-20 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-6">
                    <User className="h-10 w-10 text-red-600" />
                </div>
                <h1 className="text-3xl font-bold mb-4">Artículo no encontrado</h1>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">Lo sentimos, el artículo que buscas no existe o ha sido movido.</p>
                <Button variant="default" className="rounded-xl px-8" onClick={() => router.push("/blog")}>
                    Volver al Blog
                </Button>
            </div>
        )
    }

    return (
        <article className="min-h-screen pt-24 pb-24 bg-muted/30">
            {/* Hero Section */}
            <div className="relative w-full h-[45vh] md:h-[65vh] overflow-hidden bg-muted">
                {post.featured_image ? (
                    <img
                        src={post.featured_image}
                        alt={post.title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/30 to-primary-dark/40 flex items-center justify-center">
                        <User className="h-40 w-40 text-primary/10" />
                    </div>
                )}
                {/* Overlay more dramatic */}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

                <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 md:pb-20">
                    <div className="container mx-auto max-w-4xl">
                        <Button
                            variant="ghost"
                            className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md mb-8 rounded-full transition-all group"
                            onClick={() => router.push("/blog")}
                        >
                            <ChevronLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                            Volver a Noticias
                        </Button>

                        <div className="flex flex-wrap gap-3 mb-6">
                            <Badge className="bg-primary text-white border-none px-4 py-1.5 text-xs uppercase tracking-widest font-black shadow-lg shadow-primary/30">
                                {typeof post.category === 'object' ? post.category?.name : post.category_name || "General"}
                            </Badge>
                            {post.tags?.map(tag => (
                                <Badge key={tag.id} variant="outline" className="text-white border-white/30 bg-black/30 backdrop-blur-sm px-3 font-medium">
                                    #{tag.name}
                                </Badge>
                            ))}
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-foreground leading-[1.1] mb-8 tracking-tighter drop-shadow-sm">
                            {post.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-8 border-t border-foreground/10 pt-8 mt-2">
                            <div className="flex items-center gap-4 group">
                                <Avatar className="h-12 w-12 ring-2 ring-primary ring-offset-2 ring-offset-background transition-all group-hover:scale-110">
                                    <AvatarImage src={getAvatarUrl(post.author.avatar)} />
                                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary-dark text-white font-bold">
                                        {post.author.first_name?.charAt(0) || post.author_name?.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                    <span className="text-base font-bold text-foreground">{post.author_name}</span>
                                    <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest opacity-80">Autor del artículo</span>
                                </div>
                            </div>

                            <div className="flex gap-6 text-sm font-bold text-muted-foreground">
                                <span className="flex items-center gap-2.5">
                                    <Calendar className="h-5 w-5 text-primary" />
                                    {post.published_at ? format(new Date(post.published_at), "d 'de' MMMM, yyyy", { locale: es }) : "Borrador"}
                                </span>
                                <span className="flex items-center gap-2.5">
                                    <Clock className="h-5 w-5 text-primary" />
                                    {Math.max(3, Math.ceil(post.content.length / 1500))} min lectura
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="container mx-auto max-w-4xl px-4 -mt-12 relative z-10">
                <div className="bg-card rounded-3xl p-8 md:p-16 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-border/40">
                    <p className="text-2xl md:text-3xl font-medium text-foreground/80 leading-snug mb-16 border-l-8 border-primary pl-8 py-2">
                        {post.description}
                    </p>

                    <div className="rich-text-content prose prose-lg md:prose-xl dark:prose-invert max-w-none 
                        prose-headings:font-black prose-headings:tracking-tighter prose-headings:text-foreground
                        prose-p:leading-[1.8] prose-p:text-foreground/90 prose-p:mb-8
                        prose-img:rounded-[2rem] prose-img:shadow-2xl prose-img:my-12
                        prose-strong:text-foreground prose-strong:font-bold
                        prose-a:text-primary prose-a:font-black prose-a:decoration-primary/30 prose-a:underline-offset-4 hover:prose-a:decoration-primary transition-all
                        prose-blockquote:border-primary prose-blockquote:border-l-[10px] prose-blockquote:bg-muted/40 prose-blockquote:px-10 prose-blockquote:py-10 prose-blockquote:rounded-r-3xl prose-blockquote:italic prose-blockquote:text-xl md:prose-blockquote:text-2xl prose-blockquote:font-medium
                        prose-li:marker:text-primary prose-li:marker:font-bold
                    ">
                        <div dangerouslySetInnerHTML={{ __html: post.content }} />
                    </div>

                    <div className="mt-24 pt-12 border-t border-muted/50 flex flex-wrap justify-between items-center gap-8">
                        <div className="flex items-center gap-5">
                            <span className="text-xs font-black text-muted-foreground uppercase tracking-widest">Comparte este artículo:</span>
                            <div className="flex gap-3">
                                <Button size="icon" variant="outline" className="h-11 w-11 rounded-full hover:bg-primary hover:text-white hover:border-primary transition-all hover:scale-110 active:scale-95 shadow-sm">
                                    <Share2 className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>

                        <Button
                            variant="outline"
                            className="h-12 rounded-full border-primary/20 hover:border-primary hover:bg-primary/5 text-primary font-bold px-8 transition-all group"
                            onClick={() => router.push("/blog")}
                        >
                            <ChevronLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                            Ver todas las noticias
                        </Button>
                    </div>
                </div>
            </div>
        </article>
    )
}
