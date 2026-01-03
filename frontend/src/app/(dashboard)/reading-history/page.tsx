"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useBookStore } from "@/store/bookStore"
import { BookCard } from "@/components/book-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, CheckCircle, Clock, XCircle, ArrowLeft, Loader2 } from "lucide-react"

type StatusFilter = "" | "reading" | "completed" | "want_to_read" | "abandoned"

export default function ReadingHistoryPage() {
    const router = useRouter()
    const { readingHistory, fetchReadingHistory } = useBookStore()
    const [isLoading, setIsLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<StatusFilter>("")

    useEffect(() => {
        loadReadingHistory()
    }, [activeTab])

    const loadReadingHistory = async () => {
        setIsLoading(true)
        try {
            await fetchReadingHistory(activeTab || undefined)
        } catch (error) {
            console.error("Error loading reading history:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "reading":
                return <BookOpen className="h-5 w-5 text-yellow-500" />
            case "completed":
                return <CheckCircle className="h-5 w-5 text-green-500" />
            case "want_to_read":
                return <Clock className="h-5 w-5 text-blue-500" />
            case "abandoned":
                return <XCircle className="h-5 w-5 text-red-500" />
            default:
                return <BookOpen className="h-5 w-5" />
        }
    }

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "reading":
                return "Leyendo"
            case "completed":
                return "Completados"
            case "want_to_read":
                return "Quiero Leer"
            case "abandoned":
                return "Abandonados"
            default:
                return "Todos"
        }
    }

    const getStatusCount = (status: StatusFilter) => {
        if (!status) return readingHistory.length
        return readingHistory.filter(item => item.status === status).length
    }

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Button
                        variant="ghost"
                        onClick={() => router.push("/library")}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Volver
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            <BookOpen className="h-8 w-8" />
                            Mi Historial de Lectura
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Todos tus libros organizados por estado de lectura
                        </p>
                    </div>
                </div>

                {/* Tabs for filtering */}
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as StatusFilter)} className="mb-8">
                    <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger value="" className="gap-2">
                            Todos
                            {getStatusCount("") > 0 && (
                                <span className="ml-1 text-xs bg-primary/10 px-2 py-0.5 rounded-full">
                                    {getStatusCount("")}
                                </span>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="want_to_read" className="gap-2">
                            {getStatusIcon("want_to_read")}
                            Quiero Leer
                            {getStatusCount("want_to_read") > 0 && (
                                <span className="ml-1 text-xs bg-primary/10 px-2 py-0.5 rounded-full">
                                    {getStatusCount("want_to_read")}
                                </span>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="reading" className="gap-2">
                            {getStatusIcon("reading")}
                            Leyendo
                            {getStatusCount("reading") > 0 && (
                                <span className="ml-1 text-xs bg-primary/10 px-2 py-0.5 rounded-full">
                                    {getStatusCount("reading")}
                                </span>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="completed" className="gap-2">
                            {getStatusIcon("completed")}
                            Completados
                            {getStatusCount("completed") > 0 && (
                                <span className="ml-1 text-xs bg-primary/10 px-2 py-0.5 rounded-full">
                                    {getStatusCount("completed")}
                                </span>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="abandoned" className="gap-2">
                            {getStatusIcon("abandoned")}
                            Abandonados
                            {getStatusCount("abandoned") > 0 && (
                                <span className="ml-1 text-xs bg-primary/10 px-2 py-0.5 rounded-full">
                                    {getStatusCount("abandoned")}
                                </span>
                            )}
                        </TabsTrigger>
                    </TabsList>
                </Tabs>

                {/* Books Grid */}
                {readingHistory.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                        {readingHistory.map((item) => (
                            <div key={item.id} className="relative">
                                <BookCard book={item.book} />
                                {/* Progress Badge */}
                                {item.progress_percentage > 0 && item.status !== "completed" && (
                                    <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full font-semibold shadow-md z-10">
                                        {item.progress_percentage}%
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-16">
                            {getStatusIcon(activeTab)}
                            <h2 className="text-2xl font-semibold mb-2 mt-4">
                                {activeTab ? `No tienes libros "${getStatusLabel(activeTab)}"` : "No tienes historial de lectura"}
                            </h2>
                            <p className="text-muted-foreground mb-6 text-center max-w-md">
                                {activeTab
                                    ? `Explora la biblioteca y marca libros como "${getStatusLabel(activeTab)}"`
                                    : "Comienza a leer y marca el estado de tus libros para verlos aquí"
                                }
                            </p>
                            <Button onClick={() => router.push("/library")}>
                                Explorar Biblioteca
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
