'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MessageSquare, Pin, ArrowLeft, Send, Heart } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { clubsApi, Thread, Post } from '@/services/clubsApi'
import { userToast } from '@/lib/toast-utils'

interface DiscussionBoardProps {
    clubId: number
    threads: Thread[]
    isMember: boolean
    onRefresh: () => void
}

export function DiscussionBoard({ clubId, threads, isMember, onRefresh }: DiscussionBoardProps) {
    const [isCreating, setIsCreating] = useState(false)
    const [selectedThread, setSelectedThread] = useState<Thread | null>(null)
    const [newThreadTitle, setNewThreadTitle] = useState('')
    const [newContent, setNewContent] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()

    const handleCreateThread = async () => {
        if (!newThreadTitle || !newContent) return
        setIsLoading(true)
        try {
            await clubsApi.createThread({
                club: clubId,
                title: newThreadTitle,
                content: newContent
            })
            toast({ title: "Hilo creado con éxito" })
            setNewThreadTitle('')
            setNewContent('')
            setIsCreating(false)
            onRefresh()
        } catch (error) {
            toast({ title: "Error al crear hilo", variant: "destructive" })
        } finally {
            setIsLoading(false)
        }
    }

    const handleSelectThread = async (id: number) => {
        setIsLoading(true)
        try {
            const thread = await clubsApi.getThread(id)
            setSelectedThread(thread)
        } catch (error) {
            toast({ title: "Error al cargar hilo", variant: "destructive" })
        } finally {
            setIsLoading(false)
        }
    }

    const handleCreatePost = async () => {
        if (!selectedThread || !newContent) return
        setIsLoading(true)
        try {
            await clubsApi.createPost(selectedThread.id, newContent)
            setNewContent('')
            // Refresh thread
            handleSelectThread(selectedThread.id)
            onRefresh()
        } catch (error) {
            toast({ title: "Error al publicar mensaje", variant: "destructive" })
        } finally {
            setIsLoading(false)
        }
    }

    const handleLike = async (postId: number) => {
        try {
            await clubsApi.likePost(postId)
            if (selectedThread) handleSelectThread(selectedThread.id)
        } catch (error) {
            console.error(error)
        }
    }

    if (selectedThread) {
        return (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <Button variant="ghost" onClick={() => setSelectedThread(null)} className="mb-2">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver a discusiones
                </Button>

                <Card className="border-primary/20 bg-primary/5 mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            {selectedThread.is_pinned && <Pin className="h-4 w-4 text-primary rotate-45 fill-primary" />}
                            {selectedThread.title}
                        </CardTitle>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>Iniciado por {selectedThread.author.username}</span>
                            <span>•</span>
                            <span>{formatDistanceToNow(new Date(selectedThread.created_at), { addSuffix: true, locale: es })}</span>
                        </div>
                    </CardHeader>
                </Card>

                <div className="space-y-4 mb-6">
                    {selectedThread.posts?.map((post) => (
                        <div key={post.id} className="flex gap-4 p-4 rounded-xl bg-card border border-border shadow-sm">
                            <Avatar className="h-10 w-10 border border-border">
                                <AvatarImage src={post.author.avatar} />
                                <AvatarFallback>{post.author.username[0].toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold text-sm">{post.author.username}</span>
                                    <span className="text-xs text-muted-foreground">
                                        {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: es })}
                                    </span>
                                </div>
                                <p className="text-sm whitespace-pre-wrap">{post.content}</p>
                                <div className="flex justify-end">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className={`gap-1 ${post.is_liked ? 'text-red-500' : 'text-muted-foreground'}`}
                                        onClick={() => handleLike(post.id)}
                                    >
                                        <Heart className={`h-4 w-4 ${post.is_liked ? 'fill-current' : ''}`} />
                                        <span>{post.likes_count}</span>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {isMember && (
                    <div className="sticky bottom-4">
                        <Card className="p-4 shadow-lg border-primary/20 bg-card/80 backdrop-blur-md">
                            <div className="flex gap-2">
                                <Textarea
                                    placeholder="Escribe un mensaje..."
                                    className="min-h-[80px]"
                                    value={newContent}
                                    onChange={(e) => setNewContent(e.target.value)}
                                />
                                <div className="flex flex-col justify-end">
                                    <Button
                                        size="icon"
                                        disabled={isLoading || !newContent}
                                        onClick={handleCreatePost}
                                    >
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">Discusiones</h3>
                {isMember && (
                    <Button onClick={() => setIsCreating(!isCreating)}>
                        {isCreating ? "Cancelar" : "Nueva Discusión"}
                    </Button>
                )}
            </div>

            {isCreating && (
                <Card className="border-primary/20 bg-primary/5 animate-in fade-in slide-in-from-top-4 duration-300">
                    <CardHeader>
                        <CardTitle className="text-base text-primary">Iniciar nuevo tema</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Input
                            placeholder="Título del tema"
                            value={newThreadTitle}
                            onChange={(e) => setNewThreadTitle(e.target.value)}
                        />
                        <Textarea
                            placeholder="Contenido del primer mensaje..."
                            value={newContent}
                            onChange={(e) => setNewContent(e.target.value)}
                        />
                    </CardContent>
                    <CardFooter className="flex justify-end">
                        <Button onClick={handleCreateThread} disabled={isLoading || !newThreadTitle || !newContent}>
                            Publicar Tema
                        </Button>
                    </CardFooter>
                </Card>
            )}

            <div className="space-y-2">
                {threads.length > 0 ? (
                    threads.map((thread) => (
                        <Card
                            key={thread.id}
                            className="hover:bg-muted/50 transition-all cursor-pointer border-transparent hover:border-primary/20"
                            onClick={() => handleSelectThread(thread.id)}
                        >
                            <CardContent className="p-4 flex items-start gap-4">
                                <Avatar className="h-10 w-10 border border-border">
                                    <AvatarImage src={thread.author.avatar} />
                                    <AvatarFallback>{thread.author.username[0].toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        {thread.is_pinned && <Pin className="h-3 w-3 text-primary rotate-45 fill-primary" />}
                                        <h4 className="font-semibold truncate group-hover:text-primary transition-colors">{thread.title}</h4>
                                    </div>
                                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                                        <span>Por {thread.author.username}</span>
                                        <span>•</span>
                                        <span>{formatDistanceToNow(new Date(thread.created_at), { addSuffix: true, locale: es })}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1 bg-secondary/50 px-2 py-1 rounded-full mb-1">
                                        <MessageSquare className="h-3 w-3" />
                                        <span className="font-medium text-foreground">{thread.posts_count}</span>
                                    </div>
                                    {thread.last_reply && (
                                        <span className="hidden sm:inline-block text-right opacity-70">
                                            Respuesta de {thread.last_reply.author}
                                        </span>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
                        No hay discusiones todavía. ¡Inicia una tú!
                    </div>
                )}
            </div>
        </div>
    )
}
